#!/usr/bin/env node

/**
 * check-archive-rg-counts：归档块「逐条 Review Gate 计数」与对应治理记录 §Review Gate 段的**对账守卫**。
 *
 * 为什么需要它：归档块里每条条目都写有 `RG …` 结论摘要（含 finding 计数），而同一结论的权威载体是
 * 该条目指向的治理记录 §Review Gate 段——**同一事实的两处载体**，此前无机检。归档批次曾因此在
 * 计数上被判 blocker（口径与落点见 `docs/design/governance/2026-10-13-phase23-archive.md` 与本条目记录）。
 *
 * 判别口径（**只对「两处都有却矛盾」判失败**，避免高误报）：
 * 1. 计数只从**全角括号内的计数表达式**提取——`（N blocker / N warning / N suggest）` 或裸三元组
 *    `（a / b / c）`（按 blocker / warning / suggest 顺序）。**这是有意收窄**：轮次标签自身形如
 *    `R1 suggest`，若允许「括号外也匹配 `N suggest`」会把标签读成计数（实测误报）。
 * 2. 轮次按 `R<数字>` 切分；未标注轮次的条目计数归入 `FINAL`，与记录的**最后一轮**比对。
 * 3. **只在两侧都出现的轮次 + 同名字段上比对**；任一侧缺失即跳过（不判失败、不判通过）。
 * 4. 一条条目可链接多份记录（如「初版记录 + 形态变更记录」）：**逐字段判定**——某个 `(轮次, 字段)`
 *    在任一份候选记录上读数一致即该字段通过，全部候选都不一致才判 `rg-count-mismatch`（实测：
 *    多链接条目若按「任一矛盾即失败」会误报，因为另一份记录描述的是同一编号的另一轮审计）。
 * 5. 受检面下界 `MIN_RECONCILED`：可比对（轮次 + 字段都命中）的字段总数低于下界即判 `scope-narrowed`，
 *    防「解析被静默削弱 ⇒ 0 命中 ⇒ 通过」。
 *
 * 已知边界（有意不覆盖）：
 * - 只扫归档载体（主窗口 + 深度归档目录）中**带 `**M<数字>` 编号且含 `RG`** 的条目行；`已知观察` /
 *   `遗留与后续候选` 等非条目段不在面内；
 * - 条目不写计数（如 `RG `deep` **Pass**。`）时无从比对，按「两处都有」口径跳过；
 * - 不校验结论方向（`Pass` / `Reject`）本身，只校验计数；方向口径由 Review Gate 台账承担；
 * - **残余风险（显式登记）**：多候选记录的「任一份一致即通过」意味着**单一记录侧**的漂移可能漏判
 *   （取舍理由见规则 4；改为「任一矛盾即失败」会命中已实测的误报）；
 * - **受检行形态假设**：只处理**顶层**列表项（`-` + 空格起首），缩进子条目不在面内；当前归档中此类行 0 例。
 *
 * 用法：
 *   node scripts/governance/check-archive-rg-counts.mjs             # 受检仓库根；有问题 exit 1
 *   node scripts/governance/check-archive-rg-counts.mjs --root <dir>
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** 主窗口归档载体（仓库相对路径）。 */
export const ARCHIVE_MAIN_FILE = 'docs/plan/todo-archive.md'

/** 深度归档目录（仓库相对路径）；其中的 `*.md` 一并受检。 */
export const ARCHIVE_DEEP_DIR = 'docs/plan/archive'

/** 治理记录目录名（用于判定条目内的链接是否指记录）。 */
export const RECORD_DIR_SEGMENT = 'design/governance'

/**
 * 受检面下界（防静默收窄）。
 *
 * 语义：**可比对的字段总数**（轮次 + 字段两侧都命中才计入）不得低于该值。2026-10-14 实测为 **33**
 * （受检条目 25 / 有比对条目 15）；下界取 25 以留出归档结构变化的余量，同时仍能拦住
 * 「解析被削弱 ⇒ 几乎无可比对」的失效。
 */
export const MIN_RECONCILED = 25

/** 失败码。 */
export const ISSUE_CODES = {
    mismatch: 'rg-count-mismatch',
    scopeNarrowed: 'scope-narrowed',
}

/** 受检条目行的编号锚点：`**M<数字>`。 */
const ENTRY_LABEL_RE = /\*\*M\d/

/** `RG` 词边界（避免命中文中出现的 `RGETS` 之类）。 */
const RG_TOKEN_RE = /(?:^|[^A-Za-z])RG(?![A-Za-z])/

/**
 * 轮次标签 `R<数字>`（1 ~ 2 位，带词边界）。
 *
 * 边界是必要的：无边界时 `AR1` / 多位编号（`R10` 会被切成 `R1`）都会误命中（本条目记录 §9 的复审建议）。
 */
const ROUND_RE = /(?:^|[^A-Za-z0-9])R(\d{1,2})(?![0-9])/g

