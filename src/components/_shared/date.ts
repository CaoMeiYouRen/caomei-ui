import { CalendarDate, getLocalTimeZone, type DateValue } from '@internationalized/date'

/**
 * 原生 `Date` ↔ Reka `DateValue` 互转。
 *
 * Reka 的日期 primitive 以 `@internationalized/date` 的 `DateValue` 为模型，
 * 组件库对外统一使用原生 `Date`（对齐下游既有用法），仅在封装层做转换。
 */

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
