<script setup lang="ts">
import { Check, ChevronDown, LoaderCircle, X } from '@lucide/vue'
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
    type AcceptableValue,
} from 'reka-ui'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon } from '../../icons'
import { useAttrForwarding } from '../_shared/use-attr-forwarding'
import { labelAttrs } from '../_shared/use-label-attrs'
import type {
    AutoCompleteEmits,
    AutoCompleteOption,
    AutoCompleteProps,
} from './types'

defineOptions({ name: 'CaomeiAutoComplete', inheritAttrs: false })

const props = withDefaults(defineProps<AutoCompleteProps>(), {
    options: () => [],
    multiple: false,
    dropdown: false,
    placeholder: '',
    size: 'md',
    disabled: false,
    invalid: false,
    bodyLock: false,
    loading: false,
    debounce: 300,
    clearable: true,
    ignoreFilter: false,
})

const emit = defineEmits<AutoCompleteEmits>()

const model = defineModel<string | string[]>()

const { rootAttrs, controlAttrs } = useAttrForwarding()

const open = ref(false)
const inputValue = ref('')
const highlightedValue = ref<string | undefined>()

/** 用户按下建议项时置位；用于避免 blur 把输入文本误当作自由输入提交 */
let selectingFromList = false
let debounceTimer: ReturnType<typeof setTimeout> | undefined

const normalizedOptions = computed<AutoCompleteOption[]>(() =>
    props.options.map((option) =>
        typeof option === 'string' ? { label: option, value: option } : option,
    ),
)

const optionMap = computed(() => new Map(normalizedOptions.value.map((option) => [option.value, option])))

/** 多选模式下规范化后的已选值数组 */
const selectedValues = computed<string[]>(() => {
    if (Array.isArray(model.value)) {
        return model.value
    }
    return model.value ? [model.value] : []
})

/** 单选模式下的当前值；多选时取首个值仅用于兼容 Reka 的单值形状 */
const singleValue = computed<string>(() => {
    const values = selectedValues.value
    return values.length > 0 ? values[0] : ''
})

const hasValue = computed(() => (props.multiple ? selectedValues.value.length > 0 : singleValue.value !== ''))

/** 仅多选模式渲染已选标签 */
const tagValues = computed<string[]>(() => (props.multiple ? selectedValues.value : []))

const comboboxValue = computed<string | string[]>(() =>
    props.multiple ? selectedValues.value : singleValue.value,
)

const rootClass = computed(() => [
    `caomei-auto-complete--${props.size}`,
    {
        'caomei-auto-complete--invalid': props.invalid,
        'caomei-auto-complete--disabled': props.disabled,
    },
])

const inputPlaceholder = computed(() => {
    if (props.multiple && selectedValues.value.length > 0) {
        return undefined
    }
    return props.placeholder || undefined
})

const showClear = computed(
    () => props.clearable && !props.multiple && singleValue.value !== '' && !props.disabled,
)

const locale = useLocale()
const emptyLabel = computed(() => props.emptyLabel ?? locale.value.autoComplete.empty)
const clearLabel = computed(() => props.clearLabel ?? locale.value.input.clear)
const openLabel = computed(() => props.openLabel ?? locale.value.autoComplete.open)
const loadingLabel = computed(() => locale.value.progress.loading)

/** 高亮建议项是否与当前输入匹配；不匹配时回车应提交自由文本 */
const highlightedMatchesQuery = computed(() => {
    if (highlightedValue.value === undefined) {
        return false
    }
    const option = optionMap.value.get(highlightedValue.value)
    if (!option) {
        return false
    }
    const query = inputValue.value.trim().toLowerCase()
    if (!query) {
        return true
    }
    return option.label.toLowerCase().includes(query)
})

function labelFor(value: string): string {
    return optionMap.value.get(value)?.label ?? value
}

