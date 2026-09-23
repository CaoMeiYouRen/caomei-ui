<script setup lang="ts" generic="T extends object">
import { FlexRender, useTable, type ColumnDef, type ColumnPinningState, type PaginationState, type Row, type RowSelectionState, type SortingState, type Updater } from '@tanstack/vue-table'
import { ChevronDown, ChevronRight, ChevronUp } from '@lucide/vue'
import { computed, ref, toRaw, useId, useSlots, watch, type CSSProperties, type VNodeChild } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiCheckbox } from '../checkbox'
import { CaomeiPaginator } from '../paginator'
import { dataTableFeatures } from './table-features'
import type { DataTableCellSlotProps, DataTableColumn, DataTableExpansionSlotProps, DataTableHeaderSlotProps, DataTablePageEvent, DataTableProps, DataTableRowExpandEvent, DataTableRowGroupEvent, DataTableRowGroupSlotProps, DataTableSortEvent, DataTableSortMeta } from './types'

defineOptions({ name: 'CaomeiDataTable' })

const props = withDefaults(defineProps<DataTableProps<T>>(), {
    rowKey: undefined,
    caption: '',
    hoverable: true,
    striped: false,
    sortField: undefined,
    sortOrder: 'asc',
    loading: false,
    selectionMode: undefined,
    selection: undefined,
    paginator: false,
    rows: 10,
    totalRecords: undefined,
    lazy: false,
    page: undefined,
})

const emit = defineEmits<{
    sort: [event: DataTableSortEvent]
    'update:selection': [selection: T[] | T | null]
    'update:page': [page: number]
    'update:rows': [rows: number]
    page: [event: DataTablePageEvent]
    'update:expandedRowGroups': [expandedRowGroups: string[]]
    rowgroupExpand: [event: DataTableRowGroupEvent]
    rowgroupCollapse: [event: DataTableRowGroupEvent]
    'update:expandedRows': [expandedRows: string[]]
    rowExpand: [event: DataTableRowExpandEvent<T>]
    rowCollapse: [event: DataTableRowExpandEvent<T>]
    'update:multiSortMeta': [multiSortMeta: DataTableSortMeta[]]
}>()

// 插槽声明仅供类型推导；存在性判断在模板渲染期进行，以反映父组件对插槽的增删
defineSlots<{
    empty?: () => unknown
    /** 单元格插槽，按列 key 命名（`#cell-{key}`）；优先于列定义的 `cell` 函数 */
    [name: `cell-${string}`]: (props: DataTableCellSlotProps<T>) => unknown
    /** 表头插槽，按列 key 命名（`#header-{key}`）；渲染在排序按钮内部 */
    [name: `header-${string}`]: (props: DataTableHeaderSlotProps<T>) => unknown
    /**
     * 分组标题行内容，仅在 `rowGroupMode="subheader"` 时渲染；
     * 未提供时回退渲染分组键取值
     */
    groupheader?: (props: DataTableRowGroupSlotProps<T>) => unknown
    /** 行展开区内容；仅在提供该插槽时渲染展开行 */
    expansion?: (props: DataTableExpansionSlotProps<T>) => unknown
}>()

const slots = useSlots()

/** 判断某个列是否提供了指定类型的插槽 */
function hasColumnSlot(kind: 'cell' | 'header', key: string): boolean {
    return Boolean((slots as Record<string, unknown>)[`${kind}-${key}`])
}

/** 是否提供了 `#expansion` 插槽；展开行仅在提供时渲染（缺省时展开态仍抛出事件） */
function hasExpansionSlot(): boolean {
    return Boolean((slots as Record<string, unknown>).expansion)
}

const locale = useLocale()
const emptyText = computed(() => props.emptyText ?? locale.value.table.empty)
const loadingText = computed(() => props.loadingText ?? locale.value.progress.loading)
const selectAllLabel = computed(() => props.selectAllLabel ?? locale.value.table.selectAll)
const selectRowLabel = computed(() => props.selectRowLabel ?? locale.value.table.selectRow)
const expandRowGroupLabel = computed(
    () => props.expandRowGroupLabel ?? locale.value.table.expandRowGroup,
)
const collapseRowGroupLabel = computed(
    () => props.collapseRowGroupLabel ?? locale.value.table.collapseRowGroup,
)
const expandRowLabel = computed(() => props.expandRowLabel ?? locale.value.table.expandRow)
const collapseRowLabel = computed(() => props.collapseRowLabel ?? locale.value.table.collapseRow)

const columnMap = computed(() => new Map(props.columns.map((column) => [column.key, column])))

/** 由列定义的 `frozen` 推导冻结列状态（v9 以逻辑位 `start` / `end` 表示）。 */
const columnPinningState = computed<ColumnPinningState>(() => ({
    start: props.columns.filter((column) => column.frozen === 'left').map((column) => column.key),
    end: props.columns.filter((column) => column.frozen === 'right').map((column) => column.key),
}))

function resolveRowKey(row: T, index: number): string {
    const key = props.rowKey
    if (typeof key === 'function') {
        return String(key(row, index))
    }
    if (typeof key === 'string') {
        const value = (row as Record<string, unknown>)[key]
        return typeof value === 'string' || typeof value === 'number' ? String(value) : String(index)
    }
    return String(index)
}

