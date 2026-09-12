<script setup lang="ts">
import { CaomeiDataTable } from '@/components/data-table'
import type { DataTableColumn } from '@/components/data-table'

interface User {
    id: number
    name: string
    role: 'admin' | 'member'
    score: number
}

const columns: DataTableColumn<User>[] = [
    { key: 'name', header: '姓名' },
    {
        key: 'role',
        header: '角色',
        align: 'center',
        cell: ({ value }) => (value === 'admin' ? '管理员' : '成员'),
    },
    {
        key: 'score',
        header: '评分',
        align: 'right',
        width: '96px',
        accessor: (row) => `${row.score} 分`,
    },
]

const data: User[] = [
    { id: 1, name: '张三', role: 'admin', score: 92 },
    { id: 2, name: '李四', role: 'member', score: 78 },
]
</script>

<template>
    <CaomeiDataTable
        :data="data"
        :columns="columns"
        row-key="id"
    />
</template>
