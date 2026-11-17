<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiDataTable } from '@/components/data-table'
import type { DataTableColumn } from '@/components/data-table'

interface Row {
    id: number
    name: string
    city: string
    note: string
}

const columns: DataTableColumn<Row>[] = [
    { key: 'name', header: '姓名', width: '120px' },
    { key: 'city', header: '城市', width: '120px' },
    { key: 'note', header: '备注' },
]

const data: Row[] = [
    { id: 1, name: '张三', city: '杭州', note: '长期有效' },
    { id: 2, name: '李四', city: '上海', note: '按季度复核' },
]

/** 拖拽 / 方向键 / 双击复位都由组件回写该对象（受控） */
const columnSizing = ref<Record<string, number>>({ name: 200, city: 120, note: 260 })
</script>

<template>
    <CaomeiDataTable
        v-model:column-sizing="columnSizing"
        :data="data"
        :columns="columns"
        resizable-columns
        caption="表头拖拽调整列宽"
    />
</template>
