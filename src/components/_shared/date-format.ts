/**
 * 日期格式化：`dateFormat` 采用 PrimeVue 风格 token，便于迁移映射。
 *
 * 支持 token（区分大小写）：
 * `yyyy` / `yy` 年；`mm` / `m` 月（数字）；`MM` / `M` 月名（长 / 短）；
 * `dd` / `d` 日；`DD` / `D` 星期名（长 / 短）。
 * 未提供 `dateFormat` 时按 `locale` 输出本地化短日期。
 */

const TOKEN_PATTERN = /yyyy|yy|MM|M|dd|d|mm|m|DD|D/g

function pad(value: number): string {
    return String(value).padStart(2, '0')
}

function formatByPattern(date: Date, pattern: string, locale: string): string {
    const parts: Record<string, string> = {
        yyyy: String(date.getFullYear()),
        yy: String(date.getFullYear()).slice(-2),
        MM: new Intl.DateTimeFormat(locale, { month: 'long' }).format(date),
        M: new Intl.DateTimeFormat(locale, { month: 'short' }).format(date),
        mm: pad(date.getMonth() + 1),
        m: String(date.getMonth() + 1),
        dd: pad(date.getDate()),
        d: String(date.getDate()),
        DD: new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date),
        D: new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date),
    }

    return pattern.replace(TOKEN_PATTERN, (token) => parts[token] ?? token)
}

/** 按 `dateFormat` token 或 locale 短日期格式化；空值返回空串 */
export function formatDate(
    date: Date | null | undefined,
    dateFormat: string | undefined,
    locale: string,
): string {
    if (!date) {
        return ''
    }

    if (!dateFormat) {
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(date)
    }

    return formatByPattern(date, dateFormat, locale)
}
