/**
 * 面包屑项之间的分隔符形态
 * @en Separator style between breadcrumb items
 */
export type BreadcrumbSeparator = string

export interface BreadcrumbProps {
    /**
     * 导航区的可访问名（映射 `aria-label`）。
     *
     * 组件**不内建文案**：未传时不渲染 `aria-label`；同一页面存在多个导航区时应逐区提供。
     * @en Accessible name for the navigation region (maps to `aria-label`). The component ships **no built-in text**: nothing is rendered when omitted; provide one per region when a page has several navigations.
     */
    label?: string
    /**
     * 项之间的分隔符文本（可用 `separator` 插槽自定义）。渲染于装饰元素上、不进入可访问名。
     * @default '/'
     * @en Separator text between items (customisable via the `separator` slot). Rendered on a decorative element and excluded from the accessible name.
     */
    separator?: BreadcrumbSeparator
}

export interface BreadcrumbItemProps {
    /**
     * 链接地址。提供时渲染 `<a>`，否则渲染纯文本（末级当前页推荐不传）
     * @en Link target. Renders an `<a>` when provided, otherwise plain text (recommended for the last/current item)
     */
    href?: string
    /**
     * 是否为当前页，映射 `aria-current="page"`
     * @default false
     * @en Whether this is the current page, mapped to `aria-current="page"`
     */
    current?: boolean
}
