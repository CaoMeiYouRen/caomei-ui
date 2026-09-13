<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiCheckbox } from '@/components/checkbox'
import type { CheckboxState } from '@/components/checkbox'

const fruits = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
]

const selected = ref<string[]>(['apple'])

function isSelected(value: string): boolean {
    return selected.value.includes(value)
}

function toggle(value: string, state: CheckboxState | undefined): void {
    if (state === true) {
        selected.value = [...selected.value, value]
    } else {
        selected.value = selected.value.filter((item) => item !== value)
    }
}
</script>

<template>
    <div class="demo-col">
        <CaomeiCheckbox
            v-for="item in fruits"
            :key="item.value"
            :model-value="isSelected(item.value)"
            :text="item.label"
            @update:model-value="(state) => toggle(item.value, state)"
        />
        <p class="demo-state">
            Selected: {{ selected.join(', ') || 'none' }}
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
