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
    { key: 'code', header: '订单号' },
    { key: 'amount', header: '金额', align: 'right' },
]

const data: Order[] = [
    { id: 1, code: 'A-1001', amount: 1280, items: ['键盘', '鼠标'] },
    { id: 2, code: 'A-1002', amount: 320, items: ['鼠标垫'] },
    { id: 3, code: 'B-2001', amount: 4600, items: ['显示器', '支架', '线材'] },
]

/** 受控展开集合（行 key，与 rowKey 口径一致）：初始展开首行 */
const expandedRows = ref<string[]>(['1'])
const lastEvent = ref('')

function onRowExpand(event: DataTableRowExpandEvent<Order>): void {
    lastEvent.value = `展开：${event.data.code}`
}

function onRowCollapse(event: DataTableRowExpandEvent<Order>): void {
    lastEvent.value = `收起：${event.data.code}`
}
</script>

<template>
    <div class="demo-stack">
        <CaomeiDataTable
            v-model:expanded-rows="expandedRows"
            :data="data"
            :columns="columns"
            row-key="id"
            caption="订单（行展开）"
            @row-expand="onRowExpand"
            @row-collapse="onRowCollapse"
        >
            <template #expansion="{data: order}">
                <div class="demo-detail">
                    <strong>{{ order.code }} 明细</strong>
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
            {{ lastEvent || '点击首列按钮展开行，展开区可承载任意嵌套内容' }}
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
