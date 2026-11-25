<script setup lang="ts">
import { CaomeiContextMenu, CaomeiContextMenuContent, CaomeiContextMenuTrigger } from '@/components/context-menu'

const items = [
    { label: 'View details' },
    { label: 'No permission', disabled: true },
    { label: 'Batch export', disabled: true },
]
</script>

<template>
    <div class="cm-demo">
        <CaomeiContextMenu>
            <CaomeiContextMenuTrigger>
                <div class="cm-demo__target">
                    Right-click to see disabled items
                </div>
            </CaomeiContextMenuTrigger>
            <CaomeiContextMenuContent :model="items" />
        </CaomeiContextMenu>
    </div>
</template>

<style scoped>
.cm-demo {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.cm-demo__target {
    padding: 24px;
    border: 1px dashed var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    color: var(--caomei-color-text-muted);
    text-align: center;
}
</style>
