import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { CaomeiConfigProvider } from '../config-provider'
import {
    createChartFormat,
    formatChartDate,
    formatChartNumber,
    formatChartPercent,
    formatChartUnit,
    useChartFormat,
} from './use-chart-format'

const SAMPLE = new Date(Date.UTC(2026, 9, 15, 12))

describe('图表格式化纯函数', () => {
    it('数字按 locale 分组', () => {
        expect(formatChartNumber('en-US', 1234.5)).toBe('1,234.5')
        expect(formatChartNumber('zh-CN', 1234.5)).toBe('1,234.5')
    })

    it('百分比入参为比值', () => {
        expect(formatChartPercent('en-US', 0.42)).toBe('42%')
        expect(formatChartPercent('en-US', 0.425, { maximumFractionDigits: 1 })).toBe('42.5%')
    })

    it('日期输出随 locale 变化', () => {
        const zh = formatChartDate('zh-CN', SAMPLE)
        const en = formatChartDate('en-US', SAMPLE)

        expect(zh).not.toBe(en)
        expect(zh).toContain('2026')
        expect(en).toContain('2026')
    })

    it('单位标签原样拼接，空单位不留尾随空格', () => {
        expect(formatChartUnit('en-US', 1234.5, 'MB')).toBe('1,234.5 MB')
        expect(formatChartUnit('en-US', 1234.5, '')).toBe('1,234.5')
    })

    it('createChartFormat 产出与纯函数一致的固定语言格式化器', () => {
        const format = createChartFormat('en-US')

        expect(format.formatNumber(1234.5)).toBe(formatChartNumber('en-US', 1234.5))
        expect(format.formatDate(SAMPLE)).toBe(formatChartDate('en-US', SAMPLE))
    })
})

describe('useChartFormat', () => {
    const Probe = defineComponent({
        name: 'ChartFormatProbe',
        setup() {
            const format = useChartFormat()
            return () => h('span', { class: 'probe' }, format.formatDate(SAMPLE))
        },
    })

    it('格式化结果跟随注入的语言', async () => {
        const wrapper = mount(CaomeiConfigProvider, {
            props: { locale: 'zh-CN' },
            slots: { default: () => h(Probe) },
            attachTo: document.body,
        })

        const zh = wrapper.get('.probe').text()
        expect(zh).toBe(formatChartDate('zh-CN', SAMPLE))

        await wrapper.setProps({ locale: 'en-US' })

        const en = wrapper.get('.probe').text()
        expect(en).toBe(formatChartDate('en-US', SAMPLE))
        expect(en).not.toBe(zh)

        wrapper.unmount()
    })
})
