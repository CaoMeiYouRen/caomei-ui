<script setup lang="ts" generic="T extends object">
import { FlexRender, useTable, type ColumnDef } from '@tanstack/vue-table'
import { computed } from 'vue'
import { defaultLocaleMessages } from '../../locale'
import { dataTableFeatures } from './table-features'
import type { DataTableProps } from './types'

defineOptions({ name: 'CaomeiDataTable' })

const props = withDefaults(defineProps<DataTableProps<T>>(), {
    rowKey: undefined,
    emptyText: defaultLocaleMessages.table.empty,
    caption: '',
    hoverable: true,
    striped: false,
})

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

const tableColumns = computed<Array<ColumnDef<typeof dataTableFeatures, T>>>(() =>
    props.columns.map((column) => ({
        id: column.key,
        header: column.header ?? column.key,
        accessorFn: (row: T) => {
            if (typeof column.accessor === 'function') {
                return column.accessor(row)
            }
            const field = column.accessor ?? column.key
            return (row as Record<string, unknown>)[field]
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

const table = useTable({
    features: dataTableFeatures,
    columns: tableColumns,
    data: computed(() => props.data),
    getRowId: (row: T, index: number) => resolveRowKey(row, index),
})

const headerGroups = computed(() => table.getHeaderGroups())
const rows = computed(() => table.getRowModel().rows)
const isEmpty = computed(() => props.data.length === 0)

const rootClass = computed(() => ({
    'caomei-data-table--hoverable': props.hoverable,
    'caomei-data-table--striped': props.striped,
}))

function alignClass(key: string): string {
    return `caomei-data-table__cell--${columnMap.value.get(key)?.align ?? 'left'}`
}

function columnStyle(key: string): Record<string, string> | undefined {
    const width = columnMap.value.get(key)?.width
    return width ? { width } : undefined
}
</script>

<template>
    <div class="caomei-data-table" :class="rootClass">
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
                        :class="alignClass(header.column.id)"
                        :style="columnStyle(header.column.id)"
                    >
                        <FlexRender v-if="!header.isPlaceholder" :header="header" />
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="isEmpty" class="caomei-data-table__empty-row">
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
                            :class="alignClass(cell.column.id)"
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

.caomei-data-table__empty {
    padding: calc(var(--caomei-space-4) + var(--caomei-space-2)) var(--caomei-space-3);
    color: var(--caomei-color-text-muted);
    text-align: center;
}
</style>
