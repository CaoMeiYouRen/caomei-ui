<script setup lang="ts" generic="T extends object">
import { Check, ChevronDown, X } from '@lucide/vue'
import {
    SelectContent,
    SelectIcon,
    SelectItem,
    SelectItemIndicator,
    SelectItemText,
    SelectLabel,
    SelectGroup,
    SelectPortal,
    SelectRoot,
    SelectTrigger,
    SelectValue,
    SelectViewport,
} from 'reka-ui'
import { computed, nextTick, ref } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon } from '../../icons'
import { resolveOptionDisabled, resolveOptionField, resolveOptionValue, type OptionValue } from '../_shared/option'
import { labelAttrs } from '../_shared/use-label-attrs'
import type { SelectOptionGroup, SelectProps } from './types'

defineOptions({ name: 'CaomeiSelect', inheritAttrs: false })

const props = withDefaults(defineProps<SelectProps<T>>(), {
    options: () => [],
    optionLabel: 'label',
    optionValue: 'value',
    placeholder: '',
    size: 'md',
    disabled: false,
    invalid: false,
    bodyLock: false,
    showClear: false,
})

defineSlots<{
    /**
     * 自定义选项内容；`option` 为原始选项对象，`selected` 表示是否为当前选中项
     * @en Custom option content; `option` is the raw option object and `selected` marks the selected one
     */
    option?: (props: { option: T, selected: boolean }) => unknown
}>()

const model = defineModel<OptionValue | null>()

const locale = useLocale()
const clearLabel = computed(() => props.clearLabel ?? locale.value.select.clear)

interface NormalizedOption {
    /** 原始选项对象，供 `#option` 插槽使用 */
    raw: T
    /** 解析后的选项值（字符串或数字） */
    value: OptionValue
    /** 解析后的显示文本；字段缺省时为 undefined */
    label: string | undefined
    disabled: boolean
    /** 是否为当前选中项 */
    selected: boolean
}

/** 判断是否为分组形态 */
function isOptionGroup(option: T | SelectOptionGroup<T>): option is SelectOptionGroup<T> {
    return 'options' in option && Array.isArray(option.options)
}

/** 归一化选项列表：映射字段并剔除解析不到值的项，供触发器与面板共用 */
const normalizedOptions = computed<NormalizedOption[]>(() => {
    const result: NormalizedOption[] = []
    for (const option of props.options) {
        // 跳过分组项，由模板单独处理
        if (isOptionGroup(option)) {
            continue
        }
        const value = resolveOptionValue(option, props.optionValue, 'value')
        if (value === undefined) {
            continue
        }
        result.push({
            raw: option,
            value,
            label: resolveOptionField(option, props.optionLabel, 'label'),
            disabled: resolveOptionDisabled(option),
            selected: value === model.value,
        })
    }
    return result
})

/** 归一化分组列表 */
const normalizedGroups = computed(() => {
    const result: { label: string, options: NormalizedOption[] }[] = []
    for (const option of props.options) {
        if (!isOptionGroup(option)) {
            continue
        }
        const groupOptions: NormalizedOption[] = []
        for (const item of option.options) {
            const value = resolveOptionValue(item, props.optionValue, 'value')
            if (value === undefined) {
                continue
            }
            groupOptions.push({
                raw: item,
                value,
                label: resolveOptionField(item, props.optionLabel, 'label'),
                disabled: resolveOptionDisabled(item),
                selected: value === model.value,
            })
        }
        result.push({ label: option.label, options: groupOptions })
    }
    return result
})

/** 是否包含分组 */
const hasGroups = computed(() => props.options.some(isOptionGroup))

/** 有选中值（用于 data-filled；不依赖选项 label，空 label 也视为有值） */
const hasValue = computed(
    () => model.value !== undefined && model.value !== null && model.value !== '',
)

const clearable = computed(() => props.showClear && hasValue.value && !props.disabled)

