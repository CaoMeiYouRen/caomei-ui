<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { CalendarRoot } from 'reka-ui'
import { computed } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { fromDateValue, toDateValue } from '../_shared/date'
import CalendarView from './calendar-view.vue'
import type { CalendarPanelProps } from './types'

// 内部面板：统一 CalendarRoot 接线，供 CaomeiCalendar 与 CaomeiDatePicker 复用。
// 默认值由两个公开入口各自声明，未传项依赖 Reka 默认（当前逐项一致，勿在此处重复声明避免漂移）。
defineOptions({ name: 'CaomeiCalendarPanel' })

const props = defineProps<CalendarPanelProps>()

const model = defineModel<Date | null>({ default: null })

const messages = useLocale()
const calendarLabel = computed(() => props.label ?? messages.value.calendar.label)

const dateValue = computed(() => toDateValue(model.value))
const defaultValue = computed(() => toDateValue(props.defaultValue))
const minValue = computed(() => toDateValue(props.minValue))
const maxValue = computed(() => toDateValue(props.maxValue))

function onUpdate(value: DateValue | undefined): void {
    model.value = fromDateValue(value) ?? null
}
</script>

<template>
    <CalendarRoot
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
