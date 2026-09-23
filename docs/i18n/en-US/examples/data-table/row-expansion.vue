<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiDataTable } from '@/components/data-table'
import type { DataTableColumn, DataTableRowExpandEvent } from '@/components/data-table'

interface Order {
    id: number
    code: string
    amount: number
    items: string[]
}

const columns: DataTableColumn<Order>[] = [
    { key: 'expand', expander: true, width: '48px' },
    { key: 'code', header: 'Order' },
    { key: 'amount', header: 'Amount', align: 'right' },
]

const data: Order[] = [
    { id: 1, code: 'A-1001', amount: 1280, items: ['Keyboard', 'Mouse'] },
    { id: 2, code: 'A-1002', amount: 320, items: ['Mouse pad'] },
    { id: 3, code: 'B-2001', amount: 4600, items: ['Monitor', 'Stand', 'Cable'] },
]

/** Controlled expanded set (row keys, same shape as rowKey): start with the first row open */
const expandedRows = ref<string[]>(['1'])
const lastEvent = ref('')

function onRowExpand(event: DataTableRowExpandEvent<Order>): void {
    lastEvent.value = `Expanded: ${event.data.code}`
}

function onRowCollapse(event: DataTableRowExpandEvent<Order>): void {
    lastEvent.value = `Collapsed: ${event.data.code}`
}
</script>

<template>
    <div class="demo-stack">
        <CaomeiDataTable
            v-model:expanded-rows="expandedRows"
            :data="data"
            :columns="columns"
            row-key="id"
            caption="Orders (row expansion)"
            @row-expand="onRowExpand"
            @row-collapse="onRowCollapse"
        >
            <template #expansion="{data: order}">
                <div class="demo-detail">
                    <strong>{{ order.code }} items</strong>
                    <ul class="demo-detail__items">
                        <li
                            v-for="item in order.items"
                            :key="item"
                        >
                            {{ item }}
                        </li>
                    </ul>
                </div>
            </template>
        </CaomeiDataTable>
        <p class="demo-hint">
            {{ lastEvent || 'Use the first-column button to expand a row; the area holds arbitrary nested content' }}
        </p>
    </div>
</template>

<style scoped>
.demo-stack {
    display: grid;
    gap: 12px;
}

.demo-detail {
    display: grid;
    gap: 4px;
}

.demo-detail__items {
    margin: 0;
    padding-left: 18px;
}

.demo-hint {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: 13px;
}
</style>
