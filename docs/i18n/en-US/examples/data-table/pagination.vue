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

const data: User[] = Array.from({ length: 23 }, (_, index) => ({
    id: index + 1,
    name: `Member ${index + 1}`,
    age: 20 + (index % 20),
}))

const page = ref(1)
const rows = ref(5)
</script>

<template>
    <div class="demo-stack">
        <CaomeiDataTable
            v-model:page="page"
            v-model:rows="rows"
            :data="data"
            :columns="columns"
            row-key="id"
            paginator
            :rows-per-page-options="[5, 10, 20]"
            caption="Members"
        />
        <p class="demo-hint">
            Page {{ page }}, {{ rows }} rows per page
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
