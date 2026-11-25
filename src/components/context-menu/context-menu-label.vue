<script setup lang="ts">
import { ContextMenuLabel } from 'reka-ui'

defineOptions({ name: 'CaomeiContextMenuLabel', inheritAttrs: false })
</script>

<template>
    <ContextMenuLabel
        v-bind="$attrs"
        class="caomei-context-menu__label"
    >
        <slot />
    </ContextMenuLabel>
</template>