function displayValue(value: unknown): string {
    // 多选由标签展示已选值，输入框保持空文本，避免把模型值拼成字符串回显
    if (props.multiple || value === undefined || value === null) {
        return ''
    }
    // 既有行为：按 JS 默认字符串化（原始类型即其字面量）
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const key = String(value)
    return optionMap.value.get(key)?.label ?? key
}

function onUpdateModel(value: unknown): void {
    if (props.multiple) {
        model.value = Array.isArray(value) ? value.map((item) => String(item)) : []
        return
    }
    if (typeof value === 'string') {
        model.value = value
        return
    }
    // 既有对外行为：按 JS 默认字符串化写回模型
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    model.value = value === undefined || value === null ? '' : String(value)
}

function onItemSelect(event: CustomEvent<{ value?: AcceptableValue }>): void {
    const value = event.detail.value
    if (value !== undefined && value !== null) {
        // 既有对外行为：事件载荷按 JS 默认字符串化
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        emit('select', String(value))
    }
}

function onHighlight(payload: { value: AcceptableValue } | undefined): void {
    const value = payload?.value
    // 既有对外行为：高亮值按 JS 默认字符串化
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    highlightedValue.value = value === undefined || value === null ? undefined : String(value)
}

function scheduleComplete(query: string): void {
    if (debounceTimer !== undefined) {
        clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
        debounceTimer = undefined
        emit('complete', query)
    }, Math.max(0, props.debounce))
}

function onInput(event: Event): void {
    const target = event.target as HTMLInputElement | null
    scheduleComplete(target?.value ?? '')
}

function commitFreeText(): void {
    if (props.disabled || props.multiple) {
        return
    }
    const text = inputValue.value
    const current = singleValue.value
    // 输入框在选中建议后会回显该项的 label，需把 label 也视为「当前值」，
    // 否则失焦会把回显文本当作自由输入提交，覆盖已选值。
    if (!text.trim() || text === current || (current !== '' && text === labelFor(current))) {
        return
    }
    model.value = text
    emit('select', text)
}

function isFocusInPanel(target: EventTarget | null): boolean {
    return target instanceof Element && target.closest('[role="listbox"]') !== null
}

function onItemMouseDown(): void {
    selectingFromList = true
    // mousedown 与随后的 blur 同属一个事件循环，用宏任务在 blur 之后复位，
    // 避免输入框未聚焦时点击选项导致标记长期残留
    window.setTimeout(() => {
        selectingFromList = false
    }, 0)
}

function onFocus(event: FocusEvent): void {
    emit('focus', event)
}

function onBlur(event: FocusEvent): void {
    emit('blur', event)
    if (selectingFromList || isFocusInPanel(event.relatedTarget)) {
        selectingFromList = false
        return
    }
    commitFreeText()
}

function onEnter(event: KeyboardEvent): void {
    if (props.multiple || props.disabled || event.defaultPrevented) {
        return
    }
    if (highlightedMatchesQuery.value) {
        return
    }
    commitFreeText()
}

function onClear(): void {
    model.value = props.multiple ? [] : ''
    inputValue.value = ''
    emit('clear')
}

function removeValue(value: string): void {
    model.value = selectedValues.value.filter((item) => item !== value)
}

/** 点击字段空白处聚焦内部输入（参考原生输入框与 MultiSelect 的交互习惯） */
function onAnchorClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null
    if (target?.closest('button, input')) {
        return
    }
    ;(event.currentTarget as HTMLElement | null)?.querySelector('input')?.focus()
}

onBeforeUnmount(() => {
    if (debounceTimer !== undefined) {
        clearTimeout(debounceTimer)
    }
})

// 选项变化后，若当前高亮值已不存在则清空，避免回车误选已移除的建议
watch(normalizedOptions, () => {
    if (highlightedValue.value !== undefined && !optionMap.value.has(highlightedValue.value)) {
        highlightedValue.value = undefined
    }
})
</script>

