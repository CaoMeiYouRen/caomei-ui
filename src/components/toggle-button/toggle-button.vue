<script setup lang="ts">
import { Toggle } from 'reka-ui'
import { computed } from 'vue'
import { useLabelAttrs } from '../_shared/use-label-attrs'
import type { ToggleButtonProps } from './types'

defineOptions({ name: 'CaomeiToggleButton', inheritAttrs: false })

const props = withDefaults(defineProps<ToggleButtonProps>(), {
    disabled: false,
    size: 'md',
    label: '',
})

const model = defineModel<boolean>({ default: false })

/** label 属性优先于透传的 aria-label；二者都缺省时由可见文本推导可访问名 */
const forwardedAttrs = useLabelAttrs(() => props.label)

/** 两态文案：仅当 `onLabel` / `offLabel` 同时提供时生效（对齐 PrimeVue），否则回退默认插槽 */
const stateLabel = computed(() => {
    if (!props.onLabel || !props.offLabel) {
        return undefined
    }
    return model.value ? props.onLabel : props.offLabel
})
</script>

<template>
    <Toggle
        v-bind="forwardedAttrs"
        v-model="model"
        :disabled="disabled"
        class="caomei-toggle-button"
        :class="`caomei-toggle-button--${size}`"
    >
        <slot>{{ stateLabel }}</slot>
    </Toggle>
</template>

<style scoped>
/*
  `--caomei-toggle-button-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  尺寸档位选择器用 :where() 归零特异性，只声明 CSS 变量。
  注意：根元素是原生 <button>，宿主全局的 `button { padding: 0 }` 等元素级规则特异性高于
  :where()，若在档位块内直接声明 padding 会被其覆盖，故所有尺寸相关属性都经变量在基类消费。
*/
.caomei-toggle-button {
    box-sizing: border-box;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: var(--caomei-toggle-button-gap, var(--caomei-space-1));
    height: var(--caomei-toggle-button-height, var(--caomei-control-height-md));
    padding: var(--caomei-toggle-button-padding-y, 0) var(--caomei-toggle-button-padding-x, var(--caomei-space-3));
    border: 1px solid transparent;
    border-radius: var(--caomei-toggle-button-radius, var(--caomei-radius-md));
    background: transparent;
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-toggle-button-font-size, var(--caomei-font-size-md));
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
    opacity: var(--caomei-disabled-opacity);
}

:where(.caomei-toggle-button--sm) {
    --caomei-toggle-button-height: var(--caomei-control-height-sm);
    --caomei-toggle-button-padding-x: var(--caomei-space-2);
    --caomei-toggle-button-font-size: var(--caomei-font-size-sm);
}

:where(.caomei-toggle-button--md) {
    --caomei-toggle-button-height: var(--caomei-control-height-md);
    --caomei-toggle-button-padding-x: var(--caomei-space-3);
    --caomei-toggle-button-font-size: var(--caomei-font-size-md);
}

:where(.caomei-toggle-button--lg) {
    --caomei-toggle-button-height: var(--caomei-control-height-lg);
    --caomei-toggle-button-padding-x: var(--caomei-space-4);
    --caomei-toggle-button-font-size: var(--caomei-font-size-lg);
}

@media (prefers-reduced-motion: reduce) {
    .caomei-toggle-button {
        transition: none;
    }
}
</style>
