<script setup lang="ts">
import { HoverCardContent, HoverCardPortal } from 'reka-ui'
import type { HoverCardContentProps } from './types'

defineOptions({ name: 'CaomeiHoverCardContent', inheritAttrs: false })

withDefaults(defineProps<HoverCardContentProps>(), {
    side: 'bottom',
    align: 'start',
    sideOffset: 6,
    alignOffset: 0,
    forceMount: false,
})
</script>

<template>
    <HoverCardPortal>
        <HoverCardContent
            v-bind="$attrs"
            :side="side"
            :align="align"
            :side-offset="sideOffset"
            :align-offset="alignOffset"
            :force-mount="forceMount"
            class="caomei-hover-card__content"
        >
            <slot />
        </HoverCardContent>
    </HoverCardPortal>
</template>

<style>
/* 内容经 portal 挂到 body，scoped 作用域不命中，使用命名空间化非 scoped 块 */
.caomei-hover-card__content {
    box-sizing: border-box;
    max-width: min(var(--caomei-hover-card-max-width, 20rem), var(--reka-hover-card-content-available-width, 100vw));
    padding: var(--caomei-hover-card-padding, var(--caomei-space-3));
    border: 1px solid var(--caomei-hover-card-border, var(--caomei-color-border));
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-hover-card-bg, var(--caomei-color-bg-elevated));
    color: var(--caomei-color-text);
    box-shadow: var(--caomei-shadow-md);
    font-family: var(--caomei-font-sans);
    transform-origin: var(--reka-hover-card-content-transform-origin);
}
</style>
