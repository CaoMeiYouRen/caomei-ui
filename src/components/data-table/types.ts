import type { CSSProperties, VNodeChild } from 'vue'

export type DataTableAlign = 'left' | 'center' | 'right'

/** 排序方向；`undefined` 表示未排序 */
export type DataTableSortOrder = 'asc' | 'desc'

/** 内置排序函数名（与 `table-features.ts` 的 `sortFns` 注册表保持一致） */
export type DataTableSortFn = 'alphanumeric' | 'text' | 'basic'

/** 行选择模式 */
export type DataTableSelectionMode = 'single' | 'multiple'

export interface DataTableCellContext<T> {
    /** 当前行数据 */
    row: T
    /** 当前单元格取值 */
    value: unknown
    /** 行索引 */
    index: number
}

export interface DataTableSortEvent {
    /** 排序列的 key（无排序时为空字符串） */
    sortField: string
    /** 排序方向（无排序时为空字符串） */
    sortOrder: DataTableSortOrder | ''
}

export interface DataTableColumn<T> {
    /** 列唯一标识，同时作为默认取值字段 */
    key: string
    /** 表头文本，缺省显示 key */
    header?: string
    /**
     * 取值字段名（支持 `a.b` 点号嵌套路径）或函数；缺省用 key 作为字段名
     * @en Field name (dot-path nested access supported) or accessor function; falls back to `key`
     */
    accessor?: string | ((row: T) => unknown)
    /** 自定义单元格内容；优先于 accessor 与默认取值 */
    cell?: (context: DataTableCellContext<T>) => VNodeChild
    /** 列宽，如 '120px' / '20%' */
    width?: string
    /** 水平对齐，默认 left */
    align?: DataTableAlign
    /** 该列是否可排序 */
    sortable?: boolean
    /** 排序函数名，默认 `alphanumeric` */
    sortFn?: DataTableSortFn
    /** 表头单元格自定义 class */
    headerClass?: string
    /** 数据单元格自定义 class */
    bodyClass?: string
    /** 表头单元格自定义样式 */
    headerStyle?: CSSProperties
    /** 数据单元格自定义样式 */
    bodyStyle?: CSSProperties
}

export interface DataTableProps<T> {
    /**
     * 行数据
     * @en Row data
     */
    data: T[]
    /**
     * 列定义
     * @en Column definitions
     */
    columns: DataTableColumn<T>[]
    /**
     * 行 key 字段名或函数，缺省使用行索引
     * @en Row key field name or function; defaults to the row index
     */
    rowKey?: string | ((row: T, index: number) => string | number)
    /**
     * 空态文案，默认取当前语言的「暂无数据」
     * @en Empty-state text; defaults to the current locale's "No data" text
     */
    emptyText?: string
    /**
     * 表格标题，渲染为 caption 供无障碍
     * @en Table caption, rendered as a caption for accessibility
     */
    caption?: string
    /**
     * 行悬浮高亮，默认 true
     * @en Row hover highlight, defaults to true
     */
    hoverable?: boolean
    /**
     * 斑马纹行，默认 false
     * @en Striped rows, default false
     */
    striped?: boolean
    /**
     * 受控排序列 key；提供时进入受控排序，配合 `sortOrder` 与 `@sort`
     * @en Controlled sort field key; providing it enables controlled sorting with `sortOrder` and `@sort`
     */
    sortField?: string
    /**
     * 受控排序方向
     * @en Controlled sort order
     */
    sortOrder?: DataTableSortOrder
    /**
     * 加载态；显示加载行并标注 aria-busy
     * @en Loading state; shows a loading row and sets aria-busy
     */
    loading?: boolean
    /**
     * 加载态文案，默认取当前语言的「加载中」
     * @en Loading text; defaults to the current locale's "Loading" text
     */
    loadingText?: string
    /**
     * 行选择模式；提供时首列渲染选择框
     * @en Row selection mode; when provided a selection column is rendered first
     */
    selectionMode?: DataTableSelectionMode
    /**
     * 全选框可访问名，默认取当前语言的「全选」
     * @en Accessible name of the select-all checkbox; defaults to the current locale's "Select all"
     */
    selectAllLabel?: string
    /**
     * 行选择框可访问名前缀，默认取当前语言的「选择该行」
     * @en Accessible name prefix of the row checkbox; defaults to the current locale's "Select row"
     */
    selectRowLabel?: string
    /**
     * 受控选中行：`multiple` 用数组，`single` 用单行或 `null`；提供时进入受控选择
     * @en Controlled selection: an array for `multiple`, a single row or `null` for `single`; providing it enables controlled selection
     */
    selection?: T[] | T | null
}
