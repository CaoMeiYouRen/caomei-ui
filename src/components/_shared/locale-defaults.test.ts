import { describe, expect, it } from 'vitest'
import { resolveHourFormat, resolveWeekdayFormat } from './locale-defaults'

describe('resolveWeekdayFormat', () => {
    it('CJK 语言缺省 narrow，其余缺省 short', () => {
        expect(resolveWeekdayFormat('zh-CN')).toBe('narrow')
        expect(resolveWeekdayFormat('ja-JP')).toBe('narrow')
        expect(resolveWeekdayFormat('en-US')).toBe('short')
        expect(resolveWeekdayFormat('de-DE')).toBe('short')
    })

    it('显式值优先', () => {
        expect(resolveWeekdayFormat('zh-CN', 'long')).toBe('long')
        expect(resolveWeekdayFormat('en-US', 'narrow')).toBe('narrow')
    })
})

describe('resolveHourFormat', () => {
    it('en-US 缺省 12 小时制，其余内建语言缺省 24', () => {
        expect(resolveHourFormat('en-US')).toBe('12')
        expect(resolveHourFormat('zh-CN')).toBe('24')
        expect(resolveHourFormat('de-DE')).toBe('24')
        expect(resolveHourFormat('fr-FR')).toBe('24')
    })

    it('显式值优先', () => {
        expect(resolveHourFormat('en-US', '24')).toBe('24')
        expect(resolveHourFormat('zh-CN', '12')).toBe('12')
    })

    it('未知语言回退 Intl 解析，非法语言回退 24', () => {
        expect(resolveHourFormat('en-GB')).toBe('24')
        expect(resolveHourFormat('not a locale')).toBe('24')
    })
})
