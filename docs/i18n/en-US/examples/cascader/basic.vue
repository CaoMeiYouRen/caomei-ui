<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiCascader } from '@/components/cascader'

const value = ref<(string | number)[]>([])
const options = [
    {
        label: 'Zhejiang',
        value: 'zhejiang',
        children: [
            { label: 'Hangzhou', value: 'hangzhou' },
            { label: 'Ningbo', value: 'ningbo' },
        ],
    },
    {
        label: 'Jiangsu',
        value: 'jiangsu',
        children: [
            { label: 'Nanjing', value: 'nanjing' },
            { label: 'Suzhou', value: 'suzhou' },
        ],
    },
]
</script>

<template>
    <CaomeiCascader
        v-model="value"
        :options="options"
        placeholder="Select a region"
        label="Region"
    />
</template>
