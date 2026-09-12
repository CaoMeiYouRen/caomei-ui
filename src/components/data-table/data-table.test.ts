import { mount } from '@vue/test-utils'
import { h, nextTick, type DefineComponent } from 'vue'
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
})
