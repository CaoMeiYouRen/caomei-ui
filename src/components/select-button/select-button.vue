<script setup lang="ts" generic="T extends object">
import { ToggleGroupItem, ToggleGroupRoot } from 'reka-ui'
import { computed } from 'vue'
import { resolveOptionDisabled, resolveOptionField, resolveOptionValue } from '../_shared/option'
import { labelAttrs } from '../_shared/use-label-attrs'
import type {
    SelectButtonModelValue,
    SelectButtonProps,
    SelectButtonValue,
} from './types'

defineOptions({ name: 'CaomeiSelectButton', inheritAttrs: false })

const props = withDefaults(defineProps<SelectButtonProps<T>>(), {
    options: () => [],
    optionLabel: 'label',
    optionValue: 'value',
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

interface NormalizedOption {
    /** 解析后的选项值（字符串或数字） */
    value: SelectButtonValue
    /** 解析后的显示文本；字段缺省时为 undefined */
    label: string | undefined
    disabled: boolean
    /** 原始选项对象，供 `#option` 插槽使用 */
    raw: T
}

/** 归一化选项列表：映射字段并剔除解析不到值的项 */
const normalizedOptions = computed<NormalizedOption[]>(() => {
    const result: NormalizedOption[] = []
    for (const option of props.options) {
        const value = resolveOptionValue(option, props.optionValue, 'value')
        if (value === undefined) {
            continue
        }
        result.push({
            value,
            label: resolveOptionField(option, props.optionLabel, 'label'),
            disabled: resolveOptionDisabled(option),
            raw: option,
        })
    }
    return result
})

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
        v-bind="{...$attrs, ...labelAttrs(label)}"
        :id="id"
        :type="rootType"
        :model-value="groupValue"
        :disabled="disabled"
        :name="formName"
        orientation="horizontal"
        class="caomei-select-button"
        :class="[`caomei-select-button--${size}`, {'caomei-select-button--invalid': invalid}]"
        :aria-invalid="invalid || undefined"
        @update:model-value="handleUpdate"
    >
        <ToggleGroupItem
            v-for="option in normalizedOptions"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
            class="caomei-select-button__item"
        >
            <slot
                name="option"
                :option="option.raw"
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
    height: var(--caomei-select-button-height, var(--caomei-control-height-md));
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
    padding: 0 var(--caomei-select-button-item-padding-inline, var(--caomei-space-3));
    border: none;
    border-left: 1px solid var(--caomei-select-button-border, var(--caomei-color-border));
    background: transparent;
    color: var(--caomei-select-button-color, var(--caomei-color-text));
    font: inherit;
    font-size: var(--caomei-select-button-item-font-size, var(--caomei-font-size-md));
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;
}

.caomei-select-button__item:first-child {
    border-left: none;
}

/*
  窄屏：选项按内容宽参与换行（`flex-basis: auto` 才进入换行计算；basis 为 0 时所有选项永远
  排在一行并被裁切），行内仍由 `flex-grow` 均分；选项总宽可超过平板可用宽，故按响应式设计
  §2 的 md 档（≤768px）收敛，仅在实际放不下时换行。

  换行需要容器高度随行数增长：size 档位的高度声明在 `:where()` 内（零特异性），此处用类选择器
  释放为 `auto`，否则新增行会落到盒子外被根元素的 `overflow: hidden` 裁掉；同时给成员补
  `min-height`——容器高度不再固定后成员会被压成文字行高。成员高度减去根元素上下边框（2px），
  使单行形态的高度与释放前完全一致。依据见响应式设计 §3 矩阵 #8。
*/
@media (width <= 768px) {
    .caomei-select-button {
        flex-wrap: wrap;
        height: auto;
    }

    .caomei-select-button__item {
        flex: 1 1 auto;
        min-height: var(--caomei-select-button-item-min-height, calc(var(--caomei-control-height-md) - 2px));
    }
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
    opacity: var(--caomei-disabled-opacity);
}

:where(.caomei-select-button--sm) {
    --caomei-select-button-height: var(--caomei-control-height-sm);
    --caomei-select-button-item-padding-inline: var(--caomei-space-2);
    --caomei-select-button-item-font-size: var(--caomei-font-size-sm);
    --caomei-select-button-item-min-height: calc(var(--caomei-control-height-sm) - 2px);
}

:where(.caomei-select-button--lg) {
    --caomei-select-button-height: var(--caomei-control-height-lg);
    --caomei-select-button-item-padding-inline: var(--caomei-space-4);
    --caomei-select-button-item-font-size: var(--caomei-font-size-lg);
    --caomei-select-button-item-min-height: calc(var(--caomei-control-height-lg) - 2px);
}

@media (prefers-reduced-motion: reduce) {
    .caomei-select-button__item {
        transition: none;
    }
}
</style>
