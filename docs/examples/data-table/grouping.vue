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
    { key: 'region', header: '地区' },
    { key: 'status', header: '状态' },
    { key: 'amount', header: '金额', align: 'right' },
]

const data: Order[] = [
    { id: 1, region: '华东', status: '已完成', amount: 1200 },
    { id: 2, region: '华东', status: '处理中', amount: 860 },
    { id: 3, region: '华北', status: '已完成', amount: 430 },
    { id: 4, region: '华南', status: '已完成', amount: 720 },
    { id: 5, region: '华南', status: '已取消', amount: 0 },
]

const groupField = ref<'region' | 'status'>('region')

/** 分组只在连续同值处切分，这里按当前分组键预排序以演示分组效果 */
const sortedData = computed(() =>
    [...data].sort((left, right) => left[groupField.value].localeCompare(right[groupField.value], 'zh-Hans-CN')),
)
</script>

<template>
    <div class="demo-stack">
        <div class="demo-controls">
            <span>分组键：</span>
            <button
                type="button"
                :aria-pressed="groupField === 'region'"
                @click="groupField = 'region'"
            >
                地区
            </button>
            <button
                type="button"
                :aria-pressed="groupField === 'status'"
                @click="groupField = 'status'"
            >
                状态
            </button>
        </div>
        <CaomeiDataTable
            :data="sortedData"
            :columns="columns"
            row-key="id"
            row-group-mode="subheader"
            :group-rows-by="groupField"
            caption="订单行分组"
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