/** 支持 `a.b.c` 点号嵌套取值。 */
function getByPath(row: T, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, segment) => {
        if (acc === null || acc === undefined) {
            return undefined
        }
        return (acc as Record<string, unknown>)[segment]
    }, row)
}

const tableColumns = computed<ColumnDef<typeof dataTableFeatures, T>[]>(() =>
    props.columns.map((column) => ({
        id: column.key,
        header: column.header ?? column.key,
        enableSorting: Boolean(column.sortable),
        sortFn: column.sortable ? (column.sortFn ?? 'alphanumeric') : undefined,
        accessorFn: (row: T): unknown => {
            if (typeof column.accessor === 'function') {
                return column.accessor(row)
            }
            return getByPath(row, column.accessor ?? column.key)
        },
        cell: (info): VNodeChild => {
            if (column.cell) {
                return column.cell({
                    row: info.row.original,
                    value: info.getValue(),
                    index: info.row.index,
                })
            }
            const value = info.getValue()
            // 默认插槽按 JS 默认字符串化输出（对象 → [object Object]），此为既有对外行为
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            return value === null || value === undefined ? '' : String(value)
        },
    })),
)

/** 是否多列排序模式 */
const isMultipleSort = computed(() => props.sortMode === 'multiple')

/*
 * 排序状态来源：
 * - `multiple`：由受控 `multiSortMeta` 派生（`order: 0` 的条目忽略），未受控时用内部状态；
 * - `single`（默认）：由受控 `sortField` + `sortOrder` 派生，未受控时用内部状态。
 */
const sortingState = computed<SortingState>(() => {
    if (isMultipleSort.value) {
        const meta = props.multiSortMeta
        if (!meta) {
            return []
        }
        return meta
            .filter((item) => item.order !== 0)
            .map((item) => ({ id: item.field, desc: item.order === -1 }))
    }
    if (!props.sortField) {
        return []
    }
    return [{ id: props.sortField, desc: props.sortOrder === 'desc' }]
})

const isSortControlled = computed(() =>
    isMultipleSort.value ? props.multiSortMeta !== undefined : props.sortField !== undefined,
)

const isSelectionControlled = computed(() => props.selection !== undefined)

function selectionRows(): T[] {
    const current = props.selection
    if (current === undefined || current === null) {
        return []
    }
    return Array.isArray(current) ? (current as T[]) : [current as T]
}

/** 受控 `selection` 可能被父级 ref 包装为响应式代理，需按原始对象比对。 */
function indexOfRow(row: T): number {
    const target = toRaw(row)
    return props.data.findIndex((item) => toRaw(item) === target)
}

const rowSelectionState = computed<RowSelectionState>(() => {
    const record: RowSelectionState = {}
    for (const row of selectionRows()) {
        const index = indexOfRow(row)
        if (index >= 0) {
            record[resolveRowKey(row, index)] = true
        }
    }
    return record
})

/*
 * 组件自持状态：即使外部未传受控 props，也由内部 ref 托管，
 * 这样非受控模式下同样会抛出 `sort` / `update:selection` 事件。
 */
const internalSorting = ref<SortingState>(sortingState.value)
const internalSelection = ref<RowSelectionState>(rowSelectionState.value)

const isPageControlled = computed(() => props.page !== undefined)

/*
 * 仅在展示分页器或 lazy 模式时才真正切片；否则给一个足够大的 pageSize，
 * 避免未启用分页的表格被默认 10 行静默截断。
 */
const effectivePageSize = computed(() =>
    props.paginator || props.lazy ? props.rows : Number.MAX_SAFE_INTEGER,
)

const paginationState = computed<PaginationState>(() => ({
    pageIndex: Math.max((props.page ?? 1) - 1, 0),
    pageSize: effectivePageSize.value,
}))

const internalPagination = ref<PaginationState>({ pageIndex: 0, pageSize: effectivePageSize.value })

watch(sortingState, (next) => {
    if (isSortControlled.value) {
        internalSorting.value = next
    }
})

watch(rowSelectionState, (next) => {
    if (isSelectionControlled.value) {
        internalSelection.value = next
    }
})

watch(paginationState, (next) => {
    if (isPageControlled.value) {
        internalPagination.value = next
    }
})

const currentSorting = computed(() => (isSortControlled.value ? sortingState.value : internalSorting.value))
const currentSelection = computed(() =>
    isSelectionControlled.value ? rowSelectionState.value : internalSelection.value,
)
const currentPagination = computed(() =>
    isPageControlled.value ? paginationState.value : internalPagination.value,
)

const state = computed(() => ({
    sorting: currentSorting.value,
    rowSelection: currentSelection.value,
    pagination: currentPagination.value,
    columnPinning: columnPinningState.value,
}))

function onSortingChange(updater: Updater<SortingState>): void {
    const next = typeof updater === 'function' ? updater(currentSorting.value) : updater
    if (!isSortControlled.value) {
        internalSorting.value = next
    }
    emitSortChange(next)
}

