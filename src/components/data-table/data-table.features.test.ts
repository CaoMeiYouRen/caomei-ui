import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mount } from '@vue/test-utils'
import { nextTick, reactive, type DefineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import { CaomeiPaginator } from '../paginator'
import type { DataTableColumn, DataTableProps } from './types'
import { CaomeiDataTable } from './index'

interface Row {
    name: string | null
    age: number
}

const DataTable = CaomeiDataTable as unknown as DefineComponent<DataTableProps<Row>>

const baseData: Row[] = [
    { name: 'Ada', age: 36 },
    { name: 'Bob', age: 24 },
]

const baseColumns: DataTableColumn<Row>[] = [
    { key: 'name', header: '姓名' },
    { key: 'age', header: '年龄' },
]

const manyData: Row[] = [
    { name: 'A', age: 1 },
    { name: 'B', age: 2 },
    { name: 'C', age: 3 },
    { name: 'D', age: 4 },
    { name: 'E', age: 5 },
]

describe('CaomeiDataTable 交互特性', () => {
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

    it('客户端分页按 rows 切片并抛出 update:page / page', async () => {
        const wrapper = mount(DataTable, {
            props: { data: [...manyData], columns: baseColumns, paginator: true, rows: 2 },
        })

        expect(wrapper.find('.caomei-paginator').exists()).toBe(true)
        expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(2)
        expect(wrapper.findAll('.caomei-data-table__row')[0].text()).toContain('A')

        wrapper.findComponent(CaomeiPaginator).vm.$emit('update:page', 2)
        await nextTick()

        expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(2)
        expect(wrapper.findAll('.caomei-data-table__row')[0].text()).toContain('C')
        expect(wrapper.emitted('update:page')?.[0]?.[0]).toBe(2)
        expect(wrapper.emitted('page')?.[0]?.[0]).toEqual({ page: 2, rows: 2, first: 2, pageCount: 3 })
    })

    it('受控 page 决定当前页', async () => {
        const wrapper = mount(DataTable, {
            props: { data: [...manyData], columns: baseColumns, paginator: true, rows: 2, page: 2 },
        })

        expect(wrapper.findAll('.caomei-data-table__row')[0].text()).toContain('C')

        wrapper.findComponent(CaomeiPaginator).vm.$emit('update:page', 3)
        await nextTick()

        expect(wrapper.emitted('update:page')?.[0]?.[0]).toBe(3)
        expect(wrapper.findAll('.caomei-data-table__row')[0].text()).toContain('C')
    })

    it('rowsPerPageOptions 透传给分页器', () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...manyData],
                columns: baseColumns,
                paginator: true,
                rows: 2,
                rowsPerPageOptions: [2, 5],
            },
        })

        expect(wrapper.findComponent(CaomeiPaginator).props('rowsPerPageOptions')).toEqual([2, 5])
        expect(wrapper.find('.caomei-paginator__rows-per-page').exists()).toBe(true)
    })

    it('未提供 rowsPerPageOptions 时不渲染每页条数选择器', () => {
        const wrapper = mount(DataTable, {
            props: { data: [...manyData], columns: baseColumns, paginator: true, rows: 2 },
        })

        expect(wrapper.find('.caomei-paginator__rows-per-page').exists()).toBe(false)
    })

    it('切换每页条数抛出 update:rows / page 并按偏移保持语义重新切片', async () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...manyData],
                columns: baseColumns,
                paginator: true,
                rows: 2,
                rowsPerPageOptions: [2, 5],
            },
        })

        wrapper.findComponent(CaomeiPaginator).vm.$emit('update:page', 3)
        await nextTick()
        expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(1)

        // 第 3 页 / 每页 2 → 首行偏移 4；切到每页 5 → floor(4 / 5) = 0 → 第 1 页
        wrapper.findComponent(CaomeiPaginator).vm.$emit('update:itemsPerPage', 5)
        await nextTick()

        expect(wrapper.emitted('update:rows')?.[0]?.[0]).toBe(5)
        expect(wrapper.emitted('update:page')?.at(-1)?.[0]).toBe(1)
        expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(5)
        expect(wrapper.findAll('.caomei-data-table__row')[0].text()).toContain('A')
    })

    it('totalRecords 变化不重置用户选择的每页条数', async () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...manyData],
                columns: baseColumns,
                paginator: true,
                rows: 2,
                rowsPerPageOptions: [2, 5],
            },
        })

        wrapper.findComponent(CaomeiPaginator).vm.$emit('update:itemsPerPage', 5)
        await nextTick()
        expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(5)

        // 总数变化只重新钳位页码，不得把页大小回退到 props.rows（否则退化为 2 行）
        await wrapper.setProps({ totalRecords: 13 })
        expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(5)
    })

    it('受控分页下切换每页条数的 page 载荷按新 rows 计算 pageCount', async () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...manyData],
                columns: baseColumns,
                paginator: true,
                rows: 2,
                page: 2,
                rowsPerPageOptions: [2, 5],
            },
        })

        wrapper.findComponent(CaomeiPaginator).vm.$emit('update:itemsPerPage', 5)
        await nextTick()

        expect(wrapper.emitted('page')?.at(-1)?.[0]).toEqual({
            page: 1,
            rows: 5,
            first: 0,
            pageCount: 1,
        })
    })

    it('受控 page 下切换每页条数只抛出事件，切片由父级决定', async () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...manyData],
                columns: baseColumns,
                paginator: true,
                rows: 2,
                page: 2,
                rowsPerPageOptions: [2, 5],
            },
        })

        wrapper.findComponent(CaomeiPaginator).vm.$emit('update:itemsPerPage', 5)
        await nextTick()

        expect(wrapper.emitted('update:rows')?.[0]?.[0]).toBe(5)
        expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(2)
        expect(wrapper.findAll('.caomei-data-table__row')[0].text()).toContain('C')
    })

    it('lazy 模式不切片并按 totalRecords 渲染分页器', () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...manyData],
                columns: baseColumns,
                paginator: true,
                rows: 2,
                lazy: true,
                totalRecords: 5,
            },
        })

        expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(5)
        expect(wrapper.find('.caomei-paginator').exists()).toBe(true)
    })

    it('未启用 paginator 时渲染全部行（默认不下发切片）', () => {
        const big = Array.from({ length: 25 }, (_, index) => ({ name: `R${index + 1}`, age: index }))
        const wrapper = mount(DataTable, {
            props: { data: big, columns: baseColumns },
        })

        expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(25)
    })

    it('rows 变更时夹取页码并抛出分页事件', async () => {
        const wrapper = mount(DataTable, {
            props: { data: [...manyData], columns: baseColumns, paginator: true, rows: 2 },
        })

        wrapper.findComponent(CaomeiPaginator).vm.$emit('update:page', 3)
        await nextTick()
        const emitted = wrapper.emitted('update:page')
        expect(emitted?.[emitted.length - 1]?.[0]).toBe(3)

        await wrapper.setProps({ rows: 10 })
        await nextTick()

        expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(5)
        const after = wrapper.emitted('update:page')
        expect(after?.[after.length - 1]?.[0]).toBe(1)
    })

    it('分页与排序组合：先排序后分页', async () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...manyData],
                columns: [
                    { key: 'name', header: '名称', sortable: true },
                    { key: 'age', header: '年龄', align: 'right' },
                ],
                paginator: true,
                rows: 2,
            },
        })

        await wrapper.findAll('.caomei-data-table__sort')[0].trigger('click')
        await wrapper.findAll('.caomei-data-table__sort')[0].trigger('click')
        await nextTick()

        expect(wrapper.findAll('.caomei-data-table__row')[0].text()).toContain('E')
    })

    it('运行期切换 paginator 会同步切片行为', async () => {
        const big = Array.from({ length: 15 }, (_, index) => ({ name: `R${index + 1}`, age: index }))
        const wrapper = mount(DataTable, {
            props: { data: big, columns: baseColumns },
        })

        expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(15)

        await wrapper.setProps({ paginator: true, rows: 5 })
        await nextTick()
        expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(5)

        await wrapper.setProps({ paginator: false })
        await nextTick()
        expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(15)
    })

    it('未启用分页时 rows 变更不抛分页事件', async () => {
        const wrapper = mount(DataTable, {
            props: { data: [...manyData], columns: baseColumns, rows: 2 },
        })

        await wrapper.setProps({ rows: 3 })
        await nextTick()

        expect(wrapper.emitted('update:page')).toBeUndefined()
        expect(wrapper.emitted('page')).toBeUndefined()
    })

    it('frozen 左侧列应用吸边 class 与累计偏移', () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: [
                    { key: 'name', header: '姓名', frozen: 'left', width: '120px' },
                    { key: 'age', header: '年龄', frozen: 'left', width: '80px' },
                ],
            },
        })

        const headers = wrapper.findAll('.caomei-data-table__th')
        expect(headers[0].classes()).toContain('caomei-data-table__cell--pinned-start')
        expect(headers[1].classes()).toContain('caomei-data-table__cell--pinned-start')
        expect(headers[0].attributes('style')).toContain('left: 0px')
        expect(headers[1].attributes('style')).toContain('left: 120px')

        const cells = wrapper.findAll('.caomei-data-table__row')[0].findAll('.caomei-data-table__td')
        expect(cells[0].classes()).toContain('caomei-data-table__cell--pinned-start')
        expect(cells[1].attributes('style')).toContain('left: 120px')
    })

    it('frozen 右侧列应用 end 吸边 class 与偏移', () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: [
                    { key: 'name', header: '姓名' },
                    { key: 'age', header: '年龄', frozen: 'right', width: '100px' },
                ],
            },
        })

        const headers = wrapper.findAll('.caomei-data-table__th')
        expect(headers[0].classes()).not.toContain('caomei-data-table__cell--pinned-end')
        expect(headers[1].classes()).toContain('caomei-data-table__cell--pinned-end')
        expect(headers[1].attributes('style')).toContain('right: 0px')
    })

    it('frozen 同侧多列按末端累计偏移', () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: [
                    { key: 'name', header: '姓名', frozen: 'right', width: '120px' },
                    { key: 'age', header: '年龄', frozen: 'right', width: '100px' },
                ],
            },
        })

        const headers = wrapper.findAll('.caomei-data-table__th')
        expect(headers[0].attributes('style')).toContain('right: 100px')
        expect(headers[1].attributes('style')).toContain('right: 0px')
    })

    it('非 px 宽度按默认值估算，不误解析为 px', () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: [
                    { key: 'name', header: '姓名', frozen: 'left', width: '20%' },
                    { key: 'age', header: '年龄', frozen: 'left', width: '80px' },
                ],
            },
        })

        expect(wrapper.findAll('.caomei-data-table__th')[1].attributes('style')).toContain('left: 150px')
    })

    it('仅存在冻结列时设置表格 min-width', () => {
        const plain = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: [
                    { key: 'name', header: '姓名', width: '120px' },
                    { key: 'age', header: '年龄', width: '80px' },
                ],
            },
        })
        expect(plain.get('table').attributes('style')).toBeUndefined()

        const frozen = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: [
                    { key: 'name', header: '姓名', frozen: 'left', width: '120px' },
                    { key: 'age', header: '年龄', width: '80px' },
                ],
            },
        })
        expect(frozen.get('table').attributes('style')).toContain('min-width: 200px')
    })

    it('行悬浮 / 选中背景以不透明底色混合（冻结列不透视）', () => {
        const source = readFileSync(join(process.cwd(), 'src/components/data-table/data-table.vue'), 'utf8')

        expect(source).toContain('color-mix(in srgb, var(--caomei-color-text) 4%, var(--caomei-color-bg))')
        expect(source).toContain('color-mix(in srgb, var(--caomei-color-primary) 8%, var(--caomei-color-bg))')
        expect(source).not.toContain('4%, transparent')
        expect(source).not.toContain('8%, transparent')
    })
})
