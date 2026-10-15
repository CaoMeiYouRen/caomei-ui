import type { ComputedRef } from 'vue'
import { useLocaleCode } from '../../composables/use-locale'
import type { CaomeiLocale } from '../../locale'

/**
 * 图表文本格式：数字 / 百分比 / 日期 / 单位，全部跟随 `useLocaleCode()`。
 *
 * 图表内核不负责数据文本的本地化（ECharts 的 `locale` 只影响其内置界面文案），故把格式化做成
 * **使用方可直接接进 `option` 的回调**（如 `axisLabel.formatter` / `tooltip.valueFormatter`）。
 * 纯函数（`formatChartNumber` 等）与 composable 双出口：前者便于非组件上下文与单测直接调用。
 */

/** 默认日期样式。 */
const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }

/*
 * 无参调用（轴标签 / tooltip 的常见路径）逐点构造 `Intl` 属已知重操作，故按「locale + 形态」
 * 记忆化；带 `options` 的调用不做缓存（options 维度不可穷举），需要大量复用请用
 * `createChartFormat(locale)` 取一组固定格式化器。
 */
const numberFormatters = new Map<string, Intl.NumberFormat>()
const dateFormatters = new Map<string, Intl.DateTimeFormat>()

function cachedNumberFormatter(locale: CaomeiLocale, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
    if (options) {
        return new Intl.NumberFormat(locale, options)
    }
    const cached = numberFormatters.get(locale)
    if (cached) {
        return cached
    }
    const formatter = new Intl.NumberFormat(locale)
    numberFormatters.set(locale, formatter)
    return formatter
}

function cachedDateFormatter(locale: CaomeiLocale, options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    if (options) {
        return new Intl.DateTimeFormat(locale, options)
    }
    const cached = dateFormatters.get(locale)
    if (cached) {
        return cached
    }
    const formatter = new Intl.DateTimeFormat(locale, DEFAULT_DATE_OPTIONS)
    dateFormatters.set(locale, formatter)
    return formatter
}

/** 按 locale 格式化数字。 */
export function formatChartNumber(
    locale: CaomeiLocale,
    value: number,
    options?: Intl.NumberFormatOptions,
): string {
    return cachedNumberFormatter(locale, options).format(value)
}

/** 按 locale 格式化百分比；入参为比值（`0.42` → `42%`）。 */
export function formatChartPercent(
    locale: CaomeiLocale,
    value: number,
    options?: Intl.NumberFormatOptions,
): string {
    return new Intl.NumberFormat(locale, { style: 'percent', ...options }).format(value)
}

/** 按 locale 格式化日期。 */
export function formatChartDate(
    locale: CaomeiLocale,
    value: Date | number,
    options?: Intl.DateTimeFormatOptions,
): string {
    return cachedDateFormatter(locale, options).format(value)
}

/**
 * 按 locale 格式化「数值 + 单位」。
 *
 * **单位标签原样拼接**（不换算、不改写）：`Intl` 的 `style: 'unit'` 只接受规范化单位标识
 * （如 `megabyte`），无法承载 `MB` / `req/s` 一类业务写法；需要规范化单位时直接用
 * `formatChartNumber` 加自定义标签。
 */
export function formatChartUnit(
    locale: CaomeiLocale,
    value: number,
    unit: string,
    options?: Intl.NumberFormatOptions,
): string {
    const formatted = formatChartNumber(locale, value, options)
    return unit ? `${formatted} ${unit}` : formatted
}

export interface ChartFormat {
    /** 当前语言标识 */
    locale: ComputedRef<CaomeiLocale>
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string
    formatPercent: (value: number, options?: Intl.NumberFormatOptions) => string
    formatDate: (value: Date | number, options?: Intl.DateTimeFormatOptions) => string
    formatUnit: (value: number, unit: string, options?: Intl.NumberFormatOptions) => string
}

/**
 * 跟随宿主语言的图表格式化器集合。
 *
 * 语言变化时（`CaomeiConfigProvider` 或 `provideLocale` 切换）各格式化函数读到新值，
 * 因此直接把它们接进 `option` 即可获得联动效果。
 */
export function useChartFormat(): ChartFormat {
    const locale = useLocaleCode()

    return {
        locale,
        formatNumber: (value, options) => formatChartNumber(locale.value, value, options),
        formatPercent: (value, options) => formatChartPercent(locale.value, value, options),
        formatDate: (value, options) => formatChartDate(locale.value, value, options),
        formatUnit: (value, unit, options) => formatChartUnit(locale.value, value, unit, options),
    }
}

/** 供内部复用的完整格式化器（按固定语言构造，无响应式）。 */
export function createChartFormat(locale: CaomeiLocale): Omit<ChartFormat, 'locale'> {
    return {
        formatNumber: (value, options) => formatChartNumber(locale, value, options),
        formatPercent: (value, options) => formatChartPercent(locale, value, options),
        formatDate: (value, options) => formatChartDate(locale, value, options),
        formatUnit: (value, unit, options) => formatChartUnit(locale, value, unit, options),
    }
}
