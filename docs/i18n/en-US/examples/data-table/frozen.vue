<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiDataTable } from '@/components/data-table'
import type { DataTableColumn } from '@/components/data-table'

interface Member {
    id: number
    name: string
    email: string
    role: string
    department: string
    city: string
    updatedAt: string
    note: string
    actions: string
    status: string
}

const columns: DataTableColumn<Member>[] = [
    { key: 'name', header: 'Name', width: '120px', frozen: 'left' },
    { key: 'email', header: 'Email', width: '200px' },
    { key: 'role', header: 'Role', width: '120px' },
    { key: 'department', header: 'Department', width: '140px' },
    { key: 'city', header: 'City', width: '120px' },
    { key: 'note', header: 'Note', width: '220px' },
    { key: 'actions', header: 'Actions', width: '160px' },
    { key: 'updatedAt', header: 'Updated', width: '180px' },
    { key: 'status', header: 'Status', width: '100px', align: 'center', frozen: 'right' },
]

const data: Member[] = [
    { id: 1, name: 'Ada', email: 'ada@example.com', role: 'Admin', department: 'Engineering', city: 'Hangzhou', updatedAt: '2026-09-14 10:00', note: 'Synced', actions: 'Edit', status: 'Active' },
    { id: 2, name: 'Bob', email: 'bob@example.com', role: 'Editor', department: 'Content', city: 'Shanghai', updatedAt: '2026-09-13 18:30', note: 'Synced', actions: 'Edit', status: 'Active' },
    { id: 3, name: 'Cara', email: 'cara@example.com', role: 'Guest', department: 'Marketing', city: 'Beijing', updatedAt: '2026-09-12 09:15', note: 'Synced', actions: 'Edit', status: 'Disabled' },
]
const selection = ref<Member[]>([])

</script>

<template>
    <CaomeiDataTable
        v-model:selection="selection"
        :data="data"
        :columns="columns"
        row-key="id"
        selection-mode="multiple"
        caption="Frozen first and last columns (scroll horizontally)"
    />
</template>
