import { mount } from '@vue/test-utils'
import { h, nextTick, reactive, type DefineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { DataTableColumn, DataTableProps } from './types'
import { CaomeiDataTable } from './index'

interface Row {
    name: string | null
    age: number
}

/** VTU 无法从 props 推断泛型组件参数，测试内具体化行类型 */
const DataTable = CaomeiDataTable as unknown as DefineComponent<DataTableProps<Row>>

const baseData: Row[] = [
    { name: 'Ada', age: 36 },
    { name: 'Bob', age: 24 },
]

const baseColumns: DataTableColumn<Row>[] = [
    { key: 'name', header: '姓名' },
    { key: 'age', header: '年龄' },
]

describe('CaomeiDataTable', () => {
    it('按列定义渲染表头与单元格', () => {
        const wrapper = mount(DataTable, {
            props: { data: baseData, columns: baseColumns },
        })

        expect(wrapper.findAll('.caomei-data-table__th').map((cell) => cell.text())).toEqual([
            '姓名',
            '年龄',
        ])
        expect(wrapper.findAll('.caomei-data-table__td').map((cell) => cell.text())).toEqual([
            'Ada',
            '36',
            'Bob',
            '24',
        ])
    })

    it('accessor 函数自定义取值', () => {
        const wrapper = mount(DataTable, {
            props: {
                data: baseData,
                columns: [
                    {
                        key: 'summary',
                        header: '摘要',
                        accessor: (row: Row) => `${row.name} (${row.age})`,
                    },
                ],
            },
        })

        expect(wrapper.get('.caomei-data-table__td').text()).toBe('Ada (36)')
    })

    it('cell 自定义单元格渲染', () => {
        const wrapper = mount(DataTable, {
            props: {
                data: baseData,
                columns: [
                    {
                        key: 'age',
                        header: '年龄',
                        cell: ({ value }) => h('strong', String(value)),
                    },
                ],
            },
        })

        expect(wrapper.findAll('.caomei-data-table__td strong').map((node) => node.text())).toEqual([
            '36',
            '24',
        ])
    })

    it('null 值渲染为空字符串', () => {
        const wrapper = mount(DataTable, {
            props: { data: [{ name: null, age: 1 }], columns: baseColumns },
        })

        expect(wrapper.findAll('.caomei-data-table__td')[0].text()).toBe('')
    })

    it('数据变更后行同步更新', async () => {
        const wrapper = mount(DataTable, {
            props: { data: [baseData[0]], columns: baseColumns },
        })
        expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(1)

        await wrapper.setProps({ data: baseData })
        await nextTick()

        expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(2)
    })

    it('rowKey 支持字段名与函数', () => {
        const rowKey = vi.fn((row: Row, index: number) => `${row.name}-${index}`)
        const byField = mount(DataTable, {
            props: { data: baseData, columns: baseColumns, rowKey: 'name' },
        })
        expect(byField.findAll('.caomei-data-table__row')).toHaveLength(2)

        const byFunction = mount(DataTable, {
            props: { data: baseData, columns: baseColumns, rowKey },
        })
        expect(byFunction.findAll('.caomei-data-table__row')).toHaveLength(2)
        expect(rowKey).toHaveBeenCalled()
        expect(rowKey.mock.calls.map((call) => (call[0] as Row).name)).toEqual(['Ada', 'Bob'])
        expect(rowKey.mock.calls.map((call) => call[1])).toEqual([0, 1])
    })

    it('rowKey 字段缺失时回退行索引', () => {
        const wrapper = mount(DataTable, {
            props: { data: baseData, columns: baseColumns, rowKey: 'missing' },
        })

        expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(2)
    })

    it('空数据渲染默认空态文案', () => {
        const wrapper = mount(DataTable, {
            props: { data: [], columns: baseColumns },
        })

        expect(wrapper.find('.caomei-data-table__row').exists()).toBe(false)
        expect(wrapper.get('.caomei-data-table__empty').text()).toBe('暂无数据')
        expect(wrapper.get('.caomei-data-table__empty').attributes('colspan')).toBe('2')
    })

    it('empty 插槽覆盖空态内容', () => {
        const wrapper = mount(DataTable, {
            props: { data: [], columns: baseColumns },
            slots: { empty: '<span data-test="empty">没有记录</span>' },
        })

        expect(wrapper.get('.caomei-data-table__empty').find('[data-test="empty"]').exists()).toBe(
            true,
        )
    })

    it('caption 渲染为表格标题', () => {
        const wrapper = mount(DataTable, {
            props: { data: baseData, columns: baseColumns, caption: '用户列表' },
        })

        expect(wrapper.get('caption').text()).toBe('用户列表')
    })

    it('hoverable 与 striped 控制样式类', () => {
        const defaults = mount(DataTable, {
            props: { data: baseData, columns: baseColumns },
        })
        expect(defaults.get('.caomei-data-table').classes()).toContain(
            'caomei-data-table--hoverable',
        )
        expect(defaults.get('.caomei-data-table').classes()).not.toContain(
            'caomei-data-table--striped',
        )

        const striped = mount(DataTable, {
            props: { data: baseData, columns: baseColumns, hoverable: false, striped: true },
        })
        expect(striped.get('.caomei-data-table').classes()).not.toContain(
            'caomei-data-table--hoverable',
        )
        expect(striped.get('.caomei-data-table').classes()).toContain(
            'caomei-data-table--striped',
        )
    })

    it('align 与 width 应用到对应列', () => {
        const wrapper = mount(DataTable, {
            props: {
                data: baseData,
                columns: [
                    { key: 'name', header: '姓名' },
                    { key: 'age', header: '年龄', align: 'right', width: '120px' },
                ],
            },
        })

        const headers = wrapper.findAll('.caomei-data-table__th')
        expect(headers[1].classes()).toContain('caomei-data-table__cell--right')
        expect(headers[1].attributes('style')).toContain('width: 120px')

        const firstRowCells = wrapper.findAll('.caomei-data-table__row')[0].findAll(
            '.caomei-data-table__td',
        )
        expect(firstRowCells[1].classes()).toContain('caomei-data-table__cell--right')
    })

    it('accessor 支持点号嵌套路径', () => {
        interface NestedRow {
            user: { name: string }
        }
        const Nested = CaomeiDataTable as unknown as DefineComponent<DataTableProps<NestedRow>>
        const wrapper = mount(Nested, {
            props: {
                data: [{ user: { name: 'Ada' } }],
                columns: [{ key: 'name', header: '姓名', accessor: 'user.name' }],
            },
        })

        expect(wrapper.get('.caomei-data-table__td').text()).toBe('Ada')
    })

    it('sortable 列渲染排序按钮并在点击时切换顺序（非受控）', async () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: [
                    { key: 'name', header: '姓名' },
                    { key: 'age', header: '年龄', sortable: true },
                ],
            },
        })

        const sortButton = wrapper.findAll('.caomei-data-table__sort')[0]
        expect(sortButton.text()).toContain('年龄')
        expect(wrapper.findAll('.caomei-data-table__th')[1].attributes('aria-sort')).toBe('none')

        await sortButton.trigger('click')
        expect(wrapper.findAll('.caomei-data-table__th')[1].attributes('aria-sort')).toBe('ascending')
        expect(wrapper.findAll('.caomei-data-table__row')[0].findAll('.caomei-data-table__td')[1].text()).toBe('24')

        await sortButton.trigger('click')
        expect(wrapper.findAll('.caomei-data-table__th')[1].attributes('aria-sort')).toBe('descending')
        expect(wrapper.findAll('.caomei-data-table__row')[0].findAll('.caomei-data-table__td')[1].text()).toBe('36')
    })

    it('提供 sortField 时进入受控排序并抛出 sort 事件', async () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: [
                    { key: 'name', header: '姓名' },
                    { key: 'age', header: '年龄', sortable: true },
                ],
                sortField: 'age',
                sortOrder: 'asc',
            },
        })

        expect(wrapper.findAll('.caomei-data-table__row')[0].findAll('.caomei-data-table__td')[1].text()).toBe('24')

        await wrapper.findAll('.caomei-data-table__sort')[0].trigger('click')

        expect(wrapper.emitted('sort')?.[0]?.[0]).toEqual({ sortField: 'age', sortOrder: 'desc' })
    })

    it('受控 desc 态下点击抛出清空事件（父组件不回写）', async () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: [
                    { key: 'name', header: '姓名' },
                    { key: 'age', header: '年龄', sortable: true },
                ],
                sortField: 'age',
                sortOrder: 'desc',
            },
        })

        await wrapper.findAll('.caomei-data-table__sort')[0].trigger('click')

        expect(wrapper.emitted('sort')?.[0]?.[0]).toEqual({ sortField: '', sortOrder: '' })
    })

    it('columns 支持自定义 sortFn', async () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [{ name: '10', age: 0 }, { name: '9', age: 0 }],
                columns: [{ key: 'name', header: '值', sortable: true, sortFn: 'text' }],
            },
        })

        await wrapper.findAll('.caomei-data-table__sort')[0].trigger('click')
        expect(wrapper.emitted('sort')?.[0]?.[0]).toEqual({ sortField: 'name', sortOrder: 'asc' })
        expect(wrapper.findAll('.caomei-data-table__row')[0].text()).toBe('10')
    })

    it('headerClass / bodyClass 与自定义样式应用到列', () => {
        const wrapper = mount(DataTable, {
            props: {
                data: baseData,
                columns: [
                    {
                        key: 'name',
                        header: '姓名',
                        headerClass: 'head-name',
                        bodyClass: 'body-name',
                        headerStyle: { color: 'red' },
                        bodyStyle: { fontWeight: 'bold' },
                    },
                ],
            },
        })

        expect(wrapper.get('.caomei-data-table__th').classes()).toContain('head-name')
        expect(wrapper.get('.caomei-data-table__th').attributes('style')).toContain('color: red')
        expect(wrapper.get('.caomei-data-table__td').classes()).toContain('body-name')
        expect(wrapper.get('.caomei-data-table__td').attributes('style')).toContain('font-weight: bold')
    })

    it('loading 渲染加载行并标注 aria-busy', () => {
        const wrapper = mount(DataTable, {
            props: { data: baseData, columns: baseColumns, loading: true },
        })

        expect(wrapper.get('.caomei-data-table').attributes('aria-busy')).toBe('true')
        expect(wrapper.get('.caomei-data-table__loading').text()).toBe('加载中')
        expect(wrapper.find('.caomei-data-table__row').exists()).toBe(false)
    })

    it('loading 时可自定义文案', () => {
        const wrapper = mount(DataTable, {
            props: { data: baseData, columns: baseColumns, loading: true, loadingText: '加载记录中' },
        })

        expect(wrapper.get('.caomei-data-table__loading').text()).toBe('加载记录中')
    })

    it('selectionMode=multiple 渲染选择列并抛出 update:selection', async () => {
        const wrapper = mount(DataTable, {
            props: { data: [...baseData], columns: baseColumns, selectionMode: 'multiple' },
        })

        const boxes = wrapper.findAll('.caomei-data-table__select-cell .caomei-checkbox__control')
        expect(boxes).toHaveLength(3)

        await boxes[1].trigger('click')

        expect(wrapper.emitted('update:selection')?.[0]?.[0]).toEqual([baseData[0]])
    })

    it('selectionMode=multiple 表头可全选', async () => {
        const wrapper = mount(DataTable, {
            props: { data: [...baseData], columns: baseColumns, selectionMode: 'multiple' },
        })

        await wrapper.findAll('.caomei-data-table__select-cell .caomei-checkbox__control')[0].trigger('click')

        expect(wrapper.emitted('update:selection')?.[0]?.[0]).toEqual(baseData)
    })

    it('selectionMode=single 仅保留单行且无表头全选框', async () => {
        const wrapper = mount(DataTable, {
            props: { data: [...baseData], columns: baseColumns, selectionMode: 'single' },
        })

        const boxes = wrapper.findAll('.caomei-data-table__select-cell .caomei-checkbox__control')
        expect(boxes).toHaveLength(2)

        await boxes[1].trigger('click')

        expect(wrapper.emitted('update:selection')?.[0]?.[0]).toEqual(baseData[1])
    })

    it('受控 selection 标记选中行（响应式数组亦生效）', () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: baseColumns,
                selectionMode: 'multiple',
                selection: reactive([baseData[0]]),
            },
        })

        const rows = wrapper.findAll('.caomei-data-table__row')
        expect(rows[0].classes()).toContain('caomei-data-table__row--selected')
        expect(rows[1].classes()).not.toContain('caomei-data-table__row--selected')
    })

    it('空态 colspan 计入选择列', () => {
        const wrapper = mount(DataTable, {
            props: { data: [], columns: baseColumns, selectionMode: 'multiple' },
        })

        expect(wrapper.get('.caomei-data-table__empty').attributes('colspan')).toBe('3')
    })

    it('受控 selection 初始为空、后续回填时标记选中行', async () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: baseColumns,
                selectionMode: 'multiple',
                selection: [],
            },
        })

        expect(wrapper.findAll('.caomei-data-table__row--selected')).toHaveLength(0)

        await wrapper.setProps({ selection: [baseData[0]] })
        await nextTick()

        expect(wrapper.findAll('.caomei-data-table__row--selected')).toHaveLength(1)
    })

    it('selectionMode=single 取消选择抛出 null', async () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: baseColumns,
                selectionMode: 'single',
                selection: baseData[0],
            },
        })

        await wrapper.findAll('.caomei-data-table__select-cell .caomei-checkbox__control')[0].trigger('click')

        expect(wrapper.emitted('update:selection')?.[0]?.[0]).toBeNull()
    })

    it('selectionMode=single 选择第二行时抛出该行', async () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: baseColumns,
                selectionMode: 'single',
                selection: baseData[0],
            },
        })

        const boxes = wrapper.findAll('.caomei-data-table__select-cell .caomei-checkbox__control')
        await boxes[1].trigger('click')

        expect(wrapper.emitted('update:selection')?.[0]?.[0]).toEqual(baseData[1])
    })

    it('rowKey 为函数时选择与回填可用', () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: baseColumns,
                selectionMode: 'multiple',
                rowKey: (row: Row) => `k-${row.name}`,
                selection: reactive([baseData[1]]),
            },
        })

        expect(wrapper.findAll('.caomei-data-table__row--selected')).toHaveLength(1)

        const boxes = wrapper.findAll('.caomei-data-table__select-cell .caomei-checkbox__control')
        expect(boxes[1].attributes('aria-checked')).toBe('false')
        expect(boxes[2].attributes('aria-checked')).toBe('true')
    })

    it('multiple 部分选中时表头为 indeterminate', () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: baseColumns,
                selectionMode: 'multiple',
                selection: reactive([baseData[0]]),
            },
        })

        expect(
            wrapper.findAll('.caomei-data-table__select-cell .caomei-checkbox__control')[0].attributes('aria-checked'),
        ).toBe('mixed')
    })

    it('loading colspan 计入选择列', () => {
        const wrapper = mount(DataTable, {
            props: { data: baseData, columns: baseColumns, selectionMode: 'multiple', loading: true },
        })

        expect(wrapper.get('.caomei-data-table__loading').attributes('colspan')).toBe('3')
    })

    it('可覆盖选择框可访问名', () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: baseColumns,
                selectionMode: 'multiple',
                selectAllLabel: '全部选择',
                selectRowLabel: '选择',
            },
        })

        const boxes = wrapper.findAll('.caomei-data-table__select-cell .caomei-checkbox__control')
        expect(boxes[0].attributes('aria-label')).toBe('全部选择')
        expect(boxes[1].attributes('aria-label')).toMatch(/^选择 /)
    })
})
