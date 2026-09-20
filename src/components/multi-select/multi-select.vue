<script setup lang="ts" generic="T extends object">
import { Check, ChevronDown, X } from '@lucide/vue'
import {
    ComboboxAnchor,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxItemIndicator,
    ComboboxPortal,
    ComboboxRoot,
    ComboboxTrigger,
    ComboboxViewport,
} from 'reka-ui'
import { computed, nextTick, ref } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon } from '../../icons'
import { useAttrForwarding } from '../_shared/use-attr-forwarding'
import {
    resolveOptionDisabled,
    resolveOptionField,
    resolveOptionValue,
    type OptionValue,
} from '../_shared/option'
import { labelAttrs } from '../_shared/use-label-attrs'
import type { MultiSelectProps } from './types'

defineOptions({ name: 'CaomeiMultiSelect', inheritAttrs: false })

const props = withDefaults(defineProps<MultiSelectProps<T>>(), {
    options: () => [],
    optionLabel: 'label',
    optionValue: 'value',
    placeholder: '',
    size: 'md',
    disabled: false,
    invalid: false,
    required: false,
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

const model = defineModel<OptionValue[]>({ default: () => [] })

const { rootAttrs, controlAttrs } = useAttrForwarding()

const locale = useLocale()
const openLabel = computed(() => props.openLabel ?? locale.value.multiSelect.open)
const removeLabel = computed(() => props.removeLabel ?? locale.value.multiSelect.remove)
const emptyLabel = computed(() => props.emptyLabel ?? locale.value.multiSelect.empty)
const clearLabel = computed(() => props.clearLabel ?? locale.value.multiSelect.clear)

const rootClass = computed(() => [
    `caomei-multi-select--${props.size}`,
    {
        'caomei-multi-select--invalid': props.invalid,
        'caomei-multi-select--disabled': props.disabled,
    },
])

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

/** 归一化选项列表：映射字段并剔除解析不到值的项，供触发器与面板共用 */
const normalizedOptions = computed<NormalizedOption[]>(() => {
    const result: NormalizedOption[] = []
    for (const option of props.options) {
        const value = resolveOptionValue(option, props.optionValue, 'value')
        if (value === undefined) {
            continue
        }
        result.push({
            raw: option,
            value,
            label: resolveOptionField(option, props.optionLabel, 'label'),
            disabled: resolveOptionDisabled(option),
            selected: model.value.includes(value),
        })
    }
    return result
})

const selectedOptions = computed<NormalizedOption[]>(() => {
    const seen = new Set<OptionValue>()
    const result: NormalizedOption[] = []
    for (const value of model.value) {
        if (seen.has(value)) {
            continue
        }
        seen.add(value)
        const option = normalizedOptions.value.find((item) => item.value === value)
        if (option) {
            result.push(option)
        }
    }
    return result
})

function removeValue(value: OptionValue): void {
    model.value = model.value.filter((item) => item !== value)
}

/** 有选中项且未禁用时显示清除按钮（与 Select 的 `showClear` 口径一致） */
const clearable = computed(() => props.showClear && model.value.length > 0 && !props.disabled)

const inputRef = ref<{ $el?: unknown } | null>(null)

/**
 * 清空模型，并把焦点交回输入框：清除后按钮自身被移除，否则焦点会掉到 body。
 * 注意清空后各选项的 `selected` 同步复位，面板保持当前开合状态不变。
 */
function clearValue(): void {
    model.value = []
    void nextTick(() => {
        // 受控用法下外层可能拒绝更新：此时按钮仍在，不应把它自身的焦点抢走
        if (clearable.value) {
            return
        }
        const element = inputRef.value?.$el
        if (element instanceof HTMLElement) {
            element.focus()
        }
    })
}

/** 点击字段空白处聚焦搜索输入框，贴合原生多选字段的交互习惯 */
function onAnchorClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null
    if (target?.closest('button, input')) {
        return
    }
    ;(event.currentTarget as HTMLElement | null)?.querySelector('input')?.focus()
}
</script>

<template>
    <ComboboxRoot
        v-model="model"
        multiple
        :disabled="disabled"
        :name="name"
        :required="required"
        :open-on-click="true"
    >
        <ComboboxAnchor
            v-bind="rootAttrs"
            class="caomei-multi-select"
            :class="rootClass"
            :data-filled="model.length > 0 ? 'true' : undefined"
            @click="onAnchorClick"
        >
            <span
                v-for="option in selectedOptions"
                :key="option.value"
                class="caomei-multi-select__tag"
            >
                <span class="caomei-multi-select__tag-label">{{ option.label }}</span>
                <button
                    type="button"
                    class="caomei-multi-select__tag-remove"
                    :disabled="disabled"
                    :aria-label="`${removeLabel} ${option.label}`"
                    @click.stop="removeValue(option.value)"
                >
                    <CaomeiIcon :icon="X" />
                </button>
            </span>
            <ComboboxInput
                v-bind="{...controlAttrs, ...labelAttrs(label)}"
                :id="id"
                ref="inputRef"
                class="caomei-multi-select__input"
                :placeholder="model.length === 0 ? placeholder : undefined"
                :aria-invalid="invalid || undefined"
                :disabled="disabled"
            />
            <button
                v-if="clearable"
                type="button"
                class="caomei-multi-select__clear"
                :aria-label="clearLabel"
                @click.stop="clearValue"
            >
                <CaomeiIcon :icon="X" />
            </button>
            <ComboboxTrigger
                class="caomei-multi-select__icon"
                :disabled="disabled"
                :aria-label="openLabel"
            >
                <CaomeiIcon :icon="ChevronDown" />
            </ComboboxTrigger>
        </ComboboxAnchor>
        <ComboboxPortal>
            <ComboboxContent
                class="caomei-multi-select__content"
                position="popper"
                :side-offset="4"
                :body-lock="bodyLock"
            >
                <ComboboxViewport class="caomei-multi-select__viewport">
                    <ComboboxEmpty class="caomei-multi-select__empty">
                        {{ emptyLabel }}
                    </ComboboxEmpty>
                    <ComboboxItem
                        v-for="option in normalizedOptions"
                        :key="option.value"
                        class="caomei-multi-select__item"
                        :value="option.value"
                        :disabled="option.disabled"
                        :text-value="option.label"
                    >
                        <span class="caomei-multi-select__item-label">
                            <slot
                                name="option"
                                :option="option.raw"
                                :selected="option.selected"
                            >
                                {{ option.label }}
                            </slot>
                        </span>
                        <ComboboxItemIndicator class="caomei-multi-select__indicator">
                            <CaomeiIcon :icon="Check" />
                        </ComboboxItemIndicator>
                    </ComboboxItem>
                </ComboboxViewport>
            </ComboboxContent>
        </ComboboxPortal>
    </ComboboxRoot>
</template>

<style scoped>
/*
  `--caomei-multi-select-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  档位选择器用 :where() 归零特异性，只声明 CSS 变量。
*/
.caomei-multi-select {
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--caomei-space-1);
    width: 100%;
    max-width: var(--caomei-multi-select-max-width, var(--caomei-select-max-width));
    min-height: var(--caomei-multi-select-min-height, var(--caomei-control-height-md));
    padding: var(--caomei-multi-select-padding-block, var(--caomei-space-1)) var(--caomei-multi-select-padding-inline, var(--caomei-space-3));
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-multi-select-font-size, var(--caomei-font-size-md));
    cursor: text;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.caomei-multi-select:focus-within {
    border-color: var(--caomei-color-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-primary) 20%, transparent);
}

