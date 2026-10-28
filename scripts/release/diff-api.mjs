#!/usr/bin/env node

/**
 * diff-api：发布时 API 表面差分（仅比对 `.d.ts`）。
 *
 * 依据 [API 表面基线评估记录](../../docs/design/governance/2026-10-24-phase26-m1-3-api-surface-baseline-evaluation.md)：
 * 删除 / 重命名 / 必填性收紧属 breaking，类型变化属 warning。本脚本覆盖可机检的前两类：
 * 1. 基线有、当前没有的 `.d.ts` 文件（删除 / 重命名）；
 * 2. 基线有、当前没有的导出名（删除 / 重命名）。
 *
 * 声明文件的内容变化只列出、不判失败（required 收紧需人工复核，见 `changedFiles`）。
 * scoped CSS / JS 产物的哈希文件名**不在比对面**，避免样式变更产生假阳性。
 *
 * 用法：
 *   node scripts/release/diff-api.mjs --baseline=/tmp/api-diff/package/dist
 *   pnpm check:api-surface --baseline=<dir> --current=dist --json
 *
 * 退出码：0 通过；1 存在删除 / 重命名；2 参数或路径错误。
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution, parseCliOptions } from '../shared/cli.mjs'

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const DEFAULT_CURRENT = join(REPO_ROOT, 'dist')
export const DECLARATION_EXTENSION = '.d.ts'

const DECLARATION_EXPORT_RE = /export\s+declare\s+(?:class|function|const|let|var|interface|type|enum|namespace)\s+([\w$]+)/gu
const EXPORT_LIST_RE = /export\s+(?:type\s+)?\{([^}]*)\}/gu
const STAR_EXPORT_RE = /export\s+(?:type\s+)?\*\s*from/gu

/**
 * 递归收集目录下的 `.d.ts` 文件（仓库相对路径，正斜杠）。
 *
 * @param {string} root 目录
 * @returns {string[]} 相对路径（排序）
 */
export function collectDeclarationFiles(root) {
    if (!existsSync(root) || !statSync(root).isDirectory()) {
        throw new Error(`不是目录：${root}`)
    }
    const files = []
    const walk = (dir) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
            const full = join(dir, entry.name)
            if (entry.isDirectory()) {
                walk(full)
            } else if (entry.isFile() && entry.name.endsWith(DECLARATION_EXTENSION)) {
                files.push(relative(root, full).replaceAll('\\', '/'))
            }
        }
    }
    walk(root)
    return files.sort()
}

/**
 * 提取声明文件里的导出名。
 *
 * 覆盖 `export declare <kind> Name` 与 `export { A, B as C, type D }`；`export * from` 只计数
 * （无法静态展开），由调用方作为人工复核提示。
 *
 * @param {string} text 声明文件内容
 * @returns {{ names: string[], starExports: number }} 导出名与星号导出数量
 */
export function extractExportedNames(text) {
    const names = new Set()
    for (const match of text.matchAll(DECLARATION_EXPORT_RE)) {
        names.add(match[1])
    }
    for (const match of text.matchAll(EXPORT_LIST_RE)) {
        for (const part of match[1].split(',')) {
            const cleaned = part.trim().replace(/^type\s+/u, '')
            if (!cleaned) {
                continue
            }
            const alias = cleaned.split(/\s+as\s+/u).pop()?.trim() ?? ''
            if (/^[\w$]+$/u.test(alias)) {
                names.add(alias)
            }
        }
    }
    return { names: [...names].sort(), starExports: [...text.matchAll(STAR_EXPORT_RE)].length }
}

/**
 * 比较两套 `.d.ts` 表面。
 *
 * @param {{ baselineRoot: string, currentRoot: string }} input 基线 / 当前 dist 目录
 * @returns {Record<string, any>} 比较结果（`removedExports` / `addedExports` 为 `{ file, name }` 列表）
 */
