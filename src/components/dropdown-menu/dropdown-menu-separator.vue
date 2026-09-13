<script setup lang="ts">
import { DropdownMenuSeparator } from 'reka-ui'

defineOptions({ name: 'CaomeiDropdownMenuSeparator', inheritAttrs: false })
</script>

<template>
    <DropdownMenuSeparator
        v-bind="$attrs"
        class="caomei-dropdown-menu__separator"
    />
</template>
