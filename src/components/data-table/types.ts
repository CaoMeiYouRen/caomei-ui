import type { CSSProperties, VNodeChild } from 'vue'

export type DataTableAlign = 'left' | 'center' | 'right'

/** 排序方向；`undefined` 表示未排序 */
export type DataTableSortOrder = 'asc' | 'desc'

/** 内置排序函数名（与 `table-features.ts` 的 `sortFns` 注册表保持一致） */
export type DataTableSortFn = 'alphanumeric' | 'text' | 'basic'

/** 行选择模式 */
export type DataTableSelectionMode = 'single' | 'multiple'

/**
 * 表头全选作用域：`page` 只作用于当前页（默认，保持既有行为）；`all` 作用于当前 `data` 的全部行。
 * `lazy` 下 `data` 只含当前页，故 `all` 仍只切当前页，但不会清空其它页已选中的行
 * @en Header select-all scope: `page` selects the current page only (default, preserving existing
 * behavior); `all` selects every row in the current `data`. Under `lazy` the `data` holds only the
 * current page, so `all` still toggles that page but keeps selections from other pages intact
 */
export type DataTableSelectAllScope = 'page' | 'all'

/** 行分组模式；`subheader` 在每个分组前渲染分组标题行（对齐 PrimeVue 命名） */
export type DataTableRowGroupMode = 'subheader'

/** 排序模式；`multiple` 为多列排序（对齐 PrimeVue 命名） */
export type DataTableSortMode = 'single' | 'multiple'

/**
 * 多列排序键（对齐 PrimeVue 的 `DataTableSortMeta` 命名）
 * @en Multi-column sort key (named after PrimeVue's `DataTableSortMeta`)
 */
export interface DataTableSortMeta {
    /** 列 key */
    field: string
    /**
     * 排序方向：`1` 升序 / `-1` 降序 / `0` 不参与排序（会被忽略）
     * @en Sort direction: `1` ascending / `-1` descending / `0` excluded from sorting (ignored)
     */
    order: 1 | 0 | -1
}

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
    /**
     * 多列排序模式下的完整排序键（按优先级排列）；仅 `sortMode="multiple"` 时提供
     * @en Full sort keys in priority order for multi-column sorting; provided only when
     * `sortMode="multiple"`
     */
    multiSortMeta?: DataTableSortMeta[]
}

/** 分组展开 / 收起事件载荷（对齐 PrimeVue 的 `rowgroup-expand` / `rowgroup-collapse`） */
export interface DataTableRowGroupEvent {
    /** 触发事件的原生事件 */
    originalEvent: Event
    /** 分组键取值（与 `expandedRowGroups` 中的字符串一致） */
    data: string
}

/** 行展开 / 收起事件载荷（对齐 PrimeVue 的 `row-expand` / `row-collapse`） */
export interface DataTableRowExpandEvent<T> {
    /** 触发事件的原生事件 */
    originalEvent: Event
    /** 该行数据 */
    data: T
}

export interface DataTablePageEvent {
    /** 当前页码（从 1 开始） */
    page: number
    /** 每页条数 */
    rows: number
    /** 当前页首行偏移（0 基，对齐 PrimeVue `@page`） */
    first: number
    /** 总页数 */
    pageCount: number
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
    /**
     * 冻结列位置（横向滚动时吸边）
     * @en Frozen column side (sticks to the edge when scrolling horizontally)
     */
    frozen?: 'left' | 'right'
    /** 表头单元格自定义 class */
    headerClass?: string
    /** 数据单元格自定义 class */
    bodyClass?: string
    /** 表头单元格自定义样式 */
    headerStyle?: CSSProperties
    /** 数据单元格自定义样式 */
    bodyStyle?: CSSProperties
    /**
     * 是否作为**行展开列**：该列的单元格渲染展开 / 收起切换按钮，表头**始终留空**
     * （即使提供 `header` 也不渲染表头文本 / 排序按钮 / 列插槽；多个 `expander` 列仅首个生效）；
     * 需同时提供 `#expansion` 插槽才有可见展开区
     * @en Whether this column is the **row expander column**: its cells render the expand /
     * collapse toggle and its header is **always left blank** (even when `header` is provided, no
     * header text / sort button / column slot is rendered; when several `expander` columns are
     * declared only the first one takes effect); an `#expansion` slot is required for visible
     * expansion content
     */
    expander?: boolean
}

/**
 * `#cell-{key}` 插槽作用域；插槽优先于列定义的 `cell` 函数
 * @en `#cell-{key}` slot scope; takes precedence over the column's `cell` function
 */
export interface DataTableCellSlotProps<T> extends DataTableCellContext<T> {
    /** 当前列定义 */
    column: DataTableColumn<T>
}

/**
 * `#header-{key}` 插槽作用域；渲染在排序列的排序按钮内部，保留排序交互
 * @en `#header-{key}` slot scope; rendered inside the sort button for sortable columns, keeping sort interaction
 */
export interface DataTableHeaderSlotProps<T> {
    /** 当前列定义 */
    column: DataTableColumn<T>
}

