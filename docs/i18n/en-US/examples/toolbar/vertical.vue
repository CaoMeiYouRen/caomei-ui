<script setup lang="ts">
import { Copy, Scissors, Trash2 } from '@lucide/vue'
import { CaomeiIcon } from '@/icons'
import { CaomeiToolbar, CaomeiToolbarButton, CaomeiToolbarSeparator } from '@/components/toolbar'
</script>

<template>
    <CaomeiToolbar
        orientation="vertical"
        label="Edit actions"
    >
        <CaomeiToolbarButton label="Copy">
            <CaomeiIcon :icon="Copy" />
        </CaomeiToolbarButton>
        <CaomeiToolbarButton label="Cut">
            <CaomeiIcon :icon="Scissors" />
        </CaomeiToolbarButton>
        <CaomeiToolbarSeparator />
        <CaomeiToolbarButton label="Delete">
            <CaomeiIcon :icon="Trash2" />
        </CaomeiToolbarButton>
    </CaomeiToolbar>
</template>
