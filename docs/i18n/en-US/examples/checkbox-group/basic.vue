<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaomeiCheckboxGroup } from '@/components/checkbox-group'

const fruits = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Durian', value: 'durian', disabled: true },
]

const selected = ref<string[]>(['apple'])
const selectedLabels = computed(() =>
    fruits.filter((item) => selected.value.includes(item.value)).map((item) => item.label),
)
</script>

<template>
    <div class="demo-col">
        <CaomeiCheckboxGroup
            v-model="selected"
            :options="fruits"
            label="Fruits"
        />
        <p class="demo-state">
            Selected: {{ selectedLabels.join(', ') || 'none' }}
        </p>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.demo-state {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: 14px;
}
</style>
