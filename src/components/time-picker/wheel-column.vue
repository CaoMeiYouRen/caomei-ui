<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { WHEEL_SCROLL_IGNORE_MS } from './utils'
import type { TimeWheelOption } from './types'

defineOptions({ name: 'CaomeiTimeWheelColumn' })

const props = withDefaults(defineProps<{
    label: string
    options: TimeWheelOption[]
    modelValue: string | number
    disabled?: boolean
    readonly?: boolean
}>(), {
    disabled: false,
    readonly: false,
})

const emit = defineEmits<{
    'update:modelValue': [value: string | number]
}>()

const id = useId()
const columnEl = ref<HTMLElement>()
const interactive = computed(() => !props.disabled && !props.readonly)

/** 当前选中项下标；模型值不在候选中时回退首项，避免滚动位置与模型脱节。 */
const selectedIndex = computed(() => {
    const index = props.options.findIndex((option) => option.value === props.modelValue)
    return index < 0 ? 0 : index
})

function optionId(index: number): string {
    return `${id}-option-${index}`
}

function itemHeight(el: HTMLElement): number {
    const option = el.querySelector<HTMLElement>('[role="option"]')
    const height = option?.offsetHeight ?? 0
    return height > 0 ? height : 36
}

/** 程序化对齐：把目标项滚到中央；置忽略窗口，避免滚动事件把对齐结果当成用户选择。 */
let ignoreScrollUntil = 0

function scrollToIndex(index: number): void {
    const el = columnEl.value
    if (!el) {
        return
    }
    ignoreScrollUntil = performance.now() + WHEEL_SCROLL_IGNORE_MS
    el.scrollTop = index * itemHeight(el)
}

let settleTimer: ReturnType<typeof setTimeout> | undefined

function clearSettleTimer(): void {
    if (settleTimer !== undefined) {
        clearTimeout(settleTimer)
        settleTimer = undefined
    }
}

/** 滚动停下后取最近一项；触屏惯性滚动同样走这条路径。 */
function onScroll(): void {
    if (!interactive.value) {
        return
    }
    if (performance.now() < ignoreScrollUntil) {
        return
    }
    clearSettleTimer()
    settleTimer = setTimeout(() => {
        const el = columnEl.value
        if (!el || !props.options.length) {
            return
        }
        const index = Math.min(
            props.options.length - 1,
            Math.max(0, Math.round(el.scrollTop / itemHeight(el))),
        )
        const option = props.options[index]
        if (option.value !== props.modelValue) {
            emit('update:modelValue', option.value)
        }
    }, 140)
}

function selectIndex(index: number): void {
    if (!interactive.value) {
        return
    }
    const option = props.options[index]
    if (option.value === props.modelValue) {
        return
    }
    emit('update:modelValue', option.value)
    scrollToIndex(index)
}

function onOptionClick(index: number): void {
    columnEl.value?.focus()
    selectIndex(index)
}

function onKeydown(event: KeyboardEvent): void {
    if (!interactive.value || !props.options.length) {
        return
    }
    // 列表方向（APG listbox）：↓ 下一条、↑ 上一条，与滚轮滚动方向一致。
    let next = selectedIndex.value
    if (event.key === 'ArrowUp') {
        next = (next - 1 + props.options.length) % props.options.length
    } else if (event.key === 'ArrowDown') {
        next = (next + 1) % props.options.length
    } else if (event.key === 'PageUp') {
        next = Math.max(0, next - 5)
    } else if (event.key === 'PageDown') {
        next = Math.min(props.options.length - 1, next + 5)
    } else if (event.key === 'Home') {
        next = 0
    } else if (event.key === 'End') {
        next = props.options.length - 1
    } else {
        return
    }
    event.preventDefault()
    selectIndex(next)
}

watch(
    () => props.modelValue,
    () => {
        void nextTick(() => {
            scrollToIndex(selectedIndex.value)
        })
    },
)

watch(
    () => props.options.length,
    () => {
        void nextTick(() => {
            scrollToIndex(selectedIndex.value)
        })
    },
)

onMounted(() => {
    void nextTick(() => {
        scrollToIndex(selectedIndex.value)
    })
})

onBeforeUnmount(clearSettleTimer)
</script>

<template>
    <div
        ref="columnEl"
        class="caomei-time-wheel__column"
        :class="{
            'caomei-time-wheel__column--disabled': disabled,
            'caomei-time-wheel__column--readonly': readonly
        }"
        role="listbox"
        :aria-label="label"
        :aria-activedescendant="optionId(selectedIndex)"
        :aria-disabled="disabled || undefined"
        :aria-readonly="readonly || undefined"
        :tabindex="interactive ? 0 : -1"
        @scroll.passive="onScroll"
        @keydown="onKeydown"
    >
        <button
            v-for="(option, index) in options"
            :id="optionId(index)"
            :key="option.value"
            type="button"
            class="caomei-time-wheel__option"
            :class="{'caomei-time-wheel__option--selected': index === selectedIndex}"
            role="option"
            :aria-selected="index === selectedIndex"
            tabindex="-1"
            @click="onOptionClick(index)"
        >
            {{ option.label }}
        </button>
    </div>
</template>

<style scoped>
.caomei-time-wheel__column {
    box-sizing: border-box;
    position: relative;
    width: var(--caomei-time-picker-wheel-column-width, 3.25rem);
    height: calc(var(--caomei-time-picker-wheel-item-height, 2.25rem) * 5);
    padding-block: calc(var(--caomei-time-picker-wheel-item-height, 2.25rem) * 2);
    overflow-y: auto;
    overscroll-behavior: contain;
    scroll-snap-type: y mandatory;
    scrollbar-width: none;
    text-align: center;
    touch-action: pan-y;
}

.caomei-time-wheel__column:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: -2px;
    border-radius: var(--caomei-radius-sm);
}

.caomei-time-wheel__column--disabled,
.caomei-time-wheel__column--readonly {
    cursor: default;
}

.caomei-time-wheel__column--disabled {
    opacity: var(--caomei-disabled-opacity, 0.6);
}

.caomei-time-wheel__column::-webkit-scrollbar {
    display: none;
}

.caomei-time-wheel__option {
    display: block;
    box-sizing: border-box;
    width: 100%;
    height: var(--caomei-time-picker-wheel-item-height, 2.25rem);
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--caomei-color-text);
    font: inherit;
    font-variant-numeric: tabular-nums;
    line-height: var(--caomei-time-picker-wheel-item-height, 2.25rem);
    text-align: center;
    scroll-snap-align: center;
    cursor: pointer;
}

.caomei-time-wheel__column--disabled .caomei-time-wheel__option,
.caomei-time-wheel__column--readonly .caomei-time-wheel__option {
    cursor: default;
}

.caomei-time-wheel__option--selected {
    color: var(--caomei-color-primary-text);
    font-weight: 600;
}
</style>
