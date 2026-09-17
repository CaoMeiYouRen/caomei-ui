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
    { key: 'title', header: '任务', sortable: true },
    { key: 'status', header: '状态', align: 'center', width: '96px' },
    { key: 'owner', header: '负责人', width: '120px' },
]

const data: Task[] = [
    { id: 1, title: '迁移 DataTable', status: 'running', owner: '张三' },
    { id: 2, title: '补齐图标映射', status: 'done', owner: '李四' },
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
                {{ value === 'done' ? '已完成' : '进行中' }}
            </CaomeiTag>
        </template>
        <template #cell-owner="{row}">
            {{ row.owner }}
        </template>
        <template #header-owner="{column}">
            <em>{{ column.header }}（按顺序）</em>
        </template>
    </CaomeiDataTable>
</template>
