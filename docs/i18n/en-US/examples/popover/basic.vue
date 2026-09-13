<script setup lang="ts">
import {
    CaomeiPopover,
    CaomeiPopoverContent,
    CaomeiPopoverTrigger,
} from '@/components/popover'
</script>

<template>
    <CaomeiPopover>
        <CaomeiPopoverTrigger>Open popover</CaomeiPopoverTrigger>
        <CaomeiPopoverContent>
            Popover content. Press Esc or click outside the panel to close.
        </CaomeiPopoverContent>
    </CaomeiPopover>
</template>
