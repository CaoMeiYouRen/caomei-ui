<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaomeiDataTable } from '@/components/data-table'
import type { DataTableColumn } from '@/components/data-table'

interface Order {
    id: number
    region: string
    status: string
    amount: number
}

const columns: DataTableColumn<Order>[] = [
    { key: 'region', header: 'Region' },
    { key: 'status', header: 'Status' },
    { key: 'amount', header: 'Amount', align: 'right' },
]

const data: Order[] = [
    { id: 1, region: 'East', status: 'Done', amount: 1200 },
    { id: 2, region: 'East', status: 'Processing', amount: 860 },
    { id: 3, region: 'North', status: 'Done', amount: 430 },
    { id: 4, region: 'South', status: 'Done', amount: 720 },
    { id: 5, region: 'South', status: 'Cancelled', amount: 0 },
]

const groupField = ref<'region' | 'status'>('region')

/** Groups only split on contiguous equal values, so pre-sort by the active group key here */
const sortedData = computed(() =>
    [...data].sort((left, right) => left[groupField.value].localeCompare(right[groupField.value], 'en-US')),
)
</script>

<template>
    <div class="demo-stack">
        <div class="demo-controls">
            <span>Group by:</span>
            <button
                type="button"
                :aria-pressed="groupField === 'region'"
                @click="groupField = 'region'"
            >
                Region
            </button>
            <button
                type="button"
                :aria-pressed="groupField === 'status'"
                @click="groupField = 'status'"
            >
                Status
            </button>
        </div>
        <CaomeiDataTable
            :data="sortedData"
            :columns="columns"
            row-key="id"
            row-group-mode="subheader"
            :group-rows-by="groupField"
            caption="Orders grouped by rows"
        >
            <template #groupheader="{groupValue}">
                <span class="demo-group">{{ groupValue }}</span>
            </template>
        </CaomeiDataTable>
    </div>
</template>

<style scoped>
.demo-stack {
    display: grid;
    gap: 12px;
}

.demo-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
}

.demo-controls button {
    padding: 2px 10px;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-sm);
    background: var(--caomei-color-bg);
    color: inherit;
    font: inherit;
    cursor: pointer;
}

.demo-controls button[aria-pressed='true'] {
    border-color: var(--caomei-color-primary);
    color: var(--caomei-color-primary);
}

.demo-group {
    font-weight: 600;
}
</style>
