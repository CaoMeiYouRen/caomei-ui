import { enableAutoUnmount, mount } from '@vue/test-utils'
import type { DefineComponent } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { DataTableColumn, DataTableProps } from './types'
import { CaomeiDataTable } from './index'

interface Row {
    name: string
}

const DataTable = CaomeiDataTable as unknown as DefineComponent<DataTableProps<Row>>

const data: Row[] = [
    { name: 'Ada' },
    { name: 'Bob' },
]

const columns: DataTableColumn<Row>[] = [
    { key: 'name', header: '姓名' },
]

/** 取根容器的类名与内联 max-height（未设置时为 undefined）。 */
function rootState(props: Record<string, unknown>): { scrollable: boolean, maxHeight: string | undefined } {
    const wrapper = mount(DataTable, { props: { data: [...data], columns, ...props } })
    const root = wrapper.get('.caomei-data-table')
    const element = root.element as HTMLElement
    return {
        scrollable: root.classes().includes('caomei-data-table--scrollable'),
        maxHeight: element.style.maxHeight || undefined,
    }
}

afterEach(() => {
    vi.restoreAllMocks()
})

// 每个用例结束卸载实例，避免同一文件累积挂载实例与 document / useId 产生隐式耦合
enableAutoUnmount(afterEach)

describe('CaomeiDataTable 固定表头与滚动', () => {
    it('未开启 scrollable 时零行为变更（无修饰类、无限高）', () => {
        expect(rootState({})).toEqual({ scrollable: false, maxHeight: undefined })
    })

    it('scrollable 但未给 scrollHeight：加修饰类、不限高', () => {
        expect(rootState({ scrollable: true })).toEqual({ scrollable: true, maxHeight: undefined })
    })

    it('数字 scrollHeight 归一化为 px', () => {
        expect(rootState({ scrollable: true, scrollHeight: 360 }).maxHeight).toBe('360px')
    })

    it('字符串 scrollHeight 原样作为 CSS 长度并去除首尾空白', () => {
        expect(rootState({ scrollable: true, scrollHeight: ' 60vh ' }).maxHeight).toBe('60vh')
        expect(rootState({ scrollable: true, scrollHeight: '24rem' }).maxHeight).toBe('24rem')
    })

    it('数字与字符串的空值 / 非正值均不生成限高（避免 max-height: 0 把表体压没）', () => {
        expect(rootState({ scrollable: true, scrollHeight: '' }).maxHeight).toBeUndefined()
        expect(rootState({ scrollable: true, scrollHeight: '   ' }).maxHeight).toBeUndefined()
        expect(rootState({ scrollable: true, scrollHeight: 0 }).maxHeight).toBeUndefined()
        expect(rootState({ scrollable: true, scrollHeight: -1 }).maxHeight).toBeUndefined()
        expect(rootState({ scrollable: true, scrollHeight: Number.NaN }).maxHeight).toBeUndefined()
        expect(rootState({ scrollable: true, scrollHeight: Number.POSITIVE_INFINITY }).maxHeight).toBeUndefined()
        expect(rootState({ scrollable: true, scrollHeight: '0' }).maxHeight).toBeUndefined()
        expect(rootState({ scrollable: true, scrollHeight: '0px' }).maxHeight).toBeUndefined()
        expect(rootState({ scrollable: true, scrollHeight: '-1rem' }).maxHeight).toBeUndefined()
        expect(rootState({ scrollable: true, scrollHeight: '0.0px' }).maxHeight).toBeUndefined()
        expect(rootState({ scrollable: true, scrollHeight: '.0em' }).maxHeight).toBeUndefined()
        expect(rootState({ scrollable: true, scrollHeight: '0%' }).maxHeight).toBeUndefined()
    })

    it('纯数字字符串按 px 归一化（`max-height: 240` 是无效声明）', () => {
        expect(rootState({ scrollable: true, scrollHeight: '240' }).maxHeight).toBe('240px')
    })

    it('无法解析为 CSS 长度的字符串不生成限高并开发期告警', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
        expect(rootState({ scrollable: true, scrollHeight: 'abc' }).maxHeight).toBeUndefined()
        expect(warn).toHaveBeenCalledTimes(1)
        expect(String(warn.mock.calls[0]?.[0])).toContain('scrollHeight')
    })

    it('`calc()` / `var()` 表达式作为合法 CSS 长度原样生效', () => {
        expect(rootState({ scrollable: true, scrollHeight: 'calc(100vh - 12rem)' }).maxHeight)
            .toBe('calc(100vh - 12rem)')
        expect(rootState({ scrollable: true, scrollHeight: 'var(--table-height)' }).maxHeight)
            .toBe('var(--table-height)')
    })

    it('视口动态单位与容器查询单位可用', () => {
        expect(rootState({ scrollable: true, scrollHeight: '80dvh' }).maxHeight).toBe('80dvh')
        expect(rootState({ scrollable: true, scrollHeight: '50cqh' }).maxHeight).toBe('50cqh')
    })

    it('未知单位不生效并告警（负值不误报为无效长度）', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
        expect(rootState({ scrollable: true, scrollHeight: '10furlong' }).maxHeight).toBeUndefined()
        expect(warn).toHaveBeenCalledTimes(1)
        expect(String(warn.mock.calls[0]?.[0])).toContain('单位')
        warn.mockClear()
        expect(rootState({ scrollable: true, scrollHeight: '-1rem' }).maxHeight).toBeUndefined()
        expect(warn).not.toHaveBeenCalled()
    })

    it('非 scrollable 时忽略 scrollHeight（无修饰类、无限高）', () => {
        expect(rootState({ scrollHeight: 360 })).toEqual({ scrollable: false, maxHeight: undefined })
    })

    it('scrollable 不影响行渲染与分页器', () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...data],
                columns,
                scrollable: true,
                scrollHeight: 240,
                paginator: true,
                rows: 1,
            },
        })
        expect(wrapper.findAll('.caomei-data-table__row')).toHaveLength(1)
        expect(wrapper.find('.caomei-data-table__pagination').exists()).toBe(true)
    })
})
