<script setup lang="ts">
import { DropdownMenuGroup } from 'reka-ui'

defineOptions({ name: 'CaomeiDropdownMenuGroup', inheritAttrs: false })
</script>

<template>
    <DropdownMenuGroup
        v-bind="$attrs"
        class="caomei-dropdown-menu__group"
    >
        <slot />
    </DropdownMenuGroup>
</template>
