<script setup lang="ts">
import { CaomeiMenubar, CaomeiMenubarContent, CaomeiMenubarItem, CaomeiMenubarMenu, CaomeiMenubarTrigger } from '@/components/menubar'
</script>

<template>
    <CaomeiMenubar aria-label="Document menu">
        <CaomeiMenubarMenu value="file">
            <CaomeiMenubarTrigger>File</CaomeiMenubarTrigger>
            <CaomeiMenubarContent>
                <CaomeiMenubarItem shortcut="⌘N">
                    New document
                </CaomeiMenubarItem>
                <CaomeiMenubarItem shortcut="⌘O">
                    Open…
                </CaomeiMenubarItem>
                <CaomeiMenubarItem disabled>
                    Save (read-only)
                </CaomeiMenubarItem>
            </CaomeiMenubarContent>
        </CaomeiMenubarMenu>
        <CaomeiMenubarMenu value="edit">
            <CaomeiMenubarTrigger>Edit</CaomeiMenubarTrigger>
            <CaomeiMenubarContent>
                <CaomeiMenubarItem shortcut="⌘Z">
                    Undo
                </CaomeiMenubarItem>
                <CaomeiMenubarItem shortcut="⇧⌘Z">
                    Redo
                </CaomeiMenubarItem>
            </CaomeiMenubarContent>
        </CaomeiMenubarMenu>
        <CaomeiMenubarMenu value="help">
            <CaomeiMenubarTrigger>Help</CaomeiMenubarTrigger>
            <CaomeiMenubarContent>
                <CaomeiMenubarItem>Documentation</CaomeiMenubarItem>
            </CaomeiMenubarContent>
        </CaomeiMenubarMenu>
    </CaomeiMenubar>
</template>
