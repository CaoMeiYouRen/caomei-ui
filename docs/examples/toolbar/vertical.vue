<script setup lang="ts">
import { Copy, Scissors, Trash2 } from '@lucide/vue'
import { CaomeiIcon } from '@/icons'
import { CaomeiToolbar, CaomeiToolbarButton, CaomeiToolbarSeparator } from '@/components/toolbar'
</script>

<template>
    <CaomeiToolbar
        orientation="vertical"
        label="编辑操作"
    >
        <CaomeiToolbarButton label="复制">
            <CaomeiIcon :icon="Copy" />
        </CaomeiToolbarButton>
        <CaomeiToolbarButton label="剪切">
            <CaomeiIcon :icon="Scissors" />
        </CaomeiToolbarButton>
        <CaomeiToolbarSeparator />
        <CaomeiToolbarButton label="删除">
            <CaomeiIcon :icon="Trash2" />
        </CaomeiToolbarButton>
    </CaomeiToolbar>
</template>
