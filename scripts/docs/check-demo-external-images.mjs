#!/usr/bin/env node

/**
 * check-demo-external-images：文档站示例「外部图片源」守卫。
 *
 * 背景：示例曾用 `picsum.photos` 等外部图床作占位图，后统一改为站点内置本地占位图
 * （`docs/public/demo/*.svg` + `withBase`）。外部图片源会让示例**依赖第三方可用性**：离线 / 网络
 * 受限 / 上游下线时示例静默变成破图，且为文档站引入不可控的隐私与合规面。该次清理为**一次性人工
 * 操作**、当时无防复发门禁，故补此机检——来源与口径见
 * `docs/design/governance/2026-10-13-phase23-m5-1-demo-external-image-guard.md`。
 *
 * 规则（error，命中即 exit 1）：
 * 1. `external-image-source`——示例面文件内出现 `http(s)://` URL。
 *    **口径为整文件扫描（fail-closed）**：示例里的图片源常经间接赋值（典型为
 *    `const src = withBase('/demo/x.svg')` → `:src="src"`），只判 `src=` 语法位置会漏掉同一 idiom
 *    改为外链的形态；当前仓示例面**零**非图片外链，故不引入放行名单（将来若确需非图片外链，
 *    比照 `check-interpolation.mjs` 的登记表 + 反向校验形态扩展）。
 * 2. `scan-scope-narrowed`——受检示例文件数须达下界，且覆盖中英两侧示例目录（防受检范围被
 *    静默收窄）。
 *
 * 已知边界（有意）：
 * - 受检面为 `docs/**\/examples/**` 下的示例 `.vue` 文件；文档 `.md` 页正文内的外链图片不在本面
 *   （由 `docs:check:example-refs` 覆盖示例引用存在性，二者互补）；
 * - 只看**小写** `http(s)://` 字面量：运行时拼接 / 环境变量注入的外链、大写 scheme（`HTTPS://`）
 *   与协议相对形态（`//host/path`）均不在面内，属文本守卫的固有边界（当前仓零命中）；
 * - 整文件 fail-closed 会一并命中**非图片外链**（如 `<a href>`）与内联 SVG 的命名空间 URL——
 *   当前仓零命中；若将来出现合法用例，按 `docs:check:interpolation` 的登记表 + 反向校验形态扩展。
 *
 * 用法：
 *   node scripts/docs/check-demo-external-images.mjs [仓库根目录]
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'
import { IGNORED_PATH_SEGMENTS } from './check-docs-integrity.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const projectRoot = path.resolve(__dirname, '..', '..')

/** 示例面目录前缀（中英两侧）。 */
export const EXAMPLE_DIR_PREFIXES = ['docs/examples/', 'docs/i18n/en-US/examples/']

/** 示例目录段名（任意深度下的 `examples/` 均计入受检面）。 */
export const EXAMPLE_SEGMENT = 'examples/'

