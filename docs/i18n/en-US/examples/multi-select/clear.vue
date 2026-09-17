<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiMultiSelect } from '@/components/multi-select'

const value = ref<string[]>(['apple', 'banana'])

const options = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiMultiSelect
            v-model="value"
            :options="options"
            show-clear
            placeholder="Select fruits"
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
