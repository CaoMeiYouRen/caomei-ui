<script setup lang="ts">
import { ToggleGroupItem, ToggleGroupRoot } from 'reka-ui'
import { computed } from 'vue'
import type {
    SelectButtonModelValue,
    SelectButtonProps,
    SelectButtonValue,
} from './types'

defineOptions({ name: 'CaomeiSelectButton', inheritAttrs: false })

const props = withDefaults(defineProps<SelectButtonProps>(), {
    options: () => [],
    multiple: false,
    size: 'md',
    disabled: false,
    invalid: false,
})

const model = defineModel<SelectButtonModelValue | undefined>()

/**
 * 单选尚无选中值时，向 Reka 传入该占位对象，使其始终处于受控模式，
 * 从而忽略「再次点击已选项」产生的取消选中（segmented control 需保持一个选中项）。
 *
 * 注意：该值不得进入原生表单字段，故仅在已选中时才向 Reka 传 `name`。
 */
const EMPTY_SINGLE_VALUE: Readonly<Record<string, unknown>> = Object.freeze({
    __caomeiSelectButtonEmpty: true,
})

const rootType = computed(() => (props.multiple ? 'multiple' : 'single'))

const selectedValues = computed<SelectButtonValue[]>(() => {
    if (props.multiple) {
        return Array.isArray(model.value) ? model.value : []
    }
    return model.value === undefined || Array.isArray(model.value) ? [] : [model.value]
})

const groupValue = computed<SelectButtonValue | SelectButtonValue[] | Readonly<Record<string, unknown>>>(() => {
    if (props.multiple) {
        return selectedValues.value
    }
    return selectedValues.value[0] ?? EMPTY_SINGLE_VALUE
})

/** 单选未选中时不向 Reka 传 name，避免占位值经隐藏输入进入表单提交 */
const formName = computed(() =>
    props.name && (props.multiple || selectedValues.value.length > 0) ? props.name : undefined,
)

function isSelected(value: SelectButtonValue): boolean {
    return selectedValues.value.includes(value)
}

function handleUpdate(value: unknown): void {
    if (props.multiple) {
        model.value = Array.isArray(value) ? (value as SelectButtonValue[]) : selectedValues.value
        return
    }
    if (typeof value === 'string' || typeof value === 'number') {
        model.value = value
    }
}
</script>

<template>
    <ToggleGroupRoot
        v-bind="$attrs"
        :id="id"
        :type="rootType"
        :model-value="groupValue"
        :disabled="disabled"
        :name="formName"
        orientation="horizontal"
        class="caomei-select-button"
        :class="[`caomei-select-button--${size}`, {'caomei-select-button--invalid': invalid}]"
        :aria-label="label"
        :aria-invalid="invalid || undefined"
        @update:model-value="handleUpdate"
    >
        <ToggleGroupItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
            class="caomei-select-button__item"
        >
            <slot
                name="option"
                :option="option"
                :selected="isSelected(option.value)"
            >
                {{ option.label }}
            </slot>
        </ToggleGroupItem>
    </ToggleGroupRoot>
</template>

<style scoped>
.caomei-select-button {
    box-sizing: border-box;
    display: inline-flex;
    overflow: hidden;
    border: 1px solid var(--caomei-select-button-border, var(--caomei-color-border));
    border-radius: var(--caomei-select-button-radius, var(--caomei-radius-md));
    background: var(--caomei-select-button-bg, var(--caomei-color-bg));
    font-family: var(--caomei-font-sans);
}

.caomei-select-button--invalid {
    border-color: var(--caomei-select-button-invalid-border, var(--caomei-color-danger));
}

.caomei-select-button__item {
    box-sizing: border-box;
    display: inline-flex;
    flex: 1 1 0;
    align-items: center;
    justify-content: center;
    gap: var(--caomei-select-button-gap, var(--caomei-space-1));
    border: none;
    border-left: 1px solid var(--caomei-select-button-border, var(--caomei-color-border));
    background: transparent;
    color: var(--caomei-select-button-color, var(--caomei-color-text));
    font: inherit;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;
}

.caomei-select-button__item:first-child {
    border-left: none;
}

.caomei-select-button__item:hover:not([data-disabled], [data-state='on']) {
    background: var(--caomei-color-bg-elevated);
}

.caomei-select-button__item:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: -2px;
}

.caomei-select-button__item[data-state='on'] {
    background: var(--caomei-select-button-active-bg, var(--caomei-color-primary));
    color: var(--caomei-select-button-active-color, var(--caomei-color-primary-foreground));
}

.caomei-select-button__item[data-disabled] {
    cursor: not-allowed;
    opacity: 0.5;
}

:where(.caomei-select-button--sm) {
    height: var(--caomei-control-height-sm);
}

:where(.caomei-select-button--sm) .caomei-select-button__item {
    padding: 0 var(--caomei-space-2);
    font-size: var(--caomei-font-size-sm);
}

:where(.caomei-select-button--md) {
    height: var(--caomei-control-height-md);
}

:where(.caomei-select-button--md) .caomei-select-button__item {
    padding: 0 var(--caomei-space-3);
    font-size: var(--caomei-font-size-md);
}

:where(.caomei-select-button--lg) {
    height: var(--caomei-control-height-lg);
}

:where(.caomei-select-button--lg) .caomei-select-button__item {
    padding: 0 var(--caomei-space-4);
    font-size: var(--caomei-font-size-lg);
}

@media (prefers-reduced-motion: reduce) {
    .caomei-select-button__item {
        transition: none;
    }
}
</style>
