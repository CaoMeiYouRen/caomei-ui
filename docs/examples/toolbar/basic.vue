<script setup lang="ts">
import { Bold, Italic, Underline } from '@lucide/vue'
import { CaomeiIcon } from '@/icons'
import {
    CaomeiToolbar,
    CaomeiToolbarButton,
    CaomeiToolbarLink,
    CaomeiToolbarSeparator,
} from '@/components/toolbar'
</script>

<template>
    <CaomeiToolbar label="文本格式">
        <CaomeiToolbarButton label="加粗">
            <CaomeiIcon :icon="Bold" />
        </CaomeiToolbarButton>
        <CaomeiToolbarButton label="斜体">
            <CaomeiIcon :icon="Italic" />
        </CaomeiToolbarButton>
        <CaomeiToolbarSeparator />
        <CaomeiToolbarButton label="下划线">
            <CaomeiIcon :icon="Underline" />
        </CaomeiToolbarButton>
        <CaomeiToolbarLink
            href="/guide/getting-started"
            label="帮助"
        >
            帮助
        </CaomeiToolbarLink>
    </CaomeiToolbar>
</template>
