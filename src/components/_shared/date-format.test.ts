import { describe, expect, it } from 'vitest'
import { formatDate } from './date-format'

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
})
