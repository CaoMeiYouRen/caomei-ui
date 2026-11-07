<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiDataTable, type DataTableColumn } from '@/components/data-table'

const selection = ref<{ name: string, qty: number }[]>([])
const columns: DataTableColumn<{ name: string, qty: number }>[] = [
    { key: 'name', header: '名称' },
    { key: 'qty', header: '数量', align: 'right' },
]
const rows = [
    { name: '草稿一', qty: 12 },
    { name: '草稿二', qty: 8 },
    { name: '草稿三', qty: 30 },
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
            已选 {{ selection.length }} 项
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

/* 紧凑密度：只覆盖 token，不写单元格选择器 */
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
