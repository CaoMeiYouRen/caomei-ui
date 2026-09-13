<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiMultiSelect } from '@/components/multi-select'

const options = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
]

const selected = ref<string[]>(['apple'])
</script>

<template>
    <div class="demo-column">
        <CaomeiMultiSelect
            v-model="selected"
            :options="options"
            placeholder="Remove selected values"
        />
        <CaomeiMultiSelect
            :options="options"
            :model-value="['apple']"
            disabled
            placeholder="Disabled"
        />
        <CaomeiMultiSelect
            :options="options"
            :model-value="['apple']"
            invalid
            placeholder="Invalid"
        />
        <CaomeiMultiSelect
            :options="options"
            size="lg"
            placeholder="Large"
        />
        <CaomeiMultiSelect
            :options="options"
            body-lock
            placeholder="Lock page scroll when open (bodyLock)"
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
