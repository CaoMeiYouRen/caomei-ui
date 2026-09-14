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

const data: User[] = [
    { id: 1, name: '张三', age: 32 },
    { id: 2, name: '李四', age: 24 },
    { id: 3, name: '王五', age: 41 },
]

const selection = ref<User[]>([])
</script>

<template>
    <div class="demo-stack">
        <CaomeiDataTable
            v-model:selection="selection"
            selection-mode="multiple"
            :data="data"
            :columns="columns"
            row-key="id"
            caption="多选成员"
        />
        <p class="demo-hint">
            已选 {{ selection.length }} 人
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
