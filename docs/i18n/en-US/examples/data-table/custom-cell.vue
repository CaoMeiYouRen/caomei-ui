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
    { key: 'name', header: 'Name' },
    {
        key: 'role',
        header: 'Role',
        align: 'center',
        cell: ({ value }) => (value === 'admin' ? 'Admin' : 'Member'),
    },
    {
        key: 'score',
        header: 'Score',
        align: 'right',
        width: '96px',
        accessor: (row) => `${row.score} pts`,
    },
]

const data: User[] = [
    { id: 1, name: 'Alice', role: 'admin', score: 92 },
    { id: 2, name: 'Bob', role: 'member', score: 78 },
]
</script>

<template>
    <CaomeiDataTable
        :data="data"
        :columns="columns"
        row-key="id"
    />
</template>
