<script setup lang="ts" generic="T extends object">
import { FlexRender, useTable, type ColumnDef, type SortingState, type Updater } from '@tanstack/vue-table'
import { ChevronDown, ChevronUp } from '@lucide/vue'
import { computed, type CSSProperties } from 'vue'
import { defaultLocaleMessages } from '../../locale'
import { dataTableFeatures } from './table-features'
import type { DataTableProps, DataTableSortEvent } from './types'

defineOptions({ name: 'CaomeiDataTable' })

const props = withDefaults(defineProps<DataTableProps<T>>(), {
    rowKey: undefined,
    emptyText: defaultLocaleMessages.table.empty,
    caption: '',
    hoverable: true,
    striped: false,
    sortField: undefined,
    sortOrder: 'asc',
    loading: false,
    loadingText: defaultLocaleMessages.progress.loading,
})

const emit = defineEmits<{
    sort: [event: DataTableSortEvent]
}>()

defineSlots<{
    empty?: () => unknown
}>()

const columnMap = computed(() => new Map(props.columns.map((column) => [column.key, column])))

function resolveRowKey(row: T, index: number): string {
    const key = props.rowKey
    if (typeof key === 'function') {
        return String(key(row, index))
    }
    if (typeof key === 'string') {
        return String((row as Record<string, unknown>)[key] ?? index)
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

const tableColumns = computed<Array<ColumnDef<typeof dataTableFeatures, T>>>(() =>
    props.columns.map((column) => ({
        id: column.key,
        header: column.header ?? column.key,
        enableSorting: Boolean(column.sortable),
        sortFn: column.sortable ? (column.sortFn ?? 'alphanumeric') : undefined,
        accessorFn: (row: T) => {
            if (typeof column.accessor === 'function') {
                return column.accessor(row)
            }
            return getByPath(row, column.accessor ?? column.key)
        },
        cell: (info) => {
            if (column.cell) {
                return column.cell({
                    row: info.row.original,
                    value: info.getValue(),
                    index: info.row.index,
                })
            }
            const value = info.getValue()
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

const table = useTable({
    features: dataTableFeatures,
    columns: tableColumns,
    data: computed(() => props.data),
    getRowId: (row: T, index: number) => resolveRowKey(row, index),
    sortDescFirst: false,
    ...(isSortControlled.value
        ? {
                state: computed(() => ({ sorting: sortingState.value })),
                onSortingChange: (updater: Updater<SortingState>) => {
                    const next = typeof updater === 'function' ? updater(sortingState.value) : updater
                    const first = next[0]
                    emit('sort', {
                        sortField: first?.id ?? '',
                        sortOrder: first ? (first.desc ? 'desc' : 'asc') : '',
                    } satisfies DataTableSortEvent)
                },
            }
        : {}),
})

const headerGroups = computed(() => table.getHeaderGroups())
const rows = computed(() => table.getRowModel().rows)
const isEmpty = computed(() => props.data.length === 0)

const rootClass = computed(() => ({
    'caomei-data-table--hoverable': props.hoverable,
    'caomei-data-table--striped': props.striped,
    'caomei-data-table--loading': props.loading,
}))

function alignClass(key: string): string {
    return `caomei-data-table__cell--${columnMap.value.get(key)?.align ?? 'left'}`
}

function columnStyle(key: string): CSSProperties | undefined {
    const def = columnMap.value.get(key)
    if (!def) {
        return undefined
    }
    return { ...def.headerStyle, width: def.width }
}

function cellStyle(key: string): CSSProperties | undefined {
    return columnMap.value.get(key)?.bodyStyle
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
</script>

<template>
    <div
        class="caomei-data-table"
        :class="rootClass"
        :aria-busy="loading || undefined"
    >
        <table class="caomei-data-table__table">
            <caption v-if="caption" class="caomei-data-table__caption">
                {{ caption }}
            </caption>
            <thead>
                <tr v-for="headerGroup in headerGroups" :key="headerGroup.id">
                    <th
                        v-for="header in headerGroup.headers"
                        :key="header.id"
                        scope="col"
                        class="caomei-data-table__th"
                        :class="[alignClass(header.column.id), columnMap.get(header.column.id)?.headerClass]"
                        :style="columnStyle(header.column.id)"
                        :aria-sort="ariaSort(header.column.id)"
                    >
                        <button
                            v-if="isSortable(header.column.id)"
                            type="button"
                            class="caomei-data-table__sort"
                            @click="toggleSort(header.column.id)"
                        >
                            <span>{{ headerTitle(header.column.id) }}</span>
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
                        :colspan="Math.max(columns.length, 1)"
                    >
                        {{ loadingText }}
                    </td>
                </tr>
                <tr v-else-if="isEmpty" class="caomei-data-table__empty-row">
                    <td
                        class="caomei-data-table__empty"
                        :colspan="Math.max(columns.length, 1)"
                    >
                        <slot name="empty">
                            {{ emptyText }}
                        </slot>
                    </td>
                </tr>
                <template v-else>
                    <tr
                        v-for="row in rows"
                        :key="row.id"
                        class="caomei-data-table__row"
                    >
                        <td
                            v-for="cell in row.getAllCells()"
                            :key="cell.id"
                            class="caomei-data-table__td"
                            :class="[alignClass(cell.column.id), columnMap.get(cell.column.id)?.bodyClass]"
                            :style="cellStyle(cell.column.id)"
                        >
                            <FlexRender :cell="cell" />
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
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

.caomei-data-table__cell--right {
    text-align: right;
}

.caomei-data-table__row {
    background: var(--caomei-data-table-row-bg, transparent);
}

.caomei-data-table--striped .caomei-data-table__row:nth-child(even) {
    background: var(--caomei-data-table-striped-bg, var(--caomei-color-bg-elevated));
}

.caomei-data-table--hoverable .caomei-data-table__row:hover {
    background: var(--caomei-data-table-row-hover-bg, color-mix(in srgb, var(--caomei-color-text) 4%, transparent));
}

.caomei-data-table__empty,
.caomei-data-table__loading {
    padding: calc(var(--caomei-space-4) + var(--caomei-space-2)) var(--caomei-space-3);
    color: var(--caomei-color-text-muted);
    text-align: center;
}

.caomei-data-table__loading {
    color: var(--caomei-color-primary);
}
</style>
