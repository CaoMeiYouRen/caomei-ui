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
    { key: 'name', header: '姓名', sortable: true },
    { key: 'age', header: '年龄', sortable: true, align: 'right' },
]

const data: User[] = [
    { id: 1, name: '张三', age: 32 },
    { id: 2, name: '李四', age: 24 },
    { id: 3, name: '王五', age: 41 },
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
            caption="成员年龄（受控排序）"
            @sort="onSort"
        />
        <p class="demo-hint">
            当前排序：{{ sortField || '无' }} {{ sortField ? sortOrder : '' }}
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
