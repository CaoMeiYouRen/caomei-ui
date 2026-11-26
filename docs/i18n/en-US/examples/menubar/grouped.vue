<script setup lang="ts">
import { CaomeiMenubar, CaomeiMenubarContent, CaomeiMenubarItem, CaomeiMenubarMenu, CaomeiMenubarTrigger } from '@/components/menubar'
</script>

<template>
    <CaomeiMenubar aria-label="Document menu">
        <CaomeiMenubarMenu value="view">
            <CaomeiMenubarTrigger>View</CaomeiMenubarTrigger>
            <CaomeiMenubarContent>
                <div
                    class="menubar-group"
                    role="group"
                    aria-label="Layout"
                >
                    <CaomeiMenubarItem>Sidebar</CaomeiMenubarItem>
                    <CaomeiMenubarItem>Status bar</CaomeiMenubarItem>
                </div>
                <div
                    class="menubar-divider"
                    role="separator"
                />
                <div
                    class="menubar-group"
                    role="group"
                    aria-label="Zoom"
                >
                    <CaomeiMenubarItem shortcut="⌘+">
                        Zoom in
                    </CaomeiMenubarItem>
                    <CaomeiMenubarItem shortcut="⌘-">
                        Zoom out
                    </CaomeiMenubarItem>
                </div>
            </CaomeiMenubarContent>
        </CaomeiMenubarMenu>
    </CaomeiMenubar>
</template>

<style scoped>
.menubar-group {
    display: flex;
    flex-direction: column;
}

.menubar-divider {
    height: 1px;
    margin: var(--caomei-space-1) 0;
    background: var(--caomei-color-border);
}
</style>
