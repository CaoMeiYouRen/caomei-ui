#!/usr/bin/env node

/**
 * check-docs-integrity：守卫 Markdown 文档的**完整性**，拦截「被写空 / 被截断 / 结构被破坏」的文档。
 *
 * 背景：2026-09-17 曾两次出现批量改写脚本把治理文档写成 0 字节（`open(...,'w').write(open(...,).read())`
 * 先截断后读），而 `lint-md`、链接检查与行数检查对空 `.md` 天然放行（无坏链、0 行）——事故只能靠人工
 * 或间接信号（其他文档引用其锚点全部解析失败）发现。本脚本把这类「结构性损坏」变为可判定门禁。
 *
 * 检查项（error，命中即 exit 1）：
 * 1. **空文档**：内容为 0 字节或仅空白；
 * 2. **代码围栏不成对**：``` / ~~~ 围栏未闭合（与 `check-links.mjs` 的 `inCode` 口径一致但更严格：支持 `~~~`
 *    与围栏长度匹配）——围栏失衡
 *    会让其后的标题被当作代码块内容，锚点与标题解析静默失效；
 * 3. **孤立表格行**：由 `|` 开头的连续块缺少 GFM 分隔行（`|---|`）作为第二行——插入引用块 / 段落截断
 *    表格后，表格会退化为带字面 `|` 的段落。
 *
 * 检查项（warning，不影响退出码）：
 * 4. **相对 HEAD 的结构性缩减**：受版本控制且 HEAD 版本 ≥ `SHRINK_MIN_HEAD_LINES` 行的文档，工作区行数
 *    低于 HEAD 的 `SHRINK_RATIO` 比例；对 `SHRINK_EXEMPT_FILES`（按设计会越清理越短的载体）改为
 *    **结构标题（H1/H2）不得减少**的结构下界：阶段 / 条目标题写在 H3/H4，属归档清理的正常移除面
 *    （「归档移除阶段标题」），而骨架标题（H1/H2）的缺失才是「正文被截断」的信号。注意：该检查依赖
 *    「工作区 vs HEAD」，**洁净检出（CI）天然不触发**，只服务于提交前的本地复核；已提交的损坏须靠
 *    1~3 项（它们不依赖 HEAD）。
 *
 * 已知不覆盖（有意）：
 * - 引用块内的孤立表格行、无首尾 `|` 的 GFM 表格行——它们不是本仓库已发生过的损坏形态，纳入会带来误报面；
 * - 缩进代码块（4 空格 / Tab）内出现孤立围栏会误报 `unbalanced-code-fence`：收紧 `matchFence` 会破坏本仓
 *   列表项内 4 空格缩进的合法围栏（如 `CONTRIBUTING.md`），故按「有源码阅读经验的维护者一眼可辨」处理；
 * - `SHRINK_EXEMPT_FILES` 中的文件只做「结构标题不得减少」的结构下界：**保留 H1/H2 但大段删除 H3/H4
 *   正文**时无缩减信号（空文档检查仍生效）——这是为「归档后本就该整块移除阶段段」的载体让出的已知盲区；
 *   下界按标题**数**比较：同名标题的交换 / 重命名不另判（数不变即放行）。
 *
 * 用法：
 *   node scripts/docs/check-docs-integrity.mjs
 *   node scripts/docs/check-docs-integrity.mjs --mode=warn
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { isDirectExecution, parseCliOptions } from '../shared/cli.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const projectRoot = path.resolve(__dirname, '..', '..')

export const DEFAULT_MODE = 'error'
/** 触发「结构性缩减」比对的最小 HEAD 行数：过短的文件（如仅一行索引）不参与比对 */
export const SHRINK_MIN_HEAD_LINES = 20
/** 工作区行数低于 HEAD 行数的该比例时告警 */
export const SHRINK_RATIO = 0.3
/** 不参与检查的路径段（生成物 / 依赖 / 站点产物），按路径段匹配而非子串 */
export const IGNORED_PATH_SEGMENTS = ['node_modules', 'dist', '.vitepress/cache', '.vitepress/dist', 'coverage']
/**
 * 「结构性缩减」豁免清单：这些载体按设计会在阶段归档 / 清理后大幅变短（例如 `todo.md` 归档后只剩
 * 状态与未完成项汇总），行数比对会持续误报；改为**结构标题（H1/H2）不得减少**的结构下界
 * （空文档检查同样生效）。
 */
