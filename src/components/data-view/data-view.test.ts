import { mount } from '@vue/test-utils'
import { computed, h, nextTick, ref, type DefineComponent } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
import type { DataViewProps } from './types'
import { CaomeiDataView } from './index'

interface Item {
    id: number
    name: string
}

/** VTU 无法从 props 推断泛型组件参数，测试内具体化行类型 */
const DataView = CaomeiDataView as unknown as DefineComponent<DataViewProps<Item>>

const baseItems: Item[] = [
    { id: 1, name: '甲' },
    { id: 2, name: '乙' },
]

function listSlot(props: { items: Item[] }) {
    return h('div', { 'data-test': 'list' }, props.items.map((item) => item.name).join(','))
}

function gridSlot(props: { items: Item[] }) {
    return h('div', { 'data-test': 'grid' }, props.items.map((item) => item.name).join(','))
}

afterEach(() => {
    document.body.innerHTML = ''
})

describe('CaomeiDataView', () => {
    it('默认使用 list 布局并渲染 list 插槽', () => {
        const wrapper = mount(DataView, {
            props: { value: baseItems },
            slots: { list: listSlot },
        })

        expect(wrapper.get('.caomei-data-view').classes()).toContain('caomei-data-view--list')
        expect(wrapper.get('[data-test="list"]').text()).toBe('甲,乙')
    })

    it('layout="grid" 时渲染 grid 插槽且不渲染 list 插槽', () => {
        const wrapper = mount(DataView, {
            props: { value: baseItems, layout: 'grid' },
            slots: { grid: gridSlot, list: listSlot },
        })

        expect(wrapper.get('.caomei-data-view').classes()).toContain('caomei-data-view--grid')
        expect(wrapper.get('[data-test="grid"]').text()).toBe('甲,乙')
        expect(wrapper.find('[data-test="list"]').exists()).toBe(false)
    })

    it('只提供与 layout 不匹配的插槽时不渲染内容', () => {
        const wrapper = mount(DataView, {
            props: { value: baseItems, layout: 'grid' },
            slots: { list: listSlot },
        })

        expect(wrapper.get('.caomei-data-view__content').text()).toBe('')
        expect(wrapper.find('.caomei-data-view__empty').exists()).toBe(false)
    })

    it('空数组渲染默认空态文案', () => {
        const wrapper = mount(DataView, { props: { value: [] } })

        expect(wrapper.get('.caomei-data-view__empty').text()).toBe('暂无数据')
    })

    it('value 未提供或为 null 时同样渲染空态', () => {
        expect(mount(DataView).get('.caomei-data-view__empty').text()).toBe('暂无数据')
        expect(mount(DataView, { props: { value: null } }).get('.caomei-data-view__empty').text()).toBe('暂无数据')
    })

    it('emptyText 覆盖空态文案', () => {
        const wrapper = mount(DataView, { props: { value: [], emptyText: '暂无主题' } })

        expect(wrapper.get('.caomei-data-view__empty').text()).toBe('暂无主题')
    })

    it('empty 插槽优先于默认空态文案，并收到当前 layout', () => {
        const wrapper = mount(DataView, {
            props: { value: [], layout: 'grid' },
            slots: {
                empty: (props: { layout: string }) => h('div', { 'data-test': 'empty' }, props.layout),
            },
        })

        expect(wrapper.get('[data-test="empty"]').text()).toBe('grid')
        expect(wrapper.get('.caomei-data-view__empty').text()).toBe('grid')
    })

    it('empty 插槽优先于 emptyText prop', () => {
        const wrapper = mount(DataView, {
            props: { value: [], emptyText: '暂无主题' },
            slots: {
                empty: () => h('div', { 'data-test': 'empty' }, '自定义空态'),
            },
        })

        expect(wrapper.get('.caomei-data-view__empty').text()).toBe('自定义空态')
    })

    it('empty 插槽在 list 布局下收到当前 layout', () => {
        const wrapper = mount(DataView, {
            props: { value: [], layout: 'list' },
            slots: {
                empty: (props: { layout: string }) => h('div', { 'data-test': 'empty' }, props.layout),
            },
        })

        expect(wrapper.get('[data-test="empty"]').text()).toBe('list')
    })

    it('loading 优先于非空内容', () => {
        const wrapper = mount(DataView, {
            props: { value: baseItems, loading: true },
            slots: { list: listSlot },
        })

        expect(wrapper.get('.caomei-data-view__loading').text()).toBe('加载中')
        expect(wrapper.find('[data-test="list"]').exists()).toBe(false)
    })

    it('loading 时渲染加载文案并优先于空态与内容', () => {
        const wrapper = mount(DataView, {
            props: { value: [], loading: true },
            slots: { list: listSlot },
        })

        expect(wrapper.get('.caomei-data-view__loading').text()).toBe('加载中')
        expect(wrapper.find('.caomei-data-view__empty').exists()).toBe(false)
        expect(wrapper.find('[data-test="list"]').exists()).toBe(false)
    })

    it('loading 时根元素标注 aria-busy，非 loading 时无该属性', () => {
        const loading = mount(DataView, { props: { value: baseItems, loading: true } })
        expect(loading.get('.caomei-data-view').attributes('aria-busy')).toBe('true')

        const normal = mount(DataView, { props: { value: baseItems } })
        expect(normal.get('.caomei-data-view').attributes('aria-busy')).toBeUndefined()
    })

    it('loadingText 覆盖加载文案', () => {
        const wrapper = mount(DataView, { props: { loading: true, loadingText: '加载主题中' } })

        expect(wrapper.get('.caomei-data-view__loading').text()).toBe('加载主题中')
    })

    it('header / footer 插槽渲染在内容区之外', () => {
        const wrapper = mount(DataView, {
            props: { value: baseItems },
            slots: {
                header: '<div data-test="header">头部</div>',
                list: listSlot,
                footer: '<div data-test="footer">底部</div>',
            },
        })

        expect(wrapper.get('.caomei-data-view__header').text()).toBe('头部')
        expect(wrapper.get('.caomei-data-view__footer').text()).toBe('底部')
    })

    it('未提供 header / footer 插槽时不渲染对应区域', () => {
        const wrapper = mount(DataView, { props: { value: baseItems } })

        expect(wrapper.find('.caomei-data-view__header').exists()).toBe(false)
        expect(wrapper.find('.caomei-data-view__footer').exists()).toBe(false)
    })

    it('使用注入 locale 的内建文案', () => {
        const wrapper = mount(DataView, {
            props: { value: [], loading: true },
            global: { provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) } },
        })

        expect(wrapper.get('.caomei-data-view__loading').text()).toBe('Loading')
    })

    it('注入 locale 运行时切换后空态文案同步更新', async () => {
        const messages = ref(caomeiLocales['zh-CN'])
        const wrapper = mount(DataView, {
            props: { value: [] },
            global: { provide: { [caomeiLocaleKey]: computed(() => messages.value) } },
        })

        expect(wrapper.get('.caomei-data-view__empty').text()).toBe('暂无数据')

        messages.value = caomeiLocales['en-US']
        await nextTick()

        expect(wrapper.get('.caomei-data-view__empty').text()).toBe('No data')
    })

    it('透传原生属性到根元素', () => {
        const wrapper = mount(DataView, {
            props: { value: baseItems },
            attrs: { id: 'view-1' },
        })

        expect(wrapper.get('.caomei-data-view').attributes('id')).toBe('view-1')
    })
})
