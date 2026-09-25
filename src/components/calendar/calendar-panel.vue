<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { CalendarRoot } from 'reka-ui'
import { computed, useAttrs } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { fromDateValue, toDateValue } from '../_shared/date'
import { resolveLabelName } from '../_shared/use-label-attrs'
import CalendarView from './calendar-view.vue'
import type { CalendarPanelProps } from './types'

// 内部面板：统一 CalendarRoot 接线，供 CaomeiCalendar 与 CaomeiDatePicker 复用。
// 默认值由两个公开入口各自声明，未传项依赖 Reka 默认（当前逐项一致，勿在此处重复声明避免漂移）。
defineOptions({ name: 'CaomeiCalendarPanel', inheritAttrs: false })

const props = defineProps<CalendarPanelProps>()

const model = defineModel<Date | null>({ default: null })

const messages = useLocale()
const attrs = useAttrs()
/** 面板可访问名优先级：显式 `label` > 透传 `aria-label` > 语言兜底文案 */
const calendarLabel = computed(
    () => resolveLabelName(props.label, attrs['aria-label'], messages.value.calendar.label),
)
const dateValue = computed(() => toDateValue(model.value))
const defaultValue = computed(() => toDateValue(props.defaultValue))
const minValue = computed(() => toDateValue(props.minValue))
const maxValue = computed(() => toDateValue(props.maxValue))

function onUpdate(value: DateValue | undefined): void {
    model.value = fromDateValue(value) ?? null
}
</script>

<template>
    <!--
      显式 `label` 需压过透传值，故以对象绑定在其后覆盖 `aria-label`；
      未显式提供时保持 Reka 的合成名（`<名称>, <月份>`），不额外声明裸名。
      `role="group"` 是可访问名契约的一部分：Reka 的 CalendarRoot 根容器为 `role=generic`，
      ARIA 禁止 generic 承载名称，补显式 role 后 `aria-label` 才合法；故 role 同样压过透传值，
      不接受外部覆盖（覆盖回非可命名 role 会重新引入 `aria-prohibited-attr`）。
    -->
    <CalendarRoot
        v-bind="{...$attrs, role: 'group', ...(label ? {'aria-label': calendarLabel} : {})}"
        :model-value="dateValue"
        :default-value="defaultValue"
        :min-value="minValue"
        :max-value="maxValue"
        :disabled="disabled"
        :readonly="readonly"
        :locale="locale"
        :week-starts-on="weekStartsOn"
        :weekday-format="weekdayFormat"
        :fixed-weeks="fixedWeeks"
        :prevent-deselect="preventDeselect"
        :paged-navigation="pagedNavigation"
        :initial-focus="initialFocus"
        :calendar-label="calendarLabel"
        @update:model-value="onUpdate"
    >
        <template #default="{weekDays, grid}">
            <CalendarView
                :week-days="weekDays"
                :grid="grid"
            />
        </template>
    </CalendarRoot>
</template>