/** 全角括号（仓库口径的计数容器）。 */
const FULLWIDTH_PAREN_RE = /（([^（）]*)）/g

/** Markdown 链接（相对路径形态）。 */
const MD_LINK_RE = /\[[^\]]*\]\(([^)\s]+)\)/g

/** Markdown 标题。 */
const HEADING_RE = /^(#{2,6})\s+(.*)$/

/**
 * 从一段文本中提取计数（**只认全角括号内的表达式**）。
 *
 * 优先「带标签」形态 `N blocker` / `N warning` / `N suggest`；否则回退裸三元组 `a / b / c`。
 *
 * @param {string} chunk 待解析文本
 * @returns {{ blocker?: number, warning?: number, suggest?: number } | null} 命中首个含计数的括号；无则 null
 */
export function extractCounts(chunk) {
    for (const match of chunk.matchAll(FULLWIDTH_PAREN_RE)) {
        const inner = match[1]
        const labeled = {}
        for (const kind of ['blocker', 'warning', 'suggest']) {
            const found = new RegExp(`(\\d+)\\s*${kind}`).exec(inner)
            if (found) {
                labeled[kind] = Number(found[1])
            }
        }
        if (Object.keys(labeled).length > 0) {
            return labeled
        }
        const triple = /^\s*(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)\s*$/.exec(inner)
        if (triple) {
            return { blocker: Number(triple[1]), warning: Number(triple[2]), suggest: Number(triple[3]) }
        }
    }
    return null
}

/**
 * 按 `R<数字>` 切分文本，提取每轮计数。
 *
 * 未标注轮次的计数归入 `FINAL`（仅在首个轮次标签之前出现时）；同一轮次重复出现时**保留首个非空**取值
 * （记录正文里常有 `R1 blocker` / `R1 warning` 之类的小节标签，其括号内通常不含计数）。
 *
 * @param {string} text 待解析文本
 * @returns {Record<string, { blocker?: number, warning?: number, suggest?: number }>}
 */
export function parseRounds(text) {
    const result = {}
    const marks = [...text.matchAll(ROUND_RE)]
    if (marks.length === 0) {
        const counts = extractCounts(text)
        if (counts) {
            result.FINAL = counts
        }
        return result
    }
    const headCounts = extractCounts(text.slice(0, marks[0].index + marks[0][0].indexOf('R')))
    if (headCounts) {
        result.FINAL = headCounts
    }
    for (let i = 0; i < marks.length; i += 1) {
        const start = marks[i].index + marks[i][0].indexOf('R')
        const end = i + 1 < marks.length ? marks[i + 1].index : text.length
        const counts = extractCounts(text.slice(start, end))
        const key = `R${marks[i][1]}`
        if (counts && result[key] === undefined) {
            result[key] = counts
        }
    }
    return result
}

/**
 * 抽取记录中所有标题含 `Review Gate` 的章节（含其后同级或更高级标题之前的内容）。
 *
 * 「同级或更高级」是必要的：记录常把结论放在 `### x.x 结论` 子标题下，若按「下一个任意标题」截断，
 * 父章节会在子标题处立即结束、正文丢失（实测导致漏读）。
 *
 * @param {string} text 记录全文
 * @returns {string}
 */
export function reviewGateSections(text) {
    const lines = text.split('\n')
    const headings = []
    for (let i = 0; i < lines.length; i += 1) {
        const match = HEADING_RE.exec(lines[i])
        if (match) {
            headings.push({ index: i, level: match[1].length, title: match[2] })
        }
    }
    const parts = []
    for (let i = 0; i < headings.length; i += 1) {
        const heading = headings[i]
        if (!heading.title.includes('Review Gate')) {
            continue
        }
        let end = lines.length
        for (let j = i + 1; j < headings.length; j += 1) {
            if (headings[j].level <= heading.level) {
                end = headings[j].index
                break
            }
        }
        parts.push(lines.slice(heading.index, end).join('\n'))
    }
    return parts.join('\n')
}

/**
 * 列出受检归档文件（主窗口 + 深度归档目录）。
 *
 * @param {string} root 仓库根
 * @returns {string[]} 仓库相对路径
 */
export function listArchiveFiles(root) {
    const files = []
    if (existsSync(join(root, ARCHIVE_MAIN_FILE))) {
        files.push(ARCHIVE_MAIN_FILE)
    }
    const deepDir = join(root, ARCHIVE_DEEP_DIR)
    if (existsSync(deepDir)) {
        for (const name of readdirSync(deepDir).sort()) {
            if (name.endsWith('.md')) {
                files.push(`${ARCHIVE_DEEP_DIR}/${name}`)
            }
        }
    }
    return files
}

/**
 * 解析单条目行。
 *
 * @param {string} line 归档条目行
 * @returns {{ rg: string, records: string[] } | null} 非受检条目返回 null
 */
export function parseEntryLine(line) {
    if (!line.startsWith('- ') || !ENTRY_LABEL_RE.test(line) || !RG_TOKEN_RE.test(line)) {
        return null
    }
    const rgMatch = RG_TOKEN_RE.exec(line)
    const rgIndex = rgMatch.index + rgMatch[0].indexOf('RG')
    const records = []
    for (const match of line.matchAll(MD_LINK_RE)) {
        const target = match[1]
        if (target.includes(RECORD_DIR_SEGMENT) && target.endsWith('.md')) {
            records.push(target)
        }
    }
    return { rg: line.slice(rgIndex), records }
}

/**
 * 对账归档块与治理记录。
 *
 * @param {string} root 仓库根
 * @param {{ enforceScope?: boolean, minReconciled?: number }} [options]
 * @returns {{ reconciled: number, entries: number, compared: number, issues: Array<{ code: string, detail: string }> }}
 */
export function checkArchiveRgCounts(root, { enforceScope = true, minReconciled = MIN_RECONCILED } = {}) {
    const issues = []
    let reconciled = 0
    let entryCount = 0
    let comparedEntries = 0

    for (const file of listArchiveFiles(root)) {
        const abs = join(root, file)
        const lines = readFileSync(abs, 'utf8').split('\n')
        const fileDir = dirname(abs)
        for (let i = 0; i < lines.length; i += 1) {
            const entry = parseEntryLine(lines[i])
            if (!entry) {
                continue
            }
            entryCount += 1
            const entryRounds = parseRounds(entry.rg)
            const keys = Object.keys(entryRounds)
            if (keys.length === 0) {
                continue
            }

            const candidates = []
            for (const link of entry.records) {
                const recordPath = resolve(fileDir, link)
                if (!existsSync(recordPath)) {
                    continue
                }
                const rounds = parseRounds(reviewGateSections(readFileSync(recordPath, 'utf8')))
                if (Object.keys(rounds).length > 0) {
                    candidates.push({ link, rounds })
                }
            }
            if (candidates.length === 0) {
                continue
            }

            let entryReconciled = 0
            const disagreements = []
            for (const key of keys) {
                const entryCounts = entryRounds[key]
                const label = key === 'FINAL' ? '（未标轮次）' : key
                for (const [kind, value] of Object.entries(entryCounts)) {
                    // 逐字段取全部候选记录读数：任一份一致即该字段通过；全不一致才记矛盾。
                    const observed = []
                    for (const candidate of candidates) {
                        const recordKeys = Object.keys(candidate.rounds)
                        const target = key === 'FINAL' ? recordKeys[recordKeys.length - 1] : key
                        const recordCounts = candidate.rounds[target]
                        if (!recordCounts || recordCounts[kind] === undefined) {
                            continue
                        }
                        observed.push({ link: candidate.link, value: recordCounts[kind] })
                    }
                    if (observed.length === 0) {
                        continue
                    }
                    entryReconciled += 1
                    if (!observed.some((item) => item.value === value)) {
                        disagreements.push(
                            `${file}:${i + 1} ${label} 的 ${kind}：归档块 ${value} vs 记录 ${observed.map((item) => `${item.link} ${item.value}`).join(' / ')}`,
                        )
                    }
                }
            }

            if (entryReconciled === 0) {
                continue
            }
            comparedEntries += 1
            reconciled += entryReconciled
            for (const detail of disagreements) {
                issues.push({ code: ISSUE_CODES.mismatch, detail })
            }
        }
    }

    if (enforceScope && reconciled < minReconciled) {
        issues.push({
            code: ISSUE_CODES.scopeNarrowed,
            detail: `可比对字段 ${reconciled} 低于下界 ${minReconciled}（受检条目 ${entryCount} / 有比对条目 ${comparedEntries}；解析面可能被静默削弱）`,
        })
    }

    return { reconciled, entries: entryCount, compared: comparedEntries, issues }
}

export function main(argv = process.argv.slice(2)) {
    let root = PROJECT_ROOT
    if (argv.length > 0) {
        if (argv[0] === '--root' && argv[1]) {
            root = resolve(argv[1])
        } else {
            console.error(`[check-archive-rg-counts] 不支持的参数：${argv.join(' ')}`)
            return 2
        }
    }
    if (!existsSync(root)) {
        console.error(`[check-archive-rg-counts] 目标目录不存在：${root}`)
        return 2
    }

    const { reconciled, entries, compared, issues } = checkArchiveRgCounts(root)
    if (issues.length > 0) {
        for (const issue of issues) {
            console.error(`[check-archive-rg-counts][error] ${issue.code}: ${issue.detail}`)
        }
        console.error(`[check-archive-rg-counts] ${issues.length} 处问题（受检条目 ${entries} / 有比对 ${compared} / 可比对字段 ${reconciled}）`)
        return 1
    }
    console.info(`[check-archive-rg-counts] OK：受检条目 ${entries}、有比对条目 ${compared}、可比对字段 ${reconciled}，无矛盾`)
    return 0
}

if (isDirectExecution(import.meta.url)) {
    process.exitCode = main()
}
