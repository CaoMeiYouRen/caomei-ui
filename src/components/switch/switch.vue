<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui'
import { useAttrForwarding } from '../_shared/use-attr-forwarding'
import { useLabelAttrs } from '../_shared/use-label-attrs'
import type { SwitchProps } from './types'

defineOptions({ name: 'CaomeiSwitch', inheritAttrs: false })

const props = withDefaults(defineProps<SwitchProps>(), {
    disabled: false,
    required: false,
    label: '',
})

const model = defineModel<boolean>({ default: false })

const emit = defineEmits<{
    /**
     * 用户交互切换时触发（程序化改值不触发），载荷为切换后的值
     * @en Emitted when the user toggles the switch (not on programmatic changes); payload is the new value
     */
    change: [value: boolean]
}>()

/**
 * Reka 仅在实际交互时抛出 `update:modelValue`，父级程序化改值不会回抛，
 * 因此以该事件作为「用户交互」判别点，并据此补发 `change`。
 */
function onModelUpdate(value: boolean): void {
    model.value = value
    emit('change', value)
}

const { rootAttrs, controlAttrs } = useAttrForwarding()

/** label 属性优先于透传的 aria-label；二者都缺省时交由 Reka 从 `label[for]` 推导 */
const switchAttrs = useLabelAttrs(() => props.label, () => ({
    ...rootAttrs.value,
    ...controlAttrs.value,
}))
</script>

<template>
    <SwitchRoot
        v-bind="switchAttrs"
        :id="id"
        :model-value="model"
        :name="name"
        :value="value"
        :disabled="disabled"
        :required="required || undefined"
        class="caomei-switch"
        :class="{'caomei-switch--disabled': disabled}"
        @update:model-value="onModelUpdate"
    >
        <SwitchThumb class="caomei-switch__thumb" />
    </SwitchRoot>
</template>

<style scoped>
/*
  `--caomei-switch-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值。
  尺寸与位移可用变量覆盖，但位移需与宽高匹配；不提供尺寸档位。
*/
.caomei-switch {
    box-sizing: border-box;
    position: relative;
    display: inline-flex;
    align-items: center;
    width: var(--caomei-switch-width, 40px);
    height: var(--caomei-switch-height, 22px);
    padding: 2px;
    border: 1px solid var(--caomei-switch-border, var(--caomei-color-border));
    border-radius: var(--caomei-switch-radius, 999px);
    background: var(--caomei-switch-bg, var(--caomei-color-border));
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease;
}

.caomei-switch[data-state='checked'] {
    border-color: var(--caomei-switch-active-bg, var(--caomei-color-primary));
    background: var(--caomei-switch-active-bg, var(--caomei-color-primary));
}

.caomei-switch:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}

.caomei-switch--disabled {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-switch__thumb {
    display: block;
    width: var(--caomei-switch-thumb-size, 16px);
    height: var(--caomei-switch-thumb-size, 16px);
    border-radius: 50%;
    background: var(--caomei-switch-thumb-bg, var(--caomei-color-bg));
    transition: transform 0.15s ease;
}

.caomei-switch[data-state='checked'] .caomei-switch__thumb {
    transform: translateX(var(--caomei-switch-thumb-travel, 18px));
}

@media (prefers-reduced-motion: reduce) {
    .caomei-switch,
    .caomei-switch__thumb {
        transition: none;
    }
}
</style>
