/**
 * DataView 布局形态
 * @en DataView layout
 */
export type DataViewLayout = 'list' | 'grid'

export interface DataViewProps<T> {
    /**
     * 数据列表；为空数组或未提供时渲染空态
     * @en Item list; renders the empty state when empty or not provided
     */
    value?: T[] | null
    /**
     * 布局形态，决定渲染 `list` 还是 `grid` 插槽
     * @default 'list'
     * @en Layout, which selects the `list` or `grid` slot
     */
    layout?: DataViewLayout
    /**
     * 加载态；显示加载提示并标注 `aria-busy`，优先于空态与内容
     * @default false
     * @en Loading state; shows the loading text and sets `aria-busy`, taking precedence over the empty state and content
     */
    loading?: boolean
    /**
     * 空态文案，默认取当前语言的「暂无数据」
     * @en Empty-state text; defaults to the current locale's "No data" text
     */
    emptyText?: string
    /**
     * 加载态文案，默认取当前语言的「加载中」
     * @en Loading text; defaults to the current locale's "Loading" text
     */
    loadingText?: string
}
