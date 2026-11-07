<script setup lang="ts">
import { Calendar as CalendarIcon } from '@lucide/vue'
import { PopoverContent, PopoverPortal, PopoverRoot } from 'reka-ui'
import { computed, useAttrs, watchEffect } from 'vue'
import { warnDev } from '../../_shared/dev-warn'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon } from '../../icons'
import { defaultLocale } from '../../locale'
import { formatDate, formatTime } from '../_shared/date-format'
import { resolveLabelName } from '../_shared/use-label-attrs'
import { CaomeiPopoverTrigger } from '../popover'
import CalendarPanel from '../calendar/calendar-panel.vue'
import CalendarRangePanel from '../calendar/calendar-range-panel.vue'
import TimeInput from './time-input.vue'
import type { DatePickerModelValue, DatePickerProps, DatePickerRange, TimeParts } from './types'

// 组合 Reka Popover + 内部 CalendarPanel / CalendarRangePanel：面板日历与本库 Calendar 共用接线与可访问名，
// 避免 Reka DatePicker / DateRangePicker 内建英文文案（Event Date）无法本地化。
defineOptions({ name: 'CaomeiDatePicker', inheritAttrs: false })

const props = withDefaults(defineProps<DatePickerProps>(), {
    selectionMode: 'single',
    disabled: false,
    readonly: false,
    invalid: false,
    size: 'md',
    placeholder: '',
    showIcon: true,
    showTime: false,
    hourFormat: '24',
    showSeconds: false,
    closeOnSelect: true,
    locale: defaultLocale,
    weekdayFormat: 'narrow',
    fixedWeeks: false,
    preventDeselect: false,
})

const model = defineModel<DatePickerModelValue>({ default: null })
const open = defineModel<boolean>('open', { default: false })

const isRange = computed(() => props.selectionMode === 'range')

/** 单日期模型：非 `single` 模式或模型为区间时视为未选择 */
const singleDate = computed<Date | null>(() => (model.value instanceof Date ? model.value : null))
/** 区间模型：仅 `range` 模式且模型为「两个原生 Date」时成立；异常形状按未选择处理 */
const rangeModel = computed<DatePickerRange | null>(() => {
    if (!isRange.value) {
        return null
    }

    const value = model.value
    if (!Array.isArray(value) || !(value[0] instanceof Date) || !(value[1] instanceof Date)) {
        return null
    }

    return [value[0], value[1]]
})

const messages = useLocale()
const displayText = computed(() => {
    if (isRange.value) {
        const range = rangeModel.value
        if (!range) {
            return ''
        }
        return `${formatDate(range[0], props.dateFormat, props.locale)} – ${formatDate(range[1], props.dateFormat, props.locale)}`
    }

    const dateText = formatDate(singleDate.value, props.dateFormat, props.locale)
    if (!props.showTime) {
        return dateText
    }

    return [dateText, formatTime(singleDate.value, {
        hourFormat: props.hourFormat,
        showSeconds: props.showSeconds,
        locale: props.locale,
    })].filter(Boolean).join(' ')
})

// 面板日历只消费日期部分，时间另行编辑后合并回模型
const dateOnly = computed(() => {
    if (!singleDate.value) {
        return null
    }

    const next = new Date(singleDate.value)
    next.setHours(0, 0, 0, 0)
    return next
})
const timeParts = computed<TimeParts>(() => ({
    hour: singleDate.value?.getHours() ?? 0,
    minute: singleDate.value?.getMinutes() ?? 0,
    second: singleDate.value?.getSeconds() ?? 0,
}))

/**
 * 触发按钮兜底可访问名：单日期为「日期」；区间为「日期范围」。
 * 区间已选时**不使用** aria-label——可见区间文本即名称主体，另以隐藏文本补「开始 / 结束」语义，
 * 避免 aria-label 覆盖可见文本触发 Label in Name（WCAG 2.5.3）风险。
 */
const fallbackLabel = computed(() =>
    isRange.value ? messages.value.datePicker.range : messages.value.datePicker.label)
const attrs = useAttrs()
/**
 * 触发器可访问名优先级：显式 `label` > 透传 `aria-label` > 语言兜底文案；
 * 已有可见文本 / 占位文本时不额外声明可访问名（避免覆盖可见文案）。
 */
const triggerLabel = computed(() =>
    resolveLabelName(
        props.label,
        attrs['aria-label'],
        displayText.value || props.placeholder ? undefined : fallbackLabel.value,
    ),
)
/** 区间已选时的隐藏语义后缀（进入可访问名，不进入可见布局） */
const rangeHint = computed(() => (isRange.value && rangeModel.value
    ? `（${messages.value.datePicker.rangeStart} / ${messages.value.datePicker.rangeEnd}）`
    : ''))