.caomei-multi-select--invalid {
    border-color: var(--caomei-color-danger);
}

.caomei-multi-select--invalid:focus-within {
    border-color: var(--caomei-color-danger);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-danger) 20%, transparent);
}

.caomei-multi-select--disabled {
    cursor: not-allowed;
    background: var(--caomei-color-bg-elevated);
    opacity: var(--caomei-disabled-opacity);
}

:where(.caomei-multi-select--sm) {
    --caomei-multi-select-min-height: var(--caomei-control-height-sm);
    --caomei-multi-select-padding-block: var(--caomei-space-1);
    --caomei-multi-select-padding-inline: var(--caomei-space-2);
    --caomei-multi-select-font-size: var(--caomei-font-size-sm);
}

:where(.caomei-multi-select--lg) {
    --caomei-multi-select-min-height: var(--caomei-control-height-lg);
    --caomei-multi-select-padding-block: var(--caomei-space-2);
    --caomei-multi-select-padding-inline: var(--caomei-space-4);
    --caomei-multi-select-font-size: var(--caomei-font-size-lg);
}

.caomei-multi-select__tag {
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-space-1);
    max-width: 100%;
    padding: 0 var(--caomei-space-1) 0 var(--caomei-space-2);
    border-radius: var(--caomei-radius-sm);
    background: var(--caomei-color-bg-elevated);
    font-size: var(--caomei-font-size-sm);
    line-height: 1.6;
}

