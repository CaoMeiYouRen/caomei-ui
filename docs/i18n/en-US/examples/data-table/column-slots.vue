<script setup lang="ts">
import { CaomeiDataTable } from '@/components/data-table'
import type { DataTableColumn } from '@/components/data-table'
import { CaomeiTag } from '@/components/tag'

interface Task {
    id: number
    title: string
    status: 'done' | 'running'
    owner: string
}

const columns: DataTableColumn<Task>[] = [
    { key: 'title', header: 'Task', sortable: true },
    { key: 'status', header: 'Status', align: 'center', width: '104px' },
    { key: 'owner', header: 'Owner', width: '140px' },
]

const data: Task[] = [
    { id: 1, title: 'Migrate DataTable', status: 'running', owner: 'Alice' },
    { id: 2, title: 'Fill icon mapping', status: 'done', owner: 'Bob' },
]
</script>

<template>
    <CaomeiDataTable
        :data="data"
        :columns="columns"
        row-key="id"
    >
        <template #cell-status="{value}">
            <CaomeiTag :tone="value === 'done' ? 'success' : 'primary'">
                {{ value === 'done' ? 'Done' : 'Running' }}
            </CaomeiTag>
        </template>
        <template #cell-owner="{row}">
            {{ row.owner }}
        </template>
        <template #header-owner="{column}">
            <em>{{ column.header }} (in order)</em>
        </template>
    </CaomeiDataTable>
</template>