<template>
    <ComboboxRoot
        v-model:open="open"
        :model-value="comboboxValue"
        :multiple="multiple"
        :disabled="disabled"
        :name="name"
        :ignore-filter="ignoreFilter"
        :open-on-click="true"
        :open-on-focus="true"
        @update:model-value="onUpdateModel"
        @highlight="onHighlight"
    >
        <ComboboxAnchor
            v-bind="rootAttrs"
            class="caomei-auto-complete"
            :class="rootClass"
            :data-filled="hasValue ? 'true' : undefined"
            :data-has-placeholder="placeholder ? 'true' : undefined"
            @click="onAnchorClick"
        >
            <span
                v-for="value in tagValues"
                :key="value"
                class="caomei-auto-complete__tag"
            >
                <span class="caomei-auto-complete__tag-label">{{ labelFor(value) }}</span>
                <button
                    type="button"
                    class="caomei-auto-complete__tag-remove"
                    :disabled="disabled"
                    :aria-label="`${clearLabel} ${labelFor(value)}`"
                    @click.stop="removeValue(value)"
                >
                    <CaomeiIcon :icon="X" />
                </button>
            </span>
            <ComboboxInput
                v-bind="{...controlAttrs, ...labelAttrs(label)}"
                :id="id"
                v-model="inputValue"
                class="caomei-auto-complete__input"
                :placeholder="inputPlaceholder"
                :disabled="disabled"
                :aria-invalid="invalid || undefined"
                :display-value="displayValue"
                @input="onInput"
                @keydown.enter="onEnter"
                @focus="onFocus"
                @blur="onBlur"
            />
            <span
                v-if="loading"
                class="caomei-auto-complete__spinner"
                role="status"
                :aria-label="loadingLabel"
            >
                <CaomeiIcon :icon="LoaderCircle" />
            </span>
            <button
                v-else-if="showClear"
                type="button"
                class="caomei-auto-complete__clear"
                :aria-label="clearLabel"
                @click.stop="onClear"
            >
                <CaomeiIcon :icon="X" />
            </button>
            <ComboboxTrigger
                v-if="dropdown"
                class="caomei-auto-complete__trigger"
                :disabled="disabled"
                :aria-label="openLabel"
            >
                <CaomeiIcon :icon="ChevronDown" />
            </ComboboxTrigger>
        </ComboboxAnchor>
        <ComboboxPortal>
            <ComboboxContent
                class="caomei-auto-complete__content"
                position="popper"
                :side-offset="4"
                :body-lock="bodyLock"
            >
                <ComboboxViewport class="caomei-auto-complete__viewport">
                    <ComboboxEmpty class="caomei-auto-complete__empty">
                        {{ emptyLabel }}
                    </ComboboxEmpty>
                    <ComboboxItem
                        v-for="option in normalizedOptions"
                        :key="option.value"
                        class="caomei-auto-complete__item"
                        :value="option.value"
                        :disabled="option.disabled"
                        :text-value="option.label"
                        @select="onItemSelect"
                        @mousedown="onItemMouseDown"
                    >
                        <span class="caomei-auto-complete__item-label">{{ option.label }}</span>
                        <ComboboxItemIndicator class="caomei-auto-complete__indicator">
                            <CaomeiIcon :icon="Check" />
                        </ComboboxItemIndicator>
                    </ComboboxItem>
                </ComboboxViewport>
            </ComboboxContent>
        </ComboboxPortal>
    </ComboboxRoot>
</template>

<style scoped>
.caomei-auto-complete {
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--caomei-space-1);
    width: 100%;
    max-width: var(--caomei-auto-complete-max-width, var(--caomei-select-max-width));
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    cursor: text;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.caomei-auto-complete:focus-within {
    border-color: var(--caomei-color-primary);
    box-shadow: 0 0 0 2px var(--caomei-color-border);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-primary) 20%, transparent);
}

.caomei-auto-complete--invalid {
    border-color: var(--caomei-color-danger);
}

.caomei-auto-complete--invalid:focus-within {
    border-color: var(--caomei-color-danger);
    box-shadow: 0 0 0 2px var(--caomei-color-border);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-danger) 20%, transparent);
}