/** 抛出排序变更：多列模式额外抛出 `update:multiSortMeta` 并在 `sort` 载荷中带上完整排序键 */
function emitSortChange(next: SortingState): void {
    const first = next.length > 0 ? next[0] : undefined
    const multiSortMeta: DataTableSortMeta[] = next.map((item) => ({
        field: item.id,
        order: item.desc ? -1 : 1,
    }))
    if (isMultipleSort.value) {
        emit('update:multiSortMeta', multiSortMeta)
    }
    emit('sort', {
        sortField: first?.id ?? '',
        sortOrder: first ? (first.desc ? 'desc' : 'asc') : '',
        ...(isMultipleSort.value ? { multiSortMeta } : {}),
    } satisfies DataTableSortEvent)
}

function onRowSelectionChange(updater: Updater<RowSelectionState>): void {
    const next = typeof updater === 'function' ? updater(currentSelection.value) : updater
    if (!isSelectionControlled.value) {
        internalSelection.value = next
    }
    // 选中态取值本身即布尔；此处按 truthy 过滤，规则对索引访问的判定不适用
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const selected = props.data.filter((row, index) => next[resolveRowKey(row, index)])
    emit('update:selection', props.selectionMode === 'single' ? (selected[0] ?? null) : selected)
}

function onPaginationChange(updater: Updater<PaginationState>): void {
    const next = typeof updater === 'function' ? updater(currentPagination.value) : updater
    if (!isPageControlled.value) {
        internalPagination.value = next
    }
    emitPage(next)
}

const table = useTable({
    features: dataTableFeatures,
    columns: tableColumns,
    data: computed(() => props.data),
    getRowId: (row: T, index: number) => resolveRowKey(row, index),
    sortDescFirst: computed(() => props.sortDescFirst),
    enableRowSelection: Boolean(props.selectionMode),
    enableMultiRowSelection: props.selectionMode === 'multiple',
    manualPagination: computed(() => props.lazy),
    state,
    onSortingChange,
    onRowSelectionChange,
    onPaginationChange,
})

const headerGroups = computed(() => table.getHeaderGroups())
const tableRows = computed(() => table.getRowModel().rows)
const isEmpty = computed(() => props.data.length === 0)

/** 行分组（subheader）是否生效 */
const isSubheaderGrouped = computed(() => props.rowGroupMode === 'subheader' && Boolean(props.groupRowsBy))

/** 可折叠分组是否生效（需行分组同时生效） */
const isExpandableRowGroups = computed(() => isSubheaderGrouped.value && Boolean(props.expandableRowGroups))

/*
 * 展开集合：受控优先、缺省自持。
 * 未提供 `expandedRowGroups` 时内部自持，且**初始为空**（分组全部收起，对齐 PrimeVue）。
 *
 * 这里对受控数组用 `deep` 监听（其余受控 prop 均为标量、无需 deep）：数组型 prop 常被
 * 父级原地增删，仅按引用监听会让内部值滞后，从而在「原地变更后移除受控 prop 退回自持」时取到旧值。
 */
const isRowGroupExpansionControlled = computed(() => props.expandedRowGroups !== undefined)
const controlledExpandedRowGroups = computed<string[]>(() => props.expandedRowGroups ?? [])
const internalExpandedRowGroups = ref<string[]>(controlledExpandedRowGroups.value)

watch(
    controlledExpandedRowGroups,
    (next) => {
        if (isRowGroupExpansionControlled.value) {
            internalExpandedRowGroups.value = next
        }
    },
    { deep: true },
)

const currentExpandedRowGroups = computed(() =>
    isRowGroupExpansionControlled.value ? controlledExpandedRowGroups.value : internalExpandedRowGroups.value,
)

function isGroupExpanded(key: string): boolean {
    return currentExpandedRowGroups.value.includes(key)
}

/** 展开列（`expander: true` 的列）的 key；缺省时行展开能力不生效 */
const expanderColumnKey = computed(() => props.columns.find((column) => column.expander)?.key)

function isExpanderColumn(key: string): boolean {
    return key === expanderColumnKey.value
}

/*
 * 展开行集合：受控优先、缺省自持，与分组展开同构（数组型 prop 用 deep 监听，理由同上）。
 * 行 key 取 tanstack 行 id（即 `rowKey` 的解析结果），与选择态使用同一套标识。
 */
const isRowExpansionControlled = computed(() => props.expandedRows !== undefined)
const controlledExpandedRows = computed<string[]>(() => props.expandedRows ?? [])
const internalExpandedRows = ref<string[]>(controlledExpandedRows.value)

watch(
    controlledExpandedRows,
    (next) => {
        if (isRowExpansionControlled.value) {
            internalExpandedRows.value = next
        }
    },
    { deep: true },
)

const currentExpandedRows = computed(() =>
    isRowExpansionControlled.value ? controlledExpandedRows.value : internalExpandedRows.value,
)

function isRowExpanded(rowKey: string): boolean {
    return currentExpandedRows.value.includes(rowKey)
}

/*
 * 展开区 id：供展开按钮的 `aria-controls` 引用。以组件实例 id + 数据源行序拼装，
 * 避免行 key 含空格等字符时产生非法 id（两处调用点取同一表达式的同值）。
 */
const tableId = useId()

function expansionRowId(rowIndex: number): string {
    return `${tableId}-expansion-${rowIndex}`
}

