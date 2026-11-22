<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

/**
 * 月 / 年粒度选择面板：`DatePicker` 在 `selectionMode="month" | "year"` 时使用。
 *
 * 不自带文案表：月份名与年份数字由 `Intl` 与数字直接给出，导航按钮以目标年份作可访问名，
 * 避免为两种粒度新增 10 语 locale 键；读屏可据 `aria-pressed` / `aria-disabled` 判断状态。
 */
defineOptions({ name: 'CaomeiMonthYearPanel' })

const props = withDefaults(defineProps<{
    mode: 'month' | 'year'
    modelValue?: Date | null
    minValue?: Date
    maxValue?: Date
    locale?: string
    disabled?: boolean
    readonly?: boolean
}>(), {
    modelValue: null,
    minValue: undefined,
    maxValue: undefined,
    locale: undefined,
    disabled: false,
    readonly: false,
})

const emit = defineEmits<{
    'update:modelValue': [value: Date]
}>()

const currentYear = new Date().getFullYear()
const anchorYear = ref(props.modelValue?.getFullYear() ?? currentYear)

watch(
    () => props.modelValue,
    (value) => {
        if (value) {
            anchorYear.value = value.getFullYear()
        }
    },
)

const yearStart = computed(() => (props.mode === 'year' ? Math.floor(anchorYear.value / 12) * 12 : anchorYear.value))
const yearRange = computed(() => Array.from({ length: 12 }, (_, index) => yearStart.value + index))
const monthIndexes = Array.from({ length: 12 }, (_, index) => index)
const monthFormatter = computed(() => new Intl.DateTimeFormat(props.locale, { month: 'short' }))

const heading = computed(() => (props.mode === 'year'
    ? `${yearStart.value}–${yearStart.value + 11}`
    : String(anchorYear.value)))

const selectedMonth = computed(() => props.modelValue?.getMonth() ?? -1)
const selectedYear = computed(() => props.modelValue?.getFullYear() ?? -1)

function isMonthDisabled(year: number, month: number): boolean {
    const start = new Date(year, month, 1)
    if (props.minValue && start < new Date(props.minValue.getFullYear(), props.minValue.getMonth(), 1)) {
        return true
    }
    if (props.maxValue && start > new Date(props.maxValue.getFullYear(), props.maxValue.getMonth(), 1)) {
        return true
    }
    return false
}

function isYearDisabled(year: number): boolean {
    if (props.minValue && year < props.minValue.getFullYear()) {
        return true
    }
    if (props.maxValue && year > props.maxValue.getFullYear()) {
        return true
    }
    return false
}

interface PanelItem {
    key: string
    label: string
    value: number
    disabled: boolean
    selected: boolean
}

const items = computed<PanelItem[]>(() => {
    if (props.mode === 'year') {
        return yearRange.value.map((year) => ({
            key: `year-${year}`,
            label: String(year),
            value: year,
            disabled: isYearDisabled(year),
            selected: year === selectedYear.value,
        }))
    }

    return monthIndexes.map((month) => ({
        key: `month-${month}`,
        label: monthFormatter.value.format(new Date(anchorYear.value, month, 1)),
        value: month,
        disabled: isMonthDisabled(anchorYear.value, month),
        selected: month === selectedMonth.value && anchorYear.value === selectedYear.value,
    }))
})

/** 漫游 tabindex：选中项优先，否则首个可用项 */
const tabbableIndex = computed(() => {
    const selected = items.value.findIndex((item) => item.selected && !item.disabled)
    if (selected !== -1) {
        return selected
    }
    const firstEnabled = items.value.findIndex((item) => !item.disabled)
    return firstEnabled === -1 ? 0 : firstEnabled
})

const itemRefs = ref<(HTMLButtonElement | null)[]>([])

function setItemRef(element: Element | null, index: number): void {
    itemRefs.value[index] = element as HTMLButtonElement | null
}

function select(value: number): void {
    if (props.disabled || props.readonly) {
        return
    }
    const next = props.mode === 'year'
        ? new Date(value, 0, 1, 0, 0, 0, 0)
        : new Date(anchorYear.value, value, 1, 0, 0, 0, 0)
    if (props.mode === 'year' ? isYearDisabled(value) : isMonthDisabled(anchorYear.value, value)) {
        return
    }
    emit('update:modelValue', next)
}

function shift(step: number): void {
    if (props.disabled) {
        return
    }
    anchorYear.value = props.mode === 'year'
        ? yearStart.value + step * 12
        : anchorYear.value + step
}

/** 导航可访问名：年份模式给出目标整页区间，避免与网格内的年份选项同名 */
function navLabel(offset: number): string {
    if (props.mode === 'month') {
        return String(anchorYear.value + offset)
    }
    const start = yearStart.value + offset * 12
    return `${start}–${start + 11}`
}

const previousLabel = computed(() => navLabel(-1))
const nextLabel = computed(() => navLabel(1))

/** 聚焦指定索引（异步，等 DOM 更新后生效） */
function focusIndex(index: number): void {
    void nextTick(() => {
        itemRefs.value[index]?.focus()
    })
}

