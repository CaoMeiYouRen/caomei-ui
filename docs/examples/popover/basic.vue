<script setup lang="ts">
import {
    CaomeiPopover,
    CaomeiPopoverContent,
    CaomeiPopoverTrigger,
} from '@/components/popover'
</script>

<template>
    <CaomeiPopover>
        <CaomeiPopoverTrigger>打开浮层</CaomeiPopoverTrigger>
        <CaomeiPopoverContent>
            浮层内容。可按 Esc 键或点击面板外部关闭。
        </CaomeiPopoverContent>
    </CaomeiPopover>
</template>
