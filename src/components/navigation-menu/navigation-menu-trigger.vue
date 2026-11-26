<script setup lang="ts">
import { NavigationMenuItem, NavigationMenuTrigger } from 'reka-ui'
import type { NavigationMenuTriggerProps } from './types'

defineOptions({ name: 'CaomeiNavigationMenuTrigger', inheritAttrs: false })

withDefaults(defineProps<NavigationMenuTriggerProps>(), {
    value: undefined,
    disabled: false,
})
</script>

<template>
    <NavigationMenuItem :value="value">
        <NavigationMenuTrigger
            v-bind="$attrs"
            :disabled="disabled"
            class="caomei-navigation-menu__trigger"
        >
            <slot />
        </NavigationMenuTrigger>
        <slot name="content" />
    </NavigationMenuItem>
</template>

<style scoped>
.caomei-navigation-menu__trigger {
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-navigation-menu-trigger-gap, var(--caomei-space-1));
    padding: var(--caomei-navigation-menu-trigger-padding-y, var(--caomei-space-1)) var(--caomei-navigation-menu-trigger-padding-x, var(--caomei-space-3));
    border: 0;
    border-radius: var(--caomei-radius-sm);
    background: transparent;
    color: var(--caomei-color-text);
    font: inherit;
    cursor: pointer;
}

.caomei-navigation-menu__trigger:hover,
.caomei-navigation-menu__trigger[data-state='open'] {
    background: var(--caomei-navigation-menu-trigger-active-bg, var(--caomei-color-bg));
}

.caomei-navigation-menu__trigger:disabled {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-navigation-menu__trigger:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}
</style>
