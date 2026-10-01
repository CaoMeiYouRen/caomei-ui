#!/usr/bin/env node
/**
 * check-design-catalog：组件设计清单（`docs/design/components.md` §5）与 §11 登记表的对账守卫。
 *
 * 为什么需要它：[文档与演示站 §11](../../docs/design/documentation-site.md) 的分组表是组件成员的
 * 唯一事实源，侧栏 / 组件总览页 / 画廊登记表均有守卫，**只有组件设计 §5 的 Tier 3 清单长期无机检**
 * ——新增组件或调整实现状态后漏改该处，只能靠人工回扫（历史缺口见 §11 的「登记面」注记）。
 *
 * 判定（事实源 = §11 登记成员集合）：
 * - T1 `phantom-implemented`：§5 行标 `**已实现**`，但其组件名无一登记于 §11（声称实现却无组件页 / 未登记）；
 * - T2 `stale-marker`：§5 行对应至少一个 §11 已登记成员，却未标 `**已实现**`（实现状态滞后）；
 * - T3 `scope-narrowed`：§5 行数或 §11 成员数低于下界（防受检面 / 事实源被静默收窄）；
 * - T4 `allowlist-stale`：允许名单条目不再**被实际豁免**（对应行已标已实现或已消失）即报错（防永久豁免腐烂）；
 * - T5 `member-drift`：对应已登记组件的行含**未登记名**且不在子部件允许名单内（成员集合漂移）；
 *   子部件允许名单同样受反向校验（条目不再出现即报错）。
 *
 * 成员名口径：§5 首列以 ` / ` 分隔复合名（如 `RadioGroup / RadioButton`、`InputGroup / FloatLabel`），
 * 逐名与 §11 比对；**命中任一即视该行对应已登记组件**，其余名须是已声明的子部件
 * （`RadioButton` 随 `RadioGroup` 登记、无独立组件页，属正常）。
 *
 * 已知边界（有意，非缺陷）：本守卫以 §5 为受检对象，覆盖「§5 行 ↔ §11 成员」双向漂移；
 * **「§11 新增了 Tier 1/2 组件但未写入 §5」不在本守卫面内**（§5 只承载 Tier 3 清单，成员归属
 * 无机器可读映射）——该方向由侧栏 / 总览页守卫与新增组件收口流程承担。
 *
 * 用法：
 *   node scripts/governance/check-design-catalog.mjs   # 有漂移 exit 1
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'
import { readSection11Groups, registeredComponentsOf } from './component-registry.mjs'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const CATALOG_DOC_PATH = join(REPO_ROOT, 'docs', 'design', 'components.md')

/** 「已实现」标记形态：说明单元格内的粗体标记。 */
const IMPLEMENTED_RE = /\*\*已实现\*\*/

/** 受检面下界：§5 清单行数（当前 21）。 */
export const MIN_CATALOG_ROWS = 20
/** 事实源下界：§11 登记成员数（当前 48）。 */
export const MIN_REGISTERED_COMPONENTS = 45
/**
 * 允许「已登记但有意不标已实现」的 §5 成员名（当前为空）。
 * 受 T4 反向校验：条目不再**被实际豁免**（对应行已标已实现或已消失）即报错，防止豁免腐烂。
 */
export const CATALOG_ALLOWLIST = []
/**
 * 已声明「无独立组件页的子部件」名（如 `RadioButton` 随 `RadioGroup` 登记）。
 * 受 T5 判定与反向校验：非登记名须在此表内，否则视为成员集合漂移；条目不再出现即报错。
 */
export const CATALOG_SUBPART_ALLOWLIST = ['RadioButton']

/**
 * 解析 `docs/design/components.md` §5 的组件清单表。
 *
 * 只取 §5 内**以 `组件` 表头开始的第一张表**：表头前的内容与表结束后的内容不纳入，
 * 避免 §5 将来追加第二张表时被误纳入判定面。
 *
 * @param {string} markdown `components.md` 全文
 * @returns {{ nameCell: string, names: string[], implemented: boolean }[]}
 */