const rootClass = computed(() => [
    `caomei-date-picker--${props.size}`,
    {
        'caomei-date-picker--invalid': props.invalid,
        'caomei-date-picker--disabled': props.disabled,
        'caomei-date-picker--readonly': props.readonly,
    },
])

function onDateUpdate(value: Date | null): void {
    if (!value) {
        model.value = null
        // 取消选择同样遵循 closeOnSelect；含时间选择时保持展开
        if (props.closeOnSelect && !props.showTime) {
            open.value = false
        }
        return
    }

    const next = new Date(value)
    const current = singleDate.value
    if (current) {
        next.setHours(current.getHours(), current.getMinutes(), current.getSeconds(), 0)
    }
    model.value = next

    // 含时间选择时保持面板展开，便于继续选时间
    if (props.closeOnSelect && !props.showTime) {
        open.value = false
    }
}

function onTimeUpdate(value: TimeParts): void {
    const next = singleDate.value ? new Date(singleDate.value) : new Date()
    next.setHours(value.hour, value.minute, value.second, 0)
    model.value = next
}

/** 范围面板只在两端齐全（或完全清空）时抛值；半开区间由面板内部保留，不会打断选择 */
function onRangeUpdate(value: DatePickerRange | null): void {
    model.value = value
    if (props.closeOnSelect) {
        open.value = false
    }
}

// `showTime` 与区间选择不兼容：Reka 的 RangeCalendar 不含时间层，忽略而非静默降级到「只选开始时间」
let warnedRangeTime = false
watchEffect(() => {
    if (warnedRangeTime || !isRange.value || !props.showTime) {
        return
    }
    warnedRangeTime = true
    warnDev('[CaomeiDatePicker] selectionMode="range" 不支持 showTime，时间部分将被忽略。')
})
</script>

<template>
    <PopoverRoot v-model:open="open">
        <!--
          触发器经本库 CaomeiPopoverTrigger（as-child + unstyled）：由本库触发器统一承载开合与无障碍接线（内部委托 Reka primitive），
          外观仍由下方自持 button 提供（`unstyled` 保证不合并内建触发器外观类）。
        -->
        <CaomeiPopoverTrigger
            as-child
            unstyled
            :disabled="disabled"
        >
            <button
                :id="id"
                v-bind="$attrs"
                type="button"
                class="caomei-date-picker"
                :class="rootClass"
                :aria-label="triggerLabel"
                :aria-invalid="invalid || undefined"
                :disabled="disabled"
            >
                <span
                    class="caomei-date-picker__text"
                    :data-empty="displayText ? undefined : 'true'"
                >{{ displayText || placeholder }}</span>
                <span
                    v-if="rangeHint"
                    class="caomei-date-picker__range-hint"
                >{{ rangeHint }}</span>
                <CaomeiIcon
                    v-if="showIcon"
                    :icon="CalendarIcon"
                    class="caomei-date-picker__icon"
                />
            </button>
        </CaomeiPopoverTrigger>
        <PopoverPortal>
            <PopoverContent
                class="caomei-date-picker__content"
                align="start"
                :side-offset="6"
            >
                <CalendarPanel
                    v-if="!isRange"
                    :model-value="dateOnly"
                    :min-value="minValue"
                    :max-value="maxValue"
                    :disabled="disabled"
                    :readonly="readonly"
                    :locale="locale"
                    :week-starts-on="weekStartsOn"
                    :weekday-format="weekdayFormat"
                    :fixed-weeks="fixedWeeks"
                    :prevent-deselect="preventDeselect"
                    class="caomei-calendar"
                    @update:model-value="onDateUpdate"
                />
                <CalendarRangePanel
                    v-else
                    :model-value="rangeModel"
                    :min-value="minValue"
                    :max-value="maxValue"
                    :disabled="disabled"
                    :readonly="readonly"
                    :locale="locale"
                    :week-starts-on="weekStartsOn"
                    :weekday-format="weekdayFormat"
                    :fixed-weeks="fixedWeeks"
                    :prevent-deselect="preventDeselect"
                    class="caomei-calendar"
                    @update:model-value="onRangeUpdate"
                />
                <div
                    v-if="showTime && !isRange"
                    class="caomei-date-picker__time"
                >
                    <TimeInput
                        :model-value="timeParts"
                        :show-seconds="showSeconds"
                        :hour-format="hourFormat"
                        :locale="locale"
                        :disabled="disabled || !singleDate"
                        :readonly="readonly"
                        @update:model-value="onTimeUpdate"
                    />
                </div>
            </PopoverContent>
        </PopoverPortal>
    </PopoverRoot>
