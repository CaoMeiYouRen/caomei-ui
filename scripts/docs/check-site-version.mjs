#!/usr/bin/env node

/**
 * check-site-version：文档站版本展示的**单一来源**守卫。
 *
 * 为什么需要它：站点展示的版本号一旦手写在配置或页面里，每次发版都要手改文档，并且会出现
 * 「文档写 X、npm 上是 Y」的静默漂移。本守卫约定：**单一来源 = 仓库根 `package.json` 的 `version`**，
 * 配置经 `themeConfig.version` 暴露、页面以 `v{{ theme.version }}` 消费。
 *
 * 规则：
 * 1. `version-mismatch`——用 VitePress `resolveConfig` 取**已解析**的 `themeConfig.version`，必须存在
 *    且等于 `package.json` 的 `version`（静态读源码无法覆盖计算式派生，故取实际生效值）。
 * 2. `hardcoded-version`——版本展示面（登记表）不得出现三段式版本字面量（`\d+\.\d+\.\d+`）；
 *    版本一律派生，避免发版时手改。
 * 3. `surface-not-wired`——展示面须按类型接线：配置面引用 `package.json`；页面面消费 `theme.version`。
 * 4. `locale-version-mismatch`——**逐 locale** 断言：各 locale **原始**已解析 `themeConfig.version` 必须存在且
 *    等于 `package.json`（防「依赖 locale 合并语义 → 英文页静默展示空版本」这条收窄通道）。
 * 5. `surface-scope-narrowed`——登记表须非空、文件均存在，且至少含 1 个配置面与中英各 1 个页面面。
 *
 * 说明：`.md` 中的 `{{ theme.version }}` 是**有意**的 Vue 插值（VitePress 会把页面当 Vue 模板编译），
 * 与[文档与演示站 §13](../../docs/design/documentation-site.md) 中「不要写双花括号」的告诫不冲突——
 * 该告诫针对的是「描述插值语法」而非「消费站点数据」。
 *
 * 用法：
 *   node scripts/docs/check-site-version.mjs [仓库根目录]
 */
import { existsSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { isDirectExecution } from '../shared/cli.mjs'
import { docsProjectRoot, loadSiteNavigation } from './vitepress-site.mjs'

/** 版本展示面登记表：`kind` = config（暴露单一来源）| page（消费 theme.version）。 */
export const VERSION_SURFACES = [
    { file: 'docs/.vitepress/config.ts', kind: 'config', expect: /package\.json/ },
    { file: 'docs/guide/version-policy.md', kind: 'page', expect: /\{\{\s*theme\.version\s*\}\}/ },
    { file: 'docs/i18n/en-US/guide/version-policy.md', kind: 'page', expect: /\{\{\s*theme\.version\s*\}\}/ },
    { file: 'docs/guide/getting-started.md', kind: 'page', expect: /\{\{\s*theme\.version\s*\}\}/ },
    { file: 'docs/i18n/en-US/guide/getting-started.md', kind: 'page', expect: /\{\{\s*theme\.version\s*\}\}/ },
]

/** 三段式版本字面量（`1.2.3` / `v1.2.3`）。两段式（`1.6`）与日期不命中。 */
export const VERSION_LITERAL_RE = /(?<![\d.])\d+\.\d+\.\d+(?![\d.])/g

/**
 * 扫描版本展示面中的三段式版本字面量。
 *
 * @param {Array<{ file: string, content: string }>} surfaces 展示面内容
 * @returns {Array<{ type: string, file: string, line: number, message: string }>} 问题列表
 */
export function findHardcodedVersions(surfaces) {
    const issues = []
    for (const { file, content } of surfaces) {
        content.split(/\r?\n/u).forEach((line, index) => {
            for (const match of line.matchAll(VERSION_LITERAL_RE)) {
                issues.push({
                    type: 'hardcoded-version',
                    file,
                    line: index + 1,
                    message: `版本展示面出现三段式版本字面量「${match[0]}」：请改为消费单一来源（配置经 themeConfig.version 暴露、页面写 {{ theme.version }}）`,
                })
            }
        })
    }
    return issues
}

/**
 * 校验展示面的存在性与接线。
 *
 * @param {Array<{ file: string, kind: string, expect: RegExp }>} surfaces 登记表
 * @param {string} root 仓库根目录
 * @returns {Array<{ type: string, file: string, line: null, message: string }>} 问题列表
 */
export function checkVersionSurfaces(surfaces, root = docsProjectRoot) {
    const issues = []
    if (surfaces.length === 0) {
        return [{ type: 'surface-scope-narrowed', file: '', line: null, message: '版本展示面登记表为空：拒绝以空扫描通过' }]
    }
    const kinds = new Set(surfaces.map((surface) => surface.kind))
    if (!kinds.has('config')) {
        issues.push({ type: 'surface-scope-narrowed', file: '', line: null, message: '展示面登记表缺少配置面（kind = config）：受检范围疑似被静默收窄' })
    }
    for (const locale of ['docs/guide/', 'docs/i18n/en-US/']) {
        if (!surfaces.some((surface) => surface.file.startsWith(locale))) {
            issues.push({ type: 'surface-scope-narrowed', file: '', line: null, message: `展示面登记表缺少 ${locale} 下的页面：受检范围疑似被静默收窄` })
        }
    }
    for (const surface of surfaces) {
        const absolute = resolve(root, surface.file)
        if (!existsSync(absolute)) {
            issues.push({ type: 'surface-missing', file: surface.file, line: null, message: `登记的版本展示面不存在：${surface.file}` })
            continue
        }
        const content = readFileSync(absolute, 'utf8')
        if (!surface.expect.test(content)) {
            const hint = surface.kind === 'config'
                ? '配置面须引用 package.json（单一来源）'
                : '页面面须消费 theme.version'
            issues.push({ type: 'surface-not-wired', file: surface.file, line: null, message: `版本展示面未按约定接线（${hint}）：${surface.file}` })
        }
    }
    return issues
}

/**
 * 执行版本单一来源检查。
 *
 * @param {string} root 仓库根目录
 * @param {{ surfaces?: typeof VERSION_SURFACES }} [options] 便于单测注入展示面登记表
 * @returns {Promise<{ issues: Array<object>, version: string | null, exposedVersion: unknown, surfaceCount: number }>} 检查结果
 */
export async function runSiteVersionCheck(root = docsProjectRoot, options = {}) {
    const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
    const registry = options.surfaces ?? VERSION_SURFACES
    const surfaces = registry.map((surface) => ({
        ...surface,
        content: existsSync(resolve(root, surface.file)) ? readFileSync(resolve(root, surface.file), 'utf8') : '',
    }))
    const issues = [
        ...checkVersionSurfaces(surfaces, root),
        ...findHardcodedVersions(surfaces.map(({ file, content }) => ({ file, content }))),
    ]

    const navigation = await loadSiteNavigation(join(root, 'docs'))
    const exposedVersion = navigation.themeConfig.version
    if (exposedVersion === undefined || exposedVersion === null || exposedVersion === '') {
        issues.push({ type: 'version-mismatch', file: 'docs/.vitepress/config.ts', line: null, message: '已解析配置未暴露 themeConfig.version：站点版本展示缺少单一来源' })
    } else if (exposedVersion !== packageJson.version) {
        issues.push({
            type: 'version-mismatch',
            file: 'docs/.vitepress/config.ts',
            line: null,
            message: `已解析配置的 themeConfig.version（${String(exposedVersion)}）与 package.json 的 version（${String(packageJson.version)}）不一致`,
        })
    }
    // 逐 locale 断言：各 locale 的已解析 themeConfig 必须同样能取到该版本（防「合并语义变化 → en 页渲染空版本」这一静默收窄通道）
    for (const locale of navigation.locales) {
        const localeConfig = locale === 'root' ? navigation.themeConfig : (navigation.localeThemeConfigs?.[locale] ?? {})
        if (localeConfig.version !== packageJson.version) {
            issues.push({
                type: 'locale-version-mismatch',
                file: 'docs/.vitepress/config.ts',
                line: null,
                message: `${locale} 的已解析 themeConfig.version（${String(localeConfig.version)}）不等于 package.json 的 version（${String(packageJson.version)}）`,
            })
        }
    }
    return { issues, version: packageJson.version, exposedVersion, surfaceCount: surfaces.length }
}

/**
 * 校验命令行传入的目标目录：必须是含 `package.json` 的仓库根。
 *
 * @param {string | undefined} arg 位置参数
 * @param {string} fallbackRoot 未传参时的默认根目录
 * @returns {{ root: string | null, error: string | null }} 目标根或错误原因
 */
export function resolveTargetRoot(arg, fallbackRoot = docsProjectRoot) {
    if (!arg) {
        return { root: fallbackRoot, error: null }
    }
    if (arg.startsWith('-')) {
        return { root: null, error: `不支持的参数：${arg}` }
    }
    try {
        readFileSync(resolve(arg, 'package.json'), 'utf8')
    } catch {
        return { root: null, error: `目标目录不是仓库根（缺 package.json）：${arg}` }
    }
    return { root: arg, error: null }
}

if (isDirectExecution(import.meta.url)) {
    const { root: targetRoot, error: rootError } = resolveTargetRoot(process.argv[2])
    if (rootError) {
        process.stderr.write(`[check-site-version] ${rootError}\n`)
        process.exitCode = 1
    } else {
        const { issues, version, exposedVersion, surfaceCount } = await runSiteVersionCheck(targetRoot)
        if (issues.length > 0) {
            for (const issue of issues) {
                const location = issue.line === null ? issue.file || '<scope>' : `${issue.file}:${issue.line}`
                process.stderr.write(`${location}:${issue.type}: ${issue.message}\n`)
            }
            process.stderr.write(`[check-site-version] ${issues.length} 处问题（受检 ${surfaceCount} 个版本展示面，package.json version = ${String(version)}，已暴露 = ${String(exposedVersion)}）\n`)
            process.exitCode = 1
        } else {
            process.stdout.write(`[check-site-version] OK：${surfaceCount} 个版本展示面均派生自 package.json（version = ${String(version)}），无手写版本字面量\n`)
        }
    }
}
