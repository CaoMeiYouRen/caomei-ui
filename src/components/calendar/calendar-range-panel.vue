<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { RangeCalendarRoot } from 'reka-ui'
import { computed, useAttrs } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { fromDateRangeValue, toDateRangeValue, toDateValue } from '../_shared/date'
import { resolveLabelName } from '../_shared/use-label-attrs'
import CalendarView from './calendar-view.vue'
import type { CalendarRangePanelProps, CalendarRangeValue } from './types'

// 内部范围面板：统一 RangeCalendarRoot 接线，供 CaomeiDatePicker 的 range 模式复用。
// 默认值由调用方声明，未传项依赖 Reka 默认（与单日期面板同一纪律）。
defineOptions({ name: 'CaomeiCalendarRangePanel', inheritAttrs: false })

const props = defineProps<CalendarRangePanelProps>()

/**
 * 对外模型是**已完成的闭区间**：只选到起点时 Reka 抛出的半开区间不写回模型，
 * 否则受控写回会把 Reka 内部刚建立的起点清空（区间选择无法完成）。
 * 清空（两端皆无）照常写回 `null`。
 */
const model = defineModel<CalendarRangeValue | null>({ default: null })

const messages = useLocale()
const attrs = useAttrs()
/** 面板可访问名优先级：显式 `label` > 透传 `aria-label` > 语言兜底文案 */
const calendarLabel = computed(
    () => resolveLabelName(props.label, attrs['aria-label'], messages.value.calendar.label),
)
const rangeValue = computed(() => toDateRangeValue(model.value))
const minValue = computed(() => toDateValue(props.minValue))
const maxValue = computed(() => toDateValue(props.maxValue))

function onUpdate(value: { start?: DateValue, end?: DateValue }): void {
    if (!value.start && !value.end) {
        model.value = null
        return
    }

    const range = fromDateRangeValue(value)
    if (range) {
        model.value = range
    }
}
</script>

<template>
    <!--
      显式 `label` 需压过透传值，故以对象绑定在其后覆盖 `aria-label`；
      未显式提供时保持 Reka 的合成名（`<名称>, <月份>`），不额外声明裸名。
      `role="group"` 与单日期面板同源：Reka 根容器为 `role=generic`，ARIA 禁止 generic 承载名称。
    -->
    <RangeCalendarRoot
        v-bind="{...$attrs, role: 'group', ...(label ? {'aria-label': calendarLabel} : {})}"
        :model-value="rangeValue"
        :min-value="minValue"
        :max-value="maxValue"
        :disabled="disabled"
        :readonly="readonly"
        :locale="locale"
        :week-starts-on="weekStartsOn"
        :weekday-format="weekdayFormat"
        :fixed-weeks="fixedWeeks"
        :prevent-deselect="preventDeselect"
        :calendar-label="calendarLabel"
        @update:model-value="onUpdate"
    >
        <template #default="{weekDays, grid}">
            <CalendarView
                range
                :week-days="weekDays"
                :grid="grid"
            />
        </template>
    </RangeCalendarRoot>
</template>
