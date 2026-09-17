<script setup lang="ts">
import { DropdownMenuTrigger } from 'reka-ui'
import type { DropdownMenuTriggerProps } from './types'

defineOptions({ name: 'CaomeiDropdownMenuTrigger', inheritAttrs: false })

withDefaults(defineProps<DropdownMenuTriggerProps>(), {
    disabled: false,
})
</script>

<template>
    <DropdownMenuTrigger
        v-bind="$attrs"
        :disabled="disabled"
        class="caomei-dropdown-menu__trigger"
    >
        <slot />
    </DropdownMenuTrigger>
</template>

<style scoped>
.caomei-dropdown-menu__trigger {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-dropdown-menu-trigger-gap, var(--caomei-space-1));
    padding: var(--caomei-dropdown-menu-trigger-padding-y, var(--caomei-space-2)) var(--caomei-dropdown-menu-trigger-padding-x, var(--caomei-space-3));
    border: 1px solid var(--caomei-dropdown-menu-trigger-border, var(--caomei-color-border));
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-dropdown-menu-trigger-bg, var(--caomei-color-bg));
    color: var(--caomei-color-text);
    font: inherit;
    font-size: var(--caomei-font-size-md);
    line-height: 1.4;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease;
}

.caomei-dropdown-menu__trigger:hover:not([data-disabled]),
.caomei-dropdown-menu__trigger[data-state='open'] {
    background: var(--caomei-color-bg-elevated);
}

.caomei-dropdown-menu__trigger:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}

.caomei-dropdown-menu__trigger[data-disabled] {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

@media (prefers-reduced-motion: reduce) {
    .caomei-dropdown-menu__trigger {
        transition: none;
    }
}
</style>
