<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiMultiSelect } from '@/components/multi-select'

interface Category {
    id: number
    name: string
}

const value = ref<number[]>([1])

const categories: Category[] = [
    { id: 1, name: '前端' },
    { id: 2, name: '后端' },
    { id: 3, name: '设计' },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiMultiSelect
            v-model="value"
            :options="categories"
            option-label="name"
            option-value="id"
            placeholder="请选择分类"
        />
        <p class="demo-value">
            当前值：{{ value.length > 0 ? value.join('、') : '（空）' }}
        </p>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

.demo-value {
    margin: 0;
    font-size: 13px;
    color: var(--vp-c-text-2);
}
</style>
