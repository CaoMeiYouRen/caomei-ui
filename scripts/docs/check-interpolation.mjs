#!/usr/bin/env node

/**
 * check-interpolation：文档站「围栏外字面双花括号插值」守卫。
 *
 * 背景：VitePress 把 `docs/**\/*.md` 当 Vue 模板编译，页面里出现的字面双花括号会被求值。
 * 若内容描述的是插值语法（如写出一对双花括号再跟 `theme.version`），渲染该页时会抛
 * `TypeError: Cannot read properties of undefined (reading 'version')`——而 `pnpm docs:build`
 * **仍 exit 0**，违规只在渲染日志可见（两次踩中，见 [文档与演示站 §13]）。
 *
 * 规则（error，命中即 exit 1）：
 * 1. `literal-interpolation`——`docs/**\/*.md` 中**围栏外**出现的字面双花括号 `{{`。
 *    围栏代码块由 VitePress 的 `v-pre` 豁免（除 `-vue` 后缀语言的围栏会保留插值，本仓未使用，
 *    属已知不覆盖）；行内代码**不豁免**（行内代码仍参与模板求值）。
 * 2. `allowlist-*`——允许插值的页面登记表（`INTERPOLATION_ALLOWLIST`）须非空、覆盖中英两侧、
 *    文件存在且仍含登记的插值形态（**反向校验**：登记失效即失败，防清单腐烂）。
 * 3. `scan-scope-narrowed`——受检 `.md` 文件数须达下界且覆盖 `docs/guide/` 与 `docs/i18n/en-US/`
 *    （防受检范围被静默收窄）。
 *
 * 已知边界（有意）：
 * - 仓库根 `README.md` / `README.en-US.md` 等 `docs/` 之外的文件不经 VitePress 渲染、无插值能力，
 *   不在受检面；
 * - HTML 注释内的双花括号由 Vue 编译器忽略，本守卫仍会命中（保守方向，当前仓库零命中）；
 * - `<script setup>` / `<template>` 块与行内代码一样按普通文本扫描（模板块内是 JS，字面 `{{` 属潜在
 *   误报，当前仓库零命中）；
 * - 围栏代码块内的字面双花括号不检（`v-pre` 豁免）。
 *
 * 用法：
 *   node scripts/docs/check-interpolation.mjs [仓库根目录]
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'
import { IGNORED_PATH_SEGMENTS, detectFenceState } from './check-docs-integrity.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const projectRoot = path.resolve(__dirname, '..', '..')

/** 本库唯一被允许的站点插值形态：消费 `theme.version` 派生版本（单一来源 = 仓库根 `package.json`）。 */
export const THEME_VERSION_INTERPOLATION = /\{\{\s*theme\.version\s*\}\}/u

/**
 * 允许插值的页面登记表：**仅这些页面**可在围栏外消费 `theme.version` 插值。
 * `expect` 须为**非全局**正则（供 `.test` 反向校验；剥离时由 `stripAllowedInterpolations` 克隆为全局）。
 * 与 `check-site-version.mjs` 的 `VERSION_SURFACES` 页面面保持同集合——新增插值页面时两处需同步。
 */
export const INTERPOLATION_ALLOWLIST = [
    { file: 'docs/guide/getting-started.md', expect: THEME_VERSION_INTERPOLATION },
    { file: 'docs/i18n/en-US/guide/getting-started.md', expect: THEME_VERSION_INTERPOLATION },
    { file: 'docs/guide/version-policy.md', expect: THEME_VERSION_INTERPOLATION },
    { file: 'docs/i18n/en-US/guide/version-policy.md', expect: THEME_VERSION_INTERPOLATION },
]

