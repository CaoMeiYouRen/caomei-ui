import { enableAutoUnmount, mount } from '@vue/test-utils'
import { nextTick, type DefineComponent } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { DataTableColumn, DataTableProps } from './types'
import { CaomeiDataTable } from './index'

interface Row {
    id: number
    name: string
}

const DataTable = CaomeiDataTable as unknown as DefineComponent<DataTableProps<Row>>

const columns: DataTableColumn<Row>[] = [
    { key: 'name', header: '姓名' },
]

const rows: Row[] = Array.from({ length: 5 }, (_, index) => ({
    id: index + 1,
    name: `用户 ${index + 1}`,
}))

const rowKey = (row: Row) => String(row.id)

/** 取表头全选框的 aria-checked（`mixed` 表示半选）。 */
function headerState(wrapper: ReturnType<typeof mount>): string | null {
    return wrapper.find('.caomei-data-table__select-cell .caomei-checkbox__control').attributes('aria-checked') ?? null
}

/** 点击表头全选框。 */
async function clickHeader(wrapper: ReturnType<typeof mount>): Promise<void> {
    await wrapper.find('.caomei-data-table__select-cell .caomei-checkbox__control').trigger('click')
    await nextTick()
}

/** 最近一次 `update:selection` 的载荷。 */
function lastSelection(wrapper: ReturnType<typeof mount>): unknown {
    const events = wrapper.emitted('update:selection') ?? []
    return events.at(-1)?.[0]
}

enableAutoUnmount(afterEach)

afterEach(() => {
    vi.restoreAllMocks()
})

/** `all` 作用域在 `lazy` 或未覆盖 `selectAllLabel` 时会给出开发期提醒，用例里静默。 */
function silenceDevWarnings(): void {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
}

