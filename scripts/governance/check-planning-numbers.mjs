#!/usr/bin/env node

/**
 * check-planning-numbers：拦截「代码注释 / 测试名」中的规划编号。
 *
 * 依据：规划规范 §4 —— 禁止在代码注释与测试名中写入规划编号（阶段内条目编号、阶段编号）；
 * 例外仅真实常量与**带文档路径的导航指针**。背景：本仓曾把条目编号写进测试名与 docstring，
 * 使后续 session 据编号推断执行面，而编号会随重编号 / 归档失效。
 *
 * 判定口径（**只扫注释与测试名**，不扫代码字面量）。四段形态：
 * 1. `entry`——条目形态：1~3 个大写字母 + 数字 + `-` + 数字（阶段内条目编号的通用形）；
 * 2. `sequential`——三位编号形态：**单**个大写字母 + ≥3 位数字（两位及以上前缀的规范名，
 *    如 ECMAScript 版本 / TypeScript 错误码，不命中）；
 * 3. `audit`——审计编号形态：2~4 个大写字母 + `-` + **单**个大写字母 + 1~3 位数字
 *    （评审发现编号族）——`-` 后必须跟字母，故 `UTF-8` / `ISO-8601` / `SHA-256` 等标准名不命中；
 * 4. `phase`——阶段形态：`Phase` + 数字。
 *
 * 已知边界（有意，非缺陷；改动前须先扩语料）：
 * - 单字母 + 三位以上数字（`sequential`）与型号 / 部件号可能撞车（单字母 + 四位数字的型号形态），当前按零存量取严；
 * - 跨行拼接的测试名（跨行模板字符串）不在测试名规则面；
 * - 两~四字母 + `-` + 数字（无字母，如 `OBS-1`）与标准号同形，不在规则面（避免误报）。
 *
 * 不命中（有意）：文档路径里的编号为小写（如 `.../2026-09-21-m3-1-...md`），属允许的导航指针；
 * 代码字面量（含 UI 标签 / 常量）不扫，`真实常量` 例外由此保证。
 * 词法器对**未闭合的单 / 双引号**按「非字符串」处理（在行尾或文件尾放弃），
 * 故模板文本里的撇号（如 `It's`）或正则字面量内的引号不会吞掉其后的注释 / 测试名。
 *
 * 用法：
 *   node scripts/governance/check-planning-numbers.mjs [仓库根目录]
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** 受检文件扩展名（代码 / 组件 / 脚本）。 */
export const CODE_EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts', '.vue', '.mjs', '.js', '.cjs']

/** 不参与扫描的目录名（依赖 / 产物 / 任务态 / 平台镜像）。 */
export const EXCLUDED_DIRS = new Set([
    'node_modules',
    '.git',
    '.nuxt',
    '.output',
    '.cache',
    'dist',
    'coverage',
    'logs',
    'tmp',
    'artifacts',
    'test-results',
    'playwright-report',
    '.session',
    '.temp',
    '.claude',
    '.agents',
    '.opencode',
])

/** 不参与扫描的仓库相对路径前缀（VitePress 生成物）。 */
export const EXCLUDED_PATH_PREFIXES = ['docs/.vitepress/dist', 'docs/.vitepress/cache']

/** 命中位置来源：注释 / 测试名。 */
export const HIT_SOURCES = ['comment', 'test-name']

/**
 * 规划编号形态。`hint` 为该形态的修复方向。
 * 顺序即报告顺序；同一片段命中多形态时逐条记录。
 */
export const PLANNING_NUMBER_RULES = [
    {
        id: 'entry',
        source: String.raw`(?<![A-Za-z0-9])[A-Z]{1,3}\d{1,3}-\d{1,3}(?![A-Za-z0-9])`,
        hint: '条目编号改为带文档路径的导航指针（如 `docs/design/governance/<file>.md`）或删除编号',
    },
    {
        id: 'sequential',
        source: String.raw`(?<![A-Za-z0-9])[A-Z]\d{3,}(?![A-Za-z0-9])`,
        hint: '三位编号改为带文档路径的导航指针或语义化测试名',
    },
    {
        id: 'audit',
        source: String.raw`(?<![A-Za-z0-9])[A-Z]{2,4}-[A-Z]\d{1,3}(?![A-Za-z0-9])`,
        hint: '审计编号改为带文档路径的导航指针或语义化测试名',
    },
    {
        id: 'phase',
        source: String.raw`(?<![A-Za-z0-9])Phase\s+\d+(?![0-9])`,
        hint: '阶段编号改为带文档路径的导航指针（阶段执行源见 `docs/plan/todo.md`）',
    },
]

/**
 * 收集受检代码文件。
 *
 * @param {string} root 仓库根目录
 * @returns {string[]} 绝对路径列表（已排序）
 */
export function collectCodeFiles(root = projectRoot) {
    const files = []
    walk(root, root, files)
    return files.sort()
}

