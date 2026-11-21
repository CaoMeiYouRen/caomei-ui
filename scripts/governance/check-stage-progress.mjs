#!/usr/bin/env node
/**
 * check-stage-progress：**当前阶段 6 列进度表**的机检守卫。
 *
 * 为什么需要它：[规划规范 §7](../../docs/standards/planning.md) 要求当前阶段在
 * `## Phase N 原子条目` 之前维护一张 6 列进度表（`大条目 / 小条目 / 状态 / 提交 / 审计 / 容量`），
 * 但此前只靠人工核对。本守卫把「进度表 ↔ 条目表」变成可判定门禁：
 *
 * - 表行数 = 条目表的主线数（按 `M<n>` 前缀去重）；
 * - `小条目` 形如 `已闭环 / 总数`，总数与该主线条目数一致、已闭环数与该主线 `已交付` 行数一致；
 * - `状态` 只取 `未开始` / `进行中` / `已闭环` / `已阻塞`，且与已闭环数映射一致（已阻塞单独放行）；
 * - `提交`、`审计`、`容量` 均可定位（非空；有已交付条目时 `提交` 不得为占位符）；
 * - 当条目表全部 `已交付` 时，所有主线行不得残留 `未开始` / `进行中` / `已阻塞`（归档前置）。
 *
 * 有意边界：
 * - 只认当前进行中阶段；`todo.md` 显式声明「当前无进行中阶段」时跳过（exit 0）；
 * - 进度表必须位于 `## 当前状态` 与 `## Phase N 原子条目` 之间，不跨段猜测；
 * - 不校验提交哈希是否存在于 git 历史（允许 `待补` 等过渡值，只要非空且不是纯占位符）。
 *
 * 用法：
 *   node scripts/governance/check-stage-progress.mjs            # 仓库根
 *   node scripts/governance/check-stage-progress.mjs --root <dir>
 */
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const TODO_FILE = 'docs/plan/todo.md'

const CURRENT_PHASE_RE = /\*\*当前进行中阶段：Phase\s+(\d+)/m
const NO_ACTIVE_PHASE_RE = /\*\*当前无进行中阶段[。.]?\*\*/
const STATE_HEADING_RE = /^## 当前状态\s*$/m
const PROGRESS_HEADERS = ['大条目', '小条目', '状态', '提交', '审计', '容量']
const VALID_STATES = new Set(['未开始', '进行中', '已闭环', '已阻塞'])
const PLACEHOLDER_RE = /^[—\-–]+$/
const CAPACITY_RE = /(\d+)\s*→\s*(\d+|—|-)/

/** 失败码。 */
export const ISSUE_CODES = {
    ioError: 'io-error',
    missingTable: 'missing-progress-table',
    headerMismatch: 'progress-header-mismatch',
    rowCountMismatch: 'progress-row-count-mismatch',
    mainLineMismatch: 'progress-main-line-mismatch',
    countMismatch: 'progress-count-mismatch',
    statusMismatch: 'progress-status-mismatch',
    invalidState: 'progress-invalid-state',
    fieldMissing: 'progress-field-missing',
    archiveResidue: 'progress-archive-residue',
    scopeNarrowed: 'progress-scope-narrowed',
}

function sectionBetween(text, startRe, endRe) {
    const start = startRe.exec(text)
    if (!start) {
        return ''
    }
    const after = text.slice(start.index + start[0].length)
    const end = endRe.exec(after)
    return end ? after.slice(0, end.index) : after
}

/**
 * 解析进度表。
 *
 * @param {string} text `todo.md` 全文
 * @param {number} phase 当前阶段编号
 * @returns {{ found: boolean, headerOk: boolean, rows: Array<{ line: string, cells: string[] }> }}
 */
export function parseProgressTable(text, phase) {
    const section = sectionBetween(
        text,
        STATE_HEADING_RE,
        new RegExp(`^## Phase\\s+${phase}\\s+原子条目\\s*$`, 'm'),
    )
    const lines = section.split(/\r?\n/)
    let inTable = false
    let headerOk = false
    const rows = []
    for (const line of lines) {
        const match = line.match(/^\|(.+)\|$/)
        if (!match) {
            if (inTable) {
                break
            }
            continue
        }
        const cells = match[1].split('|').map((cell) => cell.trim())
        if (!inTable) {
            if (cells.length === PROGRESS_HEADERS.length && cells.every((cell, index) => cell === PROGRESS_HEADERS[index])) {
                inTable = true
                headerOk = true
            }
            continue
        }
        if (cells.every((cell) => /^:?-{2,}/.test(cell))) {
            continue
        }
        rows.push({ line, cells })
    }
    return { found: headerOk, headerOk, rows }
}