/** 展开按钮的 `aria-controls`：仅当展开行实际渲染时输出，避免引用不存在的元素 */
function expanderControlsId(rowKey: string, rowIndex: number): string | undefined {
    return hasExpansionSlot() && isRowExpanded(rowKey) ? expansionRowId(rowIndex) : undefined
}

/*
 * 分组字段同名列：该列在**数据行**中渲染为空白占位单元格（不重复显示分组值），
 * 但仍占用列宽，保证其余数据列与表头对齐。
 *
 * 有意偏离 PrimeVue：PrimeVue 在 subheader 模式下直接不渲染该单元格，
 * 使数据行整体左移一列、与表头错位（primefaces/primevue#6496）；
 * 本库保留占位单元格以维持列对齐。
 */
const hiddenGroupColumnKey = computed(() => {
    if (!isSubheaderGrouped.value) {
        return undefined
    }
    const field = props.groupRowsBy
    return props.columns.some((column) => column.key === field) ? field : undefined
})

type DataTableRow = Row<typeof dataTableFeatures, T>

/** 渲染条目：分组标题行与数据行交错排列 */
type DataTableDisplayEntry
    = | { kind: 'group', id: string, value: unknown, groupKey: string, firstRow: T, index: number, expanded: boolean }
        | { kind: 'row', id: string, row: DataTableRow, index: number }

/*
 * 分组按「连续同值」切分（对齐 PrimeVue）：只在当前渲染行序上计算，
 * 故分组以排序 + 分页后的切片为准，跨页的同值行会各自出现分组标题行。
 * 可折叠分组开启时，收起分组的数据行不进入渲染条目（分组标题行保留）。
 */
const displayEntries = computed<DataTableDisplayEntry[]>(() => {
    const rows = tableRows.value
    if (!isSubheaderGrouped.value) {
        return rows.map((row, index) => ({ kind: 'row', id: row.id, row, index }))
    }
    const field = props.groupRowsBy ?? ''
    const entries: DataTableDisplayEntry[] = []
    let previous: unknown
    let hasPrevious = false
    let currentExpanded = true
    for (const [index, row] of rows.entries()) {
        const value = getByPath(row.original, field)
        if (!hasPrevious || value !== previous) {
            const groupKey = formatGroupValue(value)
            currentExpanded = !isExpandableRowGroups.value || isGroupExpanded(groupKey)
            entries.push({
                kind: 'group',
                id: `group:${row.id}`,
                value,
                groupKey,
                firstRow: row.original,
                index,
                expanded: currentExpanded,
            })
            previous = value
            hasPrevious = true
        }
        if (currentExpanded) {
            entries.push({ kind: 'row', id: row.id, row, index })
        }
    }
    return entries
})

/** 该列是否为分组字段同名列（数据行渲染为空白占位单元格） */
function isGroupColumn(key: string): boolean {
    return key === hiddenGroupColumnKey.value
}

/** 分组标题缺省文案；仅当未提供 `#groupheader` 槽时使用 */
function formatGroupValue(value: unknown): string {
    if (value === null || value === undefined) {
        return ''
    }
    // 与默认单元格口径一致：按 JS 默认字符串化输出（对象 → [object Object]）
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return String(value)
}

/*
 * 切换单个分组的展开态：受控模式下只抛出事件（由父级决定是否采纳），
 * 自持模式下同时更新内部状态；两种模式都会抛出 `update:expandedRowGroups` 与展开 / 收起事件。
 */
function toggleRowGroup(originalEvent: Event, groupKey: string): void {
    const current = currentExpandedRowGroups.value
    const wasExpanded = current.includes(groupKey)
    const next = wasExpanded ? current.filter((item) => item !== groupKey) : [...current, groupKey]
    if (!isRowGroupExpansionControlled.value) {
        internalExpandedRowGroups.value = next
    }
    emit('update:expandedRowGroups', next)
    if (wasExpanded) {
        emit('rowgroupCollapse', { originalEvent, data: groupKey })
    } else {
        emit('rowgroupExpand', { originalEvent, data: groupKey })
    }
}

/*
 * 切换单行的展开态：受控模式下只抛出事件（由父级决定是否采纳），自持模式下同时更新内部状态；
 * 两种模式都会抛出 `update:expandedRows` 与 `rowExpand` / `rowCollapse`。
 */
function toggleRowExpansion(originalEvent: Event, rowKey: string, row: T): void {
    const current = currentExpandedRows.value
    const wasExpanded = current.includes(rowKey)
    const next = wasExpanded ? current.filter((item) => item !== rowKey) : [...current, rowKey]
    if (!isRowExpansionControlled.value) {
        internalExpandedRows.value = next
    }
    emit('update:expandedRows', next)
    if (wasExpanded) {
        emit('rowCollapse', { originalEvent, data: row })
    } else {
        emit('rowExpand', { originalEvent, data: row })
    }
}

const rootClass = computed(() => ({
    'caomei-data-table--hoverable': props.hoverable,
    'caomei-data-table--striped': props.striped,
    'caomei-data-table--loading': props.loading,
}))

function alignClass(key: string): string {
    return `caomei-data-table__cell--${columnMap.value.get(key)?.align ?? 'left'}`
}

function pinnedSide(key: string): 'start' | 'end' | false {
    const column = table.getColumn(key)
    return column ? column.getIsPinned() : false
}

