<script setup lang="ts">
import { RadioGroupItem } from 'reka-ui'
import { computed, useId, useSlots } from 'vue'
import { useLabelAttrs } from '../_shared/use-label-attrs'
import type { RadioButtonProps } from './types'

defineOptions({ name: 'CaomeiRadioButton', inheritAttrs: false })

const props = withDefaults(defineProps<RadioButtonProps>(), {
    disabled: false,
    text: '',
    label: '',
})

defineSlots<{
    default?: () => unknown
}>()

const slots = useSlots()

const generatedId = useId()
const radioId = computed(() => props.id ?? `caomei-radio-${generatedId}`)
const hasText = computed(() => Boolean(props.text || slots.default))

/** label 属性优先于透传的 aria-label；二者都缺省时由可见文本推导可访问名 */
const forwardedAttrs = useLabelAttrs(() => props.label)
</script>

<template>
    <RadioGroupItem
        v-bind="forwardedAttrs"
        :id="radioId"
        :value="value"
        :disabled="disabled"
        class="caomei-radio-button"
    >
        <!--
          指示器在 RadioGroupItem 默认插槽内自绘而非使用 Reka 的 RadioGroupIndicator：
          后者作为嵌套子组件不回传父级 scope id，scoped 样式无法命中其根元素。
        -->
        <span
            class="caomei-radio-button__indicator"
            aria-hidden="true"
        />
        <span
            v-if="hasText"
            class="caomei-radio-button__label"
        >
            <slot>{{ text }}</slot>
        </span>
    </RadioGroupItem>
</template>

<style scoped>
.caomei-radio-button {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-radio-gap, var(--caomei-space-2));
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
}

.caomei-radio-button:focus-visible {
    border-radius: var(--caomei-radius-sm);
    outline: 2px solid var(--caomei-radio-focus, var(--caomei-color-primary));
    outline-offset: 2px;
}

.caomei-radio-button[data-disabled] {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-radio-button__indicator {
    box-sizing: border-box;
    position: relative;
    flex-shrink: 0;
    width: var(--caomei-radio-size, 18px);
    height: var(--caomei-radio-size, 18px);
    border: 1px solid var(--caomei-radio-border, var(--caomei-color-border));
    border-radius: 50%;
    background: var(--caomei-radio-bg, var(--caomei-color-bg));
    transition: background-color 0.15s ease, border-color 0.15s ease;
}

.caomei-radio-button__indicator::after {
    content: '';
    position: absolute;
    inset: 0;
    width: 40%;
    height: 40%;
    margin: auto;
    border-radius: 50%;
    background: var(--caomei-radio-dot, var(--caomei-color-primary-foreground));
    transform: scale(0);
    transition: transform 0.15s ease;
}

.caomei-radio-button[data-state='checked'] .caomei-radio-button__indicator {
    border-color: var(--caomei-radio-active-bg, var(--caomei-color-primary));
    background: var(--caomei-radio-active-bg, var(--caomei-color-primary));
}

.caomei-radio-button[data-state='checked'] .caomei-radio-button__indicator::after {
    transform: scale(1);
}

.caomei-radio-button__label {
    user-select: none;
}

@media (prefers-reduced-motion: reduce) {
    .caomei-radio-button__indicator,
    .caomei-radio-button__indicator::after {
        transition: none;
    }
}
</style>
