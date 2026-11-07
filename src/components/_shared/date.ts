import { CalendarDate, getLocalTimeZone, type DateValue } from '@internationalized/date'

/**
 * 原生 `Date` ↔ Reka `DateValue` 互转。
 *
 * Reka 的日期 primitive 以 `@internationalized/date` 的 `DateValue` 为模型，
 * 组件库对外统一使用原生 `Date`（对齐下游既有用法），仅在封装层做转换。
 */

/** 已完成的闭区间（开始、结束），供范围选择对外建模 */
export type DateRangeValue = [Date, Date]

/** 原生 Date → CalendarDate（按本地时区取年月日，时间部分丢弃） */
export function toDateValue(date: Date | null | undefined): CalendarDate | undefined {
    if (!date) {
        return undefined
    }

    return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

/** CalendarDate → 本地时区原生 Date（当日零点） */
export function fromDateValue(value: DateValue | null | undefined): Date | undefined {
    if (!value) {
        return undefined
    }

    return value.toDate(getLocalTimeZone())
}

/** 原生闭区间 → Reka 的 `DateRange`（任一端缺失时为空） */
export function toDateRangeValue(range: DateRangeValue | null | undefined): {
    start: CalendarDate | undefined
    end: CalendarDate | undefined
} {
    return {
        start: toDateValue(range?.[0]),
        end: toDateValue(range?.[1]),
    }
}

/** Reka 的 `DateRange` → 原生闭区间；两端齐全才成立（半开区间返回 `null`） */
export function fromDateRangeValue(
    value: { start?: DateValue, end?: DateValue } | null | undefined,
): DateRangeValue | null {
    const start = fromDateValue(value?.start)
    const end = fromDateValue(value?.end)
    if (!start || !end) {
        return null
    }

    return [start, end]
}
