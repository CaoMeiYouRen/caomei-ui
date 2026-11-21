<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiCascader } from '@/components/cascader'

const value = ref<(string | number)[]>([])
const options = [
    {
        label: '浙江',
        value: 'zhejiang',
        children: [
            { label: '杭州', value: 'hangzhou' },
            { label: '宁波', value: 'ningbo' },
        ],
    },
    {
        label: '江苏',
        value: 'jiangsu',
        children: [
            { label: '南京', value: 'nanjing' },
            { label: '苏州', value: 'suzhou' },
        ],
    },
]
</script>

<template>
    <CaomeiCascader
        v-model="value"
        :options="options"
        placeholder="请选择省市"
        label="所在地区"
    />
</template>
