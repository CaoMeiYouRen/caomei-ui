<script setup lang="ts">
import { CaomeiDataTable } from '@/components/data-table'
import type { DataTableColumn } from '@/components/data-table'

interface Item {
    id: number
    name: string
    quantity: number
    price: number
}

const columns: DataTableColumn<Item>[] = [
    { key: 'name', header: 'Item' },
    { key: 'quantity', header: 'Quantity', align: 'right', width: '80px' },
    { key: 'price', header: 'Price', align: 'right', width: '96px' },
]

const data: Item[] = [
    { id: 1, name: 'Apple', quantity: 3, price: 6 },
    { id: 2, name: 'Banana', quantity: 5, price: 3 },
    { id: 3, name: 'Cherry', quantity: 2, price: 18 },
    { id: 4, name: 'Grape', quantity: 1, price: 12 },
]
</script>

<template>
    <CaomeiDataTable
        :data="data"
        :columns="columns"
        row-key="id"
        striped
    />
</template>
