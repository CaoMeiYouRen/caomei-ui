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
    <CaomeiToolbar label="Text formatting">
        <CaomeiToolbarButton label="Bold">
            <CaomeiIcon :icon="Bold" />
        </CaomeiToolbarButton>
        <CaomeiToolbarButton label="Italic">
            <CaomeiIcon :icon="Italic" />
        </CaomeiToolbarButton>
        <CaomeiToolbarSeparator />
        <CaomeiToolbarButton label="Underline">
            <CaomeiIcon :icon="Underline" />
        </CaomeiToolbarButton>
        <CaomeiToolbarLink
            href="/en-US/guide/getting-started"
            label="Help"
        >
            Help
        </CaomeiToolbarLink>
    </CaomeiToolbar>
</template>