export function parseCatalogRows(markdown) {
    const lines = markdown.split(/\r?\n/)
    const start = lines.findIndex((line) => /^##\s+5\.\s/.test(line))
    if (start === -1) {
        return []
    }
    const rest = lines.slice(start + 1)
    const end = rest.findIndex((line) => /^##\s/.test(line))
    const section = (end === -1 ? rest : rest.slice(0, end)).join('\n')

    const rows = []
    let inTable = false
    for (const line of section.split(/\r?\n/)) {
        const match = line.match(/^\|\s*([^|]+?)\s*\|/)
        if (!match) {
            if (inTable) {
                break
            }
            continue
        }
        const nameCell = match[1].trim()
        if (nameCell === '组件') {
            inTable = true
            continue
        }
        if (!inTable || nameCell.length === 0 || /^:?-{2,}/.test(nameCell)) {
            continue
        }
        const names = nameCell
            .split('/')
            .map((name) => name.trim())
            .filter((name) => name.length > 0)
        if (names.length === 0) {
            continue
        }
        rows.push({ nameCell, names, implemented: IMPLEMENTED_RE.test(line) })
    }
    return rows
}

/**
 * 对账 §5 清单与 §11 登记成员。
 *
 * @param {object} input
 * @param {Set<string>} input.registered §11 登记成员集合
 * @param {{ nameCell: string, names: string[], implemented: boolean }[]} input.rows §5 清单行
 * @param {string[]} [input.allowlist] 允许名单（默认 `CATALOG_ALLOWLIST`）
 * @param {number} [input.minRows] §5 行数下界
 * @param {number} [input.minRegistered] §11 成员数下界
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function checkDesignCatalog({
    registered,
    rows,
    allowlist = CATALOG_ALLOWLIST,
    subpartAllowlist = CATALOG_SUBPART_ALLOWLIST,
    minRows = MIN_CATALOG_ROWS,
    minRegistered = MIN_REGISTERED_COMPONENTS,
}) {
    const errors = []
    const allow = new Set(allowlist)
    const subpartAllow = new Set(subpartAllowlist)
    const usedAllowlist = new Set()
    const usedSubparts = new Set()

    if (rows.length < minRows) {
        errors.push(`§5 组件清单行数 ${rows.length} 低于下界 ${minRows}：怀疑受检面被静默收窄`)
    }
    if (registered.size < minRegistered) {
        errors.push(`§11 登记成员 ${registered.size} 低于下界 ${minRegistered}：怀疑事实源被静默收窄`)
    }

    for (const row of rows) {
        const hits = row.names.filter((name) => registered.has(name))
        const misses = row.names.filter((name) => !registered.has(name))
        const allowed = row.names.some((name) => allow.has(name))

        if (row.implemented && hits.length === 0) {
            errors.push(`§5「${row.nameCell}」标记已实现，但其组件名无一登记于 §11（成员集合 / 标记漂移）`)
        }
        if (!row.implemented && hits.length > 0 && !allowed) {
            errors.push(`§5「${row.nameCell}」对应 §11 已登记成员（${hits.join(' / ')}）却未标已实现（标记漂移）`)
        }
        // T5 成员集合完整性：对应已登记组件的行，其非登记名必须是已声明的子部件
        if (hits.length > 0) {
            for (const name of misses) {
                if (subpartAllow.has(name)) {
                    usedSubparts.add(name)
                } else {
                    errors.push(`§5「${row.nameCell}」含未登记名 "${name}"，且不在子部件允许名单内（成员集合漂移）`)
                }
            }
        }
        if (allowed && !row.implemented && hits.length > 0) {
            for (const name of row.names) {
                if (allow.has(name)) {
                    usedAllowlist.add(name)
                }
            }
        }
    }

    // T4 反向校验：允许名单条目必须仍**被实际豁免**（对应行已标已实现或已消失即须移除）
    for (const entry of allowlist) {
        if (!usedAllowlist.has(entry)) {
            errors.push(`允许名单条目 "${entry}" 已不再被实际豁免（失效条目，须移除）`)
        }
    }
    // T5 反向校验：子部件允许名单条目必须仍出现在 §5 行内
    for (const entry of subpartAllowlist) {
        if (!usedSubparts.has(entry)) {
            errors.push(`子部件允许名单条目 "${entry}" 未命中任何 §5 行（失效条目，须移除）`)
        }
    }

    return { ok: errors.length === 0, errors }
}

/** 读取仓库内的 §5 清单与 §11 登记表并执行对账。 */
export function checkRepository() {
    const rows = parseCatalogRows(readFileSync(CATALOG_DOC_PATH, 'utf-8'))
    const registered = registeredComponentsOf(readSection11Groups())
    return { ...checkDesignCatalog({ registered, rows }), rows, registered }
}

if (isDirectExecution(import.meta.url)) {
    const result = checkRepository()
    if (result.ok) {
        console.info(`[check-design-catalog] 通过：组件设计 §5 清单 ${result.rows.length} 行与 §11 登记 ${result.registered.size} 成员一致`)
        process.exit(0)
    }
    for (const error of result.errors) {
        console.error(`[check-design-catalog][error] ${error}`)
    }
    process.exit(1)
}