.caomei-auto-complete--disabled {
    cursor: not-allowed;
    background: var(--caomei-color-bg-elevated);
    opacity: var(--caomei-disabled-opacity);
}

:where(.caomei-auto-complete--sm) {
    min-height: var(--caomei-control-height-sm);
    padding: var(--caomei-space-1) var(--caomei-space-2);
    font-size: var(--caomei-font-size-sm);
}

:where(.caomei-auto-complete--md) {
    min-height: var(--caomei-control-height-md);
    padding: var(--caomei-space-1) var(--caomei-space-3);
    font-size: var(--caomei-font-size-md);
}

:where(.caomei-auto-complete--lg) {
    min-height: var(--caomei-control-height-lg);
    padding: var(--caomei-space-2) var(--caomei-space-4);
    font-size: var(--caomei-font-size-lg);
}

.caomei-auto-complete__tag {
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

.caomei-auto-complete__tag-label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.caomei-auto-complete__tag-remove {
    display: inline-flex;
    flex-shrink: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--caomei-color-text-muted);
    cursor: pointer;
}

.caomei-auto-complete__tag-remove:hover {
    color: var(--caomei-color-text);
}

.caomei-auto-complete__tag-remove:focus-visible {
    border-radius: var(--caomei-radius-sm);
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-auto-complete__tag-remove:disabled {
    cursor: not-allowed;
}

.caomei-auto-complete__input {
    flex: 1;
    min-width: 4rem;
    padding: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: inherit;
    font: inherit;
}

.caomei-auto-complete__input::placeholder {
    color: var(--caomei-color-text-muted);
}

.caomei-auto-complete__input:disabled {
    cursor: not-allowed;
}

.caomei-auto-complete__clear,
.caomei-auto-complete__trigger,
.caomei-auto-complete__spinner {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--caomei-color-text-muted);
}

.caomei-auto-complete__clear,
.caomei-auto-complete__trigger {
    cursor: pointer;
}

.caomei-auto-complete__clear:hover,
.caomei-auto-complete__trigger:hover:not(:disabled) {
    color: var(--caomei-color-text);
}

.caomei-auto-complete__clear:focus-visible,
.caomei-auto-complete__trigger:focus-visible {
    border-radius: var(--caomei-radius-sm);
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-auto-complete__trigger:disabled {
    cursor: not-allowed;
}

.caomei-auto-complete__spinner {
    animation: caomei-auto-complete-spin 0.8s linear infinite;
}

@keyframes caomei-auto-complete-spin {
    to {
        transform: rotate(360deg);
    }
}

@media (prefers-reduced-motion: reduce) {
    .caomei-auto-complete,
    .caomei-auto-complete__spinner {
        transition: none;
        animation-duration: 1.6s;
    }
}
</style>

<!--
  Portal 面板样式说明：ComboboxContent 由 popper 包裹层挂载到 body，scoped 的 data-v 落在包裹层
  而非面板本体（同 Select / MultiSelect）。改用命名空间化的非 scoped 规则，保证可覆盖性与低特异性。
-->
<style>
.caomei-auto-complete__content {
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
    box-shadow: 0 8px 24px color-mix(in srgb, var(--caomei-color-text) 12%, transparent);
}

.caomei-auto-complete__viewport {
    max-height: 15rem;
    overflow-y: auto;
    padding: var(--caomei-space-1);
}

.caomei-auto-complete__empty {
    padding: var(--caomei-space-2);
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-md);
}

.caomei-auto-complete__item {
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

.caomei-auto-complete__item-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.caomei-auto-complete__item[data-highlighted] {
    background: var(--caomei-color-bg-elevated);
}

.caomei-auto-complete__item[data-disabled] {
    cursor: not-allowed;
    opacity: 0.5;
}

.caomei-auto-complete__indicator {
    display: inline-flex;
    flex-shrink: 0;
    color: var(--caomei-color-primary);
}
</style>
