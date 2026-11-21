<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTransfer } from '@/components/transfer'

const target = ref<(string | number)[]>(['read'])
const dataSource = [
    { label: 'Read', value: 'read' },
    { label: 'Write', value: 'write' },
    { label: 'Delete', value: 'delete' },
    { label: 'Export', value: 'export' },
]
</script>

<template>
    <CaomeiTransfer
        v-model="target"
        :data-source="dataSource"
        label="Permissions"
    />
</template>
