import { mount } from '@vue/test-utils'
import { nextTick, type DefineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import type { DataTableColumn, DataTableProps, DataTableSortMeta } from './types'
import { CaomeiDataTable } from './index'

interface SortRow {
    dept: string
    name: string
    age: number
}

const SortTable = CaomeiDataTable as unknown as DefineComponent<DataTableProps<SortRow>>

const sortData: SortRow[] = [
    { dept: 'B', name: 'Bob', age: 30 },
    { dept: 'B', name: 'Ada', age: 25 },
    { dept: 'A', name: 'Cara', age: 40 },
    { dept: 'A', name: 'Dan', age: 35 },
]

const sortColumns: DataTableColumn<SortRow>[] = [
    { key: 'dept', header: '部门', sortable: true },
    { key: 'name', header: '姓名', sortable: true },
    { key: 'age', header: '年龄', sortable: true },
]

describe('CaomeiDataTable 排序', () => {
    function mountSort(props: Partial<DataTableProps<SortRow>> = {}) {
        return mount(SortTable, {
            props: { data: sortData, columns: sortColumns, ...props },
        })
    }

    /** 各排序按钮（按列序） */
    function sortButtons(wrapper: ReturnType<typeof mountSort>) {
        return wrapper.findAll('.caomei-data-table__sort')
    }

    /** 当前渲染顺序下的姓名列文本 */
    function renderedNames(wrapper: ReturnType<typeof mountSort>): string[] {
        return wrapper
            .findAll('.caomei-data-table__row')
            .map((row) => row.findAll('.caomei-data-table__td')[1].text())
    }

    describe('单列排序（既有路径）', () => {
        it('缺省首次升序、再次降序，抛出不含 multiSortMeta 的 sort 载荷', async () => {
            const wrapper = mountSort()

            await sortButtons(wrapper)[2].trigger('click')
            expect(wrapper.emitted('sort')?.[0]?.[0]).toEqual({ sortField: 'age', sortOrder: 'asc' })
            expect(renderedNames(wrapper)).toEqual(['Ada', 'Bob', 'Dan', 'Cara'])

            await sortButtons(wrapper)[2].trigger('click')
            expect(wrapper.emitted('sort')?.[1]?.[0]).toEqual({ sortField: 'age', sortOrder: 'desc' })
            expect(renderedNames(wrapper)).toEqual(['Cara', 'Dan', 'Bob', 'Ada'])
        })

        it('sortDescFirst 为 true 时首次降序，再次升序，第三击移除排序', async () => {
            const wrapper = mountSort({ sortDescFirst: true })

            await sortButtons(wrapper)[2].trigger('click')
            expect(wrapper.emitted('sort')?.[0]?.[0]).toEqual({ sortField: 'age', sortOrder: 'desc' })
            expect(renderedNames(wrapper)).toEqual(['Cara', 'Dan', 'Bob', 'Ada'])

            await sortButtons(wrapper)[2].trigger('click')
            expect(wrapper.emitted('sort')?.[1]?.[0]).toEqual({ sortField: 'age', sortOrder: 'asc' })
            expect(renderedNames(wrapper)).toEqual(['Ada', 'Bob', 'Dan', 'Cara'])

            await sortButtons(wrapper)[2].trigger('click')
            expect(wrapper.emitted('sort')?.[2]?.[0]).toEqual({ sortField: '', sortOrder: '' })
            expect(renderedNames(wrapper)).toEqual(['Bob', 'Ada', 'Cara', 'Dan'])
        })

        it('受控 sortField / sortOrder 决定渲染顺序，运行期切换列生效', async () => {
            const wrapper = mountSort({ sortField: 'age', sortOrder: 'desc' })
            expect(renderedNames(wrapper)).toEqual(['Cara', 'Dan', 'Bob', 'Ada'])

            await wrapper.setProps({ sortField: 'name', sortOrder: 'asc' })
            expect(renderedNames(wrapper)).toEqual(['Ada', 'Bob', 'Cara', 'Dan'])
        })

        it('未提供 multiSortMeta 时单列排序不渲染优先级序号', async () => {
            const wrapper = mountSort()
            await sortButtons(wrapper)[2].trigger('click')

            expect(wrapper.findAll('.caomei-data-table__sort-index')).toHaveLength(0)
        })
    })

    describe('多列排序', () => {
        it('不带修饰键点击收敛为该列单列排序，并抛出 update:multiSortMeta', async () => {
            const wrapper = mountSort({ sortMode: 'multiple', multiSortMeta: [] })

            await sortButtons(wrapper)[0].trigger('click')

            expect(wrapper.emitted('update:multiSortMeta')?.[0]?.[0]).toEqual([
                { field: 'dept', order: 1 },
            ])
            expect(wrapper.emitted('sort')?.[0]?.[0]).toEqual({
                sortField: 'dept',
                sortOrder: 'asc',
                multiSortMeta: [{ field: 'dept', order: 1 }],
            })
        })

        it('按住修饰键点击追加为下一个排序键，保留已有键与优先级', async () => {
            const wrapper = mountSort({ sortMode: 'multiple' })

            await sortButtons(wrapper)[0].trigger('click')
            await sortButtons(wrapper)[1].trigger('click.meta')

            expect(wrapper.emitted('update:multiSortMeta')?.[1]?.[0]).toEqual([
                { field: 'dept', order: 1 },
                { field: 'name', order: 1 },
            ])
            expect(wrapper.findAll('.caomei-data-table__sort-index').map((node) => node.text())).toEqual(
                ['1', '2'],
            )
        })

        it('按住 Ctrl 同样可追加（等价于 Cmd）', async () => {
            const wrapper = mountSort({ sortMode: 'multiple' })

            await sortButtons(wrapper)[0].trigger('click')
            await sortButtons(wrapper)[1].trigger('click.ctrl')

            expect(wrapper.emitted('update:multiSortMeta')?.[1]?.[0]).toEqual([
                { field: 'dept', order: 1 },
                { field: 'name', order: 1 },
            ])
        })

        it('按住修饰键点击已参与排序的列切换其方向，不改变其它键', async () => {
            const wrapper = mountSort({ sortMode: 'multiple' })

            await sortButtons(wrapper)[0].trigger('click')
            await sortButtons(wrapper)[1].trigger('click.meta')
            await sortButtons(wrapper)[0].trigger('click.meta')

            expect(wrapper.emitted('update:multiSortMeta')?.[2]?.[0]).toEqual([
                { field: 'dept', order: -1 },
                { field: 'name', order: 1 },
            ])
        })

        it('不带修饰键点击已排序的第二列时收敛为该列（丢弃其它键）', async () => {
            const wrapper = mountSort({
                sortMode: 'multiple',
                multiSortMeta: [
                    { field: 'dept', order: 1 },
                    { field: 'name', order: 1 },
                ],
            })

            await sortButtons(wrapper)[1].trigger('click')

            expect(wrapper.emitted('update:multiSortMeta')?.[0]?.[0]).toEqual([
                { field: 'name', order: -1 },
            ])
        })

        it('单列模式不抛出 update:multiSortMeta', async () => {
            const wrapper = mountSort()

            await sortButtons(wrapper)[0].trigger('click')
            await sortButtons(wrapper)[0].trigger('click')

            expect(wrapper.emitted('update:multiSortMeta')).toBeUndefined()
        })

        it('多列模式下第三击移除该排序键', async () => {
            const wrapper = mountSort({ sortMode: 'multiple' })

            await sortButtons(wrapper)[0].trigger('click')
            await sortButtons(wrapper)[1].trigger('click.meta')
            await sortButtons(wrapper)[0].trigger('click.meta')
            await sortButtons(wrapper)[0].trigger('click.meta')

            // 部门：升 → 降 → 移除（姓名键保留）
            expect(wrapper.emitted('update:multiSortMeta')?.[3]?.[0]).toEqual([
                { field: 'name', order: 1 },
            ])
            expect(renderedNames(wrapper)).toEqual(['Ada', 'Bob', 'Cara', 'Dan'])
        })

        it('受控模式下父级回写后可继续追加（v-model 语义）', async () => {
            const wrapper = mountSort({ sortMode: 'multiple', multiSortMeta: [] })

            await sortButtons(wrapper)[0].trigger('click')
            const first = wrapper.emitted('update:multiSortMeta')?.[0]?.[0] as DataTableSortMeta[]
            expect(first).toEqual([{ field: 'dept', order: 1 }])

            await wrapper.setProps({ multiSortMeta: first })
            await sortButtons(wrapper)[1].trigger('click.meta')

            const second = wrapper.emitted('update:multiSortMeta')?.[1]?.[0] as DataTableSortMeta[]
            expect(second).toEqual([
                { field: 'dept', order: 1 },
                { field: 'name', order: 1 },
            ])

            // 受控模式：渲染顺序由父级回写后的 prop 决定
            await wrapper.setProps({ multiSortMeta: second })
            expect(renderedNames(wrapper)).toEqual(['Cara', 'Dan', 'Ada', 'Bob'])
        })

        it('sortDescFirst 为 true 时新追加的排序键首次为降序', async () => {
            const wrapper = mountSort({ sortMode: 'multiple', sortDescFirst: true })

            await sortButtons(wrapper)[0].trigger('click')
            await sortButtons(wrapper)[1].trigger('click.meta')

            expect(wrapper.emitted('update:multiSortMeta')?.[1]?.[0]).toEqual([
                { field: 'dept', order: -1 },
                { field: 'name', order: -1 },
            ])
        })

        it('受控 multiSortMeta 按多键优先级排序（相同键值按次键 tie-break）', () => {
            const wrapper = mountSort({
                sortMode: 'multiple',
                multiSortMeta: [
                    { field: 'dept', order: 1 },
                    { field: 'name', order: -1 },
                ],
            })

            // 部门升序：A 组（Dan / Cara 按姓名降序）、B 组（Bob / Ada 按姓名降序）
            expect(renderedNames(wrapper)).toEqual(['Dan', 'Cara', 'Bob', 'Ada'])
            expect(wrapper.findAll('.caomei-data-table__th').map((cell) => cell.attributes('aria-sort'))).toEqual(
                ['ascending', 'descending', 'none'],
            )
        })

        it('受控 multiSortMeta 的 order: 0 条目被忽略', () => {
            const wrapper = mountSort({
                sortMode: 'multiple',
                multiSortMeta: [
                    { field: 'dept', order: 0 },
                    { field: 'name', order: -1 },
                ],
            })

            expect(renderedNames(wrapper)).toEqual(['Dan', 'Cara', 'Bob', 'Ada'])
            expect(wrapper.findAll('.caomei-data-table__sort-index').map((node) => node.text())).toEqual(
                ['1'],
            )
        })

        it('受控模式下点击只抛出事件、渲染由父级决定，回写后生效', async () => {
            const wrapper = mountSort({ sortMode: 'multiple', multiSortMeta: [] })

            await sortButtons(wrapper)[2].trigger('click')

            expect(wrapper.emitted('update:multiSortMeta')?.[0]?.[0]).toEqual([
                { field: 'age', order: 1 },
            ])
            // 父级未回写时渲染顺序不变
            expect(renderedNames(wrapper)).toEqual(['Bob', 'Ada', 'Cara', 'Dan'])

            await wrapper.setProps({ multiSortMeta: [{ field: 'age', order: 1 }] })

            expect(renderedNames(wrapper)).toEqual(['Ada', 'Bob', 'Dan', 'Cara'])
        })

        it('未提供 multiSortMeta 时自持多列排序状态', async () => {
            const wrapper = mountSort({ sortMode: 'multiple' })

            await sortButtons(wrapper)[0].trigger('click')
            await sortButtons(wrapper)[1].trigger('click.meta')

            expect(renderedNames(wrapper)).toEqual(['Cara', 'Dan', 'Ada', 'Bob'])
            expect(wrapper.findAll('.caomei-data-table__sort-index').map((node) => node.text())).toEqual(
                ['1', '2'],
            )
            // 自持模式同样抛出事件供观察
            expect(wrapper.emitted('update:multiSortMeta')).toHaveLength(2)
        })

        it('运行期从受控切到自持沿用已同步的内部值', async () => {
            const meta: DataTableSortMeta[] = [{ field: 'name', order: -1 }]
            const wrapper = mountSort({ sortMode: 'multiple', multiSortMeta: meta })

            expect(renderedNames(wrapper)).toEqual(['Dan', 'Cara', 'Bob', 'Ada'])

            await wrapper.setProps({ multiSortMeta: undefined })
            await nextTick()

            expect(renderedNames(wrapper)).toEqual(['Dan', 'Cara', 'Bob', 'Ada'])
        })

        it('与行分组同用时，多列排序决定分组顺序', () => {
            const wrapper = mountSort({
                sortMode: 'multiple',
                multiSortMeta: [
                    { field: 'dept', order: -1 },
                    { field: 'age', order: 1 },
                ],
                rowGroupMode: 'subheader',
                groupRowsBy: 'dept',
            })

            expect(
                wrapper.findAll('.caomei-data-table__row-group-cell').map((cell) => cell.text()),
            ).toEqual(['B', 'A'])
            expect(renderedNames(wrapper)).toEqual(['Ada', 'Bob', 'Dan', 'Cara'])
        })
    })
})
