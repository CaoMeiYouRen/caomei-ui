<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTreeSelect } from '@/components/tree-select'

const items = [
    {
        id: 'form',
        label: 'Form',
        children: [
            { id: 'checkbox', label: 'Checkbox' },
            { id: 'select', label: 'Select' },
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

const value = ref<string[]>(['select', 'message'])
</script>

<template>
    <div class="demo-section">
        <p class="demo-hint">
            Multiple: the panel stays open while you pick; selected labels are joined in order and truncated to one line.
        </p>
        <CaomeiTreeSelect
            v-model="value"
            multiple
            clearable
            label="Component scope"
            placeholder="Select components"
            :items="items"
        />
        <p class="demo-hint">
            Selected {{ value.length }} item(s)
        </p>

        <div class="demo-narrow">
            <CaomeiTreeSelect
                v-model="value"
                multiple
                label="Narrow container"
                placeholder="Select components"
                :items="items"
            />
        </div>
    </div>
</template>

<style scoped>
.demo-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 22rem;
}

.demo-hint {
    margin: 0;
    font-size: 13px;
    color: var(--caomei-color-text-muted);
}

/* Narrow container: the field and panel follow it and never overflow at 320 / 390 */
.demo-narrow {
    width: min(14rem, 100%);
}
</style>
