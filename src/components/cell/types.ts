/**
 * 单元格根元素标签
 * @en Root element tag of the cell
 */
export type CellAs = 'div' | 'button' | 'a'

/**
 * 单元格原生按钮类型（仅 `as="button"` 生效）
 * @en Native button type (only effective when `as="button"`)
 */
export type CellButtonType = 'button' | 'submit' | 'reset'

export interface CellProps {
    /**
     * 标题文案（可用 `title` 插槽自定义内容）
     * @en Title text (customize the content with the `title` slot)
     */
    title?: string
    /**
     * 标题下方的描述文案
     * @en Description text below the title
     */
    description?: string
    /**
     * 右侧值文案
     * @en Value text on the right
     */
    value?: string | number
    /**
     * 根元素标签：`div`（默认）/ `button` / `a`；点击语义由宿主元素承载
     * @en Root element tag: `div` (default) / `button` / `a`; the host element carries the click semantics
     */
    as?: CellAs
    /**
     * 链接地址（仅 `as="a"` 生效）
     * @en Link URL (only effective when `as="a"`)
     */
    href?: string
    /**
     * 链接打开方式（仅 `as="a"` 生效）
     * @en Link target (only effective when `as="a"`)
     */
    target?: string
    /**
     * 原生按钮类型（仅 `as="button"` 生效），默认 `button`
     * @en Native button type (only effective when `as="button"`), `button` by default
     */
    type?: CellButtonType
    /**
     * 是否显示右侧进入指示箭头
     * @en Whether to show the chevron indicator on the right
     */
    arrow?: boolean
}

export interface CellGroupProps {
    /**
     * 分组标题（可用 `title` 插槽自定义内容）
     * @en Group title (customize the content with the `title` slot)
     */
    title?: string
}
