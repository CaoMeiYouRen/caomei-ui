#!/usr/bin/env node

/**
 * check-stage-counts：**当前阶段构成计数**的跨载体对账守卫。
 *
 * 为什么需要它：阶段构成（`N 条主线 / M 条原子条目` 与 `构成对账 a + b + … = M`）同时出现在
 * `docs/plan/todo.md` 的当前状态句与条目表、以及 `docs/plan/roadmap.md` 的 §1 当前态句与阶段表行。
 * 这些数字此前靠人工同步，已在多次 Review Gate 中因两套口径不一致被判 blocker。本守卫把四个载体
 * 变成可判定门禁：**只对账「当前进行中阶段」**，历史阶段的「原登记 … 为时点值」按点时快照跳过。
 *
 * 判别规则：
 * - `todo.md`：读「当前进行中阶段：Phase N」→ 该阶段 `## Phase N 原子条目` 表格的条目行数；
 *   读当前状态段**首个**「N 条主线 / M 条原子条目」与**首个**「构成对账 a + b + … = M」；
 * - `roadmap.md`：§1 当前态句必须出现同一阶段编号；阶段表该阶段行读**首个**同形态计数与对账式；
 * - 三处一致：主线数、原子条目数、对账分量个数、分量之和、对账结果；
 * - **逐主线分布**：条目编号按首次出现顺序（`M1` / `M2` …）与对账分量**按位置对齐**逐项比较；
 * - 表内条目编号的唯一前缀数（`M1` / `M2` …）必须等于主线数；
 * - 阶段表的最大编号必须等于当前进行中阶段（防止「表里还挂着旧阶段」）。
 *
 * 有意边界：
 * - 只认「当前进行中阶段」；`todo-archive.md` / 归档块 / 历史记录不在面内；
 * - **无进行中阶段**：`todo.md` 的 `## 当前状态` 段显式声明 `**当前无进行中阶段**` 时**跳过**（exit 0）；
 *   该声明与「当前进行中阶段：Phase N」互斥，同时出现判 `phase-state-conflict`；跳过前仍交叉校验
 *   `roadmap.md` §1 的同一声明与 `todo.md` 残留的阶段条目段，二者任一不符同样判 `phase-state-conflict`；
 * - 计数与对账式只在 `## 当前状态` 段内取**首个**匹配；`roadmap.md` 只在当前阶段行内取首个匹配，
 *   历史「原登记 … 为时点值」靠位置跳过，不做语义解析；
 * - **格式耦合（fail-closed）**：`## 当前状态`、`## Phase N 原子条目`、阶段表 `**Phase N**` 粗体与
 *   §1 的 `Phase N` 字面号均为硬依赖，标题或粗体形态破坏时直接报错，而不是猜测语义；
 * - 不校验各条目状态（已完成 / 待执行）与正文交付面，只校验构成计数；
 * - 受检面下界：`carriers` 由**成功解析的载体数**累加（`todo` 计数 + `roadmap` 当前阶段行），
 *   以及条目行数下界，避免解析被静默削弱后「零命中即通过」。
 *
 * 用法：
 *   node scripts/governance/check-stage-counts.mjs            # 受检仓库根；有问题 exit 1
 *   node scripts/governance/check-stage-counts.mjs --root <dir>
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** 规划载体（仓库相对路径）。 */
export const TODO_FILE = 'docs/plan/todo.md'
export const ROADMAP_FILE = 'docs/plan/roadmap.md'

/** 当前进行中阶段编号。 */
export const CURRENT_PHASE_RE = /\*\*当前进行中阶段：Phase\s+(\d+)/

/**
 * 「无进行中阶段」显式声明。
 *
 * 阶段归档后 `todo.md` 可以没有当前阶段（规划规范允许「当前阶段状态 = 无进行中阶段」）；此时
 * 构成计数没有对账对象，守卫应**显式跳过**而不是把「未找到 Phase N」判成缺陷。该声明与
 * `CURRENT_PHASE_RE` 互斥，同时出现视为载体自相矛盾。
 */
