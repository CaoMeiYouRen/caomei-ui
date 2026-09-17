export interface PaginatorProps {
    /**
     * 总条数
     * @en Total number of items
     */
    total: number
    /**
     * 每页条数
     * @en Items per page
     */
    itemsPerPage?: number
    /**
     * 每页条数候选；提供后渲染每页条数选择器（缺省不渲染）
     * @en Rows-per-page choices; a rows-per-page selector is rendered when provided (hidden otherwise)
     */
    rowsPerPageOptions?: number[]
    /**
     * 每页条数选择器可访问名；默认取当前语言的「每页条数」
     * @en Accessible name of the rows-per-page selector; defaults to the current locale's "Rows per page" text
     */
    rowsPerPageLabel?: string
    /**
     * 当前页两侧显示的页码数量
     * @en Number of page numbers shown on each side of the current page
     */
    siblingCount?: number
    /**
     * 是否显示首页 / 末页按钮
     * @en Whether to show the first / last page buttons
     */
    showEdges?: boolean
    /**
     * 是否禁用
     * @en Whether the paginator is disabled
     */
    disabled?: boolean
    /**
     * 根节点的可访问名，映射 `aria-label`；优先级高于透传的 `aria-label`，两者都未提供时取当前语言的分页文案
     * @en Accessible name of the root, maps to `aria-label`; takes precedence over a forwarded `aria-label`, falling back to the current locale's pagination label when neither is given
     */
    label?: string
    /**
     * 首页按钮可访问名；默认取当前语言的「首页」文案
     * @en Accessible name of the first-page button; defaults to the current locale's "First page" text
     */
    firstLabel?: string
    /**
     * 上一页按钮可访问名；默认取当前语言的「上一页」文案
     * @en Accessible name of the previous-page button; defaults to the current locale's "Previous page" text
     */
    previousLabel?: string
    /**
     * 下一页按钮可访问名；默认取当前语言的「下一页」文案
     * @en Accessible name of the next-page button; defaults to the current locale's "Next page" text
     */
    nextLabel?: string
    /**
     * 末页按钮可访问名；默认取当前语言的「末页」文案
     * @en Accessible name of the last-page button; defaults to the current locale's "Last page" text
     */
    lastLabel?: string
    /**
     * 页码可访问名模板，`{page}` 会替换为页码；默认取当前语言的「第 {page} 页」文案
     * @en Accessible name template for a page number; `{page}` is replaced by the page number; defaults to the current locale's "Page {page}" text
     */
    pageLabel?: string
}
