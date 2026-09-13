<script setup lang="ts">
import { DropdownMenuItem } from 'reka-ui'
import type { DropdownMenuItemProps } from './types'

defineOptions({ name: 'CaomeiDropdownMenuItem', inheritAttrs: false })

withDefaults(defineProps<DropdownMenuItemProps>(), {
    disabled: false,
    shortcut: '',
})
</script>

<template>
    <DropdownMenuItem
        v-bind="$attrs"
        :disabled="disabled"
        :text-value="textValue"
        class="caomei-dropdown-menu__item"
    >
        <span class="caomei-dropdown-menu__item-text">
            <slot />
        </span>
        <span v-if="shortcut" class="caomei-dropdown-menu__shortcut">{{ shortcut }}</span>
    </DropdownMenuItem>
</template>
