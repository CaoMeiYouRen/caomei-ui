#!/usr/bin/env node

/**
 * check-candidate-anchors：规划载体「条件触发候选」与候选池的对账守卫。
 *
 * 为什么需要它：`docs/plan/todo.md`「未完成项汇总」段曾用**散文列表**列出条件触发候选，自述「逐条触发条件
 * 见 Backlog」——实测该项在 2026-10-13 有 3 项在 `backlog.md` §1 **无对应行**（同一事实两处载体、无对账）。
 * 该段已于 2026-10-14 **表化**（候选 / 触发条件 / Backlog 判别键），使这一项可机检。
 *
 * 判别规则：
 * - 受检面：`docs/plan/todo.md` 中**「条件触发候选」表格**的行（三列：候选 / 触发条件 / Backlog 判别键）。
 * - 事实源：`docs/plan/backlog.md` 的 **§1 候选池**正文。
 * - 判定：每行的**判别键**（单元格内反引号包裹，**可多枚、全部须存在**）须在 §1 正文中出现（子串匹配；
 *   键取短且有区分度的片段，避免两处措辞不同造成的误报 —— 这是本守卫**唯一的匹配口径**）。
 *   多键用于「一个候选对应 §1 多行」的形态（如组件增强与长尾对应 6 个长尾行），收紧判别力。
 * - 受检面下界 `MIN_CANDIDATES`：受检行数低于下界判 `scope-narrowed`（防「表被删空 ⇒ 全过」）。
 *
 * 已知边界（有意）：
 * - **不校验候选语义**：只在两侧做键的**存在性**对账，不判断键是否真的指向语义等同的行；
 * - **弱键风险**：键若仅命中分组标题或他行片段，会形成**假阴性**（目标行被删仍通过）—— 键须取**唯一锚定**片段；
 * - **不反推新增**：散文里新写一句候选不会被抓（机检面 = 表；维护义务 = 新增候选须同批补表行并填键）；
 * - 只扫 §1（§2 维护约定 / §3 已评估记录不在面内）。
 *
 * 用法：
 *   node scripts/governance/check-candidate-anchors.mjs             # 受检仓库根；有问题 exit 1
 *   node scripts/governance/check-candidate-anchors.mjs --root <dir>
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** 受检载体（todo 汇总段表）。 */
export const TODO_FILE = 'docs/plan/todo.md'

/** 事实源（候选池）。 */
export const BACKLOG_FILE = 'docs/plan/backlog.md'

/** 表格小节标题（受检面锚点）。 */
export const SECTION_ANCHOR = '**条件触发候选**'

/** 候选池小节边界。 */
export const BACKLOG_SECTION_START = '## 1. 候选池'
export const BACKLOG_SECTION_END = '## 2.'

/** 表行形态：| 候选 | 触发条件 | `键` | */
export const TABLE_ROW_RE = /^\|(?!\s*:?-{3,})[^|]*\|[^|]*\|([^|]*)\|\s*$/

/** 判别键形态（单元格内可含**多个**反引号键，全部须存在）。 */
export const KEY_RE = /`([^`]+)`/g

/**
 * 受检面下界（防静默收窄）。
 *
 * 语义：**受检候选行数**不得低于该值（表被删空 / 解析失效即失败）。
 * 取值口径：按上线时实跑的候选行数取同数量级的保守值；实跑值随规划增长、**不在注释里复述**，
 * 复算命令见本文件头「用法」。
 */
export const MIN_CANDIDATES = 12

/** 失败码。 */
export const ISSUE_CODES = {
    missing: 'candidate-anchor-missing',
    scopeNarrowed: 'scope-narrowed',
    ioError: 'io-error',
}

/**
 * 抽取 todo 汇总段「条件触发候选」表的候选行。
 *
 * @param {string} text todo.md 全文
 * @returns {Array<{ candidate: string, keys: string[] }>}
 */
export function parseCandidateRows(text) {
    const start = text.indexOf(SECTION_ANCHOR)
    if (start === -1) {
        return []
    }
    const rows = []
    for (const line of text.slice(start).split('\n')) {
        if (line.startsWith('- **已发布版本**')) {
            break
        }
        const match = TABLE_ROW_RE.exec(line)
        if (match) {
            const keys = [...match[1].matchAll(KEY_RE)].map((m) => m[1])
            if (keys.length > 0) {
                rows.push({ candidate: line.split('|')[1].trim(), keys })
            }
        }
    }
    return rows
}

/**
 * 抽取 backlog 候选池（§1）正文。
 *
 * @param {string} text backlog.md 全文
 * @returns {string}
 */
export function extractCandidatePool(text) {
    const start = text.indexOf(BACKLOG_SECTION_START)
    const end = text.indexOf(BACKLOG_SECTION_END, start === -1 ? 0 : start)
    if (start === -1) {
        return ''
    }
    return end === -1 ? text.slice(start) : text.slice(start, end)
}

/**
 * 对账候选表与候选池。
 *
 * @param {string} root 仓库根
 * @param {{ enforceScope?: boolean, minCandidates?: number }} [options]
 * @returns {{ checked: number, issues: Array<{ code: string, detail: string }> }}
 */
export function checkCandidateAnchors(root, { enforceScope = true, minCandidates = MIN_CANDIDATES } = {}) {
    const issues = []
    let todoText
    let backlogText
    try {
        todoText = readFileSync(join(root, TODO_FILE), 'utf8')
        backlogText = readFileSync(join(root, BACKLOG_FILE), 'utf8')
    } catch (error) {
        return { checked: 0, issues: [{ code: ISSUE_CODES.ioError, detail: `读取规划载体失败：${error.message}` }] }
    }

    const rows = parseCandidateRows(todoText)
    const pool = extractCandidatePool(backlogText)
    for (const { candidate, keys } of rows) {
        for (const key of keys) {
            if (!pool.includes(key)) {
                issues.push({
                    code: ISSUE_CODES.missing,
                    detail: `${TODO_FILE} 的候选「${candidate}」判别键 \`${key}\` 未在 ${BACKLOG_FILE} §1 出现（列名而无行）`,
                })
            }
        }
    }

    if (enforceScope && rows.length < minCandidates) {
        issues.push({
            code: ISSUE_CODES.scopeNarrowed,
            detail: `受检候选行 ${rows.length} 低于下界 ${minCandidates}（表被删空或解析失效）`,
        })
    }

    return { checked: rows.length, issues }
}

export function main(argv = process.argv.slice(2)) {
    let root = projectRoot
    if (argv.length > 0) {
        if (argv[0] === '--root' && argv[1]) {
            root = resolve(argv[1])
        } else {
            console.error(`[check-candidate-anchors] 不支持的参数：${argv.join(' ')}`)
            return 2
        }
    }
    if (!existsSync(root)) {
        console.error(`[check-candidate-anchors] 目标目录不存在：${root}`)
        return 2
    }

    const { checked, issues } = checkCandidateAnchors(root)
    if (issues.length > 0) {
        for (const issue of issues) {
            console.error(`[check-candidate-anchors][error] ${issue.code}: ${issue.detail}`)
        }
        console.error(`[check-candidate-anchors] ${issues.length} 处问题（受检候选行 ${checked}）`)
        return 1
    }
    console.info(`[check-candidate-anchors] OK：受检候选行 ${checked}，判别键均在候选池 §1 存在`)
    return 0
}

if (isDirectExecution(import.meta.url)) {
    process.exitCode = main()
}
