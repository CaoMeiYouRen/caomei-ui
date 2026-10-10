#!/usr/bin/env node

/**
 * check-governance-counts：治理索引摘要与记录本体的**计数对账**守卫。
 *
 * 为什么需要它：`docs/design/governance/index.md` 的摘要常引用「本批 N 文件 / M 例」等计数，
 * 与记录本体是**同一事实的两处载体**。历史上有批次「记录本体为修复前快照、索引摘要未同步」，
 * 连续两轮 Review Gate 以「同一组计数跨载体漂移」判 blocker。本守卫把「索引摘要引用的计数
 * 必须能在记录本体中找到同值」变为可判定门禁。
 *
 * 口径（**已按误报实测标定**，见治理记录）：
 * - 只覆盖**可机器识别、且两载体惯用同一数值语义**的计数族：测试计数（`N 文件 / M 例`）、
 *   e2e 计数（`N passed` / `N tests`）、治理记录计数（`N 记录 / M 指针`）、文档取证命令计数（`N md / M 命令`）。
 *   分隔符容忍 `文件 N 例` 与 `文件 / N 例` 两种写法。
 * - 规则：索引条目中出现的某族计数，若**记录本体也出现该族计数**，则索引值必须出现在本体值集合中；
 *   **本体完全不含该族计数时跳过该族**（无法对账，不判失败）——只对「两处都有却互相矛盾」判失败，
 *   这是历史 blocker 的精确类别，也是把误报压到 0 的关键。
 * - 反向（本体有、索引没有）不判失败：本体可引用历史快照计数。
 * - **盲区（显式披露）**：只对「两载体都有却矛盾」判失败；**两处同为陈旧值**（且不与其他载体比对）时不在面内，
 *   仍由 §9 的「逐载体 `rg -o` 核对」流程约束兜底。守卫对账数**含记录自身索引条目**，须在全部产物 staged 后复算。
 *
 * 用法：
 *   node scripts/governance/check-governance-counts.mjs   # 有违规 exit 1
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** 治理记录目录与索引文件（仓库相对路径）。 */
export const GOVERNANCE_DIR = 'docs/design/governance'
export const INDEX_FILE = 'docs/design/governance/index.md'

/** 受检面下界：至少要对账这么多条「两载体都有」的计数（防静默收窄）。 */
export const MIN_RECONCILED = 40

/**
 * 计数族定义：`re` 带全局标志用于 `matchAll`；`key` 把匹配规约为可比较的键。
 * 分隔符容忍 `N 文件 M 例` / `N 文件 / M 例` 两种写法。
 */
export const COUNT_FAMILIES = [
    { id: 'test', label: '测试计数（文件 / 例）', re: /(\d+)\s*文件\s*[/／]?\s*(\d+)\s*例/g, key: (m) => `${m[1]}/${m[2]}` },
    { id: 'e2e', label: 'e2e 计数', re: /(\d+)\s*(?:passed|tests)\b/g, key: (m) => m[1] },
    { id: 'records', label: '治理记录计数（记录 / 指针）', re: /(\d+)\s*记录\s*[/／]?\s*(\d+)\s*指针/g, key: (m) => `${m[1]}/${m[2]}` },
    { id: 'mdcmd', label: '文档取证命令计数（md / 命令）', re: /(\d+)\s*md\s*[/／]?\s*(\d+)\s*命令/g, key: (m) => `${m[1]}/${m[2]}` },
]

/** 索引条目链接（`- [文字](./file.md)：...`）。 */
const INDEX_LINK_RE = /^-\s*\[[^\]]+\]\(\.\/([^)]+\.md)\)/

/** 抽取某段文本中各计数族的键集合，返回 `Map<familyId, Set<string>>`。 */
export function extractCounts(text) {
    const result = new Map()
    for (const family of COUNT_FAMILIES) {
        const keys = new Set()
        for (const match of text.matchAll(family.re)) {
            keys.add(family.key(match))
        }
        result.set(family.id, keys)
    }
    return result
}

/** 解析索引条目：返回 `[{ file, text }]`（仅治理目录内、存在的记录）。 */
export function parseIndexEntries(root = projectRoot) {
    const indexPath = join(root, INDEX_FILE)
    const lines = readFileSync(indexPath, 'utf8').split(/\r?\n/)
    const entries = []
    for (const line of lines) {
        const match = line.match(INDEX_LINK_RE)
        if (!match) {
            continue
        }
        const file = match[1]
        if (!existsSync(join(root, GOVERNANCE_DIR, file))) {
            continue
        }
        entries.push({ file, text: line })
    }
    return entries
}

/** 执行校验，返回 { ok, errors, warnings, reconciled }。`options` 仅供测试下调受检面下界。 */
export function checkGovernanceCounts(root = projectRoot, { minReconciled = MIN_RECONCILED } = {}) {
    const errors = []
    const warnings = []
    let reconciled = 0

    const entries = parseIndexEntries(root)
    if (entries.length === 0) {
        errors.push('未解析到任何治理索引条目（受检面为空）')
        return { ok: false, errors, warnings, reconciled }
    }

    for (const entry of entries) {
        const indexCounts = extractCounts(entry.text)
        const body = readFileSync(join(root, GOVERNANCE_DIR, entry.file), 'utf8')
        const bodyCounts = extractCounts(body)

        for (const family of COUNT_FAMILIES) {
            const indexKeys = indexCounts.get(family.id)
            const bodyKeys = bodyCounts.get(family.id)
            if (indexKeys.size === 0 || bodyKeys.size === 0) {
                // 本体无该族计数 → 无法对账，跳过（不判失败）。
                continue
            }
            for (const key of indexKeys) {
                reconciled += 1
                if (!bodyKeys.has(key)) {
                    errors.push(
                        `${entry.file}：索引摘要的${family.label} ${key} 未在记录本体出现（同值应为 ${[...bodyKeys].join(' / ')}）`,
                    )
                }
            }
        }
    }

    if (reconciled < minReconciled) {
        errors.push(`受检面收窄：实际对账 ${reconciled} 条计数（下界 ${minReconciled}）`)
    }

    return { ok: errors.length === 0, errors, warnings, reconciled }
}

if (isDirectExecution(import.meta.url)) {
    const result = checkGovernanceCounts()
    for (const warning of result.warnings) {
        console.warn(`[check-governance-counts][warn] ${warning}`)
    }
    if (result.ok) {
        console.info(`[check-governance-counts] 通过：索引摘要与记录本体对账 ${result.reconciled} 条计数一致`)
    } else {
        for (const error of result.errors) {
            console.error(`[check-governance-counts][error] ${error}`)
        }
        process.exit(1)
    }
}