function pinnedClass(key: string): string | undefined {
    const side = pinnedSide(key)
    return side ? `caomei-data-table__cell--pinned-${side}` : undefined
}

/** 未声明 px 宽度的冻结列按此估算吸边偏移。 */
const DEFAULT_PINNED_WIDTH = 150

function columnWidth(key: string): number {
    const width = columnMap.value.get(key)?.width
    if (!width?.endsWith('px')) {
        return DEFAULT_PINNED_WIDTH
    }
    const parsed = Number.parseFloat(width)
    return Number.isFinite(parsed) ? parsed : DEFAULT_PINNED_WIDTH
}

function pinnedStyle(key: string): CSSProperties | undefined {
    const side = pinnedSide(key)
    if (!side) {
        return undefined
    }
    const keys = side === 'start' ? columnPinningState.value.start : columnPinningState.value.end
    const index = keys.indexOf(key)
    let offset = 0
    if (side === 'start') {
        for (let i = 0; i < index; i++) {
            offset += columnWidth(keys[i])
        }
        return { left: `${offset}px` }
    }
    // `end` 侧视觉顺序与 DOM 相反：从末端累计，保证末尾列贴最右
    for (let i = keys.length - 1; i > index; i--) {
        offset += columnWidth(keys[i])
    }
    return { right: `${offset}px` }
}

function columnStyle(key: string): CSSProperties | undefined {
    const def = columnMap.value.get(key)
    const pinned = pinnedStyle(key)
    if (!def && !pinned) {
        return undefined
    }
    return { ...def?.headerStyle, width: def?.width, ...pinned }
}

function cellStyle(key: string): CSSProperties | undefined {
    const bodyStyle = columnMap.value.get(key)?.bodyStyle
    const pinned = pinnedStyle(key)
    if (!bodyStyle && !pinned) {
        return undefined
    }
    return { ...bodyStyle, ...pinned }
}

function isSortable(key: string): boolean {
    return Boolean(columnMap.value.get(key)?.sortable)
}

function sortState(key: string): 'asc' | 'desc' | false {
    if (!isSortable(key)) {
        return false
    }
    const column = table.getColumn(key)
    return column ? column.getIsSorted() : false
}

function ariaSort(key: string): 'ascending' | 'descending' | 'none' | undefined {
    const state = sortState(key)
    if (!isSortable(key)) {
        return undefined
    }
    if (state === 'asc') {
        return 'ascending'
    }
    if (state === 'desc') {
        return 'descending'
    }
    return 'none'
}

function toggleSort(key: string, event?: MouseEvent): void {
    if (!isSortable(key)) {
        return
    }
    const column = table.getColumn(key)
    if (!column) {
        return
    }
    if (isMultipleSort.value) {
        /*
         * 多列模式（对齐 PrimeVue）：按住 Cmd / Ctrl 时把该列追加为下一个排序键，
         * 否则收敛为该列的单列排序。首次方向由 `sortDescFirst` 决定（tanstack 的表格选项）。
         */
        const multi = Boolean(event?.metaKey) || Boolean(event?.ctrlKey)
        column.toggleSorting(undefined, multi)
        return
    }
    column.toggleSorting()
}

/** 该列在当前多列排序中的优先级（1 基；未参与排序时为 0） */
function sortIndex(key: string): number {
    return currentSorting.value.findIndex((item) => item.id === key) + 1
}

function headerTitle(key: string): string {
    return columnMap.value.get(key)?.header ?? key
}

/** 取列定义；调用点均来自 `props.columns` 派生的表头 / 单元格，缺省分支仅用于类型收窄 */
function columnDef(key: string): DataTableColumn<T> {
    return columnMap.value.get(key) ?? { key }
}

const bodyColspan = computed(() => Math.max(props.columns.length + (props.selectionMode ? 1 : 0), 1))

const allRowsSelected = computed(() => table.getIsAllRowsSelected())
const someRowsSelected = computed(() => table.getIsSomeRowsSelected())

function headerCheckboxModel(): boolean | 'indeterminate' {
    if (allRowsSelected.value) {
        return true
    }
    return someRowsSelected.value ? 'indeterminate' : false
}

function toggleAllRows(): void {
    table.toggleAllRowsSelected(!allRowsSelected.value)
}

function toggleRow(row: { toggleSelected: () => void }): void {
    row.toggleSelected()
}

const totalRows = computed(() => props.totalRecords ?? props.data.length)

/*
 * 存在冻结列时才按 px 宽度之和给出 `min-width`：`table-layout: auto` 会压缩列宽，
 * 导致声明宽度失效、冻结列无法横向滚动；未使用冻结列时保持既有行为。
 */
const hasFrozenColumn = computed(() => props.columns.some((column) => Boolean(column.frozen)))

const tableMinWidth = computed(() => {
    if (!hasFrozenColumn.value) {
        return undefined
    }
    let total = 0
    for (const column of props.columns) {
        if (!column.width?.endsWith('px')) {
            continue
        }
        const parsed = Number.parseFloat(column.width)
        if (Number.isFinite(parsed)) {
            total += parsed
        }
    }
    return total > 0 ? `${total}px` : undefined
})

/** 按给定每页条数计算总页数（未启用分页器 / lazy 时恒为 1） */
function resolvePageCount(pageSize: number): number {
    if (!props.paginator && !props.lazy) {
        return 1
    }
    return Math.max(1, Math.ceil(totalRows.value / Math.max(pageSize, 1)))
}