export const SHRINK_EXEMPT_FILES = ['docs/plan/todo.md']

/**
 * 结构标题的最大层级：H1/H2 视为文档骨架，其缺失才是「正文被截断」信号；
 * H3/H4 是阶段 / 条目标题，属归档清理的正常移除面。
 */
export const STRUCTURAL_HEADING_MAX_LEVEL = 2

export function parseArgs(argv = process.argv) {
    return parseCliOptions(argv, {
        defaults: { mode: DEFAULT_MODE },
        values: {
            '--mode': { allowedValues: ['error', 'warn'], key: 'mode' },
        },
    })
}

/** 纯函数：判定单个 Markdown 文件内容的完整性问题（便于单测） */
export function inspectMarkdownContent(content) {
    const issues = []
    if (content.trim().length === 0) {
        issues.push({ type: 'empty', message: '内容为空（0 字节或仅空白）' })
        return issues
    }

    const lines = content.split(/\r?\n/u)
    if (detectFenceState(lines).unbalanced) {
        issues.push({ type: 'unbalanced-code-fence', message: '代码围栏未闭合（``` / ~~~ 未成对）' })
    }

    let index = 0
    let openFence = null
    while (index < lines.length) {
        const line = lines[index]
        const fence = matchFence(line)
        if (fence && (!openFence || (fence.char === openFence.char && fence.length >= openFence.length))) {
            openFence = openFence ? null : fence
            index += 1
            continue
        }
        if (openFence || isIndentedCode(line) || !isTableRow(line)) {
            index += 1
            continue
        }
        let end = index
        while (end + 1 < lines.length && isTableRow(lines[end + 1])) {
            end += 1
        }
        const block = lines.slice(index, end + 1)
        // 块首即分隔行（列表项内的表格 / 续行边界）不作为损坏判定依据
        if (!isTableDelimiterRow(block[0]) && (block.length < 2 || !isTableDelimiterRow(block[1]))) {
            issues.push({ type: 'orphan-table-row', message: `第 ${index + 1} 行起的表格块缺少分隔行，表格已退化为普通段落` })
        }
        index = end + 1
    }

    return issues
}

/** 纯函数：围栏状态（供表格扫描与失衡判定复用） */
export function detectFenceState(lines) {
    const inCodeByLine = []
    let openFence = null
    for (const line of lines) {
        const fence = matchFence(line)
        if (fence && (!openFence || (fence.char === openFence.char && fence.length >= openFence.length))) {
            openFence = openFence ? null : fence
        }
        inCodeByLine.push(Boolean(openFence))
    }
    return { inCodeByLine, unbalanced: Boolean(openFence) }
}

