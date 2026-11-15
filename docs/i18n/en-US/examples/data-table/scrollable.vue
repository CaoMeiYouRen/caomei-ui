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
    { key: 'customer', header: 'Customer', width: '160px' },
    { key: 'city', header: 'City', width: '120px' },
    { key: 'amount', header: 'Amount', align: 'right', width: '120px' },
]

const data: Order[] = Array.from({ length: 24 }, (_, index) => ({
    id: index + 1,
    customer: `Customer ${index + 1}`,
    city: ['Hangzhou', 'Shanghai', 'Beijing'][index % 3] as string,
    amount: (index + 1) * 128,
}))
</script>

<template>
    <CaomeiDataTable
        :data="data"
        :columns="columns"
        row-key="id"
        caption="Orders (fixed header)"
        scrollable
        :scroll-height="240"
        paginator
        :rows="10"
        :total-records="data.length"
    />
</template>
