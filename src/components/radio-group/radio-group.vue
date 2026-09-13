<script setup lang="ts">
import { RadioGroupRoot } from 'reka-ui'
import { computed, useAttrs } from 'vue'
import type { RadioGroupProps, RadioValue } from './types'

defineOptions({ name: 'CaomeiRadioGroup', inheritAttrs: false })

const props = withDefaults(defineProps<RadioGroupProps>(), {
    size: 'md',
    disabled: false,
    required: false,
    orientation: 'vertical',
    loop: true,
    invalid: false,
    label: '',
})

const model = defineModel<RadioValue | undefined>()

const attrs = useAttrs()

/** label 属性优先于透传的 aria-label，二者都缺省时由组内标签文本推导可访问名 */
const forwardedAttrs = computed<Record<string, unknown>>(() => ({
    ...attrs,
    ...(props.label ? { 'aria-label': props.label } : {}),
}))

/** Reka 的 update:modelValue 载荷为更宽的 AcceptableValue，收窄为组件支持的 string | number */
function handleUpdate(value: unknown): void {
    if (typeof value === 'string' || typeof value === 'number') {
        model.value = value
    } else if (value === undefined || value === null) {
        model.value = undefined
    }
}

const rootClass = computed(() => [
    `caomei-radio-group--${props.orientation}`,
    `caomei-radio-group--${props.size}`,
    {
        'caomei-radio-group--invalid': props.invalid,
    },
])
</script>

<template>
    <RadioGroupRoot
        v-bind="forwardedAttrs"
        :id="id"
        :model-value="model"
        :default-value="defaultValue"
        :disabled="disabled"
        :required="required || undefined"
        :name="name"
        :orientation="orientation"
        :dir="dir"
        :loop="loop"
        :aria-invalid="invalid || undefined"
        class="caomei-radio-group"
        :class="rootClass"
        @update:model-value="handleUpdate"
    >
        <slot />
    </RadioGroupRoot>
</template>

<style scoped>
/*
  `--caomei-radio-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  尺寸档位选择器用 :where() 归零特异性，只声明 CSS 变量，避免被基类属性覆盖。
*/
.caomei-radio-group {
    display: flex;
    gap: var(--caomei-radio-group-gap, var(--caomei-space-2));
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-radio-font-size, var(--caomei-font-size-md));
}

.caomei-radio-group--horizontal {
    flex-flow: row wrap;
    align-items: center;
}

.caomei-radio-group--vertical {
    flex-direction: column;
    align-items: flex-start;
}

:where(.caomei-radio-group--sm) {
    --caomei-radio-size: 16px;
    --caomei-radio-font-size: var(--caomei-font-size-sm);
}

:where(.caomei-radio-group--md) {
    --caomei-radio-size: 18px;
    --caomei-radio-font-size: var(--caomei-font-size-md);
}

:where(.caomei-radio-group--lg) {
    --caomei-radio-size: 20px;
    --caomei-radio-font-size: var(--caomei-font-size-lg);
}

.caomei-radio-group--invalid {
    --caomei-radio-border: var(--caomei-color-danger);
    --caomei-radio-focus: var(--caomei-color-danger);
}
</style>
