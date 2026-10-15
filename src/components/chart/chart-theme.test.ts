import { describe, expect, it } from 'vitest'
import {
    buildChartTheme,
    CHART_SERIES_TOKEN_KEYS,
    readChartThemeTokens,
    type ChartThemeTokens,
} from './chart-theme'

const tokens: ChartThemeTokens = {
    series: ['#2563eb', '#15803d', '#b45309', '#dc2626', '#6b7280'],
    text: '#1a1a1a',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    surface: '#f7f7f8',
    fontFamily: 'system-ui',
}

describe('readChartThemeTokens', () => {
    it('按序读取系列色板与主题取色', () => {
        const read = (name: string): string => `var(${name})`
        const result = readChartThemeTokens(read)

        expect(result.series).toEqual(CHART_SERIES_TOKEN_KEYS.map((key) => `var(${key})`))
        expect(result.text).toBe('var(--caomei-color-text)')
        expect(result.surface).toBe('var(--caomei-color-bg-elevated)')
        expect(result.fontFamily).toBe('var(--caomei-font-sans)')
    })

    it('未定义（空串）的 token 从色板中剔除', () => {
        const result = readChartThemeTokens((name) =>
            name === '--caomei-color-warning' ? '' : '#000000',
        )

        expect(result.series).toEqual(['#000000', '#000000', '#000000', '#000000'])
    })
})

describe('buildChartTheme', () => {
    const theme = buildChartTheme(tokens)

    it('配色与背景', () => {
        expect(theme.color).toEqual(tokens.series)
        // 背景保持透明：图表落在宿主背景之上
        expect(theme.backgroundColor).toBe('transparent')
    })

    it('字体与文字色进入全局 textStyle', () => {
        expect(theme.textStyle).toEqual({ fontFamily: 'system-ui', color: '#1a1a1a' })
    })

    it('标题 / 图例 / 提示框取语义色', () => {
        expect(theme.legend).toEqual({ textStyle: { color: '#1a1a1a' } })
        expect(theme.tooltip).toEqual({
            backgroundColor: '#f7f7f8',
            borderColor: '#e5e7eb',
            textStyle: { color: '#1a1a1a' },
        })
        expect(theme.title).toEqual({
            textStyle: { color: '#1a1a1a' },
            subtextStyle: { color: '#6b7280' },
        })
    })

    it('四类坐标轴共享同一套轴线 / 刻度 / 标签 / 分割线取值', () => {
        const axis = {
            axisLine: { lineStyle: { color: '#e5e7eb' } },
            axisTick: { lineStyle: { color: '#e5e7eb' } },
            axisLabel: { color: '#6b7280' },
            splitLine: { lineStyle: { color: '#e5e7eb' } },
            nameTextStyle: { color: '#6b7280' },
        }

        for (const key of ['categoryAxis', 'valueAxis', 'logAxis', 'timeAxis']) {
            expect(theme[key]).toEqual(axis)
        }
    })
})