export const NO_ACTIVE_PHASE_RE = /\*\*当前无进行中阶段[。.]?\*\*/

/** 构成计数：`N 条主线 / M 条原子条目`。 */
export const MAIN_ATOMIC_RE = /(\d+)\s*条主线\s*\/\s*(\d+)\s*条原子条目/

/** 构成对账：`构成对账 a + b + … = M`。 */
export const SUM_RE = /构成对账\s*([\d\s+]+?)\s*=\s*(\d+)/

/** `todo.md` 的阶段条目段标题（模板；实际按阶段编号生成）。 */
export const phaseHeadingRe = (phase) => new RegExp(`^## Phase\\s+${phase}\\s+原子条目\\s*$`, 'm')

/** 条目行：`| <主线编号>-<序号> | …`。 */
export const ITEM_ROW_RE = /^\|\s*([A-Z]\d+-\d+)\s*\|/gm

/** `roadmap.md` 的阶段表行。 */
export const PHASE_ROW_RE = /^\|\s*\*\*Phase\s+(\d+)\*\*\s*\|[^\n]*$/gm

/** 受检面下界（防解析被静默削弱）。 */
export const SCOPE_FLOOR = {
    /** 参与对账的载体数（todo + roadmap）。 */
    carriers: 2,
    /** 当前阶段的条目行数下限。 */
    itemRows: 1,
}

/** 失败码。 */
export const ISSUE_CODES = {
    ioError: 'io-error',
    missingField: 'missing-field',
    phaseMismatch: 'phase-mismatch',
    countMismatch: 'count-mismatch',
    sumMismatch: 'sum-mismatch',
    partMismatch: 'part-mismatch',
    rowCountMismatch: 'row-count-mismatch',
    mainLineMismatch: 'main-line-mismatch',
    scopeNarrowed: 'scope-narrowed',
    phaseStateConflict: 'phase-state-conflict',
}

const firstMatch = (text, re) => re.exec(text)

/** 解析 `构成对账` 的分量；空分量 / 非法字符记为 `invalid`。 */
function parseSum(match) {
    if (!match) {
        return null
    }
    const rawParts = match[1].trim().split(/\s*\+\s*/)
    return {
        parts: rawParts.map(Number),
        total: Number(match[2]),
        invalid: rawParts.some((part) => !/^\d+$/.test(part.trim())),
    }
}

