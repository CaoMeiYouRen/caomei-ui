import { describe, expect, it } from 'vitest'
import { fromDateValue, toDateValue } from './date'

describe('_shared/date', () => {
    it('toDateValue 将原生 Date 转为本地年月日的 CalendarDate', () => {
        const value = toDateValue(new Date(2026, 8, 15, 23, 30))

        expect(value?.toString()).toBe('2026-09-15')
    })

    it('toDateValue 对空值返回 undefined', () => {
        expect(toDateValue(null)).toBeUndefined()
        expect(toDateValue(undefined)).toBeUndefined()
    })

    it('fromDateValue 还原为当日零点的原生 Date', () => {
        const dateValue = toDateValue(new Date(2026, 8, 15))
        const date = fromDateValue(dateValue)

        expect(date).toBeInstanceOf(Date)
        expect(date?.getFullYear()).toBe(2026)
        expect(date?.getMonth()).toBe(8)
        expect(date?.getDate()).toBe(15)
        expect(date?.getHours()).toBe(0)
    })

    it('fromDateValue 对空值返回 undefined', () => {
        expect(fromDateValue(null)).toBeUndefined()
        expect(fromDateValue(undefined)).toBeUndefined()
    })

    it('往返转换保持年月日一致', () => {
        const source = new Date(2024, 1, 29)
        expect(fromDateValue(toDateValue(source))?.getTime()).toBe(source.getTime())
    })
})