describe('CaomeiDataTable 全选作用域', () => {
    it('默认 page：只选中当前页，不跨页改写', async () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...rows],
                columns,
                rowKey,
                selectionMode: 'multiple',
                paginator: true,
                rows: 2,
            },
        })
        await clickHeader(wrapper)
        expect(lastSelection(wrapper)).toEqual(rows.slice(0, 2))
        expect(wrapper.findAll('tbody .caomei-checkbox__control[aria-checked="true"]')).toHaveLength(2)
    })

    it('scope=all：按当前 data 全量选中 / 取消', async () => {
        silenceDevWarnings()
        const wrapper = mount(DataTable, {
            props: {
                data: [...rows],
                columns,
                rowKey,
                selectionMode: 'multiple',
                paginator: true,
                rows: 2,
                selectAllScope: 'all',
            },
        })
        expect(headerState(wrapper), '初始应为未选').toBe('false')
        await clickHeader(wrapper)
        expect(lastSelection(wrapper)).toEqual(rows)
        await clickHeader(wrapper)
        expect(lastSelection(wrapper)).toEqual([])
    })

    it('scope=all + 受控 selection：复选框反映受控值，点击只抛出事件', async () => {
        silenceDevWarnings()
        const wrapper = mount(DataTable, {
            props: {
                data: [...rows],
                columns,
                rowKey,
                selectionMode: 'multiple',
                paginator: true,
                rows: 2,
                selectAllScope: 'all',
                selection: [rows[4]],
            },
        })
        expect(headerState(wrapper), '只选中 1 / 5 时应为半选').toBe('mixed')

        await clickHeader(wrapper)
        expect(lastSelection(wrapper)).toEqual(rows)
        // 受控值未回写：组件不得自行生效
        expect(headerState(wrapper), '父级未回写时应保持半选').toBe('mixed')
    })

    it('scope=all + 受控 selection：全部选中后复选框为选中态', () => {
        silenceDevWarnings()
        const wrapper = mount(DataTable, {
            props: {
                data: [...rows],
                columns,
                rowKey,
                selectionMode: 'multiple',
                selectAllScope: 'all',
                selection: [...rows],
            },
        })
        expect(headerState(wrapper)).toBe('true')
    })

    it('lazy + scope=all：只切当前页，受控时保留其它页已选行', async () => {
        silenceDevWarnings()
        const previousPageRow: Row = { id: 99, name: '上一页' }
        const wrapper = mount(DataTable, {
            props: {
                data: rows.slice(0, 2),
                columns,
                rowKey,
                selectionMode: 'multiple',
                lazy: true,
                totalRecords: 5,
                selectAllScope: 'all',
                selection: [previousPageRow],
            },
        })
        await clickHeader(wrapper)
        expect(lastSelection(wrapper), '全选应并入当前页，且不清空上一页').toEqual([previousPageRow, ...rows.slice(0, 2)])

        // 父级回写后取消全选：上一页仍保留
        await wrapper.setProps({ selection: [previousPageRow, ...rows.slice(0, 2)] })
        await clickHeader(wrapper)
        expect(lastSelection(wrapper), '取消全选只清当前页，未加载项不得被清空').toEqual([previousPageRow])
    })

    it('lazy + scope=all 非受控：只切当前页', async () => {
        silenceDevWarnings()
        const wrapper = mount(DataTable, {
            props: {
                data: rows.slice(0, 2),
                columns,
                rowKey,
                selectionMode: 'multiple',
                lazy: true,
                totalRecords: 5,
                selectAllScope: 'all',
            },
        })
        await clickHeader(wrapper)
        expect(lastSelection(wrapper)).toEqual(rows.slice(0, 2))
    })

    it('lazy + 默认 page + 受控：保持既有行为（只抛当前页）', async () => {
        const previousPageRow: Row = { id: 99, name: '上一页' }
        const wrapper = mount(DataTable, {
            props: {
                data: rows.slice(0, 2),
                columns,
                rowKey,
                selectionMode: 'multiple',
                lazy: true,
                totalRecords: 5,
                selection: [previousPageRow],
            },
        })
        await clickHeader(wrapper)
        expect(lastSelection(wrapper), '默认作用域不得改动既有载荷（只含当前页）').toEqual(rows.slice(0, 2))

        await wrapper.setProps({ selection: rows.slice(0, 2) })
        await clickHeader(wrapper)
        expect(lastSelection(wrapper), '取消全选按既有行为清空').toEqual([])
    })

    it('scope=all + 受控：取消全选也走事件，不自行生效', async () => {
        silenceDevWarnings()
        const wrapper = mount(DataTable, {
            props: {
                data: [...rows],
                columns,
                rowKey,
                selectionMode: 'multiple',
                selectAllScope: 'all',
                selection: [...rows],
            },
        })
        await clickHeader(wrapper)
        expect(lastSelection(wrapper)).toEqual([])
        expect(headerState(wrapper), '父级未回写时应保持选中').toBe('true')
    })

    it('lazy + scope=all：同 key 的过期对象不会重复进入载荷', async () => {
        silenceDevWarnings()
        const staleRow: Row = { id: 1, name: '过期用户 1' }
        const wrapper = mount(DataTable, {
            props: {
                data: rows.slice(0, 2),
                columns,
                rowKey,
                selectionMode: 'multiple',
                lazy: true,
                totalRecords: 5,
                selectAllScope: 'all',
                selection: [staleRow],
            },
        })
        await clickHeader(wrapper)
        const payload = lastSelection(wrapper) as Row[]
        expect(payload.filter((row) => row.id === 1)).toHaveLength(1)
        expect(payload.find((row) => row.id === 1)?.name, '同 key 保留当前页对象').toBe('用户 1')
    })

    it('lazy 下 scope=all 的复选框只看当前页（不推断未加载页）', () => {
        silenceDevWarnings()
        const wrapper = mount(DataTable, {
            props: {
                data: rows.slice(0, 2),
                columns,
                rowKey,
                selectionMode: 'multiple',
                lazy: true,
                totalRecords: 5,
                selectAllScope: 'all',
                selection: rows.slice(0, 2),
            },
        })
        expect(headerState(wrapper), '当前页全选即视为选中，不因未加载页而半选').toBe('true')
    })
})
