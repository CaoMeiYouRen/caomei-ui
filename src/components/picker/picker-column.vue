<script setup lang="ts">
import { computed } from 'vue'
import { labelAttrs } from '../_shared/use-label-attrs'
import { useWheelColumn } from '../_shared/use-wheel-column'
import type { PickerColumnProps } from './types'

defineOptions({ name: 'CaomeiPickerColumn' })

const props = withDefaults(defineProps<PickerColumnProps>(), {
    label: '',
    disabled: false,
    readonly: false,
    loop: false,
})

const emit = defineEmits<{
    'update:modelValue': [value: string | number]
}>()

/** 交互逻辑与 `TimePicker` 的滚轮列共用 `use-wheel-column`（吸附 / 动量收敛 / 键盘同口径） */
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
    loop: () => props.loop,
    onChange: (value) => {
        emit('update:modelValue', value)
    },
})

const interactive = computed(() => !props.disabled && !props.readonly)

/** 列高 = 行高 × 可视行数；上下各留 `(可视行数 - 1) / 2` 行的空白，使首末项也能居中 */
const columnStyle = computed(() => ({
    '--caomei-picker-item-height': `${props.itemHeight}px`,
    height: `${props.itemHeight * props.visibleCount}px`,
    paddingBlock: `${props.itemHeight * ((props.visibleCount - 1) / 2)}px`,
}))
</script>

<template>
    <div
        ref="columnEl"
        class="caomei-picker__column"
        :class="{
            'caomei-picker__column--disabled': disabled,
            'caomei-picker__column--readonly': readonly
        }"
        :style="columnStyle"
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
            class="caomei-picker__option"
            :class="{'caomei-picker__option--selected': index === selectedIndex}"
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
.caomei-picker__column {
    box-sizing: border-box;
    position: relative;
    width: var(--caomei-picker-column-width, 6rem);
    overflow-y: auto;
    overscroll-behavior: contain;
    scroll-snap-type: y mandatory;
    scrollbar-width: none;
    text-align: center;
    touch-action: pan-y;
}

.caomei-picker__column:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: -2px;
    border-radius: var(--caomei-radius-sm);
}

.caomei-picker__column--disabled,
.caomei-picker__column--readonly {
    cursor: default;
}

.caomei-picker__column--disabled {
    opacity: var(--caomei-disabled-opacity);
}

.caomei-picker__column::-webkit-scrollbar {
    display: none;
}

.caomei-picker__option {
    display: block;
    box-sizing: border-box;
    width: 100%;
    height: var(--caomei-picker-item-height, 36px);
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--caomei-color-text);
    font: inherit;
    font-variant-numeric: tabular-nums;
    line-height: var(--caomei-picker-item-height, 36px);
    text-align: center;
    scroll-snap-align: center;
    cursor: pointer;
}

.caomei-picker__column--disabled .caomei-picker__option,
.caomei-picker__column--readonly .caomei-picker__option {
    cursor: default;
}

.caomei-picker__option--selected {
    color: var(--caomei-color-primary-text);
    font-weight: 600;
}
</style>