export function compareApiSurfaces({ baselineRoot, currentRoot }) {
    const baselineFiles = collectDeclarationFiles(baselineRoot)
    const currentFiles = collectDeclarationFiles(currentRoot)
    const baselineSet = new Set(baselineFiles)
    const currentSet = new Set(currentFiles)
    const removedFiles = baselineFiles.filter((file) => !currentSet.has(file))
    const addedFiles = currentFiles.filter((file) => !baselineSet.has(file))

    const baselineNames = new Set()
    const currentNames = new Set()
    const baselineFileNames = new Map()
    const currentFileNames = new Map()
    let baselineStarExports = 0
    let currentStarExports = 0
    for (const file of baselineFiles) {
        const { names, starExports } = extractExportedNames(readFileSync(join(baselineRoot, file), 'utf8'))
        names.forEach((name) => baselineNames.add(name))
        baselineFileNames.set(file, new Set(names))
        baselineStarExports += starExports
    }
    for (const file of currentFiles) {
        const { names, starExports } = extractExportedNames(readFileSync(join(currentRoot, file), 'utf8'))
        names.forEach((name) => currentNames.add(name))
        currentFileNames.set(file, new Set(names))
        currentStarExports += starExports
    }

    // 按「文件 + 导出名」比对：同名导出可能出现在多个声明文件（如每个 SFC 的 default），
    // 只比全局集合会漏掉单文件删除。
    const commonFiles = baselineFiles.filter((file) => currentSet.has(file))
    const removedExports = []
    const addedExports = []
    for (const file of commonFiles) {
        const before = baselineFileNames.get(file) ?? new Set()
        const after = currentFileNames.get(file) ?? new Set()
        for (const name of before) {
            if (!after.has(name)) {
                removedExports.push({ file, name })
            }
        }
        for (const name of after) {
            if (!before.has(name)) {
                addedExports.push({ file, name })
            }
        }
    }
    removedExports.sort((a, b) => a.file.localeCompare(b.file) || a.name.localeCompare(b.name))
    addedExports.sort((a, b) => a.file.localeCompare(b.file) || a.name.localeCompare(b.name))
    const changedFiles = commonFiles
        .filter((file) => readFileSync(join(baselineRoot, file), 'utf8') !== readFileSync(join(currentRoot, file), 'utf8'))

    return {
        baselineFiles,
        currentFiles,
        removedFiles,
        addedFiles,
        baselineExports: [...baselineNames].sort(),
        currentExports: [...currentNames].sort(),
        removedExports,
        addedExports,
        changedFiles,
        baselineStarExports,
        currentStarExports,
        breaking: removedFiles.length > 0 || removedExports.length > 0,
    }
}

/**
 * 渲染文本报告。
 *
 * @param {ReturnType<typeof compareApiSurfaces>} result 结果
 * @returns {string} 报告
 */
export function formatReport(result) {
    const lines = [
        `[api-surface] 基线 ${result.baselineFiles.length} 个声明文件 / ${result.baselineExports.length} 个导出；当前 ${result.currentFiles.length} / ${result.currentExports.length}`,
    ]
    if (result.baselineStarExports > 0 || result.currentStarExports > 0) {
        lines.push(`  ! 存在 export * from（基线 ${result.baselineStarExports} 处 / 当前 ${result.currentStarExports} 处），导出名无法完全静态展开，需人工复核`)
    }
    for (const file of result.removedFiles) {
        lines.push(`  ✖ 删除 / 重命名文件：${file}`)
    }
    for (const { file, name } of result.removedExports) {
        lines.push(`  ✖ 删除 / 重命名导出：${file} → ${name}`)
    }
    for (const file of result.addedFiles) {
        lines.push(`  + 新增文件：${file}`)
    }
    for (const { file, name } of result.addedExports) {
        lines.push(`  + 新增导出：${file} → ${name}`)
    }
    lines.push(result.changedFiles.length > 0
        ? `  · ${result.changedFiles.length} 个声明文件内容变化，需人工复核是否收紧 required / 改变类型`
        : '  · 无声明文件内容变化')
    if (result.breaking) {
        lines.push('[api-surface] 未通过：存在删除 / 重命名（breaking）')
    } else if (result.changedFiles.length > 0) {
        lines.push('[api-surface] 通过：无删除 / 重命名（内容变化需人工复核）')
    } else {
        lines.push('[api-surface] 通过：无删除 / 重命名（无需人工复核）')
    }
    return lines.join('\n')
}

/**
 * CLI 入口。
 *
 * @param {string[]} argv 参数
 * @returns {number} 退出码
 */
export function main(argv = process.argv) {
    let options
    try {
        options = parseCliOptions(argv, {
            flags: { '--json': { key: 'json' } },
            values: {
                '--baseline': { key: 'baseline' },
                '--current': { key: 'current' },
            },
            defaults: { current: DEFAULT_CURRENT },
        })
        if (!options.baseline) {
            throw new Error('缺少 --baseline=<dir>（上一已发布版本的解包 dist 目录）')
        }
        const result = compareApiSurfaces({ baselineRoot: options.baseline, currentRoot: options.current })
        if (options.json) {
            console.info(JSON.stringify(result, null, 2))
        } else {
            console.info(formatReport(result))
        }
        return result.breaking ? 1 : 0
    } catch (error) {
        console.error(`[api-surface] ${error.message}`)
        return 2
    }
}

if (isDirectExecution(import.meta.url)) {
    process.exitCode = main()
}
