<script setup lang="ts">
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
    RangeCalendarCell,
    RangeCalendarCellTrigger,
    RangeCalendarGrid,
    RangeCalendarGridBody,
    RangeCalendarGridHead,
    RangeCalendarGridRow,
    RangeCalendarHeadCell,
    RangeCalendarHeading,
    RangeCalendarNext,
    RangeCalendarPrev,
} from 'reka-ui'
import { computed } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon, useInternalIcons } from '../../icons'
import type { CalendarViewProps } from './types'

// 呈现层：仅消费祖先 CalendarRoot / RangeCalendarRoot 提供的日历上下文。
// 单日期与范围两族 primitive 的结构与 props 逐项一致，差异只在单元格注入的上下文；
// 故用同一份标记与样式，按 `range` 切换组件族，避免两套 DOM / 样式漂移。
defineOptions({ name: 'CaomeiCalendarView' })

const icons = useInternalIcons()

const props = defineProps<CalendarViewProps>()

const locale = useLocale()
const prevLabel = computed(() => locale.value.calendar.prev)
const nextLabel = computed(() => locale.value.calendar.next)

const parts = computed(() => (props.range
    ? {
            cell: RangeCalendarCell,
            trigger: RangeCalendarCellTrigger,
            grid: RangeCalendarGrid,
            gridHead: RangeCalendarGridHead,
            gridBody: RangeCalendarGridBody,
            gridRow: RangeCalendarGridRow,
            headCell: RangeCalendarHeadCell,
            heading: RangeCalendarHeading,
            prev: RangeCalendarPrev,
            next: RangeCalendarNext,
        }
    : {
            cell: CalendarCell,
            trigger: CalendarCellTrigger,
            grid: CalendarGrid,
            gridHead: CalendarGridHead,
            gridBody: CalendarGridBody,
            gridRow: CalendarGridRow,
            headCell: CalendarHeadCell,
            heading: CalendarHeading,
            prev: CalendarPrev,
            next: CalendarNext,
        }))
</script>

<template>
    <div class="caomei-calendar__header">
        <component
            :is="parts.prev"
            class="caomei-calendar__nav"
            :aria-label="prevLabel"
        >
            <CaomeiIcon :icon="icons.chevronLeft" />
        </component>
        <component
            :is="parts.heading"
            class="caomei-calendar__heading"
        />
        <component
            :is="parts.next"
            class="caomei-calendar__nav"
            :aria-label="nextLabel"
        >
            <CaomeiIcon :icon="icons.chevronRight" />
        </component>
    </div>
    <component
        :is="parts.grid"
        v-for="month in grid"
        :key="month.value.toString()"
        class="caomei-calendar__grid"
    >
        <component :is="parts.gridHead">
            <component :is="parts.gridRow">
                <component
                    :is="parts.headCell"
                    v-for="weekDay in weekDays"
                    :key="weekDay"
                    scope="col"
                    class="caomei-calendar__weekday"
                >
                    {{ weekDay }}
                </component>
            </component>
        </component>
        <component :is="parts.gridBody">
            <component
                :is="parts.gridRow"
                v-for="(week, index) in month.rows"
                :key="index"
            >
                <component
                    :is="parts.cell"
                    v-for="day in week"
                    :key="day.toString()"
                    :date="day"
                    class="caomei-calendar__cell"
                >
                    <component
                        :is="parts.trigger"
                        :day="day"
                        :month="month.value"
                        class="caomei-calendar__day"
                        :class="{'caomei-calendar__day--range': range}"
                    />
                </component>
            </component>
        </component>
    </component>
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
    opacity: var(--caomei-disabled-opacity);
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

/*
  区间内的日期（Reka 对区间内每一天都置 `data-selected`）：用浅色带表达「已选区间」，
  仅两端保留实底主色，使起点 / 终点在视觉上可区分。规则**必须以区间标记类限定**——
  单日期日历的选中日同样带 `data-selected`，且没有 `data-selection-*`，不限定会误伤。
*/
.caomei-calendar__day--range[data-selected]:not([data-selection-start], [data-selection-end]) {
    background: color-mix(in srgb, var(--caomei-color-primary) 16%, transparent);
}

/* 区间内日期的文本色：跨月 / 禁用日仍由下方同名规则取 muted，避免被区间带压过 */
.caomei-calendar__day--range[data-selected]:not([data-selection-start], [data-selection-end], [data-outside-view], [data-disabled]) {
    color: var(--caomei-color-text);
}

/* 悬停预览：已选起点、尚未确定终点时的区间带（Reka `data-highlighted`，仅区间日历产生） */
.caomei-calendar__day--range[data-highlighted]:not([data-selected]) {
    background: color-mix(in srgb, var(--caomei-color-primary) 10%, transparent);
}

.caomei-calendar__day[data-outside-view] {
    color: var(--caomei-color-text-muted);
}

.caomei-calendar__day[data-disabled] {
    color: var(--caomei-color-text-muted);
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-calendar__day[data-unavailable] {
    text-decoration: line-through;
}
</style>
