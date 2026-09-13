<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaomeiMultiSelect } from '@/components/multi-select'

const options = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Durian', value: 'durian', disabled: true },
    { label: 'Elderberry', value: 'elderberry' },
    { label: 'Fig', value: 'fig' },
]

const selected = ref<string[]>(['apple', 'banana'])
const count = computed(() => selected.value.length)
</script>

<template>
    <div class="demo-column">
        <CaomeiMultiSelect
            v-model="selected"
            :options="options"
            label="Fruit"
            placeholder="Select fruits"
        />
        <span class="demo-text">{{ count }} selected; type to filter after opening</span>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

.demo-text {
    color: var(--caomei-color-text-muted);
    font-size: 14px;
}
</style>
