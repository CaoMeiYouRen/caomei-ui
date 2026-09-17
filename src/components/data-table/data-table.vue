<script setup lang="ts" generic="T extends object">
import { FlexRender, useTable, type ColumnDef, type ColumnPinningState, type PaginationState, type RowSelectionState, type SortingState, type Updater } from '@tanstack/vue-table'
import { ChevronDown, ChevronUp } from '@lucide/vue'
import { computed, ref, toRaw, useSlots, watch, type CSSProperties, type VNodeChild } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiCheckbox } from '../checkbox'
import { CaomeiPaginator } from '../paginator'
import { dataTableFeatures } from './table-features'
import type { DataTableCellSlotProps, DataTableColumn, DataTableHeaderSlotProps, DataTablePageEvent, DataTableProps, DataTableSortEvent } from './types'

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
    page: [event: DataTablePageEvent]
}>()

// 插槽声明仅供类型推导；存在性判断在模板渲染期进行，以反映父组件对插槽的增删
defineSlots<{
    empty?: () => unknown
    /** 单元格插槽，按列 key 命名（`#cell-{key}`）；优先于列定义的 `cell` 函数 */
    [name: `cell-${string}`]: (props: DataTableCellSlotProps<T>) => unknown
    /** 表头插槽，按列 key 命名（`#header-{key}`）；渲染在排序按钮内部 */
    [name: `header-${string}`]: (props: DataTableHeaderSlotProps<T>) => unknown
}>()

const slots = useSlots()

/** 判断某个列是否提供了指定类型的插槽 */
function hasColumnSlot(kind: 'cell' | 'header', key: string): boolean {
    return Boolean((slots as Record<string, unknown>)[`${kind}-${key}`])
}

const locale = useLocale()
const emptyText = computed(() => props.emptyText ?? locale.value.table.empty)
const loadingText = computed(() => props.loadingText ?? locale.value.progress.loading)
const selectAllLabel = computed(() => props.selectAllLabel ?? locale.value.table.selectAll)
const selectRowLabel = computed(() => props.selectRowLabel ?? locale.value.table.selectRow)

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

const sortingState = computed<SortingState>(() => {
    if (!props.sortField) {
        return []
    }
    return [{ id: props.sortField, desc: props.sortOrder === 'desc' }]
})

const isSortControlled = computed(() => props.sortField !== undefined)

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
    const first = next.length > 0 ? next[0] : undefined
    emit('sort', {
        sortField: first?.id ?? '',
        sortOrder: first ? (first.desc ? 'desc' : 'asc') : '',
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
    sortDescFirst: false,
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

function toggleSort(key: string): void {
    if (!isSortable(key)) {
        return
    }
    table.getColumn(key)?.toggleSorting()
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

const pageCount = computed(() => {
    if (!props.paginator && !props.lazy) {
        return 1
    }
    return Math.max(1, Math.ceil(totalRows.value / Math.max(props.rows, 1)))
})

function emitPage(next: PaginationState): void {
    const page = next.pageIndex + 1
    emit('update:page', page)
    emit('page', {
        page,
        rows: next.pageSize,
        first: next.pageIndex * next.pageSize,
        pageCount: pageCount.value,
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
    const size = effectivePageSize.value
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
                        <button
                            v-if="isSortable(header.column.id)"
                            type="button"
                            class="caomei-data-table__sort"
                            @click="toggleSort(header.column.id)"
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
                    <tr
                        v-for="row in tableRows"
                        :key="row.id"
                        class="caomei-data-table__row"
                        :class="row.getIsSelected() ? 'caomei-data-table__row--selected' : undefined"
                    >
                        <td
                            v-if="selectionMode"
                            class="caomei-data-table__select-cell caomei-data-table__td"
                        >
                            <div class="caomei-data-table__select-cell-inner">
                                <CaomeiCheckbox
                                    :model-value="row.getIsSelected()"
                                    :label="`${selectRowLabel} ${row.id}`"
                                    @update:model-value="toggleRow(row)"
                                />
                            </div>
                        </td>
                        <td
                            v-for="cell in row.getAllCells()"
                            :key="cell.id"
                            class="caomei-data-table__td"
                            :class="[alignClass(cell.column.id), columnMap.get(cell.column.id)?.bodyClass, pinnedClass(cell.column.id)]"
                            :style="cellStyle(cell.column.id)"
                        >
                            <slot
                                v-if="hasColumnSlot('cell', cell.column.id)"
                                :name="`cell-${cell.column.id}`"
                                :row="row.original"
                                :value="cell.getValue()"
                                :index="row.index"
                                :column="columnDef(cell.column.id)"
                            />
                            <FlexRender
                                v-else
                                :cell="cell"
                            />
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
        <div v-if="paginator" class="caomei-data-table__pagination">
            <CaomeiPaginator
                :page="currentPagination.pageIndex + 1"
                :items-per-page="currentPagination.pageSize"
                :total="totalRows"
                @update:page="goToPage"
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
    z-index: 3;
}

.caomei-data-table__td.caomei-data-table__cell--pinned-start,
.caomei-data-table__td.caomei-data-table__cell--pinned-end {
    position: sticky;
    z-index: 2;
    background: inherit;
}

.caomei-data-table__loading {
    color: var(--caomei-color-primary);
}
</style>