function matchFence(line) {
    const match = line.match(/^\s*(`{3,}|~{3,})/u)
    if (!match) {
        return null
    }
    return { char: match[1][0], length: match[1].length }
}

function isIndentedCode(line) {
    return /^(?: {4,}|\t)/u.test(line) && line.trim().length > 0
}

function isTableRow(line) {
    const trimmed = line.trim()
    return trimmed.startsWith('|') && trimmed.endsWith('|')
}

function isTableDelimiterRow(line) {
    const trimmed = line.trim()
    return isTableRow(trimmed) && /^\|[\s:|-]+\|$/u.test(trimmed) && trimmed.includes('-')
}

/** 纯函数：判定是否属于「结构性缩减」（HEAD 行数足够且工作区远低于该比例） */
export function shouldWarnShrink(headLines, currentLines) {
    if (!Number.isFinite(headLines) || headLines < SHRINK_MIN_HEAD_LINES) {
        return false
    }
    return currentLines < headLines * SHRINK_RATIO
}

/** 纯函数：豁免文件的**结构下界**——H1/H2 骨架标题数不得减少 */
export function shouldWarnStructuralHeadingLoss(headContent, currentContent) {
    if (typeof headContent !== 'string' || headContent.length === 0) {
        return false
    }
    return countStructuralHeadings(currentContent) < countStructuralHeadings(headContent)
}

/** 纯函数：统计围栏外的 **H1/H2 骨架标题**数（层级由 `STRUCTURAL_HEADING_MAX_LEVEL` 单点派生） */
export function countStructuralHeadings(content) {
    return countHeadings(content, STRUCTURAL_HEADING_MAX_LEVEL)
}

/**
 * 纯函数：统计围栏外的标题数。
 *
 * @param {string} content 文件内容
 * @param {number} maxLevel 计入的最大标题层级（默认 6 = 全层级；2 即 H1/H2 骨架）
 * @returns {number} 标题数
 */
export function countHeadings(content, maxLevel = 6) {
    const lines = content.split(/\r?\n/u)
    const { inCodeByLine } = detectFenceState(lines)
    const headingRe = new RegExp(`^#{1,${maxLevel}}\\s`, 'u')
    return lines.filter((line, index) => !inCodeByLine[index] && headingRe.test(line)).length
}

export function collectTrackedMarkdownFiles() {
    const output = execFileSync('git', ['ls-files', '--', '*.md'], { cwd: projectRoot, encoding: 'utf8' })
    return output
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .filter((line) => !IGNORED_PATH_SEGMENTS.some((segment) => line.includes(`${segment}/`)))
}

function readHeadContent(file) {
    try {
        return execFileSync('git', ['show', `HEAD:${file}`], { cwd: projectRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    } catch {
        return null
    }
}

export function inspectMarkdownFile(file) {
    const absolutePath = path.join(projectRoot, file)
    let content
    try {
        content = readFileSync(absolutePath, 'utf8')
    } catch (error) {
        return {
            file,
            issues: [{ file, type: 'unreadable', message: `无法读取（受版本控制但在工作区缺失或不可读）：${error.message}` }],
            shrinkWarnings: [],
        }
    }

    const issues = inspectMarkdownContent(content).map((issue) => ({ ...issue, file }))
    const headContent = readHeadContent(file)
    const isExempt = SHRINK_EXEMPT_FILES.includes(file)

    const shrinkWarnings = []
    if (isExempt) {
        if (shouldWarnStructuralHeadingLoss(headContent, content)) {
            shrinkWarnings.push({
                file,
                type: 'structural-heading-loss',
                message: `H1/H2 结构标题由 HEAD 的 ${countStructuralHeadings(headContent)} 个降为 ${countStructuralHeadings(content)} 个（疑似骨架被破坏 / 正文被截断；阶段 / 条目标题在 H3/H4，属归档正常移除面）`,
            })
        }
    } else if (shouldWarnShrink(headContent === null ? 0 : countLines(headContent), countLines(content))) {
        shrinkWarnings.push({
            file,
            type: 'shrink',
            message: `行数由 HEAD 的 ${countLines(headContent)} 行降为 ${countLines(content)} 行（低于 ${SHRINK_RATIO * 100}%），疑似内容被清空 / 大面积截断`,
        })
    }

    return { file, issues, shrinkWarnings }
}

export function countLines(content) {
    if (content.length === 0) {
        return 0
    }
    return content.split(/\r?\n/u).length
}

export function collectIntegrityReport() {
    const files = collectTrackedMarkdownFiles()
    const results = files.map(inspectMarkdownFile)
    return {
        files,
        errors: results.flatMap((result) => result.issues),
        results,
        warnings: results.flatMap((result) => result.shrinkWarnings),
    }
}

export async function main(argv = process.argv) {
    const { mode } = parseArgs(argv)
    const { errors, files, warnings } = collectIntegrityReport()

    if (warnings.length > 0) {
        console.warn('[docs-integrity] warning:')
        for (const warning of warnings) {
            console.warn(`- ${warning.file}: ${warning.message}`)
        }
    }

    if (errors.length > 0) {
        const writer = mode === 'error' ? console.error : console.warn
        writer('\n[docs-integrity] error:')
        for (const error of errors) {
            writer(`- ${error.file}: ${error.message}`)
        }
        if (mode === 'error') {
            console.error(`\n[docs-integrity] failed: ${errors.length} 处结构性问题（扫描 ${files.length} 个受版本控制的 md）。`)
            process.exitCode = 1
            return
        }
        console.warn('\n[docs-integrity] completed in warn mode: errors are reported only.')
        return
    }

    console.info(`[docs-integrity] passed: ${files.length} 个受版本控制的 md 无空文档 / 无围栏失衡 / 无孤立表格行（缩减告警 ${warnings.length} 条）。`)
}

if (isDirectExecution(import.meta.url)) {
    await main()
}
