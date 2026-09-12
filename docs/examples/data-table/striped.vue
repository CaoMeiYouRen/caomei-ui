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
    { key: 'name', header: '商品' },
    { key: 'quantity', header: '数量', align: 'right', width: '80px' },
    { key: 'price', header: '单价', align: 'right', width: '96px' },
]

const data: Item[] = [
    { id: 1, name: '苹果', quantity: 3, price: 6 },
    { id: 2, name: '香蕉', quantity: 5, price: 3 },
    { id: 3, name: '樱桃', quantity: 2, price: 18 },
    { id: 4, name: '葡萄', quantity: 1, price: 12 },
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
