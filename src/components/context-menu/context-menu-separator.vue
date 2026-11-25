<script setup lang="ts">
import { ContextMenuSeparator } from 'reka-ui'

defineOptions({ name: 'CaomeiContextMenuSeparator', inheritAttrs: false })
</script>

<template>
    <ContextMenuSeparator
        v-bind="$attrs"
        class="caomei-context-menu__separator"
    />
</template>
