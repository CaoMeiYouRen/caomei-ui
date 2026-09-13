<script setup lang="ts">
import { Toggle } from 'reka-ui'
import { computed, useAttrs } from 'vue'
import type { ToggleButtonProps } from './types'

defineOptions({ name: 'CaomeiToggleButton', inheritAttrs: false })

const props = withDefaults(defineProps<ToggleButtonProps>(), {
    disabled: false,
    size: 'md',
    label: '',
})

const model = defineModel<boolean>({ default: false })

const attrs = useAttrs()

/** label 属性优先于透传的 aria-label；二者都缺省时由可见文本推导可访问名 */
const forwardedAttrs = computed<Record<string, unknown>>(() => ({
    ...attrs,
    ...(props.label ? { 'aria-label': props.label } : {}),
}))
</script>

<template>
    <Toggle
        v-bind="forwardedAttrs"
        v-model="model"
        :disabled="disabled"
        class="caomei-toggle-button"
        :class="`caomei-toggle-button--${size}`"
    >
        <slot />
    </Toggle>
</template>

<style scoped>
/*
  `--caomei-toggle-button-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  尺寸档位选择器用 :where() 归零特异性，保证使用方单类覆盖生效。
*/
.caomei-toggle-button {
    box-sizing: border-box;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: var(--caomei-toggle-button-gap, var(--caomei-space-1));
    border: 1px solid transparent;
    border-radius: var(--caomei-toggle-button-radius, var(--caomei-radius-md));
    background: transparent;
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.caomei-toggle-button:hover:not([data-disabled], [data-state='on']) {
    background: var(--caomei-color-bg-elevated);
}

.caomei-toggle-button:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}

.caomei-toggle-button[data-state='on'] {
    border-color: var(--caomei-toggle-button-active-bg, var(--caomei-color-primary));
    background: var(--caomei-toggle-button-active-bg, var(--caomei-color-primary));
    color: var(--caomei-toggle-button-active-color, var(--caomei-color-primary-foreground));
}

.caomei-toggle-button[data-disabled] {
    cursor: not-allowed;
    opacity: 0.5;
}

:where(.caomei-toggle-button--sm) {
    height: var(--caomei-control-height-sm);
    padding: 0 var(--caomei-space-2);
    font-size: var(--caomei-font-size-sm);
}

:where(.caomei-toggle-button--md) {
    height: var(--caomei-control-height-md);
    padding: 0 var(--caomei-space-3);
    font-size: var(--caomei-font-size-md);
}

:where(.caomei-toggle-button--lg) {
    height: var(--caomei-control-height-lg);
    padding: 0 var(--caomei-space-4);
    font-size: var(--caomei-font-size-lg);
}

@media (prefers-reduced-motion: reduce) {
    .caomei-toggle-button {
        transition: none;
    }
}
</style>
