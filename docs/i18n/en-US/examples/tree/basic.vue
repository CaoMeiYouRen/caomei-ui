<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTree } from '@/components/tree'

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

const selected = ref<string[]>(['button'])
const expanded = ref<string[]>(['basic'])
</script>

<template>
    <div class="demo-section">
        <p class="demo-hint">
            Controlled usage: `v-model` holds selected keys and `v-model:expanded` holds expanded keys; clicking a node toggles expansion and selection.
        </p>
        <CaomeiTree
            v-model="selected"
            v-model:expanded="expanded"
            label="Component catalog"
            :items="items"
            class="demo-tree"
        />
        <p class="demo-hint">
            Selected: {{ selected.join(', ') || 'none' }}
        </p>
    </div>
</template>

<style scoped>
.demo-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.demo-hint {
    margin: 0;
    font-size: 13px;
    color: var(--caomei-color-text-muted);
}

.demo-tree {
    max-width: 18rem;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
}
</style>
