/** 程序化滚动后忽略滚动事件的窗口（毫秒）；E2E 用它避免与实现窗口耦合。 */
export const WHEEL_SCROLL_IGNORE_MS = 200

/** 时间段的数字夹取（四舍五入后限幅）。 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, Math.round(value)))
}

/** 把目标时刻夹到 `minValue` / `maxValue` 之间（只比较时间部分；`min > max` 的跨日区间不夹取）。 */
export function clampToRange(next: Date, minValue?: Date, maxValue?: Date): Date {
    if (!minValue && !maxValue) {
        return next
    }
    const target = next.getHours() * 3600 + next.getMinutes() * 60 + next.getSeconds()
    const minSeconds = minValue ? minValue.getHours() * 3600 + minValue.getMinutes() * 60 + minValue.getSeconds() : 0
    const maxSeconds = maxValue ? maxValue.getHours() * 3600 + maxValue.getMinutes() * 60 + maxValue.getSeconds() : 24 * 3600 - 1
    if (minSeconds > maxSeconds) {
        return next
    }
    const clamped = Math.min(maxSeconds, Math.max(minSeconds, target))
    if (clamped === target) {
        return next
    }
    const result = new Date(next)
    result.setHours(Math.floor(clamped / 3600), Math.floor((clamped % 3600) / 60), clamped % 60, 0)
    return result
}

export interface TimeValueOptions {
    showSeconds: boolean
    minValue?: Date
    maxValue?: Date
}

/**
 * 把一次时间编辑写回 `Date`：日期部分沿用当前值（空值取今天），时间部分取编辑后的段值。
 * 未开启秒时强制秒归零，避免旧值的秒数在秒段不可见时仍然保留。
 */
export function buildTimeValue(
    base: Date | null | undefined,
    parts: { hour?: number, minute?: number, second?: number },
    options: TimeValueOptions,
): Date {
    const result = base && !Number.isNaN(base.getTime()) ? new Date(base) : new Date()
    result.setHours(
        parts.hour ?? result.getHours(),
        parts.minute ?? result.getMinutes(),
        options.showSeconds ? (parts.second ?? result.getSeconds()) : 0,
        0,
    )
    return clampToRange(result, options.minValue, options.maxValue)
}