/**
 * 递归收集代码文件（跳过排除目录与 VitePress 生成物）。
 *
 * @param {string} dir 当前目录
 * @param {string} root 仓库根目录
 * @param {string[]} out 输出累积
 * @returns {void}
 */
function walk(dir, root, out) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name)
        if (entry.isSymbolicLink()) {
            continue
        }
        if (entry.isDirectory()) {
            if (EXCLUDED_DIRS.has(entry.name)) {
                continue
            }
            const rel = relative(root, full).replaceAll('\\', '/')
            if (EXCLUDED_PATH_PREFIXES.includes(rel)) {
                continue
            }
            walk(full, root, out)
            continue
        }
        if (CODE_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
            out.push(full)
        }
    }
}

/**
 * 词法切分：给出注释区间与「已屏蔽区间」（字符串 / 模板字面量 + 注释）。
 *
 * 说明：测试名提取必须「只在代码位置识别调用」——夹具 / 文档里以字符串形式书写的
 * `describe(...)` 形态不得被当成真实测试名，故用屏蔽区间过滤命中位置。
 *
 * @param {string} content 文件内容
 * @returns {{ comments: Array<{ start: number, end: number, line: number }>, masked: Array<{ start: number, end: number }> }} 区间表
 */
export function tokenize(content) {
    const comments = []
    const masked = []
    const length = content.length
    let index = 0
    let line = 1
    let state = 'code'
    let quoteChar = ''
    let startLine = 1
    let startOffset = 0

    const closeComment = (end) => {
        if (content.slice(startOffset, end).trim().length > 0) {
            comments.push({ start: startOffset, end, line: startLine })
            masked.push({ start: startOffset, end })
        }
    }

    while (index < length) {
        const char = content[index]
        if (state === 'line') {
            if (char === '\n') {
                closeComment(index)
                state = 'code'
                line += 1
                index += 1
                continue
            }
            index += 1
            continue
        }
        if (state === 'block') {
            if (char === '*' && content[index + 1] === '/') {
                closeComment(index)
                state = 'code'
                index += 2
                continue
            }
            if (char === '\n') {
                line += 1
            }
            index += 1
            continue
        }
        if (state === 'html') {
            if (char === '-' && content.startsWith('-->', index)) {
                closeComment(index)
                state = 'code'
                index += 3
                continue
            }
            if (char === '\n') {
                line += 1
            }
            index += 1
            continue
        }
        if (state === 'str') {
            if (char === '\\') {
                index += 2
                continue
            }
            if (char === '\n') {
                line += 1
                // 单 / 双引号不能跨行：未闭合者按「非字符串」处理，避免撇号吞掉后续注释 / 测试名
                if (quoteChar !== '`') {
                    state = 'code'
                }
                index += 1
                continue
            }
            if (char === quoteChar) {
                state = 'code'
                masked.push({ start: startOffset, end: index + 1 })
            }
            index += 1
            continue
        }
        // state === 'code'
        if (char === '\n') {
            line += 1
            index += 1
            continue
        }
        if (char === '/' && content[index + 1] === '/') {
            state = 'line'
            startLine = line
            startOffset = index
            index += 2
            continue
        }
        if (char === '/' && content[index + 1] === '*') {
            state = 'block'
            startLine = line
            startOffset = index
            index += 2
            continue
        }
        if (char === '<' && content.startsWith('<!--', index)) {
            state = 'html'
            startLine = line
            startOffset = index
            index += 4
            continue
        }
        if (char === '"' || char === '\'' || char === '`') {
            state = 'str'
            quoteChar = char
            startOffset = index
            index += 1
            continue
        }
        index += 1
    }
    if (state === 'line' || state === 'block') {
        closeComment(index)
    } else if (state === 'str' && quoteChar === '`') {
        masked.push({ start: startOffset, end: index })
    }
    return { comments, masked }
}

/**
 * 提取注释片段（`//` / `/* *\/` / `<!-- -->`），跳过字符串字面量与模板字符串。
 *
 * @param {string} content 文件内容
 * @returns {Array<{ line: number, start: number, text: string }>} 注释片段（含起始行与起始偏移）
 */
export function extractComments(content) {
    const { comments } = tokenize(content)
    return comments.map((comment) => ({
        line: comment.line,
        start: comment.start,
        text: content.slice(comment.start, comment.end),
    }))
}

/**
 * 测试名匹配：`describe` / `it` / `test`（含 `.each(...)` / `.skip` 等修饰）的首个字符串参数。
 */