const selectedLabel = computed(() => {
    if (!hasValue.value) {
        return undefined
    }
    // 先从扁平选项中查找
    const flatMatch = normalizedOptions.value.find((option) => option.value === model.value)
    if (flatMatch) {
        return flatMatch.label
    }
    // 再从分组中查找
    for (const group of normalizedGroups.value) {
        const match = group.options.find((option) => option.value === model.value)
        if (match) {
            return match.label
        }
    }
    return undefined
})

const rootClass = computed(() => [
    `caomei-select--${props.size}`,
    {
        'caomei-select--invalid': props.invalid,
        'caomei-select--disabled': props.disabled,
        'caomei-select--clearable': clearable.value,
    },
])

const triggerRef = ref<{ $el?: unknown } | null>(null)

/** 清空模型，并把焦点交回触发器：清除后按钮自身被移除，否则焦点会掉到 body */
function clearValue(): void {
    model.value = null
    void nextTick(() => {
        // 受控用法下外层可能拒绝更新：此时按钮仍在，不应把它自身的焦点抢走
        if (clearable.value) {
            return
        }
        const element = triggerRef.value?.$el
        if (element instanceof HTMLElement) {
            element.focus()
        }
    })
}
</script>

<template>
    <SelectRoot
        v-model="model"
        :disabled="disabled"
        :name="name"
    >
        <div
            class="caomei-select__field"
            :class="`caomei-select__field--${size}`"
        >
            <SelectTrigger
                v-bind="{...$attrs, ...labelAttrs(label)}"
                :id="id"
                ref="triggerRef"
                class="caomei-select"
                :class="rootClass"
                :data-filled="hasValue ? 'true' : undefined"
                :data-has-placeholder="placeholder ? 'true' : undefined"
                :aria-invalid="invalid || undefined"
            >
                <SelectValue class="caomei-select__value">
                    <span v-if="selectedLabel">{{ selectedLabel }}</span>
                    <span v-else class="caomei-select__placeholder">{{ placeholder }}</span>
                </SelectValue>
                <SelectIcon class="caomei-select__icon">
                    <CaomeiIcon :icon="ChevronDown" />
                </SelectIcon>
            </SelectTrigger>
            <button
                v-if="clearable"
                type="button"
                class="caomei-select__clear"
                :aria-label="clearLabel"
                @click="clearValue"
            >
                <CaomeiIcon :icon="X" />
            </button>
        </div>
        <SelectPortal>
            <SelectContent
                class="caomei-select__content"
                position="popper"
                :side-offset="4"
                :body-lock="bodyLock"
            >
                <SelectViewport class="caomei-select__viewport">
                    <!-- 扁平选项 -->
                    <template v-if="!hasGroups">
                        <SelectItem
                            v-for="option in normalizedOptions"
                            :key="option.value"
                            class="caomei-select__item"
                            :value="option.value"
                            :disabled="option.disabled"
                        >
                            <SelectItemText class="caomei-select__item-text">
                                <slot
                                    name="option"
                                    :option="option.raw"
                                    :selected="option.selected"
                                >
                                    {{ option.label }}
                                </slot>
                            </SelectItemText>
                            <SelectItemIndicator class="caomei-select__indicator">
                                <CaomeiIcon :icon="Check" />
                            </SelectItemIndicator>
                        </SelectItem>
                    </template>
                    <!-- 分组选项 -->
                    <template v-else>
                        <!-- 顶层扁平选项 -->
                        <SelectItem
                            v-for="option in normalizedOptions"
                            :key="option.value"
                            class="caomei-select__item"
                            :value="option.value"
                            :disabled="option.disabled"
                        >
                            <SelectItemText class="caomei-select__item-text">
                                <slot
                                    name="option"
                                    :option="option.raw"
                                    :selected="option.selected"
                                >
                                    {{ option.label }}
                                </slot>
                            </SelectItemText>
                            <SelectItemIndicator class="caomei-select__indicator">
                                <CaomeiIcon :icon="Check" />
                            </SelectItemIndicator>
                        </SelectItem>
                        <!-- 分组 -->
                        <SelectGroup
                            v-for="(group, groupIndex) in normalizedGroups"
                            :key="`group-${group.label}-${groupIndex}`"
                            class="caomei-select-group"
                        >
                            <SelectLabel class="caomei-select-group__label">
                                {{ group.label }}
                            </SelectLabel>
                            <SelectItem
                                v-for="option in group.options"
                                :key="option.value"
                                class="caomei-select__item"
                                :value="option.value"
                                :disabled="option.disabled"
                            >
                                <SelectItemText class="caomei-select__item-text">
                                    <slot
                                        name="option"
                                        :option="option.raw"
                                        :selected="option.selected"
                                    >
                                        {{ option.label }}
                                    </slot>
                                </SelectItemText>
                                <SelectItemIndicator class="caomei-select__indicator">
                                    <CaomeiIcon :icon="Check" />
                                </SelectItemIndicator>
                            </SelectItem>
                        </SelectGroup>
                    </template>
                </SelectViewport>
            </SelectContent>
        </SelectPortal>
    </SelectRoot>
