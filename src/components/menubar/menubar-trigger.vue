<script setup lang="ts">
import { MenubarTrigger } from 'reka-ui'
import type { MenubarTriggerProps } from './types'

defineOptions({ name: 'CaomeiMenubarTrigger', inheritAttrs: false })

withDefaults(defineProps<MenubarTriggerProps>(), {
    disabled: false,
})
</script>

<template>
    <MenubarTrigger
        v-bind="$attrs"
        :disabled="disabled"
        class="caomei-menubar__trigger"
    >
        <slot />
    </MenubarTrigger>
</template>

<style scoped>
.caomei-menubar__trigger {
    display: inline-flex;
    align-items: center;
    padding: var(--caomei-menubar-trigger-padding-y, var(--caomei-space-1)) var(--caomei-menubar-trigger-padding-x, var(--caomei-space-3));
    border: 0;
    border-radius: var(--caomei-radius-sm);
    background: transparent;
    color: var(--caomei-color-text);
    font: inherit;
    cursor: pointer;
}

.caomei-menubar__trigger:hover,
.caomei-menubar__trigger[data-state='open'] {
    background: var(--caomei-menubar-trigger-active-bg, var(--caomei-color-bg));
}

.caomei-menubar__trigger:disabled {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-menubar__trigger:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}
</style>
