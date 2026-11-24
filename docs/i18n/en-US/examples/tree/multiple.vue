<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTree } from '@/components/tree'

const items = [
    {
        id: 'form',
        label: 'Form',
        children: [
            { id: 'checkbox', label: 'Checkbox' },
            { id: 'select', label: 'Select' },
            { id: 'slider', label: 'Slider' },
        ],
    },
    {
        id: 'feedback',
        label: 'Feedback',
        children: [
            { id: 'message', label: 'Message' },
            { id: 'toast', label: 'Toast' },
        ],
    },
]

const selected = ref<string[]>(['select', 'message'])
const expanded = ref<string[]>(['form', 'feedback'])
</script>

<template>
    <div class="demo-section">
        <p class="demo-hint">
            Multiple: the selection is written back in order; the custom <code>#label</code> slot receives the node context (level / expanded / selected).
        </p>
        <CaomeiTree
            v-model="selected"
            v-model:expanded="expanded"
            multiple
            label="Component multi-select"
            :items="items"
            class="demo-tree"
        >
            <template #label="{item, level}">
                <span class="demo-label">{{ level > 1 ? '· ' : '' }}{{ item.label }}</span>
            </template>
        </CaomeiTree>
        <p class="demo-hint">
            Selected {{ selected.length }} item(s)
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
    max-width: 20rem;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
}

.demo-label {
    font-size: 13px;
}
</style>
