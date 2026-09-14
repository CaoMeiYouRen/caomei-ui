<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiMultiSelect } from '@/components/multi-select'

interface Category {
    id: number
    name: string
}

const value = ref<number[]>([1])

const categories: Category[] = [
    { id: 1, name: 'Frontend' },
    { id: 2, name: 'Backend' },
    { id: 3, name: 'Design' },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiMultiSelect
            v-model="value"
            :options="categories"
            option-label="name"
            option-value="id"
            placeholder="Select categories"
        />
        <p class="demo-value">
            Value: {{ value.length > 0 ? value.join(', ') : '(empty)' }}
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
