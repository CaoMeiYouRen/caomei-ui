<script setup lang="ts">
import { DropdownMenuItemIndicator, DropdownMenuRadioItem } from 'reka-ui'
import { CaomeiIcon, useInternalIcons } from '../../icons'
import type { DropdownMenuRadioItemProps } from './types'

defineOptions({ name: 'CaomeiDropdownMenuRadioItem', inheritAttrs: false })

const icons = useInternalIcons()

withDefaults(defineProps<DropdownMenuRadioItemProps>(), {
    disabled: false,
    shortcut: '',
})
</script>

<template>
    <DropdownMenuRadioItem
        v-bind="$attrs"
        :value="value"
        :disabled="disabled"
        :text-value="textValue"
        class="caomei-dropdown-menu__item"
    >
        <span class="caomei-dropdown-menu__indicator">
            <DropdownMenuItemIndicator>
                <CaomeiIcon :icon="icons.radio" />
            </DropdownMenuItemIndicator>
        </span>
        <span class="caomei-dropdown-menu__item-text">
            <slot />
        </span>
        <span v-if="shortcut" class="caomei-dropdown-menu__shortcut">{{ shortcut }}</span>
    </DropdownMenuRadioItem>
</template>
