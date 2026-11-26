<script setup lang="ts">
import { HoverCardArrow } from 'reka-ui'

defineOptions({ name: 'CaomeiHoverCardArrow', inheritAttrs: false })
</script>

<template>
    <HoverCardArrow
        v-bind="$attrs"
        class="caomei-hover-card__arrow"
    />
</template>

<style>
.caomei-hover-card__arrow {
    fill: var(--caomei-hover-card-bg, var(--caomei-color-bg-elevated));
}
</style>
