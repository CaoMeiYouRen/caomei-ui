import { mount } from '@vue/test-utils'
import { h, nextTick, type DefineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import type { DataTableColumn, DataTableProps, DataTableRowGroupSlotProps } from './types'
import { CaomeiDataTable } from './index'

interface GroupedRow {
    name: string
    dept: string | null
}

interface NestedRow {
    user: { dept: string }
    name: string
}

const GroupedDataTable = CaomeiDataTable as unknown as DefineComponent<DataTableProps<GroupedRow>>
const NestedDataTable = CaomeiDataTable as unknown as DefineComponent<DataTableProps<NestedRow>>


describe('CaomeiDataTable 行分组（subheader）', () => {
    const groupedData: GroupedRow[] = [
        { name: 'Ada', dept: 'A' },
        { name: 'Bob', dept: 'A' },
        { name: 'Cara', dept: 'B' },
        { name: 'Dan', dept: 'B' },
        { name: 'Eve', dept: 'B' },
    ]

    const groupedColumns: DataTableColumn<GroupedRow>[] = [
        { key: 'dept', header: '部门' },
        { key: 'name', header: '姓名' },
    ]

    function mountGrouped(props: Partial<DataTableProps<GroupedRow>> = {}) {
        return mount(GroupedDataTable, {
            props: { data: groupedData, columns: groupedColumns, ...props },
        })
    }

    it('按连续同值切分渲染分组标题行，分组列在数据行渲染为空白占位', () => {
        const wrapper = mountGrouped({ rowGroupMode: 'subheader', groupRowsBy: 'dept' })

        expect(
            wrapper.findAll('.caomei-data-table__row-group-cell').map((cell) => cell.text()),
        ).toEqual(['A', 'B'])
        expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(5)
        // 表头保留分组列；数据行保留同列的空白占位单元格，使其余列与表头对齐
        expect(wrapper.findAll('.caomei-data-table__th').map((cell) => cell.text())).toEqual([
            '部门',
            '姓名',
        ])
        const firstRowCells = wrapper
            .findAll('.caomei-data-table__row')[0]
            .findAll('.caomei-data-table__td')
        expect(firstRowCells).toHaveLength(2)
        expect(firstRowCells.map((cell) => cell.text())).toEqual(['', 'Ada'])
        expect(wrapper.get('.caomei-data-table__row-group-cell').attributes('colspan')).toBe('2')
        expect(wrapper.find('.caomei-data-table__row-group').attributes('role')).toBe('row')
    })

    it('未开启分组（缺 rowGroupMode 或 groupRowsBy）时保持既有行与单元格结构', () => {
        const plain = mountGrouped()
        expect(plain.find('.caomei-data-table__row-group').exists()).toBe(false)
        expect(plain.findAll('.caomei-data-table__row-group-cell')).toHaveLength(0)
        expect(
            plain
                .findAll('.caomei-data-table__row')
                .map((row) => row.findAll('.caomei-data-table__td').map((cell) => cell.text())),
        ).toEqual([
            ['A', 'Ada'],
            ['A', 'Bob'],
            ['B', 'Cara'],
            ['B', 'Dan'],
            ['B', 'Eve'],
        ])

        const modeOnly = mountGrouped({ rowGroupMode: 'subheader' })
        expect(modeOnly.find('.caomei-data-table__row-group').exists()).toBe(false)
        expect(
            modeOnly.findAll('.caomei-data-table__row')[0].findAll('.caomei-data-table__td'),
        ).toHaveLength(2)
    })

    it('groupRowsBy 为空串时不分组，指向不存在的字段时归为单一分组', () => {
        const blank = mountGrouped({ rowGroupMode: 'subheader', groupRowsBy: '' })
        expect(blank.find('.caomei-data-table__row-group').exists()).toBe(false)
        expect(
            blank.findAll('.caomei-data-table__row')[0].findAll('.caomei-data-table__td'),
        ).toHaveLength(2)

        const missing = mountGrouped({ rowGroupMode: 'subheader', groupRowsBy: 'missing' })
        expect(
            missing.findAll('.caomei-data-table__row-group-cell').map((cell) => cell.text()),
        ).toEqual([''])
        expect(missing.findAll('.caomei-data-table__row')).toHaveLength(5)
    })

    it('运行期切换分组键即时重算，移除 groupRowsBy 回到未分组态', async () => {
        const wrapper = mountGrouped({ rowGroupMode: 'subheader', groupRowsBy: 'dept' })
        expect(
            wrapper.findAll('.caomei-data-table__row-group-cell').map((cell) => cell.text()),
        ).toEqual(['A', 'B'])

        await wrapper.setProps({ groupRowsBy: 'name' })
        expect(
            wrapper.findAll('.caomei-data-table__row-group-cell').map((cell) => cell.text()),
        ).toEqual(['Ada', 'Bob', 'Cara', 'Dan', 'Eve'])

        await wrapper.setProps({ groupRowsBy: undefined })
        expect(wrapper.find('.caomei-data-table__row-group').exists()).toBe(false)
        expect(
            wrapper.findAll('.caomei-data-table__row')[0].findAll('.caomei-data-table__td'),
        ).toHaveLength(2)
    })

    it('分组字段用点号嵌套路径取值', () => {
        const nested: NestedRow[] = [
            { user: { dept: 'A' }, name: 'Ada' },
            { user: { dept: 'A' }, name: 'Bob' },
            { user: { dept: 'B' }, name: 'Cara' },
        ]
        const wrapper = mount(NestedDataTable, {
            props: {
                data: nested,
                columns: [
                    { key: 'name', header: '姓名' },
                    { key: 'user.dept', header: '部门' },
                ],
                rowGroupMode: 'subheader',
                groupRowsBy: 'user.dept',
            },
        })

        expect(
            wrapper.findAll('.caomei-data-table__row-group-cell').map((cell) => cell.text()),
        ).toEqual(['A', 'B'])
    })

    it('#groupheader 槽接收 data / index / groupValue', () => {
        const scopes: DataTableRowGroupSlotProps<GroupedRow>[] = []
        const wrapper = mount(GroupedDataTable, {
            props: {
                data: groupedData,
                columns: groupedColumns,
                rowGroupMode: 'subheader',
                groupRowsBy: 'dept',
            },
            slots: {
                groupheader: (props: DataTableRowGroupSlotProps<GroupedRow>) => {
                    scopes.push(props)
                    return [h('strong', { class: 'group-slot' }, String(props.groupValue))]
                },
            },
        })

        expect(wrapper.findAll('.group-slot').map((node) => node.text())).toEqual(['A', 'B'])
        expect(scopes.map((scope) => scope.index)).toEqual([0, 2])
        expect(scopes[0].data).toEqual(groupedData[0])
        expect(scopes[1].data).toEqual(groupedData[2])
    })

    it('分组值缺省文本按字符串化输出，null / undefined 渲染为空', () => {
        const wrapper = mount(GroupedDataTable, {
            props: {
                data: [
                    { name: 'Ada', dept: null },
                    { name: 'Bob', dept: null },
                    { name: 'Cara', dept: 'B' },
                ],
                columns: groupedColumns,
                rowGroupMode: 'subheader',
                groupRowsBy: 'dept',
            },
        })

        expect(
            wrapper.findAll('.caomei-data-table__row-group-cell').map((cell) => cell.text()),
        ).toEqual(['', 'B'])
    })

    it('分页下分组以当前页切片为准，同时保留选择列与 colspan', () => {
        const wrapper = mount(GroupedDataTable, {
            props: {
                data: groupedData,
                columns: groupedColumns,
                rowGroupMode: 'subheader',
                groupRowsBy: 'dept',
                paginator: true,
                rows: 2,
                page: 2,
                selectionMode: 'multiple',
            },
        })

        // 第 2 页为 Cara / Dan（dept=B）；分组标题单元格跨「选择列 + 数据列」
        expect(
            wrapper.findAll('.caomei-data-table__row-group-cell').map((cell) => cell.text()),
        ).toEqual(['B'])
        expect(wrapper.get('.caomei-data-table__row-group-cell').attributes('colspan')).toBe('3')
        expect(
            wrapper.findAll('.caomei-data-table__row')[0].findAll('.caomei-data-table__td'),
        ).toHaveLength(3)
    })

    it('排序后分组按排序序切分（同值跃迁处新增标题行）', async () => {
        const wrapper = mount(GroupedDataTable, {
            props: {
                data: groupedData,
                columns: [
                    { key: 'dept', header: '部门' },
                    { key: 'name', header: '姓名', sortable: true },
                ],
                rowGroupMode: 'subheader',
                groupRowsBy: 'dept',
                sortField: 'name',
                sortOrder: 'desc',
            },
        })
        await nextTick()

        // 按姓名降序：Eve(B) / Dan(B) / Cara(B) / Bob(A) / Ada(A)
        expect(
            wrapper.findAll('.caomei-data-table__row-group-cell').map((cell) => cell.text()),
        ).toEqual(['B', 'A'])
    })

    it('空数据时渲染空态且 colspan 计入选择列', () => {
        const wrapper = mount(GroupedDataTable, {
            props: {
                data: [],
                columns: groupedColumns,
                rowGroupMode: 'subheader',
                groupRowsBy: 'dept',
                selectionMode: 'multiple',
            },
        })

        expect(wrapper.find('.caomei-data-table__row-group').exists()).toBe(false)
        expect(wrapper.get('.caomei-data-table__empty').attributes('colspan')).toBe('3')
    })
})