</template>

<style scoped>
/*
  宽度上限：与选择器家族（Select / MultiSelect / AutoComplete）同源，默认回退 `--caomei-select-max-width`
  （20rem），避免在宽容器中把触发按钮拉到过长；需要撑满所在列时在同一元素或其祖先上把
  `--caomei-date-picker-max-width` 覆盖为 `none`。上限声明在触发器自身（本组件无字段包装层）。
*/
.caomei-date-picker {
    box-sizing: border-box;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--caomei-space-2);
    width: 100%;
    max-width: var(--caomei-date-picker-max-width, var(--caomei-select-max-width));
    height: var(--caomei-date-picker-height, var(--caomei-control-height-md));
    padding: 0 var(--caomei-date-picker-padding-x, var(--caomei-space-3));
    border: 1px solid var(--caomei-color-control-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-date-picker-font-size, var(--caomei-font-size-md));
    text-align: start;
    cursor: pointer;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.caomei-date-picker:focus-visible {
    border-color: var(--caomei-color-primary);
    outline: 0;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-primary) 20%, transparent);
}

:where(.caomei-date-picker--sm) {
    --caomei-date-picker-height: var(--caomei-control-height-sm);
    --caomei-date-picker-padding-x: var(--caomei-space-2);
    --caomei-date-picker-font-size: var(--caomei-font-size-sm);
}

:where(.caomei-date-picker--md) {
    --caomei-date-picker-height: var(--caomei-control-height-md);
    --caomei-date-picker-padding-x: var(--caomei-space-3);
    --caomei-date-picker-font-size: var(--caomei-font-size-md);
}

:where(.caomei-date-picker--lg) {
    --caomei-date-picker-height: var(--caomei-control-height-lg);
    --caomei-date-picker-padding-x: var(--caomei-space-4);
    --caomei-date-picker-font-size: var(--caomei-font-size-lg);
}

.caomei-date-picker--invalid {
    border-color: var(--caomei-color-danger);
}

.caomei-date-picker--disabled {
    cursor: not-allowed;
    background: var(--caomei-color-bg-elevated);
    opacity: var(--caomei-disabled-opacity);
}

.caomei-date-picker--readonly {
    background: var(--caomei-color-bg-elevated);
}

.caomei-date-picker__text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.caomei-date-picker__text[data-empty] {
    color: var(--caomei-color-text-muted);
}

/* 区间语义后缀：只在可访问树中提供「开始 / 结束」，不参与布局 */
.caomei-date-picker__range-hint {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
}

.caomei-date-picker__icon {
    flex-shrink: 0;
    color: var(--caomei-color-text-muted);
}
</style>

<!-- Portal 面板：Portal 内元素不带父级 scoped 属性，样式集中为命名空间化的非 scoped 规则 -->
<style>
.caomei-date-picker__content {
    box-sizing: border-box;
    z-index: var(--caomei-date-picker-z-index, var(--caomei-z-dropdown));
    width: max-content;

    /*
      窄屏上限：面板不得超出 popper 可用宽 / 可用高（`--reka-popover-content-available-*` 由 Reka
      PopoverContentImpl 写入，回退 `none` 保持原行为）。日历为定宽定高内容（单月），上限只在可用
      空间小于内容时生效；此时 `overflow: auto` 让内容可滚动可达，避免面板越出视口后内容不可达
      （响应式设计 §2 降级原则、§3 矩阵 #6）。与浮层面板收敛同源，见 `docs/design/responsive.md` §3 矩阵 #6。
    */
    max-width: var(--reka-popover-content-available-width, none);
    max-height: var(--reka-popover-content-available-height, none);
    overflow: auto;
    padding: var(--caomei-space-3);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg-elevated);
    color: var(--caomei-color-text);
    box-shadow: var(--caomei-shadow-md);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
    outline: none;
    transform-origin: var(--reka-popover-content-transform-origin);
    animation: caomei-date-picker-in 0.12s ease-out;
}

.caomei-date-picker__time {
    margin-top: var(--caomei-space-2);
    padding-top: var(--caomei-space-2);
    border-top: 1px solid var(--caomei-color-border);
}

@keyframes caomei-date-picker-in {
    from {
        opacity: 0;
        transform: scale(0.96);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

@media (prefers-reduced-motion: reduce) {
    .caomei-date-picker__content {
        animation: none;
    }
}
</style>