/** 字面双花括号的起始 token（Vue 插值）。 */
export const LITERAL_INTERPOLATION_RE = /\{\{/u

/** 受检 `.md` 文件数下界（当前 200+，防 glob / 过滤被静默收窄）。 */
export const MIN_SCANNED_FILES = 150

/** 受检面必须覆盖的语言前缀（登记表与受检文件集均须覆盖）。 */
export const REQUIRED_SCAN_PREFIXES = ['docs/guide/', 'docs/i18n/en-US/']

/**
 * 纯函数：剥离一行中已登记的允许插值形态，返回剩余文本。
 *
 * @param {string} line 单行文本
 * @param {Array<{ file: string, expect: RegExp }>} allowlist 允许插值页面登记表
 * @returns {string} 剥离后的剩余文本
 */
export function stripAllowedInterpolations(line, allowlist) {
    let result = line
    for (const entry of allowlist) {
        const flags = entry.expect.flags.includes('g') ? entry.expect.flags : `${entry.expect.flags}g`
        result = result.replace(new RegExp(entry.expect.source, flags), '')
    }
    return result
}

/**
 * 纯函数：在给定文件内容中找出**围栏外**的字面双花括号。
 *
 * 登记表内页面按 `expect` 逐行剥离后仍出现 `{{` 者同样命中（登记表只放行已声明的插值形态）。
 *
 * @param {Array<{ file: string, content: string }>} files 文件清单
 * @param {Array<{ file: string, expect: RegExp }>} [allowlist] 允许插值页面登记表
 * @returns {Array<{ type: string, file: string, line: number, message: string }>} 问题列表
 */
export function findLiteralInterpolations(files, allowlist = INTERPOLATION_ALLOWLIST) {
    const issues = []
    for (const { file, content } of files) {
        const entry = allowlist.find((item) => item.file === file)
        const expects = entry ? [entry] : []
        const lines = content.split(/\r?\n/u)
        const { inCodeByLine } = detectFenceState(lines)
        lines.forEach((line, index) => {
            if (inCodeByLine[index]) {
                return
            }
            const residue = stripAllowedInterpolations(line, expects)
            const match = residue.match(LITERAL_INTERPOLATION_RE)
            if (!match) {
                return
            }
            const snippet = residue.slice(match.index, match.index + 48).trim()
            issues.push({
                type: 'literal-interpolation',
                file,
                line: index + 1,
                message: `围栏外出现字面双花括号「{{」（VitePress 会把 .md 当 Vue 模板求值，渲染该页时抛 TypeError）：${snippet}。描述插值语法请改用文字，或放入围栏代码块`,
            })
        })
    }
    return issues
}

/**
 * 纯函数：校验允许插值页面登记表——非空、覆盖中英两侧、文件存在、仍含登记的插值形态。
 *
 * @param {Array<{ file: string, expect: RegExp }>} allowlist 登记表
 * @param {string} root 仓库根目录
 * @returns {Array<{ type: string, file: string, line: null, message: string }>} 问题列表
 */
export function checkInterpolationAllowlist(allowlist, root = projectRoot) {
    if (allowlist.length === 0) {
        return [{ type: 'allowlist-scope-narrowed', file: '', line: null, message: '允许插值页面登记表为空：拒绝以空登记通过' }]
    }
    const issues = []
    for (const prefix of REQUIRED_SCAN_PREFIXES) {
        if (!allowlist.some((entry) => entry.file.startsWith(prefix))) {
            issues.push({ type: 'allowlist-scope-narrowed', file: '', line: null, message: `允许插值页面登记表缺少 ${prefix} 下的页面：受检范围疑似被静默收窄` })
        }
    }
    for (const entry of allowlist) {
        const absolute = path.resolve(root, entry.file)
        if (!existsSync(absolute)) {
            issues.push({ type: 'allowlist-missing', file: entry.file, line: null, message: `登记的允许插值页面不存在：${entry.file}` })
            continue
        }
        const content = readFileSync(absolute, 'utf8')
        const probe = new RegExp(entry.expect.source, entry.expect.flags.replaceAll('g', ''))
        if (!probe.test(content)) {
            issues.push({ type: 'allowlist-stale', file: entry.file, line: null, message: `登记的允许插值页面已不含期望插值（${entry.expect.source}）：登记失效，请更新或移除该条` })
        }
    }
    return issues
}

/**
 * 纯函数：断言受检文件集未被静默收窄（文件数下界 + 语言前缀覆盖）。
 *
 * @param {string[]} filePaths 受检文件相对路径
 * @param {number} minFiles 文件数下界
 * @returns {Array<{ type: string, file: string, line: null, message: string }>} 问题列表
 */
export function checkScannedScope(filePaths, minFiles = MIN_SCANNED_FILES) {
    const issues = []
    if (filePaths.length < minFiles) {
        issues.push({ type: 'scan-scope-narrowed', file: '', line: null, message: `受检 .md 文件数 ${filePaths.length} 低于下界 ${minFiles}：受检范围疑似被静默收窄` })
    }
    for (const prefix of REQUIRED_SCAN_PREFIXES) {
        if (!filePaths.some((file) => file.startsWith(prefix))) {
            issues.push({ type: 'scan-scope-narrowed', file: '', line: null, message: `受检面缺少 ${prefix} 下的文件：受检范围疑似被静默收窄` })
        }
    }
    return issues
}

/**
 * 收集受版本控制、位于 `docs/` 下且不属于生成物路径的 `.md` 文件（相对仓库根）。
 *
 * @param {string} root 仓库根目录
 * @returns {string[]} 文件相对路径
 */
export function collectDocsMarkdownFiles(root = projectRoot) {
    let output
    try {
        output = execFileSync('git', ['ls-files', '--', '*.md'], { cwd: root, encoding: 'utf8' })
    } catch {
        throw new Error(`目标目录不是 git 仓库（无法列出受版本控制的 .md）：${root}`)
    }
    return output
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .filter((line) => line.startsWith('docs/'))
        .filter((line) => !IGNORED_PATH_SEGMENTS.some((segment) => line.includes(`${segment}/`)))
}

/**
 * 执行围栏外字面双花括号检查。
 *
 * @param {string} root 仓库根目录
 * @param {{ files?: string[], allowlist?: typeof INTERPOLATION_ALLOWLIST, minScannedFiles?: number }} [options]
 *        便于单测注入文件集 / 登记表 / 下界
 * @returns {Promise<{ issues: Array<object>, scannedFiles: number, allowlisted: number }>} 检查结果
 */
export async function runInterpolationCheck(root = projectRoot, options = {}) {
    const allowlist = options.allowlist ?? INTERPOLATION_ALLOWLIST
    const filePaths = options.files ?? collectDocsMarkdownFiles(root)
    const minFiles = options.minScannedFiles ?? MIN_SCANNED_FILES
    const files = filePaths.map((file) => {
        const absolute = path.resolve(root, file)
        return { file, content: existsSync(absolute) ? readFileSync(absolute, 'utf8') : '' }
    })
    const issues = [
        ...checkInterpolationAllowlist(allowlist, root),
        ...checkScannedScope(filePaths, minFiles),
        ...findLiteralInterpolations(files, allowlist),
    ]
    return { issues, scannedFiles: filePaths.length, allowlisted: allowlist.length }
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
        process.stderr.write(`[check-interpolation] ${rootError}\n`)
        process.exitCode = 1
    } else {
        try {
            const { issues, scannedFiles, allowlisted } = await runInterpolationCheck(targetRoot)
            if (issues.length > 0) {
                for (const issue of issues) {
                    const location = issue.line === null ? issue.file || '<scope>' : `${issue.file}:${issue.line}`
                    process.stderr.write(`${location}:${issue.type}: ${issue.message}\n`)
                }
                process.stderr.write(`[check-interpolation] ${issues.length} 处问题（受检 ${scannedFiles} 个 .md，登记允许插值 ${allowlisted} 页）\n`)
                process.exitCode = 1
            } else {
                process.stdout.write(`[check-interpolation] OK：受检 ${scannedFiles} 个 .md 围栏外无字面双花括号，登记允许插值 ${allowlisted} 页\n`)
            }
        } catch (error) {
            process.stderr.write(`[check-interpolation] ${error instanceof Error ? error.message : String(error)}\n`)
            process.exitCode = 1
        }
    }
}
