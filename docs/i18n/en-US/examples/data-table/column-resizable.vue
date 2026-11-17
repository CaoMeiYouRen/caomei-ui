<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiDataTable } from '@/components/data-table'
import type { DataTableColumn } from '@/components/data-table'

interface Row {
    id: number
    name: string
    city: string
    note: string
}

const columns: DataTableColumn<Row>[] = [
    { key: 'name', header: 'Name', width: '120px' },
    { key: 'city', header: 'City', width: '120px' },
    { key: 'note', header: 'Note' },
]

const data: Row[] = [
    { id: 1, name: 'Alice', city: 'Hangzhou', note: 'Long-term' },
    { id: 2, name: 'Bob', city: 'Shanghai', note: 'Quarterly review' },
]

/** Drag, arrow keys and double-click reset all write this object back (controlled) */
const columnSizing = ref<Record<string, number>>({ name: 200, city: 120, note: 260 })
</script>

<template>
    <CaomeiDataTable
        v-model:column-sizing="columnSizing"
        :data="data"
        :columns="columns"
        resizable-columns
        caption="Resize columns by dragging the header"
    />
</template>