.caomei-multi-select__tag-label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.caomei-multi-select__tag-remove {
    display: inline-flex;
    flex-shrink: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--caomei-color-text-muted);
    cursor: pointer;
}

.caomei-multi-select__tag-remove:hover {
    color: var(--caomei-color-text);
}

.caomei-multi-select__tag-remove:focus-visible {
    border-radius: var(--caomei-radius-sm);
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-multi-select__tag-remove:disabled {
    cursor: not-allowed;
}

.caomei-multi-select__input {
    flex: 1;
    min-width: 4rem;
    padding: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: inherit;
    font: inherit;
}

.caomei-multi-select__input::placeholder {
    color: var(--caomei-color-text-muted);
}

.caomei-multi-select__input:disabled {
    cursor: not-allowed;
}

/*
  清除按钮为字段内的常规 flex 成员（不是绝对定位）：本组件字段可多行换行，
  绝对定位在标签占满首行时会压在标签之上，改为随输入行流动。
*/
.caomei-multi-select__clear {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--caomei-color-text-muted);

    /* 按钮默认不继承字体：显式继承以保持图标与字段文本同源 */
    font: inherit;
    cursor: pointer;
}

.caomei-multi-select__clear:hover {
    color: var(--caomei-color-text);
}

.caomei-multi-select__clear:focus-visible {
    border-radius: var(--caomei-radius-sm);
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-multi-select__icon {
    display: inline-flex;
    flex-shrink: 0;
    color: var(--caomei-color-text-muted);
}
</style>

<!--
  Portal 面板样式说明：ComboboxContent 由 popper 包裹层挂载到 body，scoped 的 data-v 落在包裹层
  而非面板本体（同 Select）。改用命名空间化的非 scoped 规则，保证可覆盖性与低特异性。
-->
<style>
.caomei-multi-select__content {
    box-sizing: border-box;
    z-index: var(--caomei-z-overlay);
    overflow: hidden;

    /*
    窄屏收敛：宽度上限取 popper 可用宽（与触发器宽同源，见 responsive.md §3 矩阵 #4）；
    min-width 同步用 min() 收敛，否则 min-width 会压过 max-width 导致越界。
    桌面下可用宽远大于自然宽度，无表现变化。
     */
    min-width: min(var(--reka-combobox-trigger-width), var(--reka-combobox-content-available-width));
    max-width: var(--reka-combobox-content-available-width, none);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    box-shadow: var(--caomei-shadow-md);
}

.caomei-multi-select__viewport {
    max-height: 15rem;
    overflow-y: auto;
    padding: var(--caomei-space-1);
}

.caomei-multi-select__empty {
    padding: var(--caomei-space-2);
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-md);
}

.caomei-multi-select__item {
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

.caomei-multi-select__item-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.caomei-multi-select__item[data-highlighted] {
    background: var(--caomei-color-bg-elevated);
}

.caomei-multi-select__item[data-disabled] {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-multi-select__indicator {
    display: inline-flex;
    flex-shrink: 0;
    color: var(--caomei-color-primary);
}
</style>
