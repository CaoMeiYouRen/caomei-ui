/**
 * 语言惯例缺省值：仅在调用方**未显式**传入对应 prop 时生效。
 *
 * 口径：
 * - `weekdayFormat`：CJK 语言用 `narrow`（单字表头无歧义），其余语言用 `short`（`Sun` / `Mon`），
 *   避免英文 `S M T W T F S` 的歧义；显式 prop 始终优先。
 * - `hourFormat`：已知 12 小时制语言按固定表返回，未知语言交给 `Intl` 的 `hour12` 解析；
 *   解析失败回退 `24`。显式 prop 始终优先。
 */

/** CJK 语言：星期表头用单字。 */
const CJK_LOCALES = new Set(['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'])

/** 已知 12 小时制语言（内建 10 语中仅 en-US）。 */
const HOUR_FORMAT_BY_LOCALE: Partial<Record<string, '12' | '24'>> = {
    'en-US': '12',
}

/**
 * 解析星期表头格式。
 *
 * @param locale 当前生效的 BCP 47 语言
 * @param explicit 调用方显式传入的 prop
 * @returns 生效的 `weekdayFormat`
 */
export function resolveWeekdayFormat(
    locale: string,
    explicit?: 'narrow' | 'short' | 'long',
): 'narrow' | 'short' | 'long' {
    if (explicit !== undefined) {
        return explicit
    }

    return CJK_LOCALES.has(locale) ? 'narrow' : 'short'
}

/**
 * 解析小时制。
 *
 * @param locale 当前生效的 BCP 47 语言
 * @param explicit 调用方显式传入的 prop
 * @returns `12` 或 `24`
 */
export function resolveHourFormat(locale: string, explicit?: '12' | '24'): '12' | '24' {
    if (explicit !== undefined) {
        return explicit
    }

    const known = HOUR_FORMAT_BY_LOCALE[locale]
    if (known !== undefined) {
        return known
    }

    try {
        return new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hour12 ? '12' : '24'
    } catch {
        return '24'
    }
}
