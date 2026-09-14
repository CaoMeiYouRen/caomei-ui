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
    { key: 'name', header: 'Name' },
    { key: 'age', header: 'Age', align: 'right' },
]

const data: User[] = [
    { id: 1, name: 'Ada', age: 32 },
    { id: 2, name: 'Bob', age: 24 },
    { id: 3, name: 'Cara', age: 41 },
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
            caption="Members (multi-select)"
        />
        <p class="demo-hint">
            Selected: {{ selection.length }}
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
