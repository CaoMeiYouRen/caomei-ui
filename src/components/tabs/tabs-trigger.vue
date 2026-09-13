<script setup lang="ts">
import { TabsTrigger } from 'reka-ui'
import type { TabTriggerProps } from './types'

defineOptions({ name: 'CaomeiTabTrigger', inheritAttrs: false })

withDefaults(defineProps<TabTriggerProps>(), {
    disabled: false,
})
</script>

<template>
    <TabsTrigger
        v-bind="$attrs"
        :value="value"
        :disabled="disabled"
        class="caomei-tabs__trigger"
    >
        <slot />
    </TabsTrigger>
</template>

<style scoped>
.caomei-tabs__trigger {
    box-sizing: border-box;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: var(--caomei-tabs-trigger-gap, var(--caomei-space-1));
    margin: 0;
    padding: var(--caomei-tabs-trigger-padding-y, var(--caomei-space-2)) var(--caomei-tabs-trigger-padding-x, var(--caomei-space-3));
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    background: transparent;
    color: var(--caomei-tabs-trigger-color, var(--caomei-color-text-muted));
    font: inherit;
    font-size: var(--caomei-font-size-md);
    line-height: 1.4;
    white-space: nowrap;
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease;
}

.caomei-tabs__trigger:hover:not([data-disabled]) {
    color: var(--caomei-color-text);
}

.caomei-tabs__trigger:focus-visible {
    border-radius: var(--caomei-radius-sm);
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: -2px;
}

.caomei-tabs__trigger[data-state='active'] {
    border-bottom-color: var(--caomei-tabs-indicator, var(--caomei-color-primary));
    color: var(--caomei-tabs-trigger-active-color, var(--caomei-color-primary));
    font-weight: 500;
}

.caomei-tabs__trigger[data-disabled] {
    cursor: not-allowed;
    opacity: 0.5;
}

:where(.caomei-tabs--vertical) .caomei-tabs__trigger {
    justify-content: flex-start;
    width: 100%;
    margin-bottom: 0;
    margin-right: -1px;
    border-right: 2px solid transparent;
    border-bottom: none;
}

:where(.caomei-tabs--vertical) .caomei-tabs__trigger[data-state='active'] {
    border-right-color: var(--caomei-tabs-indicator, var(--caomei-color-primary));
}

@media (prefers-reduced-motion: reduce) {
    .caomei-tabs__trigger {
        transition: none;
    }
}
</style>
