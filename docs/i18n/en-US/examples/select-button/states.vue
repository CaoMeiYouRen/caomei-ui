<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSelectButton } from '@/components/select-button'

const size = ref<string | number>('md')

const sizeOptions = [
    { label: 'Compact', value: 'sm' },
    { label: 'Standard', value: 'md' },
    { label: 'Spacious', value: 'lg' },
]

const partialOptions = [
    { label: 'Enabled', value: 'on' },
    { label: 'Disabled', value: 'off', disabled: true },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiSelectButton
            v-model="size"
            :options="sizeOptions"
            label="Size"
        />
        <CaomeiSelectButton
            :options="partialOptions"
            :model-value="'on'"
            label="With a disabled item"
        />
        <CaomeiSelectButton
            :options="sizeOptions"
            :model-value="'md'"
            disabled
            label="Whole group disabled"
        />
        <CaomeiSelectButton
            :options="sizeOptions"
            :model-value="'sm'"
            invalid
            label="Invalid"
        />
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
}
</style>
