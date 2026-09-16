#!/usr/bin/env node

/**
 * check-nuxt：caomei-ui/nuxt 最小消费冒烟。
 *
 * 步骤：
 * 1. 校验 `dist/nuxt.js` 存在（缺失时提示先 `pnpm build`）；
 * 2. 在 `playground/nuxt` 建立 `caomei-ui` 本地链接（node_modules 软链到仓库根）；
 * 3. 运行 `nuxt generate` 生成静态站点；
 * 4. 断言 SSR HTML 与打包 CSS 的关键标记（自动导入、样式注入、主题覆盖、暗色属性）。
 *
 * 用法：
 *   pnpm build && node scripts/release/check-nuxt.mjs
 *
 * 本脚本会实际执行 Nuxt 构建，属集成级冒烟；单测只覆盖其中的纯函数。
 */
import { execFileSync } from 'node:child_process'
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

export function fixtureDir(root = REPO_ROOT) {
    return join(root, 'playground', 'nuxt')
}

/** SSR HTML 必须包含的关键标记。 */
export const HTML_MARKERS = [
    { label: '组件 CaomeiButton 自动导入', test: (html) => html.includes('caomei-button') },
    { label: '组件 CaomeiTag 自动导入', test: (html) => html.includes('caomei-tag') },
    { label: 'composable useTheme 自动导入', test: (html) => /data-testid="theme-mode"[^<]*auto/.test(html) },
    { label: 'darkMode: media 写入 data-scheme', test: (html) => html.includes('data-scheme="auto"') },
    { label: 'app.head htmlAttrs 透传', test: (html) => html.includes('data-preset="caomei"') },
]

/** 打包 CSS 必须包含的关键标记。 */
export const CSS_MARKERS = [
    { label: '组件样式已注入', test: (css) => css.includes('.caomei-button') },
    { label: 'theme 覆盖生效', test: (css) => /--caomei-color-primary:\s*#123456/i.test(css) },
    { label: 'primary-foreground 别名覆盖生效', test: (css) => /--caomei-color-primary-foreground:\s*#fefefe/i.test(css) },
]

/** 返回 content 中未命中的标记描述。 */
export function findMissingMarkers(content, markers) {
    return markers.filter(({ test }) => !test(content)).map(({ label }) => label)
}

/**
 * 在 fixture 的 node_modules 建立指向仓库根的 `caomei-ui` 链接（幂等）。
 *
 * 已存在但目标不是仓库根（或为悬空软链）时会重建，避免误消费非本地产物。
 */
export function ensureFixtureLink(root = REPO_ROOT) {
    const linkPath = join(fixtureDir(root), 'node_modules', 'caomei-ui')
    mkdirSync(dirname(linkPath), { recursive: true })

    const target = realpathSync(root)

    let stats
    try {
        stats = lstatSync(linkPath)
    } catch {
        stats = undefined
    }

    if (stats?.isSymbolicLink()) {
        let linked
        try {
            linked = realpathSync(linkPath)
        } catch {
            linked = undefined
        }
        if (linked === target) {
            return
        }
        rmSync(linkPath, { force: true })
    } else if (stats) {
        rmSync(linkPath, { recursive: true, force: true })
    }

    symlinkSync(target, linkPath, process.platform === 'win32' ? 'junction' : 'dir')
}

/** 解析 `nuxt` 可执行入口（读取其 package.json 的 bin 字段，避免硬编码路径）。 */
export function resolveNuxtBin(root = REPO_ROOT) {
    const nuxtDir = join(root, 'node_modules', 'nuxt')
    const pkg = JSON.parse(readFileSync(join(nuxtDir, 'package.json'), 'utf8'))
    const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.nuxt

    if (!bin) {
        throw new Error('无法从 nuxt 的 package.json 解析 bin 入口')
    }

    return join(nuxtDir, bin)
}

/** 在 fixture 中执行 `nuxt generate`。 */
export function runNuxtGenerate(root = REPO_ROOT) {
    execFileSync(process.execPath, [resolveNuxtBin(root), 'generate'], {
        cwd: fixtureDir(root),
        stdio: 'pipe',
        encoding: 'utf8',
    })
}

/** 读取 fixture 生成的 SSR HTML 与打包 CSS。 */
export function readFixtureOutput(root = REPO_ROOT) {
    const publicDir = join(fixtureDir(root), '.output', 'public')
    const html = readFileSync(join(publicDir, 'index.html'), 'utf8')
    const nuxtDir = join(publicDir, '_nuxt')
    const css = readdirSync(nuxtDir)
        .filter((file) => file.endsWith('.css'))
        .map((file) => readFileSync(join(nuxtDir, file), 'utf8'))
        .join('\n')

    return { html, css }
}

/** 执行完整冒烟，返回 `{ ok, errors, details }`。 */
export function checkNuxt(root = REPO_ROOT) {
    if (!existsSync(join(root, 'dist', 'nuxt.js'))) {
        return {
            ok: false,
            errors: ['dist/nuxt.js 缺失，请先执行 `pnpm build`'],
            details: { needsBuild: true },
        }
    }

    const errors = []

    try {
        ensureFixtureLink(root)
        runNuxtGenerate(root)
    } catch (error) {
        const output = [error?.stdout, error?.stderr].filter(Boolean).join('\n').trim()
        const tail = output.split('\n').slice(-15).join('\n')
        errors.push(`nuxt generate 执行失败：${error instanceof Error ? error.message : String(error)}`)
        if (tail) {
            errors.push(`构建输出（末尾）：\n${tail}`)
        }
        return { ok: false, errors, details: {} }
    }

    let output
    try {
        output = readFixtureOutput(root)
    } catch (error) {
        errors.push(`读取 fixture 构建产物失败：${error instanceof Error ? error.message : String(error)}`)
        return { ok: false, errors, details: {} }
    }

    for (const label of findMissingMarkers(output.html, HTML_MARKERS)) {
        errors.push(`SSR HTML 缺少：${label}`)
    }
    for (const label of findMissingMarkers(output.css, CSS_MARKERS)) {
        errors.push(`打包 CSS 缺少：${label}`)
    }

    return { ok: errors.length === 0, errors, details: {} }
}

if (isDirectExecution(import.meta.url)) {
    const result = checkNuxt()

    if (result.ok) {
        console.info('[check-nuxt] 通过：最小 Nuxt 4 应用自动导入、样式注入、主题与暗色、SSR 均正常')
        process.exit(0)
    }

    if (result.details.needsBuild) {
        console.error('[check-nuxt][hint] 请先执行 `pnpm build` 生成 dist 产物')
    }
    for (const error of result.errors) {
        console.error(`[check-nuxt][error] ${error}`)
    }
    process.exit(1)
}
