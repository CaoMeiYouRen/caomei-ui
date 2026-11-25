<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiContextMenu, CaomeiContextMenuContent, CaomeiContextMenuTrigger } from '@/components/context-menu'

const lastAction = ref('')

const items = [
    { label: 'View details', command: (): string => (lastAction.value = 'View details') },
    { label: 'Copy link', shortcut: '⌘C', command: (): string => (lastAction.value = 'Copy link') },
    { separator: true },
    { label: 'Delete', danger: true, command: (): string => (lastAction.value = 'Delete') },
]
</script>

<template>
    <div class="cm-demo">
        <CaomeiContextMenu>
            <CaomeiContextMenuTrigger>
                <div class="cm-demo__target">
                    Right-click this area to open the menu
                </div>
            </CaomeiContextMenuTrigger>
            <CaomeiContextMenuContent :model="items" />
        </CaomeiContextMenu>
        <p class="demo-text">
            {{ lastAction ? `Last action: ${lastAction}` : 'Right-click the area above' }}
        </p>
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
