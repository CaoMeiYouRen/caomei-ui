<script setup lang="ts">
import { X } from '@lucide/vue'
import { ref } from 'vue'
import { CaomeiIcon } from '@/icons'
import {
    CaomeiPopover,
    CaomeiPopoverArrow,
    CaomeiPopoverClose,
    CaomeiPopoverContent,
    CaomeiPopoverTrigger,
} from '@/components/popover'

const nickname = ref('Alice')
</script>

<template>
    <CaomeiPopover>
        <CaomeiPopoverTrigger>Edit nickname</CaomeiPopoverTrigger>
        <CaomeiPopoverContent>
            <CaomeiPopoverArrow />
            <div class="demo-header">
                <strong>Nickname</strong>
                <CaomeiPopoverClose label="Close">
                    <CaomeiIcon :icon="X" />
                </CaomeiPopoverClose>
            </div>
            <input
                v-model="nickname"
                class="demo-input"
                aria-label="Nickname"
            >
        </CaomeiPopoverContent>
    </CaomeiPopover>
</template>

<style scoped>
.demo-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
}

.demo-input {
    box-sizing: border-box;
    width: 100%;
    height: var(--caomei-control-height-md);
    padding: 0 var(--caomei-space-2);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-sm);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font: inherit;
}
</style>
