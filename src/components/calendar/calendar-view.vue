<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import {
    CalendarCell,
    CalendarCellTrigger,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHead,
    CalendarGridRow,
    CalendarHeadCell,
    CalendarHeading,
    CalendarNext,
    CalendarPrev,
} from 'reka-ui'
import { computed } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon } from '../../icons'
import type { CalendarViewProps } from './types'

// 呈现层：仅消费祖先 CalendarRoot / DatePickerCalendar 提供的日历上下文
defineOptions({ name: 'CaomeiCalendarView' })

defineProps<CalendarViewProps>()

const locale = useLocale()
const prevLabel = computed(() => locale.value.calendar.prev)
const nextLabel = computed(() => locale.value.calendar.next)
</script>

<template>
    <div class="caomei-calendar__header">
        <CalendarPrev
            class="caomei-calendar__nav"
            :aria-label="prevLabel"
        >
            <CaomeiIcon :icon="ChevronLeft" />
        </CalendarPrev>
        <CalendarHeading class="caomei-calendar__heading" />
        <CalendarNext
            class="caomei-calendar__nav"
            :aria-label="nextLabel"
        >
            <CaomeiIcon :icon="ChevronRight" />
        </CalendarNext>
    </div>
    <CalendarGrid
        v-for="month in grid"
        :key="month.value.toString()"
        class="caomei-calendar__grid"
    >
        <CalendarGridHead>
            <CalendarGridRow>
                <CalendarHeadCell
                    v-for="weekDay in weekDays"
                    :key="weekDay"
                    scope="col"
                    class="caomei-calendar__weekday"
                >
                    {{ weekDay }}
                </CalendarHeadCell>
            </CalendarGridRow>
        </CalendarGridHead>
        <CalendarGridBody>
            <CalendarGridRow
                v-for="(week, index) in month.rows"
                :key="index"
            >
                <CalendarCell
                    v-for="day in week"
                    :key="day.toString()"
                    :date="day"
                    class="caomei-calendar__cell"
                >
                    <CalendarCellTrigger
                        :day="day"
                        :month="month.value"
                        class="caomei-calendar__day"
                    />
                </CalendarCell>
            </CalendarGridRow>
        </CalendarGridBody>
    </CalendarGrid>
</template>

<style scoped>
.caomei-calendar__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--caomei-space-2);
    margin-bottom: var(--caomei-space-2);
}

.caomei-calendar__heading {
    flex: 1;
    color: var(--caomei-color-text);
    font-size: var(--caomei-font-size-md);
    font-weight: 600;
    text-align: center;
    text-transform: capitalize;
}

.caomei-calendar__nav {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: var(--caomei-control-height-sm);
    height: var(--caomei-control-height-sm);
    padding: 0;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-sm);
    background: transparent;
    color: var(--caomei-color-text-muted);
    cursor: pointer;
}

.caomei-calendar__nav:hover {
    color: var(--caomei-color-text);
}

.caomei-calendar__nav:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-calendar__nav:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.caomei-calendar__grid {
    width: 100%;
    border-collapse: collapse;
}

.caomei-calendar__weekday {
    padding: var(--caomei-space-1);
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
    font-weight: 400;
    text-align: center;
}

.caomei-calendar__cell {
    padding: 0;
    text-align: center;
}

.caomei-calendar__day {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--caomei-control-height-sm);
    height: var(--caomei-control-height-sm);
    margin: 1px auto;
    border-radius: var(--caomei-radius-sm);
    color: var(--caomei-color-text);
    font-size: var(--caomei-font-size-sm);
    cursor: pointer;
}

.caomei-calendar__day:hover:not([data-disabled], [data-selected]) {
    background: var(--caomei-color-bg-elevated);
}

.caomei-calendar__day:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-calendar__day[data-today]:not([data-selected]) {
    border: 1px solid var(--caomei-color-border);
}

.caomei-calendar__day[data-selected] {
    background: var(--caomei-color-primary);
    color: var(--caomei-color-primary-foreground);
}

.caomei-calendar__day[data-outside-view] {
    color: var(--caomei-color-text-muted);
}

.caomei-calendar__day[data-disabled] {
    color: var(--caomei-color-text-muted);
    cursor: not-allowed;
    opacity: 0.5;
}

.caomei-calendar__day[data-unavailable] {
    text-decoration: line-through;
}
</style>