function emitPage(next: PaginationState): void {
    const page = next.pageIndex + 1
    emit('update:page', page)
    emit('page', {
        page,
        rows: next.pageSize,
        first: next.pageIndex * next.pageSize,
        // 按本次载荷自身的 pageSize 计算：受控分页下父级尚未回写 `rows`，不能用旧值推算
        pageCount: resolvePageCount(next.pageSize),
    } satisfies DataTablePageEvent)
}

watch(effectivePageSize, (size) => {
    if (!isPageControlled.value) {
        internalPagination.value = { ...internalPagination.value, pageSize: size }
    }
})

watch([(): number => props.rows, (): number | undefined => props.totalRecords], () => {
    if ((!props.paginator && !props.lazy) || isPageControlled.value) {
        return
    }
    // 取内部当前页大小而非 `props.rows`：用户经每页条数选择器改过大小后，
    // `totalRecords` 变化不得把选择静默重置回默认值（显式改 `props.rows` 由上方 watch 同步）
    const size = internalPagination.value.pageSize
    const maxIndex = Math.max(0, Math.ceil(totalRows.value / Math.max(size, 1)) - 1)
    internalPagination.value = {
        pageIndex: Math.min(internalPagination.value.pageIndex, maxIndex),
        pageSize: size,
    }
    emitPage(internalPagination.value)
})

function goToPage(page: number): void {
    table.setPageIndex(Math.max(page - 1, 0))
}

/**
 * 切换每页条数：抛出 `update:rows`，并按 PrimeVue 的偏移保持语义保留当前首行偏移、
 * 重新推导页码（受控分页下同样抛出 `update:page`，由父级决定是否采纳）。
 */
function setPageSize(rows: number): void {
    const current = currentPagination.value
    if (rows === current.pageSize) {
        return
    }
    const first = current.pageIndex * current.pageSize
    const pageIndex = Math.floor(first / Math.max(rows, 1))
    if (!isPageControlled.value) {
        internalPagination.value = { pageIndex, pageSize: rows }
    }
    emit('update:rows', rows)
    emitPage({ pageIndex, pageSize: rows })
}
</script>

