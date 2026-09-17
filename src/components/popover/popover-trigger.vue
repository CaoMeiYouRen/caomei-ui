<script setup lang="ts">
import { PopoverTrigger } from 'reka-ui'
import type { PopoverTriggerProps } from './types'

defineOptions({ name: 'CaomeiPopoverTrigger', inheritAttrs: false })

const props = withDefaults(defineProps<PopoverTriggerProps>(), {
    disabled: false,
})
</script>

<template>
    <PopoverTrigger
        v-bind="$attrs"
        :disabled="props.disabled || undefined"
        class="caomei-popover__trigger"
    >
        <slot />
    </PopoverTrigger>
</template>

<style scoped>
.caomei-popover__trigger {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--caomei-popover-trigger-gap, var(--caomei-space-1));
    height: var(--caomei-popover-trigger-height, var(--caomei-control-height-md));
    padding: 0 var(--caomei-popover-trigger-padding-x, var(--caomei-space-3));
    border: 1px solid var(--caomei-popover-trigger-border, var(--caomei-color-border));
    border-radius: var(--caomei-popover-trigger-radius, var(--caomei-radius-md));
    background: var(--caomei-popover-trigger-bg, var(--caomei-color-bg));
    color: var(--caomei-color-text);
    font: inherit;
    font-size: var(--caomei-font-size-md);
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease;
}

.caomei-popover__trigger:hover:not(:disabled) {
    background: var(--caomei-color-bg-elevated);
}

.caomei-popover__trigger:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}

.caomei-popover__trigger:disabled {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

@media (prefers-reduced-motion: reduce) {
    .caomei-popover__trigger {
        transition: none;
    }
}
</style>
