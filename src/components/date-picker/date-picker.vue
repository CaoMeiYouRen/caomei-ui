<script setup lang="ts">
import { Calendar as CalendarIcon } from '@lucide/vue'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { computed } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon } from '../../icons'
import { defaultLocale } from '../../locale'
import { formatDate, formatTime } from '../_shared/date-format'
import CalendarPanel from '../calendar/calendar-panel.vue'
import TimeInput from './time-input.vue'
import type { DatePickerProps, TimeParts } from './types'

// 组合 Reka Popover + 内部 CalendarPanel：面板日历与本库 Calendar 共用接线与可访问名，
// 避免 Reka DatePicker 内建英文文案（Event Date）无法本地化。
defineOptions({ name: 'CaomeiDatePicker', inheritAttrs: false })

const props = withDefaults(defineProps<DatePickerProps>(), {
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

const model = defineModel<Date | null>({ default: null })
const open = defineModel<boolean>('open', { default: false })

const messages = useLocale()
const displayText = computed(() => {
    const dateText = formatDate(model.value, props.dateFormat, props.locale)
    if (!props.showTime) {
        return dateText
    }

    return [dateText, formatTime(model.value, {
        hourFormat: props.hourFormat,
        showSeconds: props.showSeconds,
        locale: props.locale,
    })].filter(Boolean).join(' ')
})

// 面板日历只消费日期部分，时间另行编辑后合并回模型
const dateOnly = computed(() => {
    if (!model.value) {
        return null
    }

    const next = new Date(model.value)
    next.setHours(0, 0, 0, 0)
    return next
})
const timeParts = computed<TimeParts>(() => ({
    hour: model.value?.getHours() ?? 0,
    minute: model.value?.getMinutes() ?? 0,
    second: model.value?.getSeconds() ?? 0,
}))

const fallbackLabel = computed(() => props.label ?? messages.value.datePicker.label)
const triggerLabel = computed(() =>
    props.label ?? (displayText.value || props.placeholder ? undefined : fallbackLabel.value),
)

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
    const current = model.value
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
    const next = model.value ? new Date(model.value) : new Date()
    next.setHours(value.hour, value.minute, value.second, 0)
    model.value = next
}
</script>

<template>
    <PopoverRoot v-model:open="open">
        <PopoverTrigger as-child>
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
                <CaomeiIcon
                    v-if="showIcon"
                    :icon="CalendarIcon"
                    class="caomei-date-picker__icon"
                />
            </button>
        </PopoverTrigger>
        <PopoverPortal>
            <PopoverContent
                class="caomei-date-picker__content"
                align="start"
                :side-offset="6"
            >
                <CalendarPanel
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
                <div
                    v-if="showTime"
                    class="caomei-date-picker__time"
                >
                    <TimeInput
                        :model-value="timeParts"
                        :show-seconds="showSeconds"
                        :hour-format="hourFormat"
                        :locale="locale"
                        :disabled="disabled || !model"
                        :readonly="readonly"
                        @update:model-value="onTimeUpdate"
                    />
                </div>
            </PopoverContent>
        </PopoverPortal>
    </PopoverRoot>
</template>

<style scoped>
.caomei-date-picker {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--caomei-space-2);
    width: 100%;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    text-align: start;
    cursor: pointer;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.caomei-date-picker:focus-visible {
    border-color: var(--caomei-color-primary);
    outline: 0;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-primary) 20%, transparent);
}

.caomei-date-picker--sm {
    height: var(--caomei-control-height-sm);
    padding: 0 var(--caomei-space-2);
    font-size: var(--caomei-font-size-sm);
}

.caomei-date-picker--md {
    height: var(--caomei-control-height-md);
    padding: 0 var(--caomei-space-3);
    font-size: var(--caomei-font-size-md);
}

.caomei-date-picker--lg {
    height: var(--caomei-control-height-lg);
    padding: 0 var(--caomei-space-4);
    font-size: var(--caomei-font-size-lg);
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

.caomei-date-picker__icon {
    flex-shrink: 0;
    color: var(--caomei-color-text-muted);
}
</style>

<!-- Portal 面板：Portal 内元素不带父级 scoped 属性，样式集中为命名空间化的非 scoped 规则 -->
<style>
.caomei-date-picker__content {
    box-sizing: border-box;
    z-index: var(--caomei-date-picker-z-index, 1050);
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
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    box-shadow: 0 8px 24px color-mix(in srgb, var(--caomei-color-text) 16%, transparent);
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