</template>

<style scoped>
.caomei-select {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--caomei-space-1);
    width: 100%;
    padding: 0 var(--caomei-select-padding-end, var(--caomei-space-3));
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    cursor: pointer;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

/*
  清除按钮与触发器是兄弟节点（触发器为 <button>，嵌套按钮会破坏 SSR 输出结构），
  因此以绝对定位覆盖在字段右侧 [图标 + 间隙] 之前，输入区右端留出按钮宽度，避免文本压到按钮下方。
*/
.caomei-select--clearable .caomei-select__value {
    margin-inline-end: calc(var(--caomei-select-clear-width, 1.25rem) + var(--caomei-space-1));
}

.caomei-select:focus-visible {
    border-color: var(--caomei-color-primary);
    outline: none;
    box-shadow: 0 0 0 2px var(--caomei-color-border);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-primary) 20%, transparent);
}

.caomei-select--invalid {
    border-color: var(--caomei-color-danger);
}

.caomei-select--invalid:focus-visible {
    border-color: var(--caomei-color-danger);
    box-shadow: 0 0 0 2px var(--caomei-color-border);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-danger) 20%, transparent);
}

.caomei-select--disabled {
    cursor: not-allowed;
    background: var(--caomei-color-bg-elevated);
    opacity: var(--caomei-disabled-opacity);
}

/*
  字段外层仅承担「宽度上限 + 定位上下文 + 尺寸变量分发」：
  触发器保留 `.caomei-select` 类与全部交互属性，清除按钮是其兄弟节点（避免嵌套 <button>）。
  宽度上限因此只在此处声明一次；覆盖 `--caomei-select-max-width` 需作用于本元素或其祖先。
  可覆盖 token（如 `--caomei-select-clear-width`）不在本规则内预声明默认值，改由消费处 fallback 提供。
*/
.caomei-select__field {
    position: relative;
    display: inline-flex;
    width: 100%;
    max-width: var(--caomei-select-max-width);
    font-size: var(--caomei-select-field-font-size, var(--caomei-font-size-md));
}

/* 尺寸档位只声明变量：右内边距 / 图标尺寸供触发器与兄弟节点清除按钮共同消费，字号由基类回退消费 */
:where(.caomei-select__field--sm) {
    --caomei-select-padding-end: var(--caomei-space-2);
    --caomei-select-icon-size: var(--caomei-font-size-sm);
    --caomei-select-field-font-size: var(--caomei-font-size-sm);
}

:where(.caomei-select__field--md) {
    --caomei-select-padding-end: var(--caomei-space-3);
    --caomei-select-icon-size: var(--caomei-font-size-md);
}

:where(.caomei-select__field--lg) {
    --caomei-select-padding-end: var(--caomei-space-4);
    --caomei-select-icon-size: var(--caomei-font-size-lg);
    --caomei-select-field-font-size: var(--caomei-font-size-lg);
}

