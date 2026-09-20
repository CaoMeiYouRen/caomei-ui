#!/usr/bin/env node

/**
 * check-i18n-old-dirs：检测文档翻译的旧目录结构。
 *
 * 背景：caomei-ui 的文档翻译统一放在 `docs/i18n/<locale>/` 下。
 * 历史上可能存在 `docs/<locale>/` 的旧结构（如 `docs/zh-CN/`、`docs/en/`），
 * 这些旧目录会导致构建产物路径混乱、语言切换异常。
 *
 * 检查项（error，命中即 exit 1）：
 * 1. **旧目录存在**：`docs/` 下存在 `<locale>/` 形式的目录（非 `i18n`），
 *    且该目录包含 `.md` 文件或子目录——说明有遗留的翻译内容未迁移。
 *
 * 检查项（warning，不影响退出码）：
 * 2. **旧目录为空**：`docs/<locale>/` 存在但为空目录——可能是迁移后残留。
 *
 * 已知不覆盖（有意）：
 * - `docs/i18n/` 本身是正确的目录结构；
 * - `docs/.vitepress/` 是 VitePress 配置目录；
 * - `docs/examples/` 是示例目录；
 * - 其他非 locale 命名的目录（如 `components/`、`design/`、`guide/`）。
 *
 * 用法：
 *   node scripts/docs/check-i18n-old-dirs.mjs
 *   node scripts/docs/check-i18n-old-dirs.mjs --mode=warn
 */
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution, parseCliOptions } from '../shared/cli.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const projectRoot = resolve(__dirname, '..', '..')
export const docsRoot = join(projectRoot, 'docs')

export const DEFAULT_MODE = 'error'

/**
 * 已知的 locale 代码模式（BCP 47 格式）。
 * 匹配 `xx`、`xx-XX`、`xxx-XX` 等常见形式。
 */
const LOCALE_PATTERN = /^[a-z]{2,3}(?:-[A-Z]{2,4})?$/

/**
 * 不应被视为 locale 目录的名称。
 */
const EXCLUDED_DIRS = new Set([
    'i18n',
    '.vitepress',
    'examples',
    'components',
    'design',
    'guide',
    'plan',
    'standards',
    'node_modules',
    '.git',
])

export function parseArgs(argv = process.argv) {
    return parseCliOptions(argv, {
        defaults: { mode: DEFAULT_MODE },
        values: {
            '--mode': { allowedValues: ['error', 'warn'], key: 'mode' },
        },
    })
}

/**
 * 判断目录名是否为 locale 代码。
 * @param {string} dirName
 * @returns {boolean}
 */
export function isLocaleDir(dirName) {
    if (EXCLUDED_DIRS.has(dirName)) {
        return false
    }
    return LOCALE_PATTERN.test(dirName)
}

/**
 * 检查目录是否包含内容（.md 文件或子目录）。
 * @param {string} dirPath
 * @returns {{ hasContent: boolean, mdCount: number, subDirCount: number }}
 */
export function checkDirContent(dirPath) {
    let mdCount = 0
    let subDirCount = 0

    try {
        const entries = readdirSync(dirPath)
        for (const entry of entries) {
            const fullPath = join(dirPath, entry)
            const stat = statSync(fullPath)
            if (stat.isDirectory()) {
                subDirCount++
            } else if (entry.endsWith('.md')) {
                mdCount++
            }
        }
    } catch {
        // 读取失败视为无内容
    }

    return {
        hasContent: mdCount > 0 || subDirCount > 0,
        mdCount,
        subDirCount,
    }
}

/**
 * 检测 docs 目录下的旧 i18n 目录。
 * @param {string} docsDir
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function checkOldI18nDirs(docsDir = docsRoot) {
    const errors = []
    const warnings = []

    if (!existsSync(docsDir)) {
        return { errors, warnings }
    }

    const entries = readdirSync(docsDir)
    for (const entry of entries) {
        const fullPath = join(docsDir, entry)
        const stat = statSync(fullPath)

        if (!stat.isDirectory()) {
            continue
        }

        if (!isLocaleDir(entry)) {
            continue
        }

        const { hasContent, mdCount, subDirCount } = checkDirContent(fullPath)

        if (hasContent) {
            errors.push(
                `发现旧 i18n 目录：docs/${entry}/（${mdCount} 个 .md 文件，${subDirCount} 个子目录）。`
                + `请迁移到 docs/i18n/${entry}/`,
            )
        } else {
            warnings.push(
                `发现空的旧 i18n 目录：docs/${entry}/（可安全删除）`,
            )
        }
    }

    return { errors, warnings }
}

function main() {
    const { mode } = parseArgs()
    const { errors, warnings } = checkOldI18nDirs()

    // 输出警告
    for (const warning of warnings) {
        console.warn(`[check-i18n-old-dirs] ⚠ ${warning}`)
    }

    // 输出错误
    if (errors.length > 0) {
        for (const error of errors) {
            console.error(`[check-i18n-old-dirs] ✖ ${error}`)
        }
        if (mode === 'error') {
            process.exit(1)
        }
    }

    if (errors.length === 0 && warnings.length === 0) {
        console.info('[check-i18n-old-dirs] 通过：未发现旧 i18n 目录')
    }
}

if (isDirectExecution(import.meta.url)) {
    main()
}