/** 解析条目表：返回 `{ phase, mainLines: Array<{ prefix, total, delivered }> }`。 */
export function parseItemRows(text, phase) {
    const headingRe = new RegExp(`^## Phase\\s+${phase}\\s+原子条目\\s*$`, 'm')
    const heading = headingRe.exec(text)
    if (!heading) {
        return []
    }
    const after = text.slice(heading.index + heading[0].length)
    const next = /^## /m.exec(after)
    const section = next ? after.slice(0, next.index) : after
    const rows = []
    for (const line of section.split(/\r?\n/)) {
        const match = line.match(/^\|\s*([A-Z]\d+)-(\d+)\s*\|(.*)\|$/)
        if (!match) {
            continue
        }
        rows.push({
            prefix: match[1],
            delivered: /\|\s*已交付\s*\|/.test(line),
        })
    }
    return rows
}

/**
 * 对账当前阶段进度表。
 *
 * @param {string} root 仓库根
 */
export function checkStageProgress(root = projectRoot) {
    let text
    try {
        text = readFileSync(join(root, TODO_FILE), 'utf8')
    } catch (error) {
        return { skipped: false, issues: [{ code: ISSUE_CODES.ioError, detail: `读取 ${TODO_FILE} 失败：${error.message}` }] }
    }

    const stateHeading = STATE_HEADING_RE.exec(text)
    const stateSection = stateHeading
        ? text.slice(stateHeading.index + stateHeading[0].length)
        : ''
    const phaseMatch = CURRENT_PHASE_RE.exec(stateSection)
    if (!phaseMatch) {
        if (NO_ACTIVE_PHASE_RE.test(stateSection)) {
            return { skipped: true, issues: [] }
        }
        return { skipped: false, issues: [{ code: ISSUE_CODES.fieldMissing, detail: `${TODO_FILE}：未找到「当前进行中阶段：Phase N」声明` }] }
    }

    const phase = Number(phaseMatch[1])
    const issues = []
    const { found, rows } = parseProgressTable(text, phase)
    if (!found) {
        return {
            skipped: false,
            issues: [{ code: ISSUE_CODES.missingTable, detail: `${TODO_FILE}：Phase ${phase} 缺少 6 列进度表（表头须为 ${PROGRESS_HEADERS.join(' / ')}）` }],
        }
    }

    const items = parseItemRows(text, phase)
    const expected = new Map()
    for (const item of items) {
        const entry = expected.get(item.prefix) ?? { total: 0, delivered: 0 }
        entry.total += 1
        if (item.delivered) {
            entry.delivered += 1
        }
        expected.set(item.prefix, entry)
    }

    if (rows.length !== expected.size) {
        issues.push({
            code: ISSUE_CODES.rowCountMismatch,
            detail: `${TODO_FILE}：进度表 ${rows.length} 行，与条目表 ${expected.size} 条主线不一致`,
        })
    }

    const seen = new Set()
    const allDelivered = expected.size > 0
        && items.length > 0
        && [...expected.values()].every((entry) => entry.total === entry.delivered)

    for (const row of rows) {
        const [mainCell, countCell, stateCell, commitCell, auditCell, capacityCell] = row.cells
        if (row.cells.length !== PROGRESS_HEADERS.length) {
            issues.push({
                code: ISSUE_CODES.headerMismatch,
                detail: `${TODO_FILE}：进度表行「${row.line}」列数为 ${row.cells.length}，应为 ${PROGRESS_HEADERS.length}`,
            })
            continue
        }
        const prefixMatch = /^M(\d+)\b/.exec(mainCell ?? '')
        if (!prefixMatch) {
            issues.push({ code: ISSUE_CODES.mainLineMismatch, detail: `${TODO_FILE}：进度表行「${mainCell}」无法解析主线编号（须以 M<n> 开头）` })
            continue
        }
        const prefix = `M${prefixMatch[1]}`
        if (seen.has(prefix)) {
            issues.push({ code: ISSUE_CODES.mainLineMismatch, detail: `${TODO_FILE}：进度表主线 ${prefix} 重复` })
            continue
        }
        seen.add(prefix)

        const expectedEntry = expected.get(prefix)
        if (!expectedEntry) {
            issues.push({ code: ISSUE_CODES.mainLineMismatch, detail: `${TODO_FILE}：进度表主线 ${prefix} 在条目表中不存在` })
            continue
        }

        if (!VALID_STATES.has(stateCell)) {
            issues.push({
                code: ISSUE_CODES.invalidState,
                detail: `${TODO_FILE}：主线 ${prefix} 的状态「${stateCell}」不在 ${[...VALID_STATES].join(' / ')} 内`,
            })
        }

        const countMatch = /^(\d+)\s*\/\s*(\d+)$/.exec(countCell ?? '')
        if (!countMatch) {
            issues.push({ code: ISSUE_CODES.countMismatch, detail: `${TODO_FILE}：主线 ${prefix} 的小条目「${countCell}」须为「已闭环 / 总数」` })
        } else {
            const closed = Number(countMatch[1])
            const total = Number(countMatch[2])
            if (total !== expectedEntry.total) {
                issues.push({
                    code: ISSUE_CODES.countMismatch,
                    detail: `${TODO_FILE}：主线 ${prefix} 的小条目总数 ${total}，条目表实际 ${expectedEntry.total}`,
                })
            }
            if (closed !== expectedEntry.delivered) {
                issues.push({
                    code: ISSUE_CODES.countMismatch,
                    detail: `${TODO_FILE}：主线 ${prefix} 的已闭环数 ${closed}，条目表已交付 ${expectedEntry.delivered}`,
                })
            }
            if (stateCell !== '已阻塞') {
                let mapped = '进行中'
                if (closed === 0) {
                    mapped = '未开始'
                } else if (closed === total) {
                    mapped = '已闭环'
                }
                if (stateCell !== mapped) {
                    issues.push({
                        code: ISSUE_CODES.statusMismatch,
                        detail: `${TODO_FILE}：主线 ${prefix} 的状态「${stateCell}」与已闭环数 ${closed}/${total} 不匹配（应为 ${mapped}）`,
                    })
                }
            }
        }

        if (!commitCell) {
            issues.push({ code: ISSUE_CODES.fieldMissing, detail: `${TODO_FILE}：主线 ${prefix} 的提交列为空` })
        } else if (expectedEntry.delivered > 0 && PLACEHOLDER_RE.test(commitCell)) {
            issues.push({ code: ISSUE_CODES.fieldMissing, detail: `${TODO_FILE}：主线 ${prefix} 已有已交付条目，提交列仍为占位符「${commitCell}」` })
        }
        if (!auditCell || (PLACEHOLDER_RE.test(auditCell) && expectedEntry.delivered > 0)) {
            issues.push({ code: ISSUE_CODES.fieldMissing, detail: `${TODO_FILE}：主线 ${prefix} 的审计列不可定位` })
        }
        if (!capacityCell || !CAPACITY_RE.test(capacityCell)) {
            issues.push({ code: ISSUE_CODES.fieldMissing, detail: `${TODO_FILE}：主线 ${prefix} 的容量列「${capacityCell}」须为「计划 → 实际」` })
        }

        if (allDelivered && stateCell !== '已闭环') {
            issues.push({
                code: ISSUE_CODES.archiveResidue,
                detail: `${TODO_FILE}：条目表已全部交付，主线 ${prefix} 仍为「${stateCell}」`,
            })
        }
    }

    for (const prefix of expected.keys()) {
        if (!seen.has(prefix)) {
            issues.push({ code: ISSUE_CODES.mainLineMismatch, detail: `${TODO_FILE}：条目表主线 ${prefix} 未出现在进度表` })
        }
    }

    if (rows.length === 0 || expected.size === 0) {
        issues.push({ code: ISSUE_CODES.scopeNarrowed, detail: `${TODO_FILE}：进度表或条目表为空，受检面被收窄` })
    }

    return { phase, skipped: false, issues }
}

if (isDirectExecution(import.meta.url)) {
    const rootFlag = process.argv.indexOf('--root')
    const root = rootFlag === -1 ? projectRoot : resolve(process.argv[rootFlag + 1] ?? projectRoot)
    const result = checkStageProgress(root)
    if (result.skipped) {
        console.info('[check-stage-progress] 跳过：当前无进行中阶段')
        process.exit(0)
    }
    if (result.issues.length === 0) {
        console.info(`[check-stage-progress] 通过：Phase ${result.phase} 进度表与条目表一致`)
        process.exit(0)
    }
    for (const issue of result.issues) {
        console.error(`[check-stage-progress][error] ${issue.code}: ${issue.detail}`)
    }
    process.exit(1)
}
