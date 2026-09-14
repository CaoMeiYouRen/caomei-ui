<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSelect } from '@/components/select'

interface Category {
    id: number
    name: string
}

const value = ref<number | null>(null)

const categories: Category[] = [
    { id: 1, name: '前端' },
    { id: 2, name: '后端' },
    { id: 3, name: '设计' },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiSelect
            v-model="value"
            :options="categories"
            option-label="name"
            option-value="id"
            placeholder="请选择分类"
        />
        <p class="demo-value">
            当前值：{{ value ?? '（空）' }}
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
