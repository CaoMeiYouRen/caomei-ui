import { mount } from '@vue/test-utils'
import { h, nextTick, reactive, type DefineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import type { DataTableColumn, DataTableExpansionSlotProps, DataTableProps } from './types'
import { CaomeiDataTable } from './index'

interface ExpandRow {
    id: number
    name: string
    dept: string
    detail: string
}

const ExpandTable = CaomeiDataTable as unknown as DefineComponent<DataTableProps<ExpandRow>>

const expandData: ExpandRow[] = [
    { id: 1, name: 'Ada', dept: 'A', detail: 'Ada 详情' },
    { id: 2, name: 'Bob', dept: 'A', detail: 'Bob 详情' },
    { id: 3, name: 'Cara', dept: 'B', detail: 'Cara 详情' },
]

const expandColumns: DataTableColumn<ExpandRow>[] = [
    { key: 'expand', expander: true, width: '48px' },
    { key: 'name', header: '姓名' },
    { key: 'detail', header: '详情' },
]

const groupedColumns: DataTableColumn<ExpandRow>[] = [
    { key: 'expand', expander: true, width: '48px' },
    { key: 'dept', header: '部门' },
    { key: 'name', header: '姓名' },
]

describe('CaomeiDataTable 行展开', () => {
    function mountExpansion(props: Partial<DataTableProps<ExpandRow>> = {}, withSlot = true) {
        return mount(ExpandTable, {
            props: { data: expandData, columns: expandColumns, rowKey: 'id', ...props },
            ...(withSlot
                ? {
                    slots: {
                        expansion: (scope: DataTableExpansionSlotProps<ExpandRow>) => [
                            h('div', { class: 'expansion-slot' }, scope.data.detail),
                        ],
                    },
                }
                : {}),
        })
    }

    function expanders(wrapper: ReturnType<typeof mountExpansion>) {
        return wrapper.findAll('.caomei-data-table__row-expander')
    }

    it('expander 列渲染切换按钮、表头留空，且不改变既有列结构', () => {
        const wrapper = mountExpansion()

        expect(expanders(wrapper)).toHaveLength(3)
        expect(expanders(wrapper).map((button) => button.element.tagName)).toEqual([
            'BUTTON',
            'BUTTON',
            'BUTTON',
        ])
        // 表头：展开列留空，其余列照常
        expect(wrapper.findAll('.caomei-data-table__th').map((cell) => cell.text())).toEqual([
            '',
            '姓名',
            '详情',
        ])
        // 数据行 td 数与列数一致（展开列不破坏既有列结构）
        expect(
            wrapper.findAll('.caomei-data-table__row')[0].findAll('.caomei-data-table__td'),
        ).toHaveLength(3)
        expect(wrapper.findAll('.caomei-data-table__row-expansion')).toHaveLength(0)
    })

    it('自持模式下点击展开 / 收起并抛出双向事件与可访问名切换', async () => {
        const wrapper = mountExpansion()

        expect(expanders(wrapper)[0].attributes('aria-expanded')).toBe('false')
        expect(expanders(wrapper)[0].attributes('aria-label')).toBe('展开行')

        await expanders(wrapper)[0].trigger('click')

        expect(expanders(wrapper)[0].attributes('aria-expanded')).toBe('true')
        expect(expanders(wrapper)[0].attributes('aria-label')).toBe('收起行')
        expect(wrapper.findAll('.caomei-data-table__row-expansion')).toHaveLength(1)
        expect(wrapper.get('.expansion-slot').text()).toBe('Ada 详情')
        expect(wrapper.emitted('update:expandedRows')?.[0]?.[0]).toEqual(['1'])
        expect(wrapper.emitted('rowExpand')?.[0]?.[0]).toMatchObject({ data: expandData[0] })

        await expanders(wrapper)[0].trigger('click')

        expect(wrapper.findAll('.caomei-data-table__row-expansion')).toHaveLength(0)
        expect(expanders(wrapper)[0].attributes('aria-expanded')).toBe('false')
        expect(wrapper.emitted('update:expandedRows')?.[1]?.[0]).toEqual([])
        expect(wrapper.emitted('rowCollapse')?.[0]?.[0]).toMatchObject({ data: expandData[0] })
    })

    it('展开行的 id 与按钮 aria-controls 一致', async () => {
        const wrapper = mountExpansion()

        await expanders(wrapper)[1].trigger('click')

        const controls = expanders(wrapper)[1].attributes('aria-controls')
        expect(controls).toBeTruthy()
        expect(wrapper.get('.caomei-data-table__row-expansion').attributes('id')).toBe(controls)
    })

    it('多行独立展开，互不影响', async () => {
        const wrapper = mountExpansion()

        await expanders(wrapper)[0].trigger('click')
        await expanders(wrapper)[2].trigger('click')

        expect(expanders(wrapper).map((button) => button.attributes('aria-expanded'))).toEqual([
            'true',
            'false',
            'true',
        ])
        expect(wrapper.findAll('.expansion-slot').map((node) => node.text())).toEqual([
            'Ada 详情',
            'Cara 详情',
        ])
    })

    it('受控模式下点击只抛出事件、渲染由父级决定，回写后生效', async () => {
        const wrapper = mountExpansion({ expandedRows: [] })

        await expanders(wrapper)[0].trigger('click')

        expect(wrapper.emitted('update:expandedRows')?.[0]?.[0]).toEqual(['1'])
        expect(wrapper.findAll('.caomei-data-table__row-expansion')).toHaveLength(0)

        await wrapper.setProps({ expandedRows: ['1'] })

        expect(expanders(wrapper)[0].attributes('aria-expanded')).toBe('true')
        expect(wrapper.findAll('.caomei-data-table__row-expansion')).toHaveLength(1)
    })

    it('受控数组原地变更后移除受控 prop，退回自持时沿用最新值', async () => {
        const expandedRows = reactive<string[]>([])
        const wrapper = mountExpansion({ expandedRows })

        expandedRows.push('2')
        await nextTick()
        expect(wrapper.findAll('.caomei-data-table__row-expansion')).toHaveLength(1)

        await wrapper.setProps({ expandedRows: undefined })

        expect(wrapper.findAll('.caomei-data-table__row-expansion')).toHaveLength(1)
        expect(expanders(wrapper)[1].attributes('aria-expanded')).toBe('true')
    })

    it('未提供 #expansion 插槽时展开行不渲染，但事件与展开态仍生效', async () => {
        const wrapper = mountExpansion({}, false)

        await expanders(wrapper)[0].trigger('click')

        expect(wrapper.findAll('.caomei-data-table__row-expansion')).toHaveLength(0)
        expect(expanders(wrapper)[0].attributes('aria-expanded')).toBe('true')
        expect(wrapper.emitted('rowExpand')).toHaveLength(1)
    })

    it('#expansion 插槽作用域包含 data 与显示序号 index', () => {
        const scopes: DataTableExpansionSlotProps<ExpandRow>[] = []
        const wrapper = mount(ExpandTable, {
            props: { data: expandData, columns: expandColumns, rowKey: 'id', expandedRows: ['1', '3'] },
            slots: {
                expansion: (scope: DataTableExpansionSlotProps<ExpandRow>) => {
                    scopes.push(scope)
                    return [h('span', { class: 'expansion-slot' }, scope.data.name)]
                },
            },
        })

        expect(scopes.map((scope) => scope.data.name)).toEqual(['Ada', 'Cara'])
        expect(scopes.map((scope) => scope.index)).toEqual([0, 2])
        expect(wrapper.findAll('.caomei-data-table__row-expansion')).toHaveLength(2)
    })

    it('未提供 expander 列时不渲染切换按钮，行展开能力不生效', () => {
        const wrapper = mount(ExpandTable, {
            props: {
                data: expandData,
                columns: [
                    { key: 'name', header: '姓名' },
                    { key: 'detail', header: '详情' },
                ],
                rowKey: 'id',
            },
            slots: { expansion: () => [h('span', { class: 'expansion-slot' }, '详情')] },
        })

        expect(expanders(wrapper)).toHaveLength(0)
        expect(wrapper.findAll('.caomei-data-table__row-expansion')).toHaveLength(0)
    })

    it('收起态不输出 aria-controls，展开后指向实际渲染的展开行', async () => {
        const wrapper = mountExpansion({ selectionMode: 'multiple' })

        // 收起态：展开行不存在，aria-controls 不输出（避免引用不存在的元素）
        expect(expanders(wrapper)[0].attributes('aria-controls')).toBeUndefined()

        await expanders(wrapper)[0].trigger('click')

        expect(expanders(wrapper)[0].attributes('aria-controls')).toBe(
            wrapper.get('.caomei-data-table__row-expansion').attributes('id'),
        )
    })

    it('展开列的表头始终留空（提供 header 或标记 sortable 也不渲染）', () => {
        const wrapper = mount(ExpandTable, {
            props: {
                data: expandData,
                columns: [
                    { key: 'expand', expander: true, header: '展开', sortable: true, width: '48px' },
                    { key: 'name', header: '姓名' },
                ],
                rowKey: 'id',
            },
            slots: { expansion: () => [h('span', { class: 'expansion-slot' }, '详情')] },
        })

        expect(wrapper.findAll('.caomei-data-table__th').map((cell) => cell.text())).toEqual([
            '',
            '姓名',
        ])
        expect(wrapper.find('.caomei-data-table__sort').exists()).toBe(false)
    })

    it('多个 expander 列时仅首个生效，其余列按普通列渲染', () => {
        const wrapper = mount(ExpandTable, {
            props: {
                data: expandData,
                columns: [
                    { key: 'expand', expander: true, width: '48px' },
                    { key: 'name', header: '姓名', expander: true },
                ],
                rowKey: 'id',
            },
            slots: { expansion: () => [h('span', { class: 'expansion-slot' }, '详情')] },
        })

        // 每行只有一个切换按钮（首个 expander 列），第二个 expander 列按普通列渲染
        expect(
            wrapper.findAll('.caomei-data-table__row')[0].findAll('.caomei-data-table__row-expander'),
        ).toHaveLength(1)
        expect(wrapper.findAll('.caomei-data-table__th').map((cell) => cell.text())).toEqual([
            '',
            '姓名',
        ])
    })

    it('可访问名可覆盖，展开行 colspan 计入选择列', () => {
        const wrapper = mountExpansion({
            selectionMode: 'multiple',
            expandedRows: ['1'],
            expandRowLabel: '展开该行',
            collapseRowLabel: '收起该行',
        })

        expect(expanders(wrapper)[0].attributes('aria-label')).toBe('收起该行')
        expect(expanders(wrapper)[1].attributes('aria-label')).toBe('展开该行')
        expect(wrapper.get('.caomei-data-table__row-expansion-cell').attributes('colspan')).toBe('4')
    })

    it('与行分组同用时，展开行渲染在所属分组的数据行之后', async () => {
        const wrapper = mount(ExpandTable, {
            props: {
                data: expandData,
                columns: groupedColumns,
                rowKey: 'id',
                rowGroupMode: 'subheader',
                groupRowsBy: 'dept',
            },
            slots: {
                expansion: (scope: DataTableExpansionSlotProps<ExpandRow>) => [
                    h('span', { class: 'expansion-slot' }, scope.data.detail),
                ],
            },
        })

        // 第 3 行（Cara）位于第二个分组
        await expanders(wrapper)[2].trigger('click')

        const bodyChildren = wrapper.get('tbody').element.children
        const expansionIndex = Array.from(bodyChildren).findIndex((node) =>
            node.classList.contains('caomei-data-table__row-expansion'),
        )
        const expansionRow = bodyChildren[expansionIndex]
        expect(expansionRow.previousElementSibling?.textContent).toContain('Cara')
        expect(wrapper.get('.expansion-slot').text()).toBe('Cara 详情')
    })

    it('空数据时渲染空态且不渲染切换按钮', () => {
        const wrapper = mountExpansion({ data: [] })

        expect(expanders(wrapper)).toHaveLength(0)
        expect(wrapper.find('.caomei-data-table__empty').exists()).toBe(true)
    })
})
