<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSelect } from '@/components/select'

interface Category {
    id: number
    name: string
}

const value = ref<number | null>(null)

const categories: Category[] = [
    { id: 1, name: 'Frontend' },
    { id: 2, name: 'Backend' },
    { id: 3, name: 'Design' },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiSelect
            v-model="value"
            :options="categories"
            option-label="name"
            option-value="id"
            placeholder="Select a category"
        />
        <p class="demo-value">
            Value: {{ value ?? '(empty)' }}
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
