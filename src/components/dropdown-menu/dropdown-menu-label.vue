<script setup lang="ts">
import { DropdownMenuLabel } from 'reka-ui'

defineOptions({ name: 'CaomeiDropdownMenuLabel', inheritAttrs: false })
</script>

<template>
    <DropdownMenuLabel
        v-bind="$attrs"
        class="caomei-dropdown-menu__label"
    >
        <slot />
    </DropdownMenuLabel>
</template>
