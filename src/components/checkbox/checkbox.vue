<script setup lang="ts">
import { Check, Minus } from '@lucide/vue'
import { CheckboxRoot } from 'reka-ui'
import { computed, useId, useSlots } from 'vue'
import { CaomeiIcon } from '../../icons'
import { useAttrForwarding } from '../_shared/use-attr-forwarding'
import { useLabelAttrs } from '../_shared/use-label-attrs'
import type { CheckboxProps, CheckboxState } from './types'

defineOptions({ name: 'CaomeiCheckbox', inheritAttrs: false })

const props = withDefaults(defineProps<CheckboxProps>(), {
    size: 'md',
    disabled: false,
    invalid: false,
    required: false,
    text: '',
    label: '',
})

defineSlots<{
    default?: () => unknown
}>()

const model = defineModel<CheckboxState>()

const slots = useSlots()
const generatedId = useId()
const checkboxId = computed(() => props.id ?? `caomei-checkbox-${generatedId}`)
const hasText = computed(() => Boolean(props.text || slots.default))

const { rootAttrs, controlAttrs } = useAttrForwarding()

/** label 属性优先于透传的 aria-label，二者都缺省时交由 Reka 从可见标签推导 */
const forwardedAttrs = useLabelAttrs(() => props.label, controlAttrs)

const rootClass = computed(() => [
    `caomei-checkbox--${props.size}`,
    {
        'caomei-checkbox--disabled': props.disabled,
        'caomei-checkbox--invalid': props.invalid,
    },
])
</script>

<template>
    <div
        v-bind="rootAttrs"
        class="caomei-checkbox"
        :class="rootClass"
    >
        <CheckboxRoot
            v-bind="forwardedAttrs"
            :id="checkboxId"
            v-model="model"
            class="caomei-checkbox__control"
            :disabled="disabled"
            :required="required || undefined"
            :name="name"
            :value="value"
            :aria-invalid="invalid || undefined"
        >
            <!--
              指示器在 CheckboxRoot 默认插槽内自绘，而非使用 Reka 的 CheckboxIndicator：
              后者作为嵌套子组件不回传父级 scope id，scoped 样式无法命中其根元素。
              代价是不再拥有 Presence / forceMount 动画能力，需要过渡时再评估。
            -->
            <template #default="{state}">
                <span
                    v-if="state !== false"
                    class="caomei-checkbox__indicator"
                    :data-state="state === 'indeterminate' ? 'indeterminate' : 'checked'"
                >
                    <CaomeiIcon :icon="state === 'indeterminate' ? Minus : Check" />
                </span>
            </template>
        </CheckboxRoot>
        <label
            v-if="hasText"
            class="caomei-checkbox__label"
            :for="checkboxId"
        >
            <slot>{{ text }}</slot>
        </label>
    </div>
</template>

<style scoped>
/*
  `--caomei-checkbox-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  尺寸档位选择器用 :where() 归零特异性，只声明 CSS 变量，避免被基类属性覆盖。
*/
.caomei-checkbox {
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-space-2);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-checkbox-font-size, var(--caomei-font-size-md));
    cursor: pointer;
}

:where(.caomei-checkbox--sm) {
    --caomei-checkbox-size: 16px;
    --caomei-checkbox-font-size: var(--caomei-font-size-sm);
}

:where(.caomei-checkbox--md) {
    --caomei-checkbox-size: 18px;
    --caomei-checkbox-font-size: var(--caomei-font-size-md);
}

:where(.caomei-checkbox--lg) {
    --caomei-checkbox-size: 20px;
    --caomei-checkbox-font-size: var(--caomei-font-size-lg);
}

.caomei-checkbox--disabled {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-checkbox__control {
    box-sizing: border-box;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: var(--caomei-checkbox-size, 18px);
    height: var(--caomei-checkbox-size, 18px);
    padding: 0;
    border: 1px solid var(--caomei-checkbox-border, var(--caomei-color-border));
    border-radius: var(--caomei-checkbox-radius, var(--caomei-radius-sm));
    background: var(--caomei-checkbox-bg, var(--caomei-color-bg));
    color: var(--caomei-checkbox-foreground, var(--caomei-color-primary-foreground));
    cursor: inherit;
    transition: background-color 0.15s ease, border-color 0.15s ease;
}

.caomei-checkbox__control[data-state='checked'],
.caomei-checkbox__control[data-state='indeterminate'] {
    border-color: var(--caomei-checkbox-active-bg, var(--caomei-color-primary));
    background: var(--caomei-checkbox-active-bg, var(--caomei-color-primary));
}

.caomei-checkbox__control:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}

/* 校验失败时保留选中态填充色，仅以危险色描边提示错误 */
.caomei-checkbox--invalid .caomei-checkbox__control {
    border-color: var(--caomei-color-danger);
}

.caomei-checkbox--invalid .caomei-checkbox__control:focus-visible {
    outline-color: var(--caomei-color-danger);
}

.caomei-checkbox__indicator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: calc(var(--caomei-checkbox-size, 18px) * 0.7);
    line-height: 1;
    pointer-events: none;
}

.caomei-checkbox__label {
    cursor: inherit;
    user-select: none;
}

@media (prefers-reduced-motion: reduce) {
    .caomei-checkbox__control {
        transition: none;
    }
}
</style>
