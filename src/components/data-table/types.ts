import type { VNodeChild } from 'vue'

export type DataTableAlign = 'left' | 'center' | 'right'

export interface DataTableCellContext<T> {
    /** 当前行数据 */
    row: T
    /** 当前单元格取值 */
    value: unknown
    /** 行索引 */
    index: number
}

export interface DataTableColumn<T> {
    /** 列唯一标识，同时作为默认取值字段 */
    key: string
    /** 表头文本，缺省显示 key */
    header?: string
    /** 取值字段名或函数；缺省用 key 作为字段名 */
    accessor?: string | ((row: T) => unknown)
    /** 自定义单元格内容；优先于 accessor 与默认取值 */
    cell?: (context: DataTableCellContext<T>) => VNodeChild
    /** 列宽，如 '120px' / '20%' */
    width?: string
    /** 水平对齐，默认 left */
    align?: DataTableAlign
}

export interface DataTableProps<T> {
    /** 行数据 */
    data: T[]
    /** 列定义 */
    columns: DataTableColumn<T>[]
    /** 行 key 字段名或函数，缺省使用行索引 */
    rowKey?: string | ((row: T, index: number) => string | number)
    /** 空态文案，默认取当前语言的「暂无数据」 */
    emptyText?: string
    /** 表格标题，渲染为 caption 供无障碍 */
    caption?: string
    /** 行悬浮高亮，默认 true */
    hoverable?: boolean
    /** 斑马纹行，默认 false */
    striped?: boolean
}
