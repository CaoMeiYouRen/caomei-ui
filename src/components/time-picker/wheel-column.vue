<script setup lang="ts">
import { computed } from 'vue'
import { labelAttrs } from '../_shared/use-label-attrs'
import { useWheelColumn } from '../_shared/use-wheel-column'
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

/**
 * 交互逻辑与 `Picker` 共用 `use-wheel-column`（吸附 / 动量收敛 / 键盘 / 程序化对齐同口径）；
 * 本组件只保留模板与 `--caomei-time-picker-wheel-*` 样式。`loop` 在时间轮上恒关闭。
 */
const {
    columnEl,
    selectedIndex,
    optionId,
    onScroll,
    onOptionClick,
    onKeydown,
} = useWheelColumn({
    options: () => props.options,
    modelValue: () => props.modelValue,
    disabled: () => props.disabled,
    readonly: () => props.readonly,
    onChange: (value) => {
        emit('update:modelValue', value)
    },
})

const interactive = computed(() => !props.disabled && !props.readonly)
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
        v-bind="labelAttrs(label)"
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
