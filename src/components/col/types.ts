/**
 * 断点（视口宽度上限）下的列配置
 * @en Column configuration at a breakpoint (viewport max-width)
 */
export interface ColBreakpointConfig {
    /**
     * 占列数（24 栅格），有效范围 1–24
     * @en Number of columns to span (out of 24), valid range 1–24
     */
    span?: number
    /**
     * 左侧偏移列数
     * @en Number of columns to offset on the inline start
     */
    offset?: number
    /**
     * 视觉排序，映射 CSS `order`
     * @en Visual order, mapped to CSS `order`
     */
    order?: number
}

/**
 * 断点取值：数字（等价于 `{ span }`）或完整配置对象。
 *
 * 断点语义与[响应式设计](../../../docs/design/responsive.md)一致：`sm` / `md` / `lg` 均为**视口宽度上限**
 * （640 / 768 / 1024），且窄档覆盖宽档（`lg` → `md` → `sm`，最窄者最后生效）。
 *
 * **对象只需声明要覆盖的字段**：未声明的字段**不做逐档级联**，而是回退到**基础档（最宽视口）取值**。
 * @en Breakpoint value: a number (equivalent to `{ span }`) or a full config object. Breakpoint semantics match the responsive design doc: `sm` / `md` / `lg` are viewport max-widths (640 / 768 / 1024) and narrower breakpoints win over wider ones (`lg` → `md` → `sm`, narrowest applied last). An object only needs to declare the fields to override; undeclared fields are **not** cascaded from wider breakpoints but fall back to the **base (widest viewport) value**.
 */
export type ColBreakpointValue = number | ColBreakpointConfig

export interface ColProps {
    /**
     * 默认（最宽视口）占列数，基于 24 栅格，有效范围 1–24
     * @default 24
     * @en Default number of columns to span (out of 24) at the widest viewport, valid range 1–24
     */
    span?: number
    /**
     * 左侧偏移列数
     * @default 0
     * @en Number of columns to offset on the inline start
     */
    offset?: number
    /**
     * 视觉排序，映射 CSS `order`
     * @default 0
     * @en Visual order, mapped to CSS `order`
     */
    order?: number
    /**
     * 视口宽度 ≤ 640px 时生效的配置；数字等价于 `{ span }`
     * @en Configuration applied when the viewport is ≤ 640px; a number is equivalent to `{ span }`
     */
    sm?: ColBreakpointValue
    /**
     * 视口宽度 ≤ 768px 时生效的配置；数字等价于 `{ span }`
     * @en Configuration applied when the viewport is ≤ 768px; a number is equivalent to `{ span }`
     */
    md?: ColBreakpointValue
    /**
     * 视口宽度 ≤ 1024px 时生效的配置；数字等价于 `{ span }`
     * @en Configuration applied when the viewport is ≤ 1024px; a number is equivalent to `{ span }`
     */
    lg?: ColBreakpointValue
    /**
     * 根元素标签，默认 div
     * @en Root element tag, defaults to div
     */
    as?: string
}
