<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaomeiDataTable } from '@/components/data-table'
import type { DataTableColumn, DataTableSortMeta } from '@/components/data-table'

interface Member {
    dept: string
    name: string
    score: number
}

const columns: DataTableColumn<Member>[] = [
    { key: 'dept', header: 'Department', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'score', header: 'Score', sortable: true, align: 'right' },
]

const data: Member[] = [
    { dept: 'Engineering', name: 'Ada', score: 88 },
    { dept: 'Engineering', name: 'Bob', score: 92 },
    { dept: 'Design', name: 'Cara', score: 75 },
    { dept: 'Design', name: 'Dan', score: 81 },
]

/** Controlled multi-column sorting: department ascending, then score descending within a department */
const multiSortMeta = ref<DataTableSortMeta[]>([
    { field: 'dept', order: 1 },
    { field: 'score', order: -1 },
])

const sortText = computed(() =>
    multiSortMeta.value.length === 0
        ? 'none'
        : multiSortMeta.value
                .map((meta) => `${meta.field} ${meta.order === 1 ? 'asc' : 'desc'}`)
                .join(' → '),
)
</script>

<template>
    <div class="demo-stack">
        <CaomeiDataTable
            v-model:multi-sort-meta="multiSortMeta"
            :data="data"
            :columns="columns"
            row-key="name"
            sort-mode="multiple"
            caption="Team members (multi-column sorting)"
        />
        <p class="demo-hint">
            Current sort: {{ sortText }} (hold Cmd / Ctrl while clicking a header to append a sort key)
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
