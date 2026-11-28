<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiPicker } from '@/components/picker'
import type { PickerColumn } from '@/components/picker'

const columns: PickerColumn[] = [
    {
        label: 'Province',
        options: [
            { label: 'Zhejiang', value: 'zj' },
            { label: 'Jiangsu', value: 'js' },
        ],
    },
    {
        label: 'City',
        options: [
            { label: 'Hangzhou', value: 'hz' },
            { label: 'Nanjing', value: 'nj' },
            { label: 'Suzhou', value: 'sz' },
        ],
    },
]

const value = ref<(string | number)[]>(['zj', 'hz'])
</script>

<template>
    <div class="picker-demo">
        <CaomeiPicker
            v-model="value"
            :columns="columns"
            loop
            label="Choose a region"
        />
        <p class="picker-demo__hint">
            Current: {{ value.join(' / ') }}
        </p>
    </div>
</template>

<style scoped>
.picker-demo {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-2);
    align-items: flex-start;
}

.picker-demo__hint {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