export const TEST_NAME_RE = /\b(?:describe|it|test)(?:\.[A-Za-z]+)*\s*(?:\((?:[^()]|\([^()]*\))*\))?\s*\(\s*([`'"])([^\n]*?)\1/g

/**
 * 提取测试名（describe / it / test 的首个字符串参数）；调用位置落在屏蔽区间内者不计。
 *
 * @param {string} content 文件内容
 * @returns {Array<{ line: number, name: string }>} 测试名列表
 */
export function extractTestNames(content) {
    const { masked } = tokenize(content)
    const names = []
    for (const match of content.matchAll(TEST_NAME_RE)) {
        const offset = match.index ?? 0
        if (masked.some((range) => offset >= range.start && offset < range.end)) {
            continue
        }
        names.push({
            line: countLinesUntil(content, offset),
            name: match[2],
        })
    }
    return names
}

function countLinesUntil(content, offset) {
    let line = 1
    for (let index = 0; index < offset && index < content.length; index += 1) {
        if (content[index] === '\n') {
            line += 1
        }
    }
    return line
}

/**
 * 在片段内匹配全部规划编号形态，逐条给出命中行号与该行原文。
 *
 * @param {string} segment 待检片段（注释文本或测试名）
 * @param {number} baseLine 片段起始行号
 * @returns {Array<{ id: string, line: number, snippet: string, hint: string }>} 命中列表
 */
export function matchPlanningNumbers(segment, baseLine = 1) {
    const hits = []
    const lines = segment.split(/\r?\n/u)
    for (const rule of PLANNING_NUMBER_RULES) {
        for (const match of segment.matchAll(new RegExp(rule.source, 'g'))) {
            const offset = match.index ?? 0
            const lineOffset = countNewlines(segment.slice(0, offset))
            hits.push({
                id: rule.id,
                line: baseLine + lineOffset,
                snippet: (lines[lineOffset] ?? '').trim().slice(0, 160),
                hint: rule.hint,
            })
        }
    }
    return hits
}

function countNewlines(text) {
    return (text.match(/\n/gu) ?? []).length
}

/**
 * 扫描单个文件内容，返回注释与测试名中的规划编号命中。
 *
 * @param {string} content 文件内容
 * @returns {Array<{ id: string, line: number, source: string, snippet: string, hint: string }>} 命中列表
 */
export function scanContent(content) {
    const hits = []
    for (const comment of extractComments(content)) {
        for (const hit of matchPlanningNumbers(comment.text, countLinesUntil(content, comment.start))) {
            hits.push({ ...hit, source: 'comment' })
        }
    }
    for (const testName of extractTestNames(content)) {
        for (const hit of matchPlanningNumbers(testName.name, testName.line)) {
            hits.push({ ...hit, source: 'test-name' })
        }
    }
    return hits
}

/**
 * 扫描仓库内全部受检代码文件。
 *
 * @param {string} root 仓库根目录
 * @param {string[]} [files] 受检文件列表（省略时自行收集，供调用方复用同一份 walk 结果）
 * @returns {Array<{ file: string, hits: Array<object> }>} 按文件聚合的命中
 */
export function scanRepository(root = projectRoot, files = collectCodeFiles(root)) {
    const results = []
    for (const file of files) {
        const hits = scanContent(readFileSync(file, 'utf8'))
        if (hits.length > 0) {
            results.push({ file: relative(root, file).replaceAll('\\', '/'), hits })
        }
    }
    return results
}

/**
 * 校验命令行传入的目标目录：必须是含 `.github/` 的仓库根，非法参数不得静默放行。
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
    if (!existsSync(join(arg, '.github'))) {
        return { root: null, error: `目标目录不是仓库根（缺 .github/）：${arg}` }
    }
    return { root: arg, error: null }
}

/**
 * 输出报告；存在命中时置退出码 1。
 *
 * @param {Array<{ file: string, hits: Array<object> }>} results 命中结果
 * @param {number} scannedFiles 受检文件数
 * @returns {void}
 */
export function report(results, scannedFiles) {
    const total = results.reduce((sum, result) => sum + result.hits.length, 0)
    if (total === 0) {
        process.stdout.write(`[check-planning-numbers] 0 处命中：${scannedFiles} 个受检文件的注释 / 测试名无规划编号\n`)
        return
    }
    for (const { file, hits } of results) {
        for (const hit of hits) {
            process.stderr.write(`${file}:${hit.line}:${hit.source}:${hit.id}: ${hit.snippet}\n`)
            process.stderr.write(`  修复方向：${hit.hint}\n`)
        }
    }
    process.stderr.write(`[check-planning-numbers] ${total} 处命中（${results.length} 个文件）：注释 / 测试名不得写规划编号（规划规范 §4）\n`)
    process.exitCode = 1
}

if (isDirectExecution(import.meta.url)) {
    const { root: targetRoot, error: rootError } = resolveTargetRoot(process.argv[2])
    if (rootError) {
        process.stderr.write(`[check-planning-numbers] ${rootError}\n`)
        process.exitCode = 1
    } else {
        const files = collectCodeFiles(targetRoot)
        if (files.length === 0) {
            process.stderr.write(`[check-planning-numbers] 未找到任何受检代码文件（目标目录：${targetRoot}）：拒绝以空扫描通过\n`)
            process.exitCode = 1
        } else {
            report(scanRepository(targetRoot, files), files.length)
        }
    }
}
