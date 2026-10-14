/**
 * 行内各项沿交叉轴（默认纵向）的对齐方式，映射 CSS `align-items`
 * @en Cross-axis alignment of the items inside a row, mapped to CSS `align-items`
 */
export type RowAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'

/**
 * 列间距：单值 = 仅横向间距（`column-gap`）；`[横向, 纵向]` = 同时设置行间距
 * @en Column gutter: a single number sets the horizontal (inline) gap (`column-gap`); a `[horizontal, vertical]` tuple also sets the vertical (block) gap
 */
export type RowGutter = number | [number, number]

export interface RowProps {
    /**
     * 列间距（px）。单值只设置横向间距；传 `[横向, 纵向]` 时同时设置换行后的行间距。
     *
     * 基于 CSS Grid 的 `gap` 实现：间距只出现在相邻项之间，行的左右外侧不留间距；
     * 多行时不与父容器产生负外边距补偿。
     *
     * **约束**：`gap` 不参与收缩，横向间距总宽 `23 × gutter` 必须小于容器宽，否则栅格会撑出横向溢出
     * （窄屏请按断点减小 `gutter`，如 `:gutter="16" :sm="{ span: 24 }"` 搭配更小的移动端间距）。
     * @default 0
     * @en Column gutter (px). A single number sets the horizontal gap only; pass `[horizontal, vertical]` to also set the vertical gap that applies once rows wrap. Built on CSS Grid `gap`: spacing appears only between adjacent items, with no gap on the outer edges and no negative-margin compensation when rows wrap. **Constraint**: `gap` does not shrink, so the total horizontal gap `23 x gutter` must stay smaller than the container width, otherwise the grid overflows horizontally (reduce `gutter` at narrow breakpoints).
     */
    gutter?: RowGutter
    /**
     * 行内各项沿交叉轴的对齐方式
     * @default 'stretch'
     * @en Cross-axis alignment of the items inside the row
     */
    align?: RowAlign
    /**
     * 根元素标签，默认 div
     * @en Root element tag, defaults to div
     */
    as?: string
}
