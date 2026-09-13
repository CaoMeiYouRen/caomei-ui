<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSelectButton } from '@/components/select-button'

const size = ref<string | number>('md')

const sizeOptions = [
    { label: '紧凑', value: 'sm' },
    { label: '标准', value: 'md' },
    { label: '宽松', value: 'lg' },
]

const partialOptions = [
    { label: '可用', value: 'on' },
    { label: '禁用', value: 'off', disabled: true },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiSelectButton
            v-model="size"
            :options="sizeOptions"
            label="尺寸"
        />
        <CaomeiSelectButton
            :options="partialOptions"
            :model-value="'on'"
            label="含禁用项"
        />
        <CaomeiSelectButton
            :options="sizeOptions"
            :model-value="'md'"
            disabled
            label="整组禁用"
        />
        <CaomeiSelectButton
            :options="sizeOptions"
            :model-value="'sm'"
            invalid
            label="校验失败"
        />
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
}
</style>
