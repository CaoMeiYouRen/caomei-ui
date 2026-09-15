import { describe, expect, it } from 'vitest'
import { formatDate, formatTime } from './date-format'

describe('_shared/date-format', () => {
    const date = new Date(2026, 8, 5)

    it('空值返回空串', () => {
        expect(formatDate(null, 'yy-mm-dd', 'zh-CN')).toBe('')
        expect(formatDate(undefined, undefined, 'zh-CN')).toBe('')
    })

    it('按 PrimeVue 风格 token 格式化', () => {
        expect(formatDate(date, 'yy-mm-dd', 'zh-CN')).toBe('26-09-05')
        expect(formatDate(date, 'yyyy/m/d', 'zh-CN')).toBe('2026/9/5')
        expect(formatDate(date, 'dd.mm.yyyy', 'zh-CN')).toBe('05.09.2026')
    })

    it('支持月名与星期名 token', () => {
        expect(formatDate(date, 'MM', 'en-US')).toBe('September')
        expect(formatDate(date, 'M', 'en-US')).toBe('Sep')
        expect(formatDate(date, 'DD', 'en-US')).toBe('Saturday')
        expect(formatDate(date, 'D', 'en-US')).toBe('Sat')
    })

    it('未提供 dateFormat 时回退 locale 短日期', () => {
        const formatted = formatDate(date, undefined, 'en-US')
        expect(formatted).toContain('2026')
        expect(formatted).toContain('09')
        expect(formatted).toContain('05')
    })

    it('未知 token 原样保留', () => {
        expect(formatDate(date, 'yy年x月', 'zh-CN')).toBe('26年x月')
    })

    describe('formatTime', () => {
        const dateTime = new Date(2026, 8, 5, 14, 30, 9)

        it('空值返回空串', () => {
            expect(formatTime(null)).toBe('')
        })

        it('24 小时制默认不含秒', () => {
            expect(formatTime(dateTime, { hourFormat: '24', locale: 'zh-CN' })).toBe('14:30')
        })

        it('showSeconds 时含秒', () => {
            expect(formatTime(dateTime, { hourFormat: '24', showSeconds: true, locale: 'zh-CN' })).toBe('14:30:09')
        })

        it('12 小时制带日序（day period）', () => {
            const formatted = formatTime(dateTime, { hourFormat: '12', locale: 'en-US' })
            expect(formatted).toContain('02:30')
            expect(formatted.toUpperCase()).toContain('PM')
        })

        it('zh-CN 12 小时制使用本地日序文案', () => {
            const formatted = formatTime(dateTime, { hourFormat: '12', locale: 'zh-CN' })
            expect(formatted).toContain('02:30')
            expect(formatted).toContain('下午')
        })
    })
})
