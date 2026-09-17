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
import { computed } from 'vue'
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
})

const model = defineModel<OptionValue[]>({ default: () => [] })

const { rootAttrs, controlAttrs } = useAttrForwarding()

const locale = useLocale()
const openLabel = computed(() => props.openLabel ?? locale.value.multiSelect.open)
const removeLabel = computed(() => props.removeLabel ?? locale.value.multiSelect.remove)
const emptyLabel = computed(() => props.emptyLabel ?? locale.value.multiSelect.empty)

const rootClass = computed(() => [
    `caomei-multi-select--${props.size}`,
    {
        'caomei-multi-select--invalid': props.invalid,
        'caomei-multi-select--disabled': props.disabled,
    },
])

interface NormalizedOption {
    /** 解析后的选项值（字符串或数字） */
    value: OptionValue
    /** 解析后的显示文本；字段缺省时为 undefined */
    label: string | undefined
    disabled: boolean
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
            value,
            label: resolveOptionField(option, props.optionLabel, 'label'),
            disabled: resolveOptionDisabled(option),
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
                class="caomei-multi-select__input"
                :placeholder="model.length === 0 ? placeholder : undefined"
                :aria-invalid="invalid || undefined"
                :disabled="disabled"
            />
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
                        <span class="caomei-multi-select__item-label">{{ option.label }}</span>
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
.caomei-multi-select {
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--caomei-space-1);
    width: 100%;
    max-width: var(--caomei-multi-select-max-width, var(--caomei-select-max-width));
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    cursor: text;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.caomei-multi-select:focus-within {
    border-color: var(--caomei-color-primary);
    box-shadow: 0 0 0 2px var(--caomei-color-border);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-primary) 20%, transparent);
}

.caomei-multi-select--invalid {
    border-color: var(--caomei-color-danger);
}

.caomei-multi-select--invalid:focus-within {
    border-color: var(--caomei-color-danger);
    box-shadow: 0 0 0 2px var(--caomei-color-border);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-danger) 20%, transparent);
}

.caomei-multi-select--disabled {
    cursor: not-allowed;
    background: var(--caomei-color-bg-elevated);
    opacity: var(--caomei-disabled-opacity);
}

:where(.caomei-multi-select--sm) {
    min-height: var(--caomei-control-height-sm);
    padding: var(--caomei-space-1) var(--caomei-space-2);
    font-size: var(--caomei-font-size-sm);
}

:where(.caomei-multi-select--md) {
    min-height: var(--caomei-control-height-md);
    padding: var(--caomei-space-1) var(--caomei-space-3);
    font-size: var(--caomei-font-size-md);
}

:where(.caomei-multi-select--lg) {
    min-height: var(--caomei-control-height-lg);
    padding: var(--caomei-space-2) var(--caomei-space-4);
    font-size: var(--caomei-font-size-lg);
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
    z-index: 1000;
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
    opacity: 0.5;
}

.caomei-multi-select__indicator {
    display: inline-flex;
    flex-shrink: 0;
    color: var(--caomei-color-primary);
}
</style>