/**
 * 焦点移动：沿方向逐项寻找可用项；遇禁用项跳过，到达面板边界即停（保持当前焦点）。
 *
 * 不同步取模：负方向越过首项时取模会绕回末端。
 */
function focusItem(index: number, direction: number): void {
    let cursor = index
    for (const _item of items.value) {
        cursor += direction
        if (cursor < 0 || cursor >= items.value.length) {
            return
        }
        if (!items.value[cursor]?.disabled) {
            focusIndex(cursor)
            return
        }
    }
}

function onKeydown(event: KeyboardEvent): void {
    const currentIndex = itemRefs.value.findIndex((element) => element === document.activeElement)
    if (currentIndex === -1) {
        return
    }
    if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault()
        const order = items.value.map((item, index) => ({ item, index }))
        const enabled = order.filter(({ item }) => !item.disabled)
        const target = event.key === 'Home' ? enabled[0] : enabled.at(-1)
        if (target) {
            focusIndex(target.index)
        }
        return
    }
    const offsets: Record<string, number | undefined> = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -3,
        ArrowDown: 3,
    }
    const offset = offsets[event.key]
    if (offset === undefined) {
        return
    }
    event.preventDefault()
    focusItem(currentIndex, offset)
}
</script>

<template>
    <div
        class="caomei-month-year-panel"
        :class="`caomei-month-year-panel--${mode}`"
    >
        <div class="caomei-month-year-panel__header">
            <button
                type="button"
                class="caomei-hit-target caomei-month-year-panel__nav"
                :aria-label="previousLabel"
                :disabled="disabled"
                @click="shift(-1)"
            >
                <span aria-hidden="true">‹</span>
            </button>
            <span class="caomei-month-year-panel__heading">{{ heading }}</span>
            <button
                type="button"
                class="caomei-hit-target caomei-month-year-panel__nav"
                :aria-label="nextLabel"
                :disabled="disabled"
                @click="shift(1)"
            >
                <span aria-hidden="true">›</span>
            </button>
        </div>
        <div
            class="caomei-month-year-panel__grid"
            role="listbox"
            :aria-label="heading"
            :aria-multiselectable="false"
            :aria-readonly="readonly || undefined"
            @keydown="onKeydown"
        >
            <button
                v-for="(item, index) in items"
                :key="item.key"
                :ref="(element) => setItemRef(element as Element | null, index)"
                type="button"
                class="caomei-hit-target caomei-month-year-panel__item"
                :class="{
                    'caomei-month-year-panel__item--selected': item.selected,
                    'caomei-month-year-panel__item--disabled': item.disabled
                }"
                role="option"
                :aria-selected="item.selected"
                :aria-disabled="item.disabled || undefined"
                :disabled="item.disabled || disabled"
                :tabindex="readonly ? (item.selected ? 0 : -1) : (index === tabbableIndex ? 0 : -1)"
                @click="select(item.value)"
            >
                {{ item.label }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.caomei-month-year-panel {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-2);
    width: min(var(--caomei-month-year-panel-width, 20rem), calc(100vw - var(--caomei-space-4) * 2));
    padding: var(--caomei-space-3);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-sm);
}

.caomei-month-year-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--caomei-space-2);
}

.caomei-month-year-panel__heading {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
}

.caomei-month-year-panel__nav {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--caomei-control-height-sm, 2rem);
    height: var(--caomei-control-height-sm, 2rem);
    padding: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-md);
    line-height: 1;
    background: transparent;
    border: none;
    border-radius: var(--caomei-radius-sm);
    cursor: pointer;
}

.caomei-month-year-panel__nav:hover:not(:disabled) {
    color: var(--caomei-color-text);
    background: var(--caomei-color-bg-elevated);
}

.caomei-month-year-panel__nav:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-month-year-panel__nav:disabled {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-month-year-panel__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--caomei-space-1);
}

.caomei-month-year-panel__item {
    box-sizing: border-box;
    min-width: 0;
    padding: var(--caomei-space-2) var(--caomei-space-1);
    overflow: hidden;
    color: var(--caomei-color-text);
    font: inherit;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--caomei-radius-sm);
    cursor: pointer;
}

.caomei-month-year-panel__item:hover:not(:disabled) {
    background: var(--caomei-color-bg-elevated);
}

.caomei-month-year-panel__item:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-month-year-panel__item--selected {
    color: var(--caomei-color-primary-foreground);
    background: var(--caomei-color-primary);
}

.caomei-month-year-panel__item--selected:hover:not(:disabled) {
    background: color-mix(in srgb, var(--caomei-color-primary) 88%, var(--caomei-color-text));
}

.caomei-month-year-panel__item--disabled {
    color: var(--caomei-color-text-muted);
    cursor: not-allowed;
}

/* 选中项落在可选范围外时（外部预置越界值），保持主色实底上的可读前景 */
.caomei-month-year-panel__item--selected.caomei-month-year-panel__item--disabled {
    color: var(--caomei-color-primary-foreground);
}
</style>
