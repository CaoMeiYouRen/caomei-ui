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
     * 根节点的可访问名，映射 `aria-label`
     * @en Accessible name of the root, maps to `aria-label`
     */
    label?: string
    /**
     * 首页按钮可访问名
     * @en Accessible name of the first-page button
     */
    firstLabel?: string
    /**
     * 上一页按钮可访问名
     * @en Accessible name of the previous-page button
     */
    previousLabel?: string
    /**
     * 下一页按钮可访问名
     * @en Accessible name of the next-page button
     */
    nextLabel?: string
    /**
     * 末页按钮可访问名
     * @en Accessible name of the last-page button
     */
    lastLabel?: string
    /**
     * 页码可访问名模板，`{page}` 会替换为页码
     * @en Accessible name template for a page number; `{page}` is replaced by the page number
     */
    pageLabel?: string
}