<template>
    <div
        class="caomei-data-table"
        :class="rootClass"
        :aria-busy="loading || undefined"
    >
        <table
            class="caomei-data-table__table"
            :style="tableMinWidth ? {minWidth: tableMinWidth} : undefined"
        >
            <caption v-if="caption" class="caomei-data-table__caption">
                {{ caption }}
            </caption>
            <thead>
                <tr v-for="headerGroup in headerGroups" :key="headerGroup.id">
                    <th
                        v-if="selectionMode"
                        scope="col"
                        class="caomei-data-table__select-cell caomei-data-table__th"
                        :aria-hidden="selectionMode === 'single' ? 'true' : undefined"
                    >
                        <div
                            v-if="selectionMode === 'multiple'"
                            class="caomei-data-table__select-cell-inner"
                        >
                            <CaomeiCheckbox
                                :model-value="headerCheckboxModel()"
                                :label="selectAllLabel"
                                @update:model-value="toggleAllRows"
                            />
                        </div>
                    </th>
                    <th
                        v-for="header in headerGroup.headers"
                        :key="header.id"
                        scope="col"
                        class="caomei-data-table__th"
                        :class="[alignClass(header.column.id), columnMap.get(header.column.id)?.headerClass, pinnedClass(header.column.id)]"
                        :style="columnStyle(header.column.id)"
                        :aria-sort="ariaSort(header.column.id)"
                    >
                        <!-- 展开列只承载切换按钮，表头始终留空（排序 / 列插槽 / 默认表头三条路径统一收敛在此） -->
                        <template v-if="!isExpanderColumn(header.column.id)">
                            <button
                                v-if="isSortable(header.column.id)"
                                type="button"
                                class="caomei-data-table__sort"
                                @click="toggleSort(header.column.id, $event)"
                            >
                                <slot
                                    v-if="hasColumnSlot('header', header.column.id)"
                                    :name="`header-${header.column.id}`"
                                    :column="columnDef(header.column.id)"
                                />
                                <span v-else>{{ headerTitle(header.column.id) }}</span>
                                <ChevronUp
                                    v-if="sortState(header.column.id) === 'asc'"
                                    class="caomei-data-table__sort-icon"
                                    :size="14"
                                    aria-hidden="true"
                                />
                                <ChevronDown
                                    v-else-if="sortState(header.column.id) === 'desc'"
                                    class="caomei-data-table__sort-icon"
                                    :size="14"
                                    aria-hidden="true"
                                />
                                <span
                                    v-if="isMultipleSort && sortState(header.column.id)"
                                    class="caomei-data-table__sort-index"
                                >{{ sortIndex(header.column.id) }}</span>
                            </button>
                            <slot
                                v-else-if="hasColumnSlot('header', header.column.id)"
                                :name="`header-${header.column.id}`"
                                :column="columnDef(header.column.id)"
                            />
                            <FlexRender
                                v-else-if="!header.isPlaceholder"
                                :header="header"
                            />
                        </template>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="loading" class="caomei-data-table__loading-row">
                    <td
                        class="caomei-data-table__loading"
                        :colspan="bodyColspan"
                    >
                        {{ loadingText }}
                    </td>
                </tr>
                <tr v-else-if="isEmpty" class="caomei-data-table__empty-row">
                    <td
                        class="caomei-data-table__empty"
                        :colspan="bodyColspan"
                    >
                        <slot name="empty">
                            {{ emptyText }}
                        </slot>
                    </td>
                </tr>
                <template v-else>
                    <template v-for="entry in displayEntries" :key="entry.id">
                        <tr
                            v-if="entry.kind === 'group'"
                            class="caomei-data-table__row-group"
                            role="row"
                        >
                            <td
                                :colspan="bodyColspan"
                                class="caomei-data-table__row-group-cell"
                            >
                                <button
                                    v-if="isExpandableRowGroups"
                                    type="button"
                                    class="caomei-data-table__row-group-toggle"
                                    :aria-expanded="entry.expanded"
                                    :aria-label="entry.expanded ? collapseRowGroupLabel : expandRowGroupLabel"
                                    @click="toggleRowGroup($event, entry.groupKey)"
                                >
                                    <ChevronDown
                                        v-if="entry.expanded"
                                        :size="14"
                                        aria-hidden="true"
                                    />
                                    <ChevronRight
                                        v-else
                                        :size="14"
                                        aria-hidden="true"
                                    />
                                </button>
                                <slot
                                    name="groupheader"
                                    :data="entry.firstRow"
                                    :index="entry.index"
                                    :group-value="entry.value"
                                >
                                    {{ formatGroupValue(entry.value) }}
                                </slot>
                            </td>
                        </tr>
                        <template v-else>
                            <tr
                                class="caomei-data-table__row"
                                :class="entry.row.getIsSelected() ? 'caomei-data-table__row--selected' : undefined"
                            >
                                <td
                                    v-if="selectionMode"
                                    class="caomei-data-table__select-cell caomei-data-table__td"
                                >
                                    <div class="caomei-data-table__select-cell-inner">
                                        <CaomeiCheckbox
                                            :model-value="entry.row.getIsSelected()"
                                            :label="`${selectRowLabel} ${entry.row.id}`"
                                            @update:model-value="toggleRow(entry.row)"
                                        />
                                    </div>
                                </td>
                                <td
                                    v-for="cell in entry.row.getAllCells()"
                                    :key="cell.id"
                                    class="caomei-data-table__td"
                                    :class="[alignClass(cell.column.id), columnMap.get(cell.column.id)?.bodyClass, pinnedClass(cell.column.id)]"
                                    :style="cellStyle(cell.column.id)"
                                >
                                    <button
                                        v-if="isExpanderColumn(cell.column.id)"
                                        type="button"
                                        class="caomei-data-table__row-expander"
                                        :aria-expanded="isRowExpanded(entry.row.id)"
                                        :aria-controls="expanderControlsId(entry.row.id, entry.row.index)"
                                        :aria-label="isRowExpanded(entry.row.id) ? collapseRowLabel : expandRowLabel"
                                        @click.stop="toggleRowExpansion($event, entry.row.id, entry.row.original)"
                                    >
                                        <ChevronDown
                                            v-if="isRowExpanded(entry.row.id)"
                                            :size="14"
                                            aria-hidden="true"
                                        />
                                        <ChevronRight
                                            v-else
                                            :size="14"
                                            aria-hidden="true"
                                        />
                                    </button>
                                    <slot
                                        v-else-if="!isGroupColumn(cell.column.id) && hasColumnSlot('cell', cell.column.id)"
                                        :name="`cell-${cell.column.id}`"
                                        :row="entry.row.original"
                                        :value="cell.getValue()"
                                        :index="entry.row.index"
                                        :column="columnDef(cell.column.id)"
                                    />
                                    <FlexRender
                                        v-else-if="!isGroupColumn(cell.column.id)"
                                        :cell="cell"
                                    />
                                </td>
                            </tr>
                            <tr
                                v-if="hasExpansionSlot() && isRowExpanded(entry.row.id)"
                                :id="expansionRowId(entry.row.index)"
                                class="caomei-data-table__row-expansion"
                                role="row"
                            >
                                <td
                                    :colspan="bodyColspan"
                                    class="caomei-data-table__row-expansion-cell"
                                >
                                    <slot
                                        name="expansion"
                                        :data="entry.row.original"
                                        :index="entry.index"
                                    />
                                </td>
                            </tr>
                        </template>
                    </template>
                </template>
            </tbody>
        </table>
        <div v-if="paginator" class="caomei-data-table__pagination">
            <CaomeiPaginator
                :page="currentPagination.pageIndex + 1"
                :items-per-page="currentPagination.pageSize"
                :total="totalRows"
                :rows-per-page-options="rowsPerPageOptions"
                @update:page="goToPage"
                @update:items-per-page="setPageSize"
            />
        </div>
    </div>
</template>

<style scoped>
/*
  `--caomei-data-table-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值：
  否则 scoped 根选择器（0,2,0）会压过使用方 `.caomei-data-table`（0,1,0）的同名覆盖。
*/
.caomei-data-table {
    width: 100%;
    overflow-x: auto;
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
}

