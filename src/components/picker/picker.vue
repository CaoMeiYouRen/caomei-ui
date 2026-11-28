<script setup lang="ts">
import { computed } from 'vue'
import CaomeiPickerColumn from './picker-column.vue'
import type { PickerProps } from './types'

defineOptions({ name: 'CaomeiPicker', inheritAttrs: false })

const props = withDefaults(defineProps<PickerProps>(), {
    disabled: false,
    readonly: false,
    loop: false,
    itemHeight: 36,
    visibleCount: 5,
})

/**
 * 选中值：数组长度与 `columns` 对齐。
 *
 * 初始为空时各列回退到自己的首项（`valueFor`），因此「未选中」与「选中首项」在视觉上一致，
 * 但与 `TimePicker` 同口径：模型不写入隐式默认值，只有用户交互才回写。
 */
const model = defineModel<(string | number)[]>({ default: () => [] })

/** 当前值：`defineModel` 已保证非空数组（默认 `[]`），无需再兜底 */
const effective = computed(() => model.value)

function valueFor(index: number): string | number {
    const values = effective.value
    if (index < values.length) {
        return values[index]
    }
    // 未选择时回退到该列首项：仅用于展示与落点计算，不回写模型
    const options = props.columns[index].options
    return options.length ? options[0].value : ''
}

function onColumnUpdate(index: number, value: string | number): void {
    const next = [...props.columns.map((_, columnIndex) => valueFor(columnIndex))]
    next[index] = value
    model.value = next
}
</script>

<template>
    <div
        v-bind="$attrs"
        class="caomei-picker"
        :class="{'caomei-picker--disabled': disabled}"
        role="group"
        :aria-label="label"
        :aria-disabled="disabled || undefined"
    >
        <CaomeiPickerColumn
            v-for="(column, index) in columns"
            :key="index"
            :label="column.label"
            :options="column.options"
            :model-value="valueFor(index)"
            :disabled="disabled"
            :readonly="readonly"
            :loop="loop"
            :item-height="itemHeight"
            :visible-count="visibleCount"
            @update:model-value="onColumnUpdate(index, $event)"
        />
    </div>
</template>

<style scoped>
.caomei-picker {
    box-sizing: border-box;
    display: inline-flex;
    gap: var(--caomei-space-2);
    align-items: stretch;
    padding: var(--caomei-space-1) var(--caomei-space-2);
    border: 1px solid var(--caomei-picker-border, var(--caomei-color-border));
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-picker-bg, var(--caomei-color-bg));
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
}

.caomei-picker--disabled {
    opacity: var(--caomei-disabled-opacity);
}
</style>
