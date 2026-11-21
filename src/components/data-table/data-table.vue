<script setup lang="ts" generic="T extends object">
import { FlexRender, useTable, type ColumnDef, type ColumnPinningState, type PaginationState, type Row, type RowSelectionState, type SortingState, type Updater } from '@tanstack/vue-table'
import { computed, h, onBeforeUnmount, ref, toRaw, useId, useSlots, watch, type CSSProperties, type VNodeChild } from 'vue'
import { warnDev } from '../../_shared/dev-warn'
import { useInternalIcons } from '../../icons'
import { useLocale } from '../../composables/use-locale'
import { CaomeiCheckbox } from '../checkbox'
import { CaomeiPaginator } from '../paginator'
import { CaomeiTooltipText } from '../tooltip'
import { dataTableFeatures } from './table-features'
import type { DataTableCellSlotProps, DataTableColumn, DataTableColumnResizeEvent, DataTableExpansionSlotProps, DataTableHeaderSlotProps, DataTablePageEvent, DataTableProps, DataTableRowExpandEvent, DataTableRowGroupEvent, DataTableRowGroupSlotProps, DataTableSortEvent, DataTableSortMeta } from './types'

defineOptions({ name: 'CaomeiDataTable' })

const icons = useInternalIcons()

const props = withDefaults(defineProps<DataTableProps<T>>(), {
    resizableColumns: false,
    columnResizeMinWidth: 48,
    columnResizeStep: 8,
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
    autoResetPageIndex: undefined,
    selectAllScope: 'page',
    scrollable: false,
    scrollHeight: undefined,
    cellTooltips: true,
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
    'update:columnSizing': [columnSizing: Record<string, number>]
    columnResizeEnd: [event: DataTableColumnResizeEvent]
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

/** 生效的列可见性：剔除不可隐藏的展开列（避免「可见但被冻结偏移漏算」的不一致） */
const effectiveVisibility = computed<Record<string, boolean>>(() => {
    const value = props.columnVisibility ?? {}
    const expanderKeys = props.columns.filter((column) => column.expander).map((column) => column.key)
    if (expanderKeys.length === 0) {
        return value
    }
    const next = { ...value }
    for (const key of expanderKeys) {
        delete next[key]
    }
    return next
})

/** 未受控时的内部列宽（`resizableColumns` 的拖拽结果），受控用法忽略 */
const internalSizing = ref<Record<string, number>>({})

/** 生效列宽来源：受控优先，否则内部状态 */
const effectiveSizing = computed(() => props.columnSizing ?? internalSizing.value)

/** 受控列宽（px）：正数有限值才生效，其余回退到列定义 */
const sizingOverrides = computed(() => {
    const result = new Map<string, number>()
    for (const [key, value] of Object.entries(effectiveSizing.value)) {
        if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
            result.set(key, value)
        }
    }
    return result
})

/** 列宽拖拽 / 键盘调整的默认步进（px），可由 `columnResizeStep` 覆盖 */
const DEFAULT_RESIZE_STEP = 8

/** 默认最小列宽（px），可由 `columnResizeMinWidth` 覆盖 */
const DEFAULT_RESIZE_MIN_WIDTH = 48

/** 生效的最小列宽：非正数 / 非有限值回退默认 */
const resizeMinWidth = computed(() => {
    const value = props.columnResizeMinWidth
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : DEFAULT_RESIZE_MIN_WIDTH
})

/** 生效的调整步进：非正数 / 非有限值回退默认 */
const resizeStep = computed(() => {
    const value = props.columnResizeStep
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : DEFAULT_RESIZE_STEP
})

/** 手柄的 ARIA 当前值：按最小列宽夹取，保证 `valuemin ≤ valuenow` 的合法区间 */
function resizeHandleValue(key: string): number {
    return Math.max(resizeMinWidth.value, currentColumnWidth(key))
}

/** 当前列宽：与渲染同源（受控 / 内部值 → 列定义 `px` → 估算），避免 tanstack 默认 `size` 失真 */
function currentColumnWidth(key: string): number {
    return columnWidth(key)
}

/** 回写列宽：受控用法 emit `update:columnSizing`，未受控写内部状态 */
function writeColumnWidth(next: Record<string, number>): void {
    if (props.columnSizing !== undefined) {
        emit('update:columnSizing', next)
        return
    }
    internalSizing.value = next
}

/** 应用列宽并返回实际生效值（按最小列宽夹取） */
function setColumnWidth(key: string, width: number): number {
    const applied = Math.max(resizeMinWidth.value, Math.round(width))
    writeColumnWidth({ ...effectiveSizing.value, [key]: applied })
    return applied
}

/** 调整列宽并在宽度确有变化时抛出结束事件（无净变化的按键 / 拖拽不产生事件） */
function resizeColumn(key: string, width: number): number {
    const previous = currentColumnWidth(key)
    const applied = setColumnWidth(key, width)
    if (applied !== previous) {
        emit('columnResizeEnd', { key, width: applied })
    }
    return applied
}

/** 复位：去掉该列覆盖值并回退到列定义 `width`；存在覆盖值且宽度确有变化时抛出结束事件 */
function resetColumnWidth(key: string): void {
    if (!(key in effectiveSizing.value)) {
        return
    }
    const previous = currentColumnWidth(key)
    const next = { ...effectiveSizing.value }
    delete next[key]
    writeColumnWidth(next)
    const width = definitionColumnWidth(key)
    if (width !== previous) {
        emit('columnResizeEnd', { key, width })
    }
}

let resizeState: { key: string, startX: number, startWidth: number, width: number } | null = null

function onResizeMove(event: PointerEvent): void {
    if (!resizeState) {
        return
    }
    resizeState.width = setColumnWidth(resizeState.key, resizeState.startWidth + (event.clientX - resizeState.startX))
}

/** 只移除拖拽监听与状态，不带业务副作用（卸载路径复用） */
function detachResizeListeners(): void {
    resizeState = null
    window.removeEventListener('pointermove', onResizeMove)
    window.removeEventListener('pointerup', stopResize)
    window.removeEventListener('pointercancel', stopResize)
}

function stopResize(): void {
    const state = resizeState
    detachResizeListeners()
    // 拖拽未改变宽度（例如只是点击手柄）不视为调整结束事件
    if (state && state.width !== state.startWidth) {
        emit('columnResizeEnd', { key: state.key, width: state.width })
    }
}

function startResize(event: PointerEvent, key: string): void {
    if (!props.resizableColumns || event.button !== 0) {
        return
    }
    event.preventDefault()
    event.stopPropagation()
    resizeState = { key, startX: event.clientX, startWidth: currentColumnWidth(key), width: currentColumnWidth(key) }
    window.addEventListener('pointermove', onResizeMove)
    window.addEventListener('pointerup', stopResize)
    window.addEventListener('pointercancel', stopResize)
}

onBeforeUnmount(detachResizeListeners)

function onResizeKeydown(event: KeyboardEvent, key: string): void {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        const delta = event.key === 'ArrowLeft' ? -resizeStep.value : resizeStep.value
        resizeColumn(key, currentColumnWidth(key) + delta)
        return
    }
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        resetColumnWidth(key)
    }
}

