<script setup lang="ts" generic="T extends object">
import { CheckboxGroupRoot } from 'reka-ui'
import { computed } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiCheckbox, type CheckboxModel, type CheckboxState } from '../checkbox'
import {
    resolveOptionDisabled,
    resolveOptionField,
    resolveOptionValue,
    type OptionValue,
} from '../_shared/option'
import type { CheckboxGroupProps } from './types'

defineOptions({ name: 'CaomeiCheckboxGroup' })

const props = withDefaults(defineProps<CheckboxGroupProps<T>>(), {
    options: () => [],
    optionLabel: 'label',
    optionValue: 'value',
    size: 'md',
    disabled: false,
    invalid: false,
    selectAll: false,
    rovingFocus: false,
    required: false,
})

const model = defineModel<OptionValue[]>({ default: () => [] })

const locale = useLocale()
const selectAllText = computed(() => props.selectAllText ?? locale.value.checkbox.selectAll)

interface NormalizedOption {
    value: OptionValue
    label: string | undefined
    disabled: boolean
}

/** 归一化选项列表：映射字段并剔除解析不到值的项（与 Select / MultiSelect 同口径） */
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
        })
    }
    return result
})

/** 可参与全选的选项值（禁用项不参与，避免全选写入无法交互的值） */
const selectableValues = computed(() =>
    normalizedOptions.value.filter((option) => !option.disabled).map((option) => option.value),
)

const selectedCount = computed(
    () => selectableValues.value.filter((value) => model.value.includes(value)).length,
)

/** 全选项状态：全选中 → true，部分选中 → 半选，未选中或无可选项 → false */
const selectAllState = computed<CheckboxState>(() => {
    if (selectedCount.value === 0 || selectableValues.value.length === 0) {
        return false
    }
    return selectedCount.value === selectableValues.value.length ? true : 'indeterminate'
})

const selectAllDisabled = computed(() => props.disabled || selectableValues.value.length === 0)

/** 全选 / 取消全选：只增删可选项，已选中的禁用项值保持不变 */
function onToggleAll(checked: CheckboxModel | undefined): void {
    if (checked === true) {
        model.value = Array.from(new Set([...model.value, ...selectableValues.value]))
        return
    }
    const selectable = new Set(selectableValues.value)
    model.value = model.value.filter((value) => !selectable.has(value))
}

const rootClass = computed(() => `caomei-checkbox-group--${props.size}`)
</script>

<template>
    <div
        :id="id"
        class="caomei-checkbox-group"
        :class="rootClass"
        role="group"
        :aria-label="label || undefined"
        :aria-invalid="invalid || undefined"
    >
        <CaomeiCheckbox
            v-if="selectAll"
            class="caomei-checkbox-group__select-all"
            :model-value="selectAllState"
            :text="selectAllText"
            :size="size"
            :invalid="invalid"
            :disabled="selectAllDisabled"
            @update:model-value="onToggleAll"
        />
        <!--
          数组模型与「按 value 增删」由 Reka 的 CheckboxGroupRoot 上下文承接，
          子项只需提供 value；分组自身的 name / required 落到其隐藏表单控件上。
        -->
        <CheckboxGroupRoot
            v-model="model"
            :name="name"
            :required="required || undefined"
            :disabled="disabled"
            :roving-focus="rovingFocus"
            class="caomei-checkbox-group__options"
        >
            <CaomeiCheckbox
                v-for="option in normalizedOptions"
                :key="option.value"
                :value="option.value"
                :text="option.label"
                :size="size"
                :invalid="invalid"
                :disabled="disabled || option.disabled"
            />
            <slot />
        </CheckboxGroupRoot>
    </div>
</template>

<style scoped>
/*
  `--caomei-checkbox-group-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  尺寸档位选择器用 :where() 归零特异性，只声明 CSS 变量。
  禁用态不在此处叠加透明度：子项各自已按 `--caomei-disabled-opacity` 处理，分组再乘会双重变淡。
*/
.caomei-checkbox-group {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-checkbox-group-gap, var(--caomei-space-2));
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-checkbox-group-font-size, var(--caomei-font-size-md));
}

.caomei-checkbox-group__options {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-checkbox-group-gap, var(--caomei-space-2));
}

:where(.caomei-checkbox-group--sm) {
    --caomei-checkbox-group-font-size: var(--caomei-font-size-sm);
}

:where(.caomei-checkbox-group--md) {
    --caomei-checkbox-group-font-size: var(--caomei-font-size-md);
}

:where(.caomei-checkbox-group--lg) {
    --caomei-checkbox-group-font-size: var(--caomei-font-size-lg);
}
</style>