/** 截取指定二级标题的段落正文（到下一个二级标题为止）。 */
function sectionOf(text, headingRe) {
    const heading = firstMatch(text, headingRe)
    if (!heading) {
        return ''
    }
    const after = text.slice(heading.index + heading[0].length)
    const next = after.search(/^## /m)
    return next === -1 ? after : after.slice(0, next)
}

/**
 * 解析 `todo.md` 的当前阶段构成。
 *
 * @param {string} text
 * @returns {{ phase: number | null, mainLines: number | null, atomic: number | null, sum: { parts: number[], total: number, invalid: boolean } | null, items: string[] }}
 */
export function parseTodo(text) {
    const phase = Number(firstMatch(text, CURRENT_PHASE_RE)?.[1] ?? Number.NaN)
    const stateSection = sectionOf(text, /^## 当前状态\s*$/m)
    const counts = firstMatch(stateSection, MAIN_ATOMIC_RE)
    const sum = parseSum(firstMatch(stateSection, SUM_RE))
    const heading = Number.isNaN(phase) ? null : firstMatch(text, phaseHeadingRe(phase))

    let items = []
    if (heading) {
        const start = heading.index + heading[0].length
        const rest = text.slice(start)
        const nextHeading = rest.search(/^## /m)
        const section = nextHeading === -1 ? rest : rest.slice(0, nextHeading)
        items = [...section.matchAll(ITEM_ROW_RE)].map((match) => match[1])
    }

    return {
        phase: Number.isNaN(phase) ? null : phase,
        mainLines: counts ? Number(counts[1]) : null,
        atomic: counts ? Number(counts[2]) : null,
        sum,
        items,
    }
}

/**
 * 解析 `roadmap.md` 的当前阶段构成。
 *
 * @param {string} text
 * @param {number} phase 当前进行中阶段编号
 * @returns {{ phaseMentioned: boolean, latestPhase: number | null, row: string | null, mainLines: number | null, atomic: number | null, sum: { parts: number[], total: number, invalid: boolean } | null }}
 */
export function parseRoadmap(text, phase) {
    const stateSection = sectionOf(text, /^## 1\.[^\n]*$/m)
    const rows = [...text.matchAll(PHASE_ROW_RE)]
    const latestPhase = rows.length > 0 ? Math.max(...rows.map((match) => Number(match[1]))) : null
    const row = rows.find((match) => Number(match[1]) === phase)?.[0] ?? null
    const counts = row ? firstMatch(row, MAIN_ATOMIC_RE) : null
    const sum = parseSum(row ? firstMatch(row, SUM_RE) : null)

    return {
        phaseMentioned: new RegExp(`Phase\\s+${phase}(?!\\d)`).test(stateSection),
        latestPhase,
        row,
        mainLines: counts ? Number(counts[1]) : null,
        atomic: counts ? Number(counts[2]) : null,
        sum,
    }
}

/**
 * 对账当前阶段构成计数。
 *
 * @param {string} root 仓库根
 * @returns {{ phase: number | null, mainLines: number | null, atomic: number | null, itemRows: number, carriers: number, skipped: boolean, issues: Array<{ code: string, detail: string }> }} `skipped` 仅在跳过分支且交叉校验无问题时为 true；任何问题以 `issues` 为准。
 */
export function checkStageCounts(root) {
    const issues = []
    let todoText
    let roadmapText
    try {
        todoText = readFileSync(join(root, TODO_FILE), 'utf8')
        roadmapText = readFileSync(join(root, ROADMAP_FILE), 'utf8')
    } catch (error) {
        return {
            phase: null,
            mainLines: null,
            atomic: null,
            itemRows: 0,
            carriers: 0,
            skipped: false,
            issues: [{ code: ISSUE_CODES.ioError, detail: `读取规划载体失败：${error.message}` }],
        }
    }

    const todo = parseTodo(todoText)
    const noActivePhase = NO_ACTIVE_PHASE_RE.test(sectionOf(todoText, /^## 当前状态\s*$/m))
    if (todo.phase === null) {
        if (noActivePhase) {
            // 跳过模式仍需交叉断言，避免「todo 已收口、roadmap 还挂着阶段」被静默放过。
            const skippedIssues = []
            const roadmapState = sectionOf(roadmapText, /^## 1\.[^\n]*$/m)
            if (!NO_ACTIVE_PHASE_RE.test(roadmapState)) {
                skippedIssues.push({
                    code: ISSUE_CODES.phaseStateConflict,
                    detail: `${ROADMAP_FILE}：§1 未声明「当前无进行中阶段」，与 ${TODO_FILE} 的声明不一致`,
                })
            }
            if (/^## Phase\s+\d+\s+原子条目\s*$/m.test(todoText)) {
                skippedIssues.push({
                    code: ISSUE_CODES.phaseStateConflict,
                    detail: `${TODO_FILE}：声明无进行中阶段，但仍残留「## Phase N 原子条目」段`,
                })
            }
            return {
                phase: null,
                mainLines: null,
                atomic: null,
                itemRows: 0,
                carriers: 0,
                skipped: skippedIssues.length === 0,
                issues: skippedIssues,
            }
        }
        issues.push({
            code: ISSUE_CODES.missingField,
            detail: `${TODO_FILE}：未找到「当前进行中阶段：Phase N」声明`,
        })
        return { ...todo, itemRows: todo.items.length, carriers: 0, skipped: false, issues }
    }
    if (noActivePhase) {
        issues.push({
            code: ISSUE_CODES.phaseStateConflict,
            detail: `${TODO_FILE}：同时声明「当前无进行中阶段」与「当前进行中阶段：Phase ${todo.phase}」`,
        })
    }
    if (todo.mainLines === null || todo.atomic === null) {
        issues.push({
            code: ISSUE_CODES.missingField,
            detail: `${TODO_FILE}：当前状态段未找到「N 条主线 / M 条原子条目」`,
        })
    }
    if (!todo.sum) {
        issues.push({
            code: ISSUE_CODES.missingField,
            detail: `${TODO_FILE}：当前状态段未找到「构成对账 a + b + … = M」`,
        })
    }

    const roadmap = parseRoadmap(roadmapText, todo.phase)
    if (!roadmap.row) {
        issues.push({
            code: ISSUE_CODES.phaseMismatch,
            detail: `${ROADMAP_FILE}：阶段表缺少 Phase ${todo.phase} 行`,
        })
    }
    if (roadmap.latestPhase !== null && roadmap.latestPhase !== todo.phase) {
        issues.push({
            code: ISSUE_CODES.phaseMismatch,
            detail: `${ROADMAP_FILE}：阶段表最大编号为 Phase ${roadmap.latestPhase}，与当前进行中阶段 Phase ${todo.phase} 不一致`,
        })
    }
    if (!roadmap.phaseMentioned) {
        issues.push({
            code: ISSUE_CODES.phaseMismatch,
            detail: `${ROADMAP_FILE}：§1 当前态句未提及当前进行中阶段 Phase ${todo.phase}`,
        })
    }
    if (roadmap.mainLines === null || roadmap.atomic === null) {
        issues.push({
            code: ISSUE_CODES.missingField,
            detail: `${ROADMAP_FILE}：Phase ${todo.phase} 行未找到「N 条主线 / M 条原子条目」`,
        })
    }
    if (!roadmap.sum) {
        issues.push({
            code: ISSUE_CODES.missingField,
            detail: `${ROADMAP_FILE}：Phase ${todo.phase} 行未找到「构成对账 a + b + … = M」`,
        })
    }

    if (
        todo.mainLines !== null
        && todo.atomic !== null
        && roadmap.mainLines !== null
        && roadmap.atomic !== null
        && (todo.mainLines !== roadmap.mainLines || todo.atomic !== roadmap.atomic)
    ) {
        issues.push({
            code: ISSUE_CODES.countMismatch,
            detail: `构成计数不一致：${TODO_FILE} = ${todo.mainLines} / ${todo.atomic}，${ROADMAP_FILE} = ${roadmap.mainLines} / ${roadmap.atomic}`,
        })
    }

    const tableRows = todo.items.length
    if (todo.atomic !== null && tableRows !== todo.atomic) {
        issues.push({
            code: ISSUE_CODES.rowCountMismatch,
            detail: `${TODO_FILE}：条目表 ${tableRows} 行，与当前状态句的 ${todo.atomic} 条原子条目不一致`,
        })
    }

    const distinctMainLines = new Set(todo.items.map((id) => id.replace(/-\d+$/, ''))).size
    if (todo.mainLines !== null && distinctMainLines !== todo.mainLines) {
        issues.push({
            code: ISSUE_CODES.mainLineMismatch,
            detail: `${TODO_FILE}：条目编号共有 ${distinctMainLines} 个主线前缀，与声明的 ${todo.mainLines} 条主线不一致（条目：${todo.items.join(' / ')}）`,
        })
    }

    for (const [label, sum, expectedTotal, expectedParts] of [
        [TODO_FILE, todo.sum, todo.atomic, todo.mainLines],
        [ROADMAP_FILE, roadmap.sum, roadmap.atomic, roadmap.mainLines],
    ]) {
        if (!sum) {
            continue
        }
        const computed = sum.parts.reduce((total, value) => total + value, 0)
        if (sum.invalid) {
            issues.push({
                code: ISSUE_CODES.sumMismatch,
                detail: `${label}：构成对账含空分量或非数字字符（${sum.parts.join(' + ')}）`,
            })
        }
        if (computed !== sum.total) {
            issues.push({
                code: ISSUE_CODES.sumMismatch,
                detail: `${label}：构成对账 ${sum.parts.join(' + ')} = ${computed}，与写明的 ${sum.total} 不一致`,
            })
        }
        if (expectedTotal !== null && sum.total !== expectedTotal) {
            issues.push({
                code: ISSUE_CODES.sumMismatch,
                detail: `${label}：构成对账结果 ${sum.total} 与原子条目数 ${expectedTotal} 不一致`,
            })
        }
        if (expectedParts !== null && sum.parts.length !== expectedParts) {
            issues.push({
                code: ISSUE_CODES.sumMismatch,
                detail: `${label}：构成对账有 ${sum.parts.length} 个分量，与 ${expectedParts} 条主线不一致`,
            })
        }
    }

    // 逐主线分布：按条目编号首次出现顺序与对账分量对齐（位置约定见文件头「有意边界」）
    const prefixOrder = []
    const prefixCounts = new Map()
    for (const id of todo.items) {
        const prefix = id.replace(/-\d+$/, '')
        if (!prefixCounts.has(prefix)) {
            prefixOrder.push(prefix)
            prefixCounts.set(prefix, 0)
        }
        prefixCounts.set(prefix, prefixCounts.get(prefix) + 1)
    }
    if (todo.sum && todo.mainLines !== null && todo.sum.parts.length === todo.mainLines && prefixOrder.length === todo.mainLines) {
        const mismatched = todo.sum.parts
            .map((expected, index) => ({ prefix: prefixOrder[index], expected, actual: prefixCounts.get(prefixOrder[index]) ?? 0 }))
            .filter((entry) => entry.expected !== entry.actual)
        if (mismatched.length > 0) {
            issues.push({
                code: ISSUE_CODES.partMismatch,
                detail: `${TODO_FILE}：对账分量与条目表的逐主线行数不一致（${mismatched.map((entry) => `${entry.prefix} 声明 ${entry.expected} / 实际 ${entry.actual}`).join('；')}）`,
            })
        }
    }

    const carriers = Number(todo.mainLines !== null && todo.atomic !== null)
        + Number(Boolean(roadmap.row) && roadmap.mainLines !== null && roadmap.atomic !== null)
    if (carriers < SCOPE_FLOOR.carriers || tableRows < SCOPE_FLOOR.itemRows) {
        issues.push({
            code: ISSUE_CODES.scopeNarrowed,
            detail: `受检面收窄：载体 ${carriers} 个（下界 ${SCOPE_FLOOR.carriers}）/ 条目行 ${tableRows} 行（下界 ${SCOPE_FLOOR.itemRows}）`,
        })
    }

    return {
        phase: todo.phase,
        mainLines: todo.mainLines,
        atomic: todo.atomic,
        itemRows: tableRows,
        carriers,
        skipped: false,
        issues,
    }
}

export function main(argv = process.argv.slice(2)) {
    let root = projectRoot
    if (argv.length > 0) {
        if (argv[0] === '--root' && argv[1]) {
            root = resolve(argv[1])
        } else {
            console.error(`[check-stage-counts] 不支持的参数：${argv.join(' ')}`)
            return 2
        }
    }
    if (!existsSync(root)) {
        console.error(`[check-stage-counts] 目标目录不存在：${root}`)
        return 2
    }

    const { phase, mainLines, atomic, itemRows, carriers, skipped, issues } = checkStageCounts(root)
    if (issues.length > 0) {
        for (const issue of issues) {
            console.error(`[check-stage-counts][error] ${issue.code}: ${issue.detail}`)
        }
        console.error(`[check-stage-counts] ${issues.length} 处问题（载体 ${carriers} / 阶段 ${phase ?? '未知'}）`)
        return 1
    }
    if (skipped) {
        console.info('[check-stage-counts] skipped：当前无进行中阶段（todo.md 显式声明），构成计数无需对账')
        return 0
    }
    console.info(`[check-stage-counts] OK：Phase ${phase} 构成 ${mainLines} 条主线 / ${atomic} 条原子条目（条目行 ${itemRows}，载体 ${carriers}）`)
    return 0
}

if (isDirectExecution(import.meta.url)) {
    process.exitCode = main()
}
