<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTransfer } from '@/components/transfer'

const target = ref<(string | number)[]>(['read'])
const dataSource = [
    { label: '读取', value: 'read' },
    { label: '写入', value: 'write' },
    { label: '删除', value: 'delete' },
    { label: '导出', value: 'export' },
]
</script>

<template>
    <CaomeiTransfer
        v-model="target"
        :data-source="dataSource"
        label="权限分配"
    />
</template>
