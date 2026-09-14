<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiAutoComplete } from '@/components/auto-complete'

const value = ref('')

const options = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Durian', value: 'durian', disabled: true },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiAutoComplete
            v-model="value"
            :options="options"
            placeholder="Search or type a fruit"
            label="Fruit"
            dropdown
        />
        <p class="demo-value">
            Current value: {{ value || '(empty)' }}
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
