<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiDataTable, type DataTableColumn } from '@/components/data-table'

const selection = ref<{ name: string, qty: number }[]>([])
const columns: DataTableColumn<{ name: string, qty: number }>[] = [
    { key: 'name', header: 'Name' },
    { key: 'qty', header: 'Quantity', align: 'right' },
]
const rows = [
    { name: 'Draft one', qty: 12 },
    { name: 'Draft two', qty: 8 },
    { name: 'Draft three', qty: 30 },
]
</script>

<template>
    <div class="demo-column demo-compact">
        <CaomeiDataTable
            v-model:selection="selection"
            selection-mode="multiple"
            :columns="columns"
            :data="rows"
            row-key="name"
        />
        <span class="demo-text">
            {{ selection.length }} selected
        </span>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

/* Compact density: override tokens only, no cell selectors */
.demo-compact {
    --caomei-data-table-cell-padding-block: 4px;
    --caomei-data-table-cell-padding-inline: 8px;
    --caomei-data-table-selection-column-width: 48px;
    --caomei-data-table-selection-cell-padding-inline: 4px;
}

.demo-text {
    color: var(--caomei-color-text-muted);
    font-size: 13px;
}
</style>
