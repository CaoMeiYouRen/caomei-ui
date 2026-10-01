import { describe, expect, it } from 'vitest'
import {
    CATALOG_ALLOWLIST,
    CATALOG_SUBPART_ALLOWLIST,
    checkDesignCatalog,
    checkRepository,
    parseCatalogRows,
} from './check-design-catalog.mjs'

/** §5 语料：表头 + 分隔行 + 普通行 + 复合名行 + 未实现行，尾部接下一节（解析须止于 `## 6.`）。 */
const CATALOG_MARKDOWN = [
    '## 5. Tier 3：长尾（按需）',
    '',
    '| 组件 | 实现方式 | Reka UI 对应 | Reka 成熟度 | 说明 |',
    '|------|----------|--------------|:-:|------|',
    '| Divider | 自建 | 无 | — | 线型（**已实现**） |',
    '| RadioGroup / RadioButton | 封装 | RadioGroup | 稳定 | 表单基础控件（**已实现**） |',
    '| Sidebar | 自建（布局） | 无 | — | 移动端抽屉可复用 Dialog |',
    '| NotShipped | 自建 | 无 | — | 规划中 |',
    '',
    '## 6. 不自研',
    '',
    '| Divider | 不应被解析 |',
].join('\n')

const REGISTERED = new Set(['Divider', 'RadioGroup'])

/** §5 语料：首张表结束后追加第二张表（须停在首张表结束处）。 */
const CATALOG_WITH_SECOND_TABLE = [
    '## 5. Tier 3：长尾（按需）',
    '',
    '> 表格前说明段落',
    '',
    '| 组件 | 实现方式 | Reka UI 对应 | Reka 成熟度 | 说明 |',
    '|------|----------|--------------|:-:|------|',
    '| Divider | 自建 | 无 | — | 线型（**已实现**） |',
    '',
    '| 另一张表 | 说明 |',
    '|------|------|',
    '| Ghost | 不应被纳入 |',
].join('\n')

describe('parseCatalogRows', () => {
    it('解析 §5 表格行并跳过表头 / 分隔行 / 下一节', () => {
        const rows = parseCatalogRows(CATALOG_MARKDOWN)
        expect(rows.map((row) => row.nameCell)).toEqual([
            'Divider',
            'RadioGroup / RadioButton',
            'Sidebar',
            'NotShipped',
        ])
    })

    it('只取首张表：表前内容与表后第二张表不纳入', () => {
        const rows = parseCatalogRows(CATALOG_WITH_SECOND_TABLE)
        expect(rows.map((row) => row.nameCell)).toEqual(['Divider'])
    })

    it('复合名按 `/` 拆分，粗体标记识别为已实现', () => {
        const rows = parseCatalogRows(CATALOG_MARKDOWN)
        expect(rows[1]).toEqual({
            nameCell: 'RadioGroup / RadioButton',
            names: ['RadioGroup', 'RadioButton'],
            implemented: true,
        })
        expect(rows[2].implemented).toBe(false)
    })

    it('缺少 §5 标题时返回空数组', () => {
        expect(parseCatalogRows('# 其它文档\n\n| 组件 |\n|---|')).toEqual([])
    })
})

