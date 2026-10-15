import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import CaomeiChart from './chart.vue'

/**
 * 可选 peer 缺失 / 内核加载失败时的降级路径。
 *
 * 独立成文件并只替换 `loadChart`（令其 reject），避免将抛错型模块工厂带入成功路径的模块图。
 */
vi.mock('./chart-loader', async (importOriginal) => {
    const actual = await importOriginal<typeof import('./chart-loader')>()
    return {
        ...actual,
        loadChart: vi.fn().mockRejectedValue(new Error('vue-echarts is not installed')),
    }
})

describe('CaomeiChart 内核加载失败', () => {
    it('渲染失败占位并带 role="alert"，且不抛出', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
        const wrapper = mount(CaomeiChart, {
            props: { option: {} },
            attachTo: document.body,
        })

        expect(wrapper.find('.caomei-chart__status').attributes('role')).toBe('status')

        await flushPromises()

        const status = wrapper.find('.caomei-chart__status')
        expect(status.attributes('role')).toBe('alert')
        expect(status.text()).toBe('图表加载失败，请确认已安装 vue-echarts')
        expect(wrapper.find('.v-chart-stub').exists()).toBe(false)
        expect(warn).toHaveBeenCalled()

        warn.mockRestore()
        wrapper.unmount()
    })
})
