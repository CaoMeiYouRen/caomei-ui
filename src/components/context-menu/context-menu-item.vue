<script setup lang="ts">
import { ContextMenuItem } from 'reka-ui'
import type { ContextMenuItemProps } from './types'

defineOptions({ name: 'CaomeiContextMenuItem', inheritAttrs: false })

withDefaults(defineProps<ContextMenuItemProps>(), {
    disabled: false,
    shortcut: '',
    danger: false,
    textValue: undefined,
})
</script>

<template>
    <ContextMenuItem
        v-bind="$attrs"
        :disabled="disabled"
        :text-value="textValue"
        class="caomei-context-menu__item"
        :class="{'caomei-context-menu__item--danger': danger}"
    >
        <span class="caomei-context-menu__item-text">
            <slot />
        </span>
        <span
            v-if="shortcut"
            class="caomei-context-menu__shortcut"
        >{{ shortcut }}</span>
    </ContextMenuItem>
</template>
