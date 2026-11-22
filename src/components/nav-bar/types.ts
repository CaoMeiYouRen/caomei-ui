/**
 * `CaomeiNavBar` 的属性。
 *
 * 路由级页头（不接 vue-router）：返回按钮只抛 `back` 事件，历史栈与跳转由使用方决定；
 * 无历史时用 `backDisabled` 或 `back: false` 表达，组件不自行判断。
 * @en Props of `CaomeiNavBar`.
 *
 * A route-level page header that does not depend on vue-router: the back button only emits `back`,
 * so history and navigation stay with the consumer. Express "no history" with `backDisabled` or
 * `back: false`; the component never guesses.
 */
export interface NavBarProps {
    /**
     * 标题文本；默认插槽优先
     * @en Title text; the default slot wins when provided
     */
    title?: string
    /**
     * 是否渲染返回按钮
     * @default true
     * @en Whether to render the back button
     */
    back?: boolean
    /**
     * 返回按钮的可访问名；缺省取当前语言的「返回」
     * @en Accessible name of the back button; defaults to the locale's "Back"
     */
    backLabel?: string
    /**
     * 返回按钮禁用态（无历史时使用）
     * @default false
     * @en Disabled state of the back button (use when there is no history)
     */
    backDisabled?: boolean
    /**
     * 是否吸顶
     * @default false
     * @en Whether the bar sticks to the top
     */
    sticky?: boolean
    /**
     * 是否叠加顶部安全区（`--caomei-safe-area-top`）。该值是**视口级**的：在 `viewport-fit=cover`
     * 下无论是否吸顶都会加上刘海高度，非吸顶且不需要留白时显式传 `false`
     * @default true
     * @en Whether to add the top safe area (`--caomei-safe-area-top`). The value is **viewport-level**:
     * under `viewport-fit=cover` it applies whether or not the bar is sticky, so pass `false`
     * explicitly when a non-sticky bar needs no extra space
     */
    safeArea?: boolean
    /**
     * 导航区的可访问名；缺省取当前语言的「导航栏」
     * @en Accessible name of the nav landmark; defaults to the locale's "Navigation bar"
     */
    label?: string
}
