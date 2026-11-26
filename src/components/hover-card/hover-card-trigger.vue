<script setup lang="ts">
import { HoverCardTrigger } from 'reka-ui'
import type { HoverCardTriggerProps } from './types'

defineOptions({ name: 'CaomeiHoverCardTrigger', inheritAttrs: false })

withDefaults(defineProps<HoverCardTriggerProps>(), {
    disabled: false,
})
</script>

<template>
    <!--
      禁用时渲染纯按钮：原生 disabled 只抑制 click / focus，指针事件仍会派发给
      Reka 的 pointerenter，卡片照样展开，故不接 HoverCardTrigger。
    -->
    <button
        v-if="disabled"
        v-bind="$attrs"
        type="button"
        disabled
        class="caomei-hover-card__trigger"
    >
        <slot />
    </button>
    <HoverCardTrigger
        v-else
        v-bind="$attrs"
        as="button"
        type="button"
        class="caomei-hover-card__trigger"
    >
        <slot />
    </HoverCardTrigger>
</template>

<style scoped>
.caomei-hover-card__trigger {
    display: inline-flex;
    align-items: center;
    padding: 0;
    border: 0;
    background: none;
    color: var(--caomei-color-primary-text);
    font: inherit;
    text-decoration: underline dotted;
    cursor: help;
}

.caomei-hover-card__trigger:disabled {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-hover-card__trigger:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}
</style>
