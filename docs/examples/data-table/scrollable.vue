<script setup lang="ts">
import { CaomeiDataTable } from '@/components/data-table'
import type { DataTableColumn } from '@/components/data-table'

interface Order {
    id: number
    customer: string
    city: string
    amount: number
}

const columns: DataTableColumn<Order>[] = [
    { key: 'customer', header: '客户', width: '160px' },
    { key: 'city', header: '城市', width: '120px' },
    { key: 'amount', header: '金额', align: 'right', width: '120px' },
]

const data: Order[] = Array.from({ length: 24 }, (_, index) => ({
    id: index + 1,
    customer: `客户 ${index + 1}`,
    city: ['杭州', '上海', '北京'][index % 3] as string,
    amount: (index + 1) * 128,
}))
</script>

<template>
    <CaomeiDataTable
        :data="data"
        :columns="columns"
        row-key="id"
        caption="订单（固定表头）"
        scrollable
        :scroll-height="240"
        paginator
        :rows="10"
        :total-records="data.length"
    />
</template>
