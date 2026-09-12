export interface PaginatorProps {
    /** 总条数 */
    total: number
    /** 每页条数 */
    itemsPerPage?: number
    /** 当前页两侧显示的页码数量 */
    siblingCount?: number
    /** 是否显示首页 / 末页按钮 */
    showEdges?: boolean
    /** 是否禁用 */
    disabled?: boolean
    /** 根节点的可访问名，映射 `aria-label` */
    label?: string
    /** 首页按钮可访问名 */
    firstLabel?: string
    /** 上一页按钮可访问名 */
    previousLabel?: string
    /** 下一页按钮可访问名 */
    nextLabel?: string
    /** 末页按钮可访问名 */
    lastLabel?: string
    /** 页码可访问名模板，`{page}` 会替换为页码 */
    pageLabel?: string
}
