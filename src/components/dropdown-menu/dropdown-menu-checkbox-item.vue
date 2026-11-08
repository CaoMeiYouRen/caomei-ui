<script setup lang="ts">
import { DropdownMenuCheckboxItem, DropdownMenuItemIndicator } from 'reka-ui'
import { CaomeiIcon, useInternalIcons } from '../../icons'
import type { DropdownMenuCheckboxItemProps } from './types'

defineOptions({ name: 'CaomeiDropdownMenuCheckboxItem', inheritAttrs: false })

const icons = useInternalIcons()

withDefaults(defineProps<DropdownMenuCheckboxItemProps>(), {
    disabled: false,
    shortcut: '',
})

const model = defineModel<boolean | 'indeterminate'>()
</script>

<template>
    <DropdownMenuCheckboxItem
        v-bind="$attrs"
        v-model="model"
        :disabled="disabled"
        :text-value="textValue"
        class="caomei-dropdown-menu__item"
    >
        <span class="caomei-dropdown-menu__indicator">
            <DropdownMenuItemIndicator>
                <CaomeiIcon :icon="icons.check" />
            </DropdownMenuItemIndicator>
        </span>
        <span class="caomei-dropdown-menu__item-text">
            <slot />
        </span>
        <span v-if="shortcut" class="caomei-dropdown-menu__shortcut">{{ shortcut }}</span>
    </DropdownMenuCheckboxItem>
</template>
