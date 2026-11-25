<script setup lang="ts">
import { ContextMenuGroup } from 'reka-ui'

defineOptions({ name: 'CaomeiContextMenuGroup', inheritAttrs: false })
</script>

<template>
    <ContextMenuGroup
        v-bind="$attrs"
        class="caomei-context-menu__group"
    >
        <slot />
    </ContextMenuGroup>
</template>
