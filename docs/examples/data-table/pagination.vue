<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiDataTable } from '@/components/data-table'
import type { DataTableColumn } from '@/components/data-table'

interface User {
    id: number
    name: string
    age: number
}

const columns: DataTableColumn<User>[] = [
    { key: 'name', header: '姓名' },
    { key: 'age', header: '年龄', align: 'right' },
]

const data: User[] = Array.from({ length: 23 }, (_, index) => ({
    id: index + 1,
    name: `成员 ${index + 1}`,
    age: 20 + (index % 20),
}))

const page = ref(1)
</script>

<template>
    <div class="demo-stack">
        <CaomeiDataTable
            v-model:page="page"
            :data="data"
            :columns="columns"
            row-key="id"
            paginator
            :rows="5"
            caption="分页成员"
        />
        <p class="demo-hint">
            第 {{ page }} 页
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