/**
 * `#groupheader` 插槽作用域（仅在 `rowGroupMode="subheader"` 时渲染）
 * @en `#groupheader` slot scope (only rendered when `rowGroupMode="subheader"`)
 */
export interface DataTableRowGroupSlotProps<T> {
    /** 分组首行数据 */
    data: T
    /**
     * 分组首行在当前渲染行序中的索引（排序 / 分页后的显示序号，0 基）；
     * 与 `#cell-{key}` 的数据源索引语义不同
     * @en Index of the group's first row in the current rendered row order (display index after
     * sorting/pagination, 0-based); differs from the source index semantics of `#cell-{key}`
     */
    index: number
    /** 分组键取值 */
    groupValue: unknown
}

/**
 * `#expansion` 插槽作用域；仅在提供该插槽时渲染展开区
 * @en `#expansion` slot scope; the expansion area renders only when this slot is provided
 */
export interface DataTableExpansionSlotProps<T> {
    /** 该行数据 */
    data: T
    /**
     * 该行在当前渲染行序中的索引（排序 / 分页后的显示序号，0 基，口径同 `#groupheader`）；
     * 与 `#cell-{key}` 的数据源索引语义不同
     * @en Index of the row in the current rendered row order (display index after sorting/pagination,
     * 0-based, same as `#groupheader`); differs from the source index semantics of `#cell-{key}`
     */
    index: number
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
     * 排序模式：`single`（默认）单列排序；`multiple` 多列排序——点击表头时按住 Cmd / Ctrl 追加为下一个排序键，
     * 不按修饰键则收敛为该列的单列排序（对齐 PrimeVue 语义）
     * @en Sort mode: `single` (default) for one column; `multiple` for multi-column sorting — hold
     * Cmd / Ctrl while clicking a header to append it as the next sort key, otherwise the sorting
     * collapses to that column alone (matching PrimeVue)
     */
    sortMode?: DataTableSortMode
    /**
     * 受控多列排序键（按优先级排列）；仅在 `sortMode="multiple"` 时生效，提供时进入受控模式，
     * 配合 `@update:multiSortMeta` 回写。`order` 为 `0` 的条目会被忽略
     * @en Controlled multi-column sort keys (in priority order); only effective when
     * `sortMode="multiple"`, providing it enables the controlled mode and you write back from
     * `@update:multiSortMeta`. Entries whose `order` is `0` are ignored
     */
    multiSortMeta?: DataTableSortMeta[]
    /**
     * 首次点击可排序列时的方向是否为降序，默认 `false`（升序）
     * @en Whether the first click on a sortable column sorts descending, defaults to `false`
     * (ascending)
     */
    sortDescFirst?: boolean
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
    /**
     * 表头全选作用域：`page` 只切当前页（默认）；`all` 切当前 `data` 的全部行。
     * `lazy` 下不推断未加载页，只切当前页并在受控模式下保留其它页的已选行
     * @en Header select-all scope: `page` toggles the current page only (default); `all` toggles
     * every row in the current `data`. Under `lazy` unloaded pages are never inferred: only the
     * current page is toggled and, in controlled mode, selections from other pages are preserved
     */
    selectAllScope?: DataTableSelectAllScope
    /**
     * 是否显示分页器
     * @en Whether to show the paginator
     */
    paginator?: boolean
    /**
     * 每页条数，默认 10
     * @en Rows per page, defaults to 10
     */
    rows?: number
    /**
     * 每页条数候选；提供后在分页器渲染每页条数选择器，切换时抛出 `update:rows`
     * @en Rows-per-page choices; when provided, a rows-per-page selector is rendered in the paginator
     * and switching it emits `update:rows`
     */
    rowsPerPageOptions?: number[]
    /**
     * 总条数；`lazy` 时由服务端提供，缺省用 `data.length`
     * @en Total records; provided by the server when `lazy`, defaults to `data.length`
     */
    totalRecords?: number
    /**
     * Lazy 模式（服务端分页）：不切片 `data`，仅渲染分页器并抛出 `page`
     * @en Lazy mode (server-side pagination): does not slice `data`, only renders the paginator and emits `page`
     */
    lazy?: boolean
    /**
     * 当前页码（从 1 开始）；提供时进入受控分页
     * @en Current page (1-based); providing it enables controlled pagination
     */
    page?: number
    /**
     * 数据引用替换或排序变化等改变页码的状态时，是否自动回到第一页。
     * 未提供时沿用上游默认：客户端分页自动重置，`lazy`（服务端分页）不重置，保持既有行为
     * @en Whether to reset to the first page when page-altering state changes (replacing the `data`
     * reference, sorting, ...). When omitted, the upstream default applies: automatic reset for
     * client-side pagination and no reset under `lazy` (server-side pagination), preserving
     * existing behavior
     */
    autoResetPageIndex?: boolean
    /**
     * 行分组模式；`subheader` 在每个分组前渲染分组标题行（需同时提供 `groupRowsBy`）
     * @en Row group mode; `subheader` renders a group header row before each group
     * (requires `groupRowsBy`)
     */
    rowGroupMode?: DataTableRowGroupMode
    /**
     * 分组字段名，支持 `a.b` 点号嵌套路径；与同名 `key` 的列配合时该列的数据单元格渲染为**空白占位**
     * （保留列宽，避免数据列与表头错位；有意不沿用 PrimeVue 的不渲染做法）
     * @en Group field name, supports `a.b` dot-path nesting; a column with the same `key` renders
     * blank placeholder body cells (keeping the column width so data columns stay aligned with the
     * header; deliberately does not follow PrimeVue's "do not render" approach)
     */
    groupRowsBy?: string
    /**
     * 是否可折叠分组；需与 `rowGroupMode="subheader"` + `groupRowsBy` 同用，开启后分组标题行渲染内建折叠按钮
     * @en Whether row groups are collapsible; used together with `rowGroupMode="subheader"` + `groupRowsBy`;
     * when enabled a built-in toggle button is rendered in each group header row
     */
    expandableRowGroups?: boolean
    /**
     * 受控展开的分组键集合；提供时进入受控模式，配合 `@update:expandedRowGroups` 回写。
     * **缺省（未提供）时分组全部收起**（对齐 PrimeVue），未列出的分组不渲染其数据行
     * @en Controlled set of expanded group keys; providing it enables the controlled mode, write back
     * from `@update:expandedRowGroups`. **Without it all groups start collapsed** (matching PrimeVue),
     * and groups not listed do not render their data rows
     */
    expandedRowGroups?: string[]
    /**
     * 展开分组按钮的可访问名，默认取当前语言的「展开分组」
     * @en Accessible name of the expand-group button; defaults to the current locale's "Expand row group"
     */
    expandRowGroupLabel?: string
    /**
     * 收起分组按钮的可访问名，默认取当前语言的「收起分组」
     * @en Accessible name of the collapse-group button; defaults to the current locale's "Collapse row group"
     */
    collapseRowGroupLabel?: string
    /**
     * 受控展开的行集合（行 key，口径同 `rowKey`）；提供时进入受控模式，配合
     * `@update:expandedRows` 回写。**需配合 `expander` 列与 `#expansion` 插槽使用**；
     * 缺省（未提供）时由组件自持（初始为空，即全部收起）
     * @en Controlled set of expanded row keys (same key shape as `rowKey`); providing it enables the
     * controlled mode, write back from `@update:expandedRows`. **Used together with an `expander`
     * column and the `#expansion` slot**; without it the component holds the state itself (starting
     * empty, i.e. all rows collapsed)
     */
    expandedRows?: string[]
    /**
     * 展开行按钮的可访问名，默认取当前语言的「展开行」
     * @en Accessible name of the expand-row button; defaults to the current locale's "Expand row"
     */
    expandRowLabel?: string
    /**
     * 收起行按钮的可访问名，默认取当前语言的「收起行」
     * @en Accessible name of the collapse-row button; defaults to the current locale's "Collapse row"
     */
    collapseRowLabel?: string
    /**
     * 固定表头与表体滚动：开启后表格容器按 `scrollHeight` 限高，表体在容器内滚动，
     * 表头吸顶、分页器吸底。缺省关闭，渲染与滚动行为保持不变
     * @en Fixed header with a scrollable body: when enabled the table container is capped at
     * `scrollHeight`, the body scrolls inside it, the header sticks to the top and the paginator
     * sticks to the bottom. Off by default, leaving rendering and scrolling unchanged
     */
    scrollable?: boolean
    /**
     * 滚动容器的高度上限，仅在 `scrollable` 时生效；数字按 `px` 归一化（如 `360` → `360px`），
     * 字符串作为 CSS 长度（如 `'60vh'` / `'24rem'` / `80dvh` / `'var(--table-height)'`）。缺省时不限高，容器按内容自然高度渲染。
     * 字符串须为有效 CSS 长度；空值 / `0` / 负数 / 无法解析的值不生成限高（后者开发期告警）。
     * 限高应不小于「表头 + 一行」的高度
     * @en Maximum height of the scroll container, only effective with `scrollable`; numbers are
     * normalized to `px` (`360` → `360px`) and strings are used as-is as CSS lengths
     * (`'60vh'` / `'24rem'`). Without it the container is not capped and follows the content height.
     * Strings must be valid CSS lengths; empty / zero / negative values and unparsable strings produce
     * no cap. Keep the cap at least as tall as the header plus one row
     */
    scrollHeight?: number | string
    /**
     * 逐格提示：默认单元格（未使用 `cell` 渲染函数）在文本被截断时悬停显示全文。
     * 大批量表（每格一个提示实例）会显著增加挂载开销，可显式关闭；关闭后单元格不再挂提示接线，
     * 截断配方与列宽上限保持不变，`cell` 自定义渲染与表头提示也不受影响。缺省开启，渲染结果不变
     * @en Per-cell tooltips: default cells (those without a `cell` renderer) show the full text on
     * hover when truncated. Large tables pay one tooltip instance per cell, so this can be turned off
     * explicitly; when off, cells keep their truncation recipe and width cap but lose the tooltip
     * wiring, while `cell` renderers and header tooltips are unaffected. On by default, leaving the
     * rendered output unchanged
     */
    cellTooltips?: boolean
}
