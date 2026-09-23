import { mount } from '@vue/test-utils'
import { h, nextTick, reactive, type DefineComponent } from 'vue'
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

    describe('可折叠分组', () => {
        const expandableProps: Partial<DataTableProps<GroupedRow>> = {
            rowGroupMode: 'subheader',
            groupRowsBy: 'dept',
            expandableRowGroups: true,
        }

        function groupToggles(wrapper: ReturnType<typeof mountGrouped>) {
            return wrapper.findAll('.caomei-data-table__row-group-toggle')
        }

        it('缺省（未提供 expandedRowGroups）时分组全部收起，仅渲染分组标题行', () => {
            const wrapper = mountGrouped(expandableProps)

            expect(groupToggles(wrapper)).toHaveLength(2)
            expect(groupToggles(wrapper).map((button) => button.attributes('aria-expanded'))).toEqual([
                'false',
                'false',
            ])
            expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(0)
            expect(
                wrapper.findAll('.caomei-data-table__row-group-cell').map((cell) => cell.text()),
            ).toEqual(['A', 'B'])
        })

        it('自持模式下点击切换按钮展开 / 收起该组并抛出双向事件', async () => {
            const wrapper = mountGrouped(expandableProps)

            await groupToggles(wrapper)[0].trigger('click')

            expect(groupToggles(wrapper)[0].attributes('aria-expanded')).toBe('true')
            expect(groupToggles(wrapper)[1].attributes('aria-expanded')).toBe('false')
            expect(
                wrapper.findAll('.caomei-data-table__row').map((row) => row.text()),
            ).toEqual(['Ada', 'Bob'])
            expect(wrapper.emitted('update:expandedRowGroups')?.[0]?.[0]).toEqual(['A'])
            expect(wrapper.emitted('rowgroupExpand')?.[0]?.[0]).toMatchObject({ data: 'A' })

            await groupToggles(wrapper)[0].trigger('click')

            expect(groupToggles(wrapper)[0].attributes('aria-expanded')).toBe('false')
            expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(0)
            expect(wrapper.emitted('update:expandedRowGroups')?.[1]?.[0]).toEqual([])
            expect(wrapper.emitted('rowgroupCollapse')?.[0]?.[0]).toMatchObject({ data: 'A' })
        })

        it('自持模式下多个分组独立折叠，互不影响', async () => {
            const wrapper = mountGrouped(expandableProps)

            await groupToggles(wrapper)[1].trigger('click')

            expect(groupToggles(wrapper).map((button) => button.attributes('aria-expanded'))).toEqual([
                'false',
                'true',
            ])
            expect(wrapper.findAll('.caomei-data-table__row').map((row) => row.text())).toEqual([
                'Cara',
                'Dan',
                'Eve',
            ])
        })

        it('受控模式下点击只抛出事件、渲染由父级决定，回写后生效', async () => {
            const wrapper = mountGrouped({ ...expandableProps, expandedRowGroups: [] })

            await groupToggles(wrapper)[0].trigger('click')

            expect(wrapper.emitted('update:expandedRowGroups')?.[0]?.[0]).toEqual(['A'])
            // 受控：父级未回写时 DOM 不变（仍全部收起）
            expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(0)

            await wrapper.setProps({ expandedRowGroups: ['A'] })

            expect(groupToggles(wrapper)[0].attributes('aria-expanded')).toBe('true')
            expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(2)
        })

        it('受控初始值决定展开态；运行期移除受控 prop 后退回自持并沿用已同步的内部值', async () => {
            const wrapper = mountGrouped({ ...expandableProps, expandedRowGroups: ['B'] })

            expect(groupToggles(wrapper).map((button) => button.attributes('aria-expanded'))).toEqual([
                'false',
                'true',
            ])
            expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(3)

            await wrapper.setProps({ expandedRowGroups: undefined })

            // 受控期间内部值已同步为 ['B']，退回自持后沿用该值
            expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(3)

            await groupToggles(wrapper)[1].trigger('click')

            expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(0)
        })

        it('切换按钮为原生 button、带 aria-expanded 与可访问名，可覆盖可访问名', () => {
            const wrapper = mountGrouped(expandableProps)
            const button = groupToggles(wrapper)[0]

            expect(button.element.tagName).toBe('BUTTON')
            expect(button.attributes('type')).toBe('button')
            expect(button.attributes('aria-label')).toBe('展开分组')

            const custom = mount(GroupedDataTable, {
                props: {
                    data: groupedData,
                    columns: groupedColumns,
                    ...expandableProps,
                    expandedRowGroups: ['A'],
                    expandRowGroupLabel: '展开该组',
                    collapseRowGroupLabel: '收起该组',
                },
            })

            expect(groupToggles(custom)[0].attributes('aria-label')).toBe('收起该组')
            expect(groupToggles(custom)[1].attributes('aria-label')).toBe('展开该组')
        })

        it('未开启 expandableRowGroups 时不渲染切换按钮且数据行全部渲染', () => {
            const wrapper = mountGrouped({ rowGroupMode: 'subheader', groupRowsBy: 'dept' })

            expect(groupToggles(wrapper)).toHaveLength(0)
            expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(5)
        })

        it('未开启行分组时 expandableRowGroups 不生效', () => {
            const wrapper = mountGrouped({ expandableRowGroups: true })

            expect(groupToggles(wrapper)).toHaveLength(0)
            expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(5)
        })

        it('非连续的同值分组共用同一分组键，切换时同步翻转', async () => {
            const wrapper = mount(GroupedDataTable, {
                props: {
                    data: [
                        { name: 'Ada', dept: 'A' },
                        { name: 'Bob', dept: 'B' },
                        { name: 'Cara', dept: 'A' },
                    ],
                    columns: groupedColumns,
                    ...expandableProps,
                },
            })

            // 两段 A 各自出现分组标题行，但共用键 'A'
            expect(
                wrapper.findAll('.caomei-data-table__row-group-cell').map((cell) => cell.text()),
            ).toEqual(['A', 'B', 'A'])

            await groupToggles(wrapper)[0].trigger('click')

            expect(groupToggles(wrapper).map((button) => button.attributes('aria-expanded'))).toEqual([
                'true',
                'false',
                'true',
            ])
            expect(wrapper.findAll('.caomei-data-table__row').map((row) => row.text())).toEqual([
                'Ada',
                'Cara',
            ])
        })

        it('分组值为 null 时以空串作为分组键参与展开集合', async () => {
            const wrapper = mount(GroupedDataTable, {
                props: {
                    data: [
                        { name: 'Ada', dept: null },
                        { name: 'Bob', dept: null },
                        { name: 'Cara', dept: 'B' },
                    ],
                    columns: groupedColumns,
                    ...expandableProps,
                },
            })

            await groupToggles(wrapper)[0].trigger('click')

            expect(wrapper.emitted('update:expandedRowGroups')?.[0]?.[0]).toEqual([''])
            expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(2)
        })
        it('受控数组原地变更后移除受控 prop，退回自持时沿用最新值', async () => {
            const expandedRowGroups = reactive<string[]>([])
            const wrapper = mount(GroupedDataTable, {
                props: { data: groupedData, columns: groupedColumns, ...expandableProps, expandedRowGroups },
            })

            expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(0)

            // 原地 push（不替换数组引用）：deep 监听须把新值同步进内部值
            expandedRowGroups.push('A')
            await nextTick()
            expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(2)

            await wrapper.setProps({ expandedRowGroups: undefined })

            // 退回自持后沿用已同步的 ['A']，而非停留在初始的空数组
            expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(2)
        })

        it('空数据时渲染空态且不渲染切换按钮', () => {
            const wrapper = mount(GroupedDataTable, {
                props: { data: [], columns: groupedColumns, ...expandableProps },
            })

            expect(groupToggles(wrapper)).toHaveLength(0)
            expect(wrapper.find('.caomei-data-table__empty').exists()).toBe(true)
        })
    })
})