.caomei-data-table__table {
    width: 100%;
    border-collapse: collapse;
}

.caomei-data-table__caption {
    padding: var(--caomei-space-2) 0;
    color: var(--caomei-color-text-muted);
    text-align: left;
}

.caomei-data-table__th,
.caomei-data-table__td {
    padding: var(--caomei-space-2) var(--caomei-space-3);
    border-bottom: 1px solid var(--caomei-data-table-border, var(--caomei-color-border));
    text-align: left;
    vertical-align: middle;
}

.caomei-data-table__th {
    background: var(--caomei-data-table-head-bg, var(--caomei-color-bg-elevated));
    color: var(--caomei-color-text);
    font-weight: 600;
    white-space: nowrap;
}

.caomei-data-table__sort {
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-space-1);
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
}

.caomei-data-table__sort:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}

.caomei-data-table__sort-icon {
    flex-shrink: 0;
    color: var(--caomei-color-text-muted);
}

/* 多列排序的优先级序号（仅 `sortMode="multiple"` 且该列参与排序时渲染） */
.caomei-data-table__sort-index {
    flex-shrink: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
    font-weight: 600;
}

.caomei-data-table__cell--center {
    text-align: center;
}

.caomei-data-table__select-cell {
    width: 1%;
    padding-inline: var(--caomei-space-2);
    text-align: center;
    white-space: nowrap;
}

/*
  用 flex 包裹复选框：复选框为 inline-flex，直接放在单元格内会受基线对齐影响，
  选中态指示器出现时行高产生 1px 抖动。
*/
.caomei-data-table__select-cell-inner {
    display: flex;
    align-items: center;
    justify-content: center;
}

.caomei-data-table__cell--right {
    text-align: right;
}

/*
  行背景档位用 :where() 归零特异性（只提供默认值，便于消费方覆盖），
  使 `.caomei-data-table__row--selected` 能稳定压过基础 / 斑马纹 / 悬浮态。
*/
:where(.caomei-data-table__row) {
    background: var(--caomei-data-table-row-bg, var(--caomei-color-bg));
}

:where(.caomei-data-table--striped) :where(.caomei-data-table__row:nth-child(even)) {
    background: var(--caomei-data-table-striped-bg, var(--caomei-color-bg-elevated));
}

:where(.caomei-data-table--hoverable) :where(.caomei-data-table__row:hover) {
    background: var(--caomei-data-table-row-hover-bg, color-mix(in srgb, var(--caomei-color-text) 4%, var(--caomei-color-bg)));
}

.caomei-data-table__row--selected,
:where(.caomei-data-table--hoverable) .caomei-data-table__row--selected:hover {
    background: var(--caomei-data-table-selected-bg, color-mix(in srgb, var(--caomei-color-primary) 8%, var(--caomei-color-bg)));
}

/* 分组标题行：横跨全部数据列；不参与冻结列吸边（单一跨列单元格无法逐列吸附） */
.caomei-data-table__row-group > .caomei-data-table__row-group-cell {
    padding: var(--caomei-space-2) var(--caomei-space-3);
    border-bottom: 1px solid var(--caomei-data-table-border, var(--caomei-color-border));
    background: var(--caomei-data-table-group-bg, var(--caomei-color-bg-elevated));
    color: var(--caomei-color-text);
    font-weight: 600;
    text-align: left;
}

/* 可折叠分组的内建切换按钮：行内排布在分组标题内容之前，保留文本基线对齐 */
.caomei-data-table__row-group-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--caomei-space-1);
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    vertical-align: middle;
    cursor: pointer;
}

.caomei-data-table__row-group-toggle:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}

/* 行展开列的切换按钮：与分组切换按钮同形 */
.caomei-data-table__row-expander {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
}

.caomei-data-table__row-expander:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}

/* 展开区：横跨全部数据列（含展开列与选择列），不参与冻结列吸边 */
.caomei-data-table__row-expansion > .caomei-data-table__row-expansion-cell {
    padding: var(--caomei-space-2) var(--caomei-space-3);
    border-bottom: 1px solid var(--caomei-data-table-border, var(--caomei-color-border));
    background: var(--caomei-data-table-expansion-bg, var(--caomei-color-bg-elevated));
    color: var(--caomei-color-text);
    text-align: left;
}

.caomei-data-table__empty,
.caomei-data-table__loading {
    padding: calc(var(--caomei-space-4) + var(--caomei-space-2)) var(--caomei-space-3);
    color: var(--caomei-color-text-muted);
    text-align: center;
}

.caomei-data-table__pagination {
    display: flex;
    justify-content: flex-end;
    padding-top: var(--caomei-space-3);
}

/* 冻结列：横向滚动时吸边；表头层级高于数据单元格 */
.caomei-data-table__th.caomei-data-table__cell--pinned-start,
.caomei-data-table__th.caomei-data-table__cell--pinned-end {
    position: sticky;
    z-index: var(--caomei-z-pinned-header);
}

.caomei-data-table__td.caomei-data-table__cell--pinned-start,
.caomei-data-table__td.caomei-data-table__cell--pinned-end {
    position: sticky;
    z-index: var(--caomei-z-pinned);
    background: inherit;
}

.caomei-data-table__loading {
    color: var(--caomei-color-primary);
}
</style>
