<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSelect } from '@/components/select'

const value = ref<string>('apple')

const options = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '樱桃', value: 'cherry' },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiSelect
            v-model="value"
            label="水果（小尺寸）"
            size="sm"
            :options="options"
            placeholder="小尺寸"
        />
        <CaomeiSelect
            v-model="value"
            label="水果（中尺寸）"
            size="md"
            :options="options"
            placeholder="中尺寸（默认）"
        />
        <CaomeiSelect
            v-model="value"
            label="水果（大尺寸）"
            size="lg"
            :options="options"
            placeholder="大尺寸"
        />
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}
</style>