describe('checkDesignCatalog', () => {
    const rowsOf = (markdown) => parseCatalogRows(markdown)

    it('一致时通过', () => {
        const result = checkDesignCatalog({ registered: REGISTERED, rows: rowsOf(CATALOG_MARKDOWN), minRows: 1, minRegistered: 1 })
        expect(result).toEqual({ ok: true, errors: [] })
    })

    it('T1：标记已实现但无 §11 登记成员时报错', () => {
        const rows = rowsOf(CATALOG_MARKDOWN)
        rows.push({ nameCell: 'Ghost', names: ['Ghost'], implemented: true })
        const result = checkDesignCatalog({ registered: REGISTERED, rows, minRows: 1, minRegistered: 1 })
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('Ghost')
        expect(result.errors.join('\n')).toContain('标记已实现')
    })

    it('T2：已登记成员未标已实现时报错', () => {
        const rows = rowsOf(CATALOG_MARKDOWN).map((row) => (row.nameCell === 'Divider' ? { ...row, implemented: false } : row))
        const result = checkDesignCatalog({ registered: REGISTERED, rows, minRows: 1, minRegistered: 1 })
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('却未标已实现')
    })

    it('T2：复合名命中任一登记成员即要求标记（子部件无独立组件页属正常）', () => {
        const rows = rowsOf(CATALOG_MARKDOWN).map((row) => (row.nameCell.startsWith('RadioGroup') ? { ...row, implemented: false } : row))
        const result = checkDesignCatalog({ registered: REGISTERED, rows, minRows: 1, minRegistered: 1 })
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('RadioGroup / RadioButton')
    })

    it('T2：允许名单命中时放行', () => {
        const rows = rowsOf(CATALOG_MARKDOWN).map((row) => (row.nameCell === 'Divider' ? { ...row, implemented: false } : row))
        const result = checkDesignCatalog({ registered: REGISTERED, rows, allowlist: ['Divider'], minRows: 1, minRegistered: 1 })
        expect(result).toEqual({ ok: true, errors: [] })
    })

    it('T3：§5 行数低于下界时报错', () => {
        const result = checkDesignCatalog({ registered: REGISTERED, rows: rowsOf(CATALOG_MARKDOWN), minRows: 99, minRegistered: 1 })
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('受检面被静默收窄')
    })

    it('T3：§11 成员数低于下界时报错', () => {
        const result = checkDesignCatalog({ registered: REGISTERED, rows: rowsOf(CATALOG_MARKDOWN), minRows: 1, minRegistered: 99 })
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('事实源被静默收窄')
    })

    it('T4：允许名单条目未被实际豁免时报错（防腐烂）', () => {
        const result = checkDesignCatalog({ registered: REGISTERED, rows: rowsOf(CATALOG_MARKDOWN), allowlist: ['Divider', 'NeverSeen'], minRows: 1, minRegistered: 1 })
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('NeverSeen')
        expect(result.errors.join('\n')).toContain('失效条目')
    })

    it('T4：豁免已不再需要（行已标已实现）时报错', () => {
        const result = checkDesignCatalog({ registered: REGISTERED, rows: rowsOf(CATALOG_MARKDOWN), allowlist: ['Divider'], minRows: 1, minRegistered: 1 })
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('已不再被实际豁免')
    })

    it('T5：对应已登记组件的行含未登记名且不在子部件名单内时报错', () => {
        const rows = rowsOf(CATALOG_MARKDOWN).map((row) => (row.nameCell === 'Divider' ? { nameCell: 'Divider / Ghost', names: ['Divider', 'Ghost'], implemented: true } : row))
        const result = checkDesignCatalog({ registered: REGISTERED, rows, minRows: 1, minRegistered: 1 })
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('Ghost')
        expect(result.errors.join('\n')).toContain('成员集合漂移')
    })

    it('T5：子部件允许名单命中时放行（RadioButton 随 RadioGroup 登记）', () => {
        const rows = rowsOf(CATALOG_MARKDOWN).filter((row) => row.nameCell === 'RadioGroup / RadioButton')
        const result = checkDesignCatalog({ registered: REGISTERED, rows, subpartAllowlist: ['RadioButton'], minRows: 1, minRegistered: 1 })
        expect(result).toEqual({ ok: true, errors: [] })
    })

    it('T5：子部件允许名单条目未命中时报错（防腐烂）', () => {
        const result = checkDesignCatalog({ registered: REGISTERED, rows: rowsOf(CATALOG_MARKDOWN), subpartAllowlist: ['NeverSeen'], minRows: 1, minRegistered: 1 })
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('NeverSeen')
        expect(result.errors.join('\n')).toContain('子部件允许名单')
    })
})

describe('仓库现状', () => {
    it('组件设计 §5 清单与 §11 登记表一致', () => {
        const result = checkRepository()
        expect(result.errors).toEqual([])
        expect(result.ok).toBe(true)
        // 受检面下界：清单行数与登记成员数均高于守卫下界
        expect(result.rows.length).toBeGreaterThanOrEqual(20)
        expect(result.registered.size).toBeGreaterThanOrEqual(45)
    })

    it('默认允许名单为空、子部件名单仅登记无独立组件页的子部件', () => {
        expect(CATALOG_ALLOWLIST).toEqual([])
        expect(CATALOG_SUBPART_ALLOWLIST).toEqual(['RadioButton'])
    })
})
