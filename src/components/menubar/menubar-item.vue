<script setup lang="ts">
import { MenubarItem } from 'reka-ui'
import type { MenubarItemProps } from './types'

defineOptions({ name: 'CaomeiMenubarItem', inheritAttrs: false })

withDefaults(defineProps<MenubarItemProps>(), {
    disabled: false,
    shortcut: '',
    textValue: undefined,
})
</script>

<template>
    <MenubarItem
        v-bind="$attrs"
        :disabled="disabled"
        :text-value="textValue"
        class="caomei-menubar__item"
    >
        <span class="caomei-menubar__item-text">
            <slot />
        </span>
        <span v-if="shortcut" class="caomei-menubar__shortcut">{{ shortcut }}</span>
    </MenubarItem>
</template>

<style scoped>
.caomei-menubar__item {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: var(--caomei-menubar-item-gap, var(--caomei-space-2));
    padding: var(--caomei-menubar-item-padding-y, var(--caomei-space-2)) var(--caomei-menubar-item-padding-x, var(--caomei-space-2));
    border-radius: var(--caomei-radius-sm);
    color: var(--caomei-color-text);
    font-size: var(--caomei-font-size-md);
    line-height: 1.4;
    cursor: pointer;
    user-select: none;
    outline: none;
}

.caomei-menubar__item[data-highlighted] {
    background: var(--caomei-menubar-item-highlighted-bg, var(--caomei-color-bg-elevated));
}

.caomei-menubar__item[data-disabled] {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-menubar__item-text {
    flex: 1 1 auto;
    min-width: 0;
}

.caomei-menubar__shortcut {
    flex: none;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