.caomei-select__clear {
    position: absolute;
    inset-block: 0;
    inset-inline-end: calc(var(--caomei-select-padding-end, var(--caomei-space-3)) + var(--caomei-select-icon-size, 1rem) + var(--caomei-space-1));
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--caomei-select-clear-width, 1.25rem);
    padding: 0;
    border: 0;
    border-radius: var(--caomei-radius-sm);
    background: transparent;
    color: var(--caomei-color-text-muted);

    /* 按钮默认不继承字体：显式继承以保持图标与字段文本同源 */
    font: inherit;
    cursor: pointer;
}

.caomei-select__clear:hover {
    color: var(--caomei-color-text);
}

.caomei-select__clear:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-select--sm {
    height: var(--caomei-control-height-sm);
    font-size: var(--caomei-font-size-sm);
}

.caomei-select--md {
    height: var(--caomei-control-height-md);
    font-size: var(--caomei-font-size-md);
}

.caomei-select--lg {
    height: var(--caomei-control-height-lg);
    font-size: var(--caomei-font-size-lg);
}

.caomei-select__value {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-align: left;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.caomei-select__placeholder {
    color: var(--caomei-color-text-muted);
}

.caomei-select__icon {
    display: inline-flex;
    flex-shrink: 0;
    color: var(--caomei-color-text-muted);
}

/* 图标尺寸走 token（与档位字号同源），使清除按钮的定位不依赖 `em` 解析上下文 */
.caomei-select__icon svg {
    width: var(--caomei-select-icon-size, 1rem);
    height: var(--caomei-select-icon-size, 1rem);
}
</style>

<!--
  Portal 面板样式说明：Reka UI 的 SelectContent 由 popper 包裹层挂载到 body，scoped 的
  data-v 属性落在包裹层而非面板本体，因此 `.caomei-select__content[data-v-x]` 无法命中。
  `:deep(.caomei-select__content)` 虽可通过「祖先 + 后代」命中，但会提高特异性并依赖
  Vue 作用域沿 popper 包裹层下放；这里改用命名空间化（`caomei-select__` 前缀）的
  非 scoped 规则，特异性更低、更易被使用方覆盖。
-->
<style>
.caomei-select__content {
    box-sizing: border-box;
    z-index: var(--caomei-z-overlay);
    overflow: hidden;

    /*
    窄屏收敛：宽度上限取 popper 可用宽（Reka 由 floating-ui 的 size 中间件写在 popper 包裹层，
    与触发器宽同源）；min-width 同步用 min() 收敛，否则 min-width 会压过 max-width 导致越界。
    桌面下可用宽远大于面板自然宽度，故该上限不改变既有表现。
    两个变量同时提供，缺失时 max-width 回退 none、min-width 回退 auto（退回本规则引入前的行为）。
     */
    min-width: min(var(--reka-select-trigger-width), var(--reka-select-content-available-width));
    max-width: var(--reka-select-content-available-width, none);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    box-shadow: var(--caomei-shadow-md);
}

.caomei-select__viewport {
    padding: var(--caomei-space-1);
}

.caomei-select__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--caomei-space-2);
    padding: var(--caomei-space-1) var(--caomei-space-2);
    border-radius: var(--caomei-radius-sm);
    font-size: var(--caomei-font-size-md);
    cursor: pointer;
    user-select: none;
    outline: none;
}

.caomei-select__item[data-highlighted] {
    background: var(--caomei-color-bg-elevated);
}

/* 长选项文本省略号：面板宽度被可用宽限制后，文本须可收缩而非撑破面板 */
.caomei-select__item-text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.caomei-select__item[data-disabled] {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-select__indicator {
    display: inline-flex;
    flex-shrink: 0;
    color: var(--caomei-color-primary);
}

.caomei-select-group {
    padding-block: var(--caomei-space-1);
}

.caomei-select-group__label {
    display: block;
    padding: var(--caomei-space-1) var(--caomei-space-2);
    font-size: var(--caomei-font-size-sm);
    font-weight: 600;
    color: var(--caomei-color-text-muted);
    user-select: none;
}
</style>
