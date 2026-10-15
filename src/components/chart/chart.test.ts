import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CaomeiConfigProvider } from '../config-provider'
import CaomeiChart from './chart.vue'

/**
 * 仅替换 `loadChart`（把可选 peer 的内核换成本地桩），本组件自身的加载 / 降级 / 透传逻辑走真实实现：
 * 真实 `vue-echarts` 会在挂载时初始化 ECharts，而 happy-dom 不提供 2D 画布上下文。
 * 真实内核的集成由浏览器侧装置覆盖（见 `test/e2e/chart.e2e.ts`）。
 */
const mocks = vi.hoisted(() => ({ loadChart: vi.fn() }))

vi.mock('./chart-loader', async (importOriginal) => {
    const actual = await importOriginal<typeof import('./chart-loader')>()
    return { ...actual, loadChart: mocks.loadChart }
})

const VChartStub = defineComponent({
    name: 'VChartStub',
    props: {
        option: { type: Object, required: true },
        theme: { type: [String, Object], default: undefined },
        initOptions: { type: Object, default: undefined },
        updateOptions: { type: Object, default: undefined },
        group: { type: String, default: undefined },
        loading: { type: Boolean, default: false },
        autoresize: { type: [Boolean, Object], default: false },
    },
    setup() {
        return () => h('div', { class: 'v-chart-stub' })
    },
})

const option = { series: [{ type: 'bar', data: [1, 2, 3] }] }

function mountChart(props: Record<string, unknown> = {}) {
    return mount(CaomeiChart, {
        props: { option, ...props },
        attachTo: document.body,
    })
}

beforeEach(() => {
    mocks.loadChart.mockReset()
    mocks.loadChart.mockResolvedValue({ VChart: VChartStub })
})

afterEach(() => {
    document.body.innerHTML = ''
})

describe('CaomeiChart', () => {
    it('内核加载完成前渲染加载占位（role="status"），完成后渲染图表', async () => {
        const wrapper = mountChart()

        const status = wrapper.get('.caomei-chart__status')
        expect(status.attributes('role')).toBe('status')
        expect(status.text()).toBe('正在加载图表…')
        expect(wrapper.find('.v-chart-stub').exists()).toBe(false)

        await flushPromises()
        await nextTick()

        expect(wrapper.find('.caomei-chart__status').exists()).toBe(false)
        expect(wrapper.find('.v-chart-stub').exists()).toBe(true)

        wrapper.unmount()
    })

    it('option 与各透传项原样交给内核', async () => {
        const wrapper = mountChart({
            theme: 'dark',
            initOptions: { renderer: 'svg' },
            updateOptions: { notMerge: true },
            group: 'overview',
            loading: true,
        })
        await flushPromises()

        const chart = wrapper.getComponent(VChartStub)
        expect(chart.props('option')).toStrictEqual(option)
        expect(chart.props('theme')).toBe('dark')
        expect(chart.props('initOptions')).toStrictEqual({ renderer: 'svg' })
        expect(chart.props('updateOptions')).toStrictEqual({ notMerge: true })
        expect(chart.props('group')).toBe('overview')
        expect(chart.props('loading')).toBe(true)

        wrapper.unmount()
    })

    it('autoresize 默认开启，可显式关闭', async () => {
        const on = mountChart()
        await flushPromises()
        expect(on.getComponent(VChartStub).props('autoresize')).toBe(true)
        on.unmount()

        const off = mountChart({ autoresize: false })
        await flushPromises()
        expect(off.getComponent(VChartStub).props('autoresize')).toBe(false)
        off.unmount()
    })

    it('label 输出 role="group" 与 aria-label；缺省不输出', () => {
        const labelled = mountChart({ label: '月度趋势' })
        const root = labelled.get('.caomei-chart')
        expect(root.attributes('role')).toBe('group')
        expect(root.attributes('aria-label')).toBe('月度趋势')
        labelled.unmount()

        const plain = mountChart()
        expect(plain.get('.caomei-chart').attributes('role')).toBeUndefined()
        expect(plain.get('.caomei-chart').attributes('aria-label')).toBeUndefined()
        plain.unmount()
    })

    it('仅透传 aria-label（不传 label）时同样授予 role="group"', () => {
        // ARIA 1.2 禁止在无角色通用元素上命名：有可访问名即须有角色
        const wrapper = mount(CaomeiChart, {
            props: { option },
            attrs: { 'aria-label': '趋势图' },
            attachTo: document.body,
        })

        const root = wrapper.get('.caomei-chart')
        expect(root.attributes('role')).toBe('group')
        expect(root.attributes('aria-label')).toBe('趋势图')

        wrapper.unmount()
    })

    it('显式透传 role 时以使用方为准（逃生舱）', () => {
        const wrapper = mount(CaomeiChart, {
            props: { option, label: '月度趋势' },
            attrs: { role: 'figure' },
            attachTo: document.body,
        })

        expect(wrapper.get('.caomei-chart').attributes('role')).toBe('figure')

        wrapper.unmount()
    })

    it('height 写为根元素内联样式；缺省由 CSS 变量回退', () => {
        const sized = mountChart({ height: '12rem' })
        expect(sized.get('.caomei-chart').attributes('style')).toContain('height: 12rem')
        sized.unmount()

        const fallback = mountChart()
        expect(fallback.get('.caomei-chart').attributes('style')).toBeUndefined()
        fallback.unmount()
    })

    it('透传 class / id 到根元素', () => {
        const wrapper = mountChart({ id: 'trend-chart', class: 'demo-chart' })
        const root = wrapper.get('.caomei-chart')
        expect(root.attributes('id')).toBe('trend-chart')
        expect(root.classes()).toContain('demo-chart')
        wrapper.unmount()
    })

    it('注入语言后占位文案随 locale 切换', async () => {
        const wrapper = mount(CaomeiConfigProvider, {
            props: { locale: 'en-US' },
            slots: { default: () => h(CaomeiChart, { option }) },
            attachTo: document.body,
        })

        expect(wrapper.get('.caomei-chart__status').text()).toBe('Loading chart…')

        await flushPromises()
        wrapper.unmount()
    })
})