/** 外部 URL 字面量（含协议，排除被引号 / 括号 / 中文标点截断的情形）。 */
export const EXTERNAL_URL_RE = /https?:\/\/[^\s"'`)>\]}，。；、]+/u

/** 受检示例文件数下界（当前 363，防 glob / 过滤被静默收窄）。 */
export const MIN_SCANNED_EXAMPLES = 300

/**
 * 纯函数：在给定示例文件内容中找出外部 URL 字面量（每行至多报 1 处，避免噪声）。
 *
 * @param {Array<{ file: string, content: string }>} files 文件清单
 * @returns {Array<{ type: string, file: string, line: number, message: string }>} 问题列表
 */
export function findExternalImageSources(files) {
    const issues = []
    for (const { file, content } of files) {
        content.split(/\r?\n/u).forEach((line, index) => {
            const match = line.match(EXTERNAL_URL_RE)
            if (!match) {
                return
            }
            issues.push({
                type: 'external-image-source',
                file,
                line: index + 1,
                message: `示例出现在外部 URL「${match[0]}」：示例须自包含，图片源请改用站点内置本地占位图（docs/public/demo/*.svg + withBase）`,
            })
        })
    }
    return issues
}

/**
 * 纯函数：断言受检文件集未被静默收窄（文件数下界 + 中英两侧示例目录覆盖）。
 *
 * @param {string[]} filePaths 受检文件相对路径
 * @param {number} minFiles 文件数下界
 * @returns {Array<{ type: string, file: string, line: null, message: string }>} 问题列表
 */
export function checkScannedScope(filePaths, minFiles = MIN_SCANNED_EXAMPLES) {
    const issues = []
    if (filePaths.length < minFiles) {
        issues.push({ type: 'scan-scope-narrowed', file: '', line: null, message: `受检示例文件数 ${filePaths.length} 低于下界 ${minFiles}：受检范围疑似被静默收窄` })
    }
    for (const prefix of EXAMPLE_DIR_PREFIXES) {
        if (!filePaths.some((file) => file.startsWith(prefix))) {
            issues.push({ type: 'scan-scope-narrowed', file: '', line: null, message: `受检面缺少 ${prefix} 下的文件：受检范围疑似被静默收窄` })
        }
    }
    return issues
}

/**
 * 收集受版本控制、位于示例目录下且不属于生成物路径的示例文件（相对仓库根）。
 *
 * @param {string} root 仓库根目录
 * @returns {string[]} 文件相对路径
 */
export function collectExampleFiles(root = projectRoot) {
    let output
    try {
        output = execFileSync('git', ['ls-files', '--', '*.vue'], { cwd: root, encoding: 'utf8' })
    } catch {
        throw new Error(`目标目录不是 git 仓库（无法列出受版本控制的示例文件）：${root}`)
    }
    return output
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .filter((line) => line.startsWith('docs/'))
        .filter((line) => line.includes(EXAMPLE_SEGMENT))
        .filter((line) => !IGNORED_PATH_SEGMENTS.some((segment) => line.includes(`${segment}/`)))
}

/**
 * 执行示例外部图片源检查。
 *
 * @param {string} root 仓库根目录
 * @param {{ files?: string[], minScannedFiles?: number }} [options] 便于单测注入文件集 / 下界
 * @returns {{ issues: Array<object>, scannedFiles: number }} 检查结果
 */
export function runDemoExternalImageCheck(root = projectRoot, options = {}) {
    const filePaths = options.files ?? collectExampleFiles(root)
    const minFiles = options.minScannedFiles ?? MIN_SCANNED_EXAMPLES
    const files = filePaths.map((file) => {
        const absolute = path.resolve(root, file)
        return { file, content: existsSync(absolute) ? readFileSync(absolute, 'utf8') : '' }
    })
    return {
        issues: [...checkScannedScope(filePaths, minFiles), ...findExternalImageSources(files)],
        scannedFiles: filePaths.length,
    }
}

/**
 * 校验命令行传入的目标目录：必须是含 `package.json` 的仓库根。
 *
 * @param {string | undefined} arg 位置参数
 * @param {string} fallbackRoot 未传参时的默认根目录
 * @returns {{ root: string | null, error: string | null }} 目标根或错误原因
 */
export function resolveTargetRoot(arg, fallbackRoot = projectRoot) {
    if (!arg) {
        return { root: fallbackRoot, error: null }
    }
    if (arg.startsWith('-')) {
        return { root: null, error: `不支持的参数：${arg}` }
    }
    try {
        readFileSync(path.resolve(arg, 'package.json'), 'utf8')
    } catch {
        return { root: null, error: `目标目录不是仓库根（缺 package.json）：${arg}` }
    }
    return { root: arg, error: null }
}

if (isDirectExecution(import.meta.url)) {
    const { root: targetRoot, error: rootError } = resolveTargetRoot(process.argv[2])
    if (rootError) {
        process.stderr.write(`[check-demo-external-images] ${rootError}\n`)
        process.exitCode = 1
    } else {
        try {
            const { issues, scannedFiles } = runDemoExternalImageCheck(targetRoot)
            if (issues.length > 0) {
                for (const issue of issues) {
                    const location = issue.line === null ? issue.file || '<scope>' : `${issue.file}:${issue.line}`
                    process.stderr.write(`${location}:${issue.type}: ${issue.message}\n`)
                }
                process.stderr.write(`[check-demo-external-images] ${issues.length} 处问题（受检 ${scannedFiles} 个示例文件）\n`)
                process.exitCode = 1
            } else {
                process.stdout.write(`[check-demo-external-images] OK：受检 ${scannedFiles} 个示例文件，无外部图片源\n`)
            }
        } catch (error) {
            process.stderr.write(`[check-demo-external-images] ${error instanceof Error ? error.message : String(error)}\n`)
            process.exitCode = 1
        }
    }
}
