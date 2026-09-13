<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiDataTable } from '@/components/data-table'
import type { DataTableColumn, DataTableSortEvent, DataTableSortOrder } from '@/components/data-table'

interface User {
    id: number
    name: string
    age: number
}

const columns: DataTableColumn<User>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'age', header: 'Age', sortable: true, align: 'right' },
]

const data: User[] = [
    { id: 1, name: 'Ada', age: 32 },
    { id: 2, name: 'Bob', age: 24 },
    { id: 3, name: 'Cara', age: 41 },
]

const sortField = ref('')
const sortOrder = ref<DataTableSortOrder>('asc')

function onSort(event: DataTableSortEvent): void {
    sortField.value = event.sortField
    if (event.sortOrder) {
        sortOrder.value = event.sortOrder
    }
}
</script>

<template>
    <div class="demo-stack">
        <CaomeiDataTable
            :data="data"
            :columns="columns"
            row-key="id"
            :sort-field="sortField"
            :sort-order="sortOrder"
            caption="Members (controlled sorting)"
            @sort="onSort"
        />
        <p class="demo-hint">
            Current sort: {{ sortField || 'none' }} {{ sortField ? sortOrder : '' }}
        </p>
    </div>
</template>

<style scoped>
.demo-stack {
    display: grid;
    gap: 12px;
}

.demo-hint {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: 13px;
}
</style>