/** 隐藏列的 key 集合（生效可见性里显式 `false` 的列） */
const hiddenColumnKeys = computed(() => new Set(
    Object.entries(effectiveVisibility.value)
        .filter(([, visible]) => !visible)
        .map(([key]) => key),
))

/** 由列定义的 `frozen` 推导冻结列状态（v9 以逻辑位 `start` / `end` 表示）；冻结偏移只累计可见列 */
const columnPinningState = computed<ColumnPinningState>(() => ({
    start: props.columns
        .filter((column) => column.frozen === 'left' && !hiddenColumnKeys.value.has(column.key))
        .map((column) => column.key),
    end: props.columns
        .filter((column) => column.frozen === 'right' && !hiddenColumnKeys.value.has(column.key))
        .map((column) => column.key),
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

/*
 * `lazy` 下 `props.data` 只含当前页，缺省 `rowKey` 会退化为**页内索引**：翻页后同一索引可能
 * 指向不同行，选择 / 展开状态因此会串页。自持态在翻页时已丢弃（见下方 watcher），但受控
 * `expandedRows` 无法区分页，故在开发期要求显式提供稳定 `rowKey`。
 * `lazy` 需在挂载时确定，这里只判定一次。
 */
if (props.selectAllScope === 'all' && props.lazy) {
    warnDev('[CaomeiDataTable] selectAllScope="all" 在 lazy 下不会推断未加载页：表头全选仍只切换当前页，其它页已选行在受控模式下保留。')
}
if (props.selectAllScope === 'all' && props.selectAllLabel === undefined) {
    warnDev('[CaomeiDataTable] selectAllScope="all" 已开启但未提供 selectAllLabel：默认可访问名仍是「全选当前页」，请按实际作用域覆盖。')
}
if (
    props.lazy
    && props.rowKey === undefined
    && (props.selectionMode !== undefined || props.columns.some((column) => column.expander))
) {
    warnDev(
        '[CaomeiDataTable] lazy 模式下未提供 rowKey：行 id 将按页内索引生成，翻页后选择 / 展开状态会重置，受控 expandedRows 也无法稳定跨页。请提供能唯一标识行的 rowKey。',
    )
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
        // 表头文本统一走提示包装：仅当列宽是绝对长度时才单行省略（见 `truncateWidth`）
        header: (): VNodeChild => h(CaomeiTooltipText, {
            class: textClass(column.key),
            style: textStyle(column.key),
            mode: 'auto',
        }, () => column.header ?? column.key),
        enableSorting: Boolean(column.sortable),
        // 展开列承载行展开按钮：隐藏它会让表头与控制按钮不一致，显式禁止
        enableHiding: !column.expander,
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
            const text = value === null || value === undefined ? '' : String(value)
            if (!text) {
                return ''
            }
            // 默认文本包一层提示接线：列宽受限时单行省略，被截断时悬停显示全文；
            // 大批量表可显式关闭，避免每格一个提示实例的挂载开销
            if (!props.cellTooltips) {
                // 只去掉提示接线，截断配方（绝对列宽下的单行省略）与列宽上限保持不变
                return h('span', { class: [textClass(column.key), 'caomei-data-table__cell-box'], style: textStyle(column.key) }, text)
            }
            return h(CaomeiTooltipText, {
                class: textClass(column.key),
                style: textStyle(column.key),
                mode: 'auto',
            }, () => text)
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

/*
 * 服务端分页（`lazy`）下选择按页收敛：`props.data` 即当前页，翻页后上一页的行 id 不再对应任何行。
 * 受控侧由 `rowSelectionState`（`indexOfRow` 只查当前页）与 emit 侧的 `props.data.filter` 保证；
 * 自持侧在此丢弃旧页键，避免缺省索引键在新页复用而出现「翻页后自动选中」的串行现象。
 * 需要跨页保留时由父级聚合受控 `selection`。
 */
watch(
    () => props.data,
    () => {
        if (!props.lazy || isSelectionControlled.value) {
            return
        }
        internalSelection.value = {}
    },
)

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

/*
 * 列可见性与列顺序：均为受控读取（本组件不提供列开关 UI）。缺省值是 tanstack 的中性值——
 * `{}` 表示全部可见、`[]` 表示保持列定义顺序，因此摘除 prop 即回到默认渲染。
 */
const columnVisibilityState = computed(() => effectiveVisibility.value)
const columnOrderState = computed(() => props.columnOrder ?? [])
const columnSizingState = computed<Record<string, number>>(() => Object.fromEntries(sizingOverrides.value))

const columnKeys = computed(() => new Set(tableColumns.value.map((column) => column.id)))

/** 开发期告警去重：列定义异步到达 / 原地变更时同一条提示只输出一次 */
const warnedMessages = new Set<string>()

function warnOnce(message: string): void {
    if (warnedMessages.has(message)) {
        return
    }
    warnedMessages.add(message)
    warnDev(message)
}

watch([(): Record<string, boolean> | undefined => props.columnVisibility, columnKeys], ([value]): void => {
    for (const key of Object.keys(value ?? {})) {
        if (!columnKeys.value.has(key)) {
            warnOnce(`[CaomeiDataTable] columnVisibility 中的列 key「${key}」不存在，已忽略。`)
        }
    }
}, { immediate: true, deep: true })

watch([(): Record<string, number> | undefined => props.columnSizing, columnKeys], ([value]): void => {
    for (const key of Object.keys(value ?? {})) {
        if (!columnKeys.value.has(key)) {
            warnOnce(`[CaomeiDataTable] columnSizing 中的列 key「${key}」不存在，已忽略。`)
        }
    }
}, { immediate: true, deep: true })

watch([(): string[] | undefined => props.columnOrder, columnKeys], ([value]): void => {
    const seen = new Set<string>()
    for (const key of value ?? []) {
        if (!columnKeys.value.has(key)) {
            warnOnce(`[CaomeiDataTable] columnOrder 中的列 key「${key}」不存在，已忽略。`)
        } else if (seen.has(key)) {
            warnOnce(`[CaomeiDataTable] columnOrder 中的列 key「${key}」重复，仅首次生效。`)
        }
        seen.add(key)
    }
}, { immediate: true, deep: true })

const state = computed(() => ({
    sorting: currentSorting.value,
    rowSelection: currentSelection.value,
    pagination: currentPagination.value,
    columnPinning: columnPinningState.value,
    columnVisibility: columnVisibilityState.value,
    columnOrder: columnOrderState.value,
    columnSizing: columnSizingState.value,
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
    /*
      未提供时显式镜像上游默认（`!manualPagination`）：Boolean prop 的缺省会被 Vue 转成 `false`
      （故在 withDefaults 中声明 `undefined`），而 vue-table 的选项合并会丢弃 `undefined`，
      动态摘除 prop 时依赖 `??` 在每次同步中给出确定布尔值，避免残留上一次的 `false`。
    */
    autoResetPageIndex: computed(() => props.autoResetPageIndex ?? !props.lazy),
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

/*
 * 服务端分页（`lazy`）且缺省 `rowKey` 时，展开集合的键是页内索引：翻页后必须丢弃，
 * 否则新页同索引行会被自动展开。显式 `rowKey` 时键跨页稳定，展开态可保留。
 */
watch(
    () => props.data,
    () => {
        if (!props.lazy || props.rowKey !== undefined || isRowExpansionControlled.value) {
            return
        }
        internalExpandedRows.value = []
    },
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
    'caomei-data-table--scrollable': props.scrollable,
}))

/** 长度表达式：`calc()` / `min()` / `max()` / `clamp()` / `var()` 交给浏览器解析。 */
const CSS_LENGTH_FUNCTION_PATTERN = /^(?:calc|min|max|clamp|var)\(/u
/** 单个长度值：可选符号 + 数字 + 可选单位。 */
const CSS_LENGTH_VALUE_PATTERN = /^([+-]?(?:\d*\.?\d+))([a-z%]*)$/u
/** 可用于 `max-height` 的长度单位（含视口动态单位与容器查询单位）。 */
const CSS_LENGTH_UNITS = new Set([
    '', 'px', 'rem', 'em', 'vh', 'vw', 'vmin', 'vmax', '%', 'ch', 'ex', 'cm', 'mm', 'in', 'pt', 'pc',
    'dvh', 'dvw', 'dvmin', 'dvmax', 'svh', 'svw', 'svmin', 'svmax', 'lvh', 'lvw', 'lvmin', 'lvmax',
    'lh', 'rlh', 'cqw', 'cqh', 'cqi', 'cqb', 'cqmin', 'cqmax',
])

/**
 * 滚动容器的限高：数字按 `px` 归一化（`scrollHeight` 取 `number` 时不能直接进样式），
 * 字符串按 CSS 长度解析。
 *
 * 数字与字符串走同一套回落：空值 / 非正数 / 非有限值不生成限高（`max-height: 0` 会把表体压没），
 * 无法解析为 CSS 长度的字符串同样不生成并在开发期告警，避免「写了但浏览器丢弃」的静默失败。
 * 负值与零按同一分支静默忽略——`-1rem` 语法合法，只是不能用于 `max-height`，不该报「无效长度」。
 */
const scrollStyle = computed<CSSProperties | undefined>(() => {
    if (!props.scrollable) {
        return undefined
    }
    const value = props.scrollHeight
    if (value === undefined || value === '') {
        return undefined
    }
    if (typeof value === 'number') {
        return Number.isFinite(value) && value > 0 ? { maxHeight: `${value}px` } : undefined
    }
    const normalized = value.trim()
    if (!normalized) {
        return undefined
    }
    if (CSS_LENGTH_FUNCTION_PATTERN.test(normalized)) {
        return { maxHeight: normalized }
    }
    const matched = CSS_LENGTH_VALUE_PATTERN.exec(normalized)
    if (!matched) {
        warnDev(`[CaomeiDataTable] scrollHeight 不是有效的 CSS 长度：${normalized}（将被忽略）`)
        return undefined
    }
    const numeric = Number(matched[1])
    if (!Number.isFinite(numeric) || numeric <= 0) {
        return undefined
    }
    const unit = matched[2]
    if (!CSS_LENGTH_UNITS.has(unit)) {
        warnDev(`[CaomeiDataTable] scrollHeight 的单位 ${unit} 不受支持：${normalized}（将被忽略）`)
        return undefined
    }
    // 无单位数字按 `px` 归一化：`max-height: 240` 是无效声明，会让限高静默失效
    return { maxHeight: unit === '' ? `${numeric}px` : normalized }
})

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

/** 解析后的列宽文本：受控 `columnSizing` 优先，其次列定义 `width` */
function resolvedColumnWidth(key: string): string | undefined {
    const sized = sizingOverrides.value.get(key)
    return sized === undefined ? columnMap.value.get(key)?.width : `${sized}px`
}

/** 列定义宽度（`px`）：非 px 或缺失按估算值，供复位与无覆盖时回退 */
function definitionColumnWidth(key: string): number {
    const width = columnMap.value.get(key)?.width
    if (!width?.endsWith('px')) {
        return DEFAULT_PINNED_WIDTH
    }
    const parsed = Number.parseFloat(width)
    return Number.isFinite(parsed) ? parsed : DEFAULT_PINNED_WIDTH
}

function columnWidth(key: string): number {
    const sized = sizingOverrides.value.get(key)
    if (sized !== undefined) {
        return sized
    }
    return definitionColumnWidth(key)
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

/**
 * 只有绝对长度的列宽才驱动截断。
 *
 * 百分比在单元格内容盒里会**二次取基准**（`width: '20%'` 的列，`max-width: 20%` 相对内容盒只有 20%×20%），
 * 短文本也会被截成省略号并弹出提示；`auto` / `min-content` 一类关键字在 `max-width` 上无意义。
 * 故只接受绝对长度，其余形态退回「不截断、按内容换行」的既有行为。
 */
const ABSOLUTE_LENGTH = /^\d+(?:\.\d+)?(?:px|rem|em|ch|ex|cm|mm|in|pt|pc)$/

function truncateWidth(key: string): string | undefined {
    const width = resolvedColumnWidth(key)?.trim()
    return width && ABSOLUTE_LENGTH.test(width) ? width : undefined
}

/** 文本盒的类名：带列宽上限的列才加截断配方，避免把默认单元格静默改成单行 */
function textClass(key: string): string {
    return truncateWidth(key)
        ? 'caomei-data-table__text caomei-data-table__text--truncate'
        : 'caomei-data-table__text'
}

/**
 * 列宽上限：减掉单元格的左右内边距，否则 `table-layout: auto` 的列会被撑到「声明宽度 + 内边距」。
 * `table-layout: auto` 的列最小宽度取单元格内容的最小内容宽，文本盒带上限后该列才会真正收窄。
 */
function textStyle(key: string): CSSProperties | undefined {
    const width = truncateWidth(key)
    if (!width) {
        return undefined
    }
    // `max(1ch, …)` 兜底：列宽小于左右内边距之和时 `calc` 结果为负，否则会被钳到 `max-width: 0`，文本整体不可见
    return { maxWidth: `max(1ch, calc(${width} - 2 * var(--caomei-data-table-cell-padding-inline, var(--caomei-space-3))))` }
}

function columnStyle(key: string): CSSProperties | undefined {
    const def = columnMap.value.get(key)
    const pinned = pinnedStyle(key)
    if (!def && !pinned) {
        return undefined
    }
    return { ...def?.headerStyle, width: resolvedColumnWidth(key), ...pinned }
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

/**
 * 多列排序的优先级序号文本；未排序时返回空串。
 *
 * 序号元素在**所有**可排序表头都渲染（未排序时为空的占位），配合 `--reserved` 的
 * `visibility: hidden` + `min-width: 1ch` 预留同宽空间——表头内容宽必须与排序态一致，
 * 否则 `table-layout: auto` 下点击排序会让该列宽随图标 / 序号的出现而跳变。
 * 空占位不进入可访问名（无文本），故无需 `aria-hidden`。
 */
function sortIndexLabel(key: string): string {
    return sortState(key) ? String(sortIndex(key)) : ''
}

function headerTitle(key: string): string {
    return columnMap.value.get(key)?.header ?? key
}

/** 取列定义；调用点均来自 `props.columns` 派生的表头 / 单元格，缺省分支仅用于类型收窄 */
function columnDef(key: string): DataTableColumn<T> {
    return columnMap.value.get(key) ?? { key }
}

const bodyColspan = computed(() => Math.max(
    table.getVisibleLeafColumns().length + (props.selectionMode ? 1 : 0),
    1,
))

/*
 * 表头全选默认只作用于**当前页**：`getIsAllPageRowsSelected` / `getIsSomePageRowsSelected`
 * 与 `toggleAllPageRowsSelected` 都以分页后的行模型为准，客户端分页下不会跨页批量改写。
 * 无分页时页行模型即全量行，行为与全选整表一致。`selectAllScope="all"` 改用全量行模型。
 */
const allPageRowsSelected = computed(() => table.getIsAllPageRowsSelected())
const somePageRowsSelected = computed(() => table.getIsSomePageRowsSelected())
const allTableRowsSelected = computed(() => table.getIsAllRowsSelected())
const someTableRowsSelected = computed(() => table.getIsSomeRowsSelected())

/** `all` 只在客户端分页下表示「整表」；`lazy` 的 `data` 只有当前页，不能据此推断整表。 */
const usesAllScope = computed(() => props.selectAllScope === 'all' && !props.lazy)

const headerAllSelected = computed(() =>
    usesAllScope.value ? allTableRowsSelected.value : allPageRowsSelected.value,
)
const headerSomeSelected = computed(() =>
    usesAllScope.value ? someTableRowsSelected.value : somePageRowsSelected.value,
)

function headerCheckboxModel(): boolean | 'indeterminate' {
    if (headerAllSelected.value) {
        return true
    }
    return headerSomeSelected.value ? 'indeterminate' : false
}

/** 取行的稳定标识；未提供 `rowKey` 或取值失败时返回 `null`（无法按 key 去重）。 */
function rowIdentity(row: T): string | null {
    if (props.rowKey === undefined) {
        return null
    }
    try {
        return resolveRowKey(row, props.data.indexOf(row))
    } catch {
        return null
    }
}

/** 当前页之外、仍被受控 `selection` 持有的行（按对象身份比较，再按 `rowKey` 去掉与当前页重复的过期对象）。 */
function rowsOutsideCurrentPage(): T[] {
    // 页面键集合与 `rowIdentity` 同口径：无法取 key 的行不参与按 key 去重（仅靠对象身份）
    const pageKeys = new Set<string>()
    props.data.forEach((row, index) => {
        try {
            pageKeys.add(resolveRowKey(row, index))
        } catch {
            // 自定义 `rowKey` 对个别行抛错时不得中断全选
        }
    })
    return selectionRows().filter((row) => {
        if (props.data.some((item) => toRaw(item) === toRaw(row))) {
            return false
        }
        const key = rowIdentity(row)
        return key === null || !pageKeys.has(key)
    })
}

function toggleAllPageRows(): void {
    const target = !headerAllSelected.value
    // 默认 `page` 保持既有行为（即使 `lazy` + 受控也不改动载荷）；只有显式 `all` 才做跨页合并
    if (props.lazy && props.selectAllScope === 'all') {
        // 服务端模式不推断全量：只切当前页；受控时保留其它页已选行（不清空未加载项）
        if (isSelectionControlled.value) {
            const next = target
                ? [...rowsOutsideCurrentPage(), ...props.data]
                : rowsOutsideCurrentPage()
            emit('update:selection', next)
            return
        }
        table.toggleAllPageRowsSelected(target)
        return
    }
    if (props.selectAllScope === 'all') {
        table.toggleAllRowsSelected(target)
        return
    }
    table.toggleAllPageRowsSelected(target)
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
        const sized = sizingOverrides.value.get(column.key)
        if (sized !== undefined) {
            total += sized
            continue
        }
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
        tabindex="0"
        :style="scrollStyle"
        :role="caption ? 'group' : undefined"
        :aria-label="caption || undefined"
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
                                @update:model-value="toggleAllPageRows"
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
                                class="caomei-data-table__sort caomei-hit-target"
                                @click="toggleSort(header.column.id, $event)"
                            >
                                <slot
                                    v-if="hasColumnSlot('header', header.column.id)"
                                    :name="`header-${header.column.id}`"
                                    :column="columnDef(header.column.id)"
                                />
                                <CaomeiTooltipText
                                    v-else
                                    :class="textClass(header.column.id)"
                                    :style="textStyle(header.column.id)"
                                    mode="auto"
                                >
                                    {{ headerTitle(header.column.id) }}
                                </CaomeiTooltipText>
                                <component
                                    :is="icons.chevronUp"
                                    v-if="sortState(header.column.id) !== 'desc'"
                                    class="caomei-data-table__sort-icon"
                                    :class="{'caomei-data-table__sort-icon--reserved': !sortState(header.column.id)}"
                                    :size="14"
                                    aria-hidden="true"
                                />
                                <component
                                    :is="icons.chevronDown"
                                    v-else
                                    class="caomei-data-table__sort-icon"
                                    :size="14"
                                    aria-hidden="true"
                                />
                                <span
                                    v-if="isMultipleSort"
                                    class="caomei-data-table__sort-index"
                                    :class="{'caomei-data-table__sort-index--reserved': !sortState(header.column.id)}"
                                >{{ sortIndexLabel(header.column.id) }}</span>
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

                        <span
                            v-if="resizableColumns && !isExpanderColumn(header.column.id)"
                            class="caomei-data-table__resizer caomei-hit-target"
                            role="separator"
                            aria-orientation="vertical"
                            :aria-label="locale.table.columnResize.replace('{column}', headerTitle(header.column.id))"
                            :aria-valuemin="resizeMinWidth"
                            aria-valuemax="2000"
                            :aria-valuenow="resizeHandleValue(header.column.id)"
                            tabindex="0"
                            @pointerdown="startResize($event, header.column.id)"
                            @keydown="onResizeKeydown($event, header.column.id)"
                            @dblclick="resetColumnWidth(header.column.id)"
                        />
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
                                    <component
                                        :is="icons.chevronDown"
                                        v-if="entry.expanded"
                                        :size="14"
                                        aria-hidden="true"
                                    />
                                    <component
                                        :is="icons.chevronRight"
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
                                    v-for="cell in entry.row.getVisibleCells()"
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
                                        <component
                                            :is="icons.chevronDown"
                                            v-if="isRowExpanded(entry.row.id)"
                                            :size="14"
                                            aria-hidden="true"
                                        />
                                        <component
                                            :is="icons.chevronRight"
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

/*
  根容器常驻 `tabindex="0"`：横向溢出时键盘用户必须能进入滚动区（WCAG 2.1.1）。
  焦点环只在键盘聚焦时出现，静态视觉与鼠标交互不受影响。
*/
.caomei-data-table:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
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
    padding: var(--caomei-data-table-cell-padding-block, var(--caomei-space-2)) var(--caomei-data-table-cell-padding-inline, var(--caomei-space-3));
    border-bottom: 1px solid var(--caomei-data-table-border, var(--caomei-color-border));
    text-align: left;
    vertical-align: middle;
}

.caomei-data-table__th {
    background: var(--caomei-data-table-head-bg, var(--caomei-color-bg-elevated));
    color: var(--caomei-color-text);
    font-weight: 600;
    white-space: nowrap;
    position: relative;
}

/*
  截断前提（表头 / 单元格默认文本）：**只有带绝对长度列宽的列**才加此配方（`textClass`），
  上限由 `textStyle` 逐列下发。`overflow: hidden` 把文本的最小内容宽归零——否则
  `table-layout: auto` 会按整段文本分配列宽，表格只会横向撑开、省略号与提示永不出现。
  未设列宽的列保持既有换行行为；自定义 `cell` / `#cell-*` / `#header-*` 插槽不包裹。

  提示包装经多层组件渲染，父级 scope id 到不了内层 span，故用 `:deep()` 落到实际元素。
*/
:deep(.caomei-data-table__text--truncate) {
    overflow: hidden;
    text-overflow: ellipsis;
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

/* 多列排序的优先级序号（仅 `sortMode="multiple"` 渲染，未排序时为空占位） */
.caomei-data-table__sort-index {
    flex-shrink: 0;

    /* `tabular-nums` 让各位数字等宽，`min-width: 1ch` 才与「一位序号」的实宽相等；
       两位及以上序号（同时排序 ≥10 列）仍会宽于占位，属已声明边界。 */
    min-width: 1ch;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
    font-variant-numeric: tabular-nums;
    font-weight: 600;
}

/*
  未排序时的占位：图标与序号在**所有**可排序表头都渲染，未排序时以 `visibility: hidden` 保留
  同一盒模型（图标 14px + 序号 `1ch` + 两处 `gap`），使表头内容宽在「排序前 / 后」逐值一致。
  缺这一层时 `table-layout: auto` 会按内容分配列宽，点击排序插入图标会让该列明显变宽、其余列被压缩。
*/
.caomei-data-table__sort-icon--reserved,
.caomei-data-table__sort-index--reserved {
    visibility: hidden;
}

.caomei-data-table__cell--center {
    text-align: center;
}

.caomei-data-table__select-cell {
    width: var(--caomei-data-table-selection-column-width, 1%);
    padding-inline: var(--caomei-data-table-selection-cell-padding-inline, var(--caomei-space-2));
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
    padding: var(--caomei-data-table-cell-padding-block, var(--caomei-space-2)) var(--caomei-data-table-cell-padding-inline, var(--caomei-space-3));
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
    padding: var(--caomei-data-table-cell-padding-block, var(--caomei-space-2)) var(--caomei-data-table-cell-padding-inline, var(--caomei-space-3));
    border-bottom: 1px solid var(--caomei-data-table-border, var(--caomei-color-border));
    background: var(--caomei-data-table-expansion-bg, var(--caomei-color-bg-elevated));
    color: var(--caomei-color-text);
    text-align: left;
}

.caomei-data-table__empty,
.caomei-data-table__loading {
    padding: calc(var(--caomei-space-4) + var(--caomei-data-table-cell-padding-block, var(--caomei-space-2))) var(--caomei-data-table-cell-padding-inline, var(--caomei-space-3));
    color: var(--caomei-color-text-muted);
    text-align: center;
}

.caomei-data-table__pagination {
    display: flex;
    justify-content: var(--caomei-data-table-pagination-justify, flex-end);
    padding-top: var(--caomei-space-3);
}

/*
  固定表头：仅在 `scrollable` 时把根容器变成纵向滚动区，`th` 吸顶、分页器吸底。
  非滚动态不加任何匹配选择器 ⇒ 既有计算样式与视觉基线不变。
*/
.caomei-data-table--scrollable {
    overflow-y: auto;
}

.caomei-data-table--scrollable .caomei-data-table__th {
    position: sticky;
    top: 0;
    z-index: var(--caomei-z-pinned-header);
}

/*
  冻结表头在滚动模式下同时双轴吸边，必须画在普通吸顶表头之上（同层时按树序绘制，
  靠前的冻结列会被其后的普通表头盖住），同时也必须在冻结数据格之上。
*/
.caomei-data-table--scrollable .caomei-data-table__th.caomei-data-table__cell--pinned-start,
.caomei-data-table--scrollable .caomei-data-table__th.caomei-data-table__cell--pinned-end {
    z-index: calc(var(--caomei-z-pinned-header) + 1);
}

.caomei-data-table--scrollable .caomei-data-table__pagination {
    position: sticky;
    bottom: 0;
    z-index: var(--caomei-z-pinned-header);
    background: var(--caomei-data-table-pagination-sticky-bg, var(--caomei-color-bg));
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
    color: var(--caomei-color-primary-text);
}

/*
  动效轴（数据展示，见 `docs/design/governance/2026-11-08-motion-system-evaluation.md` §4 A7）：
  只过渡颜色与透明度，不为排序 / 分页引发的整表重排做动画，因此行的状态切换不会改变盒模型。
  `minimal` 下无匹配选择器 ⇒ 计算样式与冻结基线逐值一致。
*/
:where([data-motion='expressive']) .caomei-data-table__row {
    transition: background-color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard);
}

:where([data-motion='expressive']) .caomei-data-table__sort-icon,
:where([data-motion='expressive']) .caomei-data-table__sort-index {
    transition: color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard);
}

/* 排序激活列：图标与多列序号随 `th[aria-sort]` 提亮（只改颜色，列宽由占位元素保持） */
:where([data-motion='expressive']) .caomei-data-table__th[aria-sort='ascending'] :is(.caomei-data-table__sort-icon, .caomei-data-table__sort-index),
:where([data-motion='expressive']) .caomei-data-table__th[aria-sort='descending'] :is(.caomei-data-table__sort-icon, .caomei-data-table__sort-index) {
    color: var(--caomei-color-primary-text);
}

/* 展开区：只做透明度入场；高度由新增行承担，动画不触发布局属性 */
@media (prefers-reduced-motion: no-preference) {
    :where([data-motion='expressive']) .caomei-data-table__row-expansion-cell {
        animation: caomei-data-table-expansion-in var(--caomei-motion-duration-base) var(--caomei-motion-ease-out);
    }
}

@keyframes caomei-data-table-expansion-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}
</style>

<style>
/*
  关闭逐格提示时的可测量盒：与 `CaomeiTooltipText` 的默认盒一致（`inline-block` + 可被父容器压缩）。
  截断配方（`overflow: hidden` / `text-overflow` / `max-width`）在 `inline` 元素上不生效，
  不补这一层会让「关闭提示」连带丢掉单行省略与列宽上限。
*/
.caomei-data-table__cell-box {
    box-sizing: border-box;
    display: inline-block;
    max-width: 100%;
    min-width: 0;
}
</style>

<style scoped>
.caomei-data-table__resizer {
    position: absolute;
    top: 0;
    right: -4px;
    width: 8px;
    height: 100%;
    cursor: col-resize;
    touch-action: none;
    background: transparent;
}

.caomei-data-table__resizer::after {
    content: '';
    position: absolute;
    top: 20%;
    right: 3px;
    width: 2px;
    height: 60%;
    border-radius: 1px;
    background: var(--caomei-border-color, var(--caomei-color-border));
}

.caomei-data-table__resizer:hover::after,
.caomei-data-table__resizer:focus-visible::after {
    background: var(--caomei-color-primary);
}
</style>
