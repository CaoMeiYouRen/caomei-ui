<script setup lang="ts">
import { Save } from '@lucide/vue'
import { ref } from 'vue'
import { CaomeiIcon } from '@/icons'
import { CaomeiSplitButton } from '@/components/split-button'
import type { SplitButtonMenuItem } from '@/components/split-button'

const lastAction = ref('')

const items: SplitButtonMenuItem[] = [
    { label: 'Save as', command: () => (lastAction.value = 'Save as') },
    { label: 'Export', command: () => (lastAction.value = 'Export') },
    { separator: true },
    { label: 'Delete (disabled)', disabled: true },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiSplitButton
            :model="items"
            @click="lastAction = 'Save (main button)'"
        >
            Save
            <template #icon>
                <CaomeiIcon :icon="Save" />
            </template>
        </CaomeiSplitButton>
        <p class="demo-text">
            {{ lastAction ? `Last action: ${lastAction}` : 'Click the main button or the dropdown menu' }}
        </p>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
}

.demo-text {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
