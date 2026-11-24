<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTreeSelect } from '@/components/tree-select'

const items = [
    {
        id: 'basic',
        label: 'Basics',
        children: [
            { id: 'button', label: 'Button' },
            { id: 'input', label: 'Input' },
        ],
    },
    {
        id: 'display',
        label: 'Data display',
        children: [
            { id: 'data-table', label: 'DataTable' },
            { id: 'tree', label: 'Tree' },
        ],
    },
    { id: 'disabled', label: 'Unavailable', disabled: true },
]

const value = ref<string[]>(['input'])
</script>

<template>
    <div class="demo-section">
        <p class="demo-hint">
            Single select: click the field to open the panel; arrow keys move focus, while `Enter` / `Space` or a click picks the node, collapsing the panel and showing the label. `clearable` adds a clear button.
        </p>
        <CaomeiTreeSelect
            v-model="value"
            label="Owning module"
            placeholder="Select a module"
            clearable
            :items="items"
        />
        <p class="demo-hint">
            Current value: {{ value.join(', ') || 'empty' }}
        </p>
    </div>
</template>

<style scoped>
.demo-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 20rem;
}

.demo-hint {
    margin: 0;
    font-size: 13px;
    color: var(--caomei-color-text-muted);
}
</style>
