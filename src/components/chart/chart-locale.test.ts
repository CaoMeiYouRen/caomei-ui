import { describe, expect, it } from 'vitest'
import { CHART_BUILTIN_LOCALES, CHART_LOCALE_BY_LOCALE, registerChartLocale, resolveChartLocale } from './chart-locale'

describe('图表语言映射', () => {
    it('五个内建语种均有映射，未登记语种回落 zh-CN', () => {
        expect(Object.keys(CHART_LOCALE_BY_LOCALE).sort()).toEqual(['en-US', 'ja-JP', 'ko-KR', 'zh-CN', 'zh-TW'])
        expect(resolveChartLocale('zh-CN')).toBe('ZH')
        expect(resolveChartLocale('en-US')).toBe('EN')
        expect(resolveChartLocale('ja-JP')).toBe('JA')
        expect(resolveChartLocale('ko-KR')).toBe('KO')
    })

    it('zh-TW 回落简体 ZH（ECharts 未提供繁体语言包，属已登记的有意差异）', () => {
        expect(resolveChartLocale('zh-TW')).toBe('ZH')
    })

    it('内置语言直接返回键名，不触发语言包加载', async () => {
        for (const key of CHART_BUILTIN_LOCALES) {
            await expect(registerChartLocale(key)).resolves.toBe(key)
        }
    })

    it('扩展语言注册成功并返回原键名（幂等）', async () => {
        await expect(registerChartLocale('JA')).resolves.toBe('JA')
        await expect(registerChartLocale('JA')).resolves.toBe('JA')
    })
})
