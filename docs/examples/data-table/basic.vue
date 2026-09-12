<script setup lang="ts">
import { CaomeiDataTable } from '@/components/data-table'
import type { DataTableColumn } from '@/components/data-table'

interface User {
    id: number
    name: string
    email: string
}

const columns: DataTableColumn<User>[] = [
    { key: 'name', header: '姓名' },
    { key: 'email', header: '邮箱' },
]

const data: User[] = [
    { id: 1, name: '张三', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', email: 'lisi@example.com' },
    { id: 3, name: '王五', email: 'wangwu@example.com' },
]
</script>

<template>
    <CaomeiDataTable
        :data="data"
        :columns="columns"
        row-key="id"
        caption="团队成员"
    />
</template>
