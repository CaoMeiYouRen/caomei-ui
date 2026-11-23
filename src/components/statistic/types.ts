/**
 * 统计数值尺寸档
 * @en Statistic size step
 */
export type StatisticSize = 'sm' | 'md' | 'lg'

/**
 * 统计数值根元素标签
 * @en Root element tag of the statistic
 */
export type StatisticAs = 'div' | 'span'

/**
 * 统计数值的入参：数字或可解析为数字的字符串
 * @en Value accepted by the statistic: a number or a numeric string
 */
export type StatisticValue = number | string | null | undefined

export interface StatisticProps {
    /**
     * 数值；`null` / `undefined` / 空串 / 非数字串按空值渲染 `placeholder`。指数形式（如 `1e+21`）原样输出、不分组
     * @en Value; `null` / `undefined` / an empty or non-numeric string renders `placeholder`. Exponent forms (such as `1e+21`) are rendered as-is without grouping
     */
    value?: StatisticValue
    /**
     * 小数位数（0 ~ 20）；缺省保留数值自身的有效小数位。按 `Number#toFixed` 语义处理（受二进制浮点表示影响，非十进制严格四舍五入）；非整数或越界值按「未提供」处理，不做截断；指数形式的数值不受影响
     * @en Decimal places (0 ~ 20); when omitted the value keeps its own decimal digits. Uses `Number#toFixed` semantics (affected by binary floating point, not strict decimal rounding); non-integer or out-of-range values are treated as absent rather than clamped, and exponent-form values are unaffected
     */
    precision?: number
    /**
     * 千分位分隔符；传空串关闭分组
     * @en Thousands separator; pass an empty string to disable grouping
     */
    groupSeparator?: string
    /**
     * 小数点符号，默认 `.`
     * @en Decimal separator, `.` by default
     */
    decimalSeparator?: string
    /**
     * 数值前缀（如货币符号），随数值一起朗读
     * @en Value prefix (such as a currency symbol), read together with the value
     */
    prefix?: string
    /**
     * 数值后缀（如单位），随数值一起朗读
     * @en Value suffix (such as a unit), read together with the value
     */
    suffix?: string
    /**
     * 可见标签；提供后数值区以它（或 `label` 插槽内容）作为可访问名
     * @en Visible label; when provided it (or the `label` slot content) names the value region
     */
    label?: string
    /**
     * 加载态：隐藏数值区内容（含前后缀）并显示占位骨架，数值区标记 `aria-busy`
     * @en Loading state: hides the value region's content (prefix and suffix included) behind a skeleton and marks the value region `aria-busy`
     */
    loading?: boolean
    /**
     * 空值占位，默认 `--`
     * @en Placeholder for empty values, `--` by default
     */
    placeholder?: string
    /**
     * 尺寸档；默认 `md`
     * @en Size step; `md` by default
     */
    size?: StatisticSize
    /**
     * 根元素标签，默认 `div`
     * @en Root element tag, `div` by default
     */
    as?: StatisticAs
}
