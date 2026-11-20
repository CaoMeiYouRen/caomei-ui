<script setup lang="ts">
import { computed, useId, useSlots } from 'vue'
import { useLocale } from '../../composables/use-locale'
import type { TimePickerEmits, TimePickerProps, TimePickerStep } from './types'

defineOptions({ name: 'CaomeiTimePicker' })

const props = withDefaults(defineProps<TimePickerProps>(), {
    modelValue: null,
    label: undefined,
    ariaLabel: undefined,
    hourFormat: '24',
    showSeconds: false,
    step: undefined,
    minValue: undefined,
    maxValue: undefined,
    disabled: false,
    readonly: false,
    id: undefined,
})

const emit = defineEmits<TimePickerEmits>()

const slots = useSlots()
const messages = useLocale()
const fieldId = useId()
const resolvedId = computed(() => props.id ?? fieldId)
const accessibleName = computed(() => props.ariaLabel ?? props.label)

const hourLabel = computed(() => messages.value.timePicker.hour)
const minuteLabel = computed(() => messages.value.timePicker.minute)
const secondLabel = computed(() => messages.value.timePicker.second)

const is12Hour = computed(() => props.hourFormat === '12')

/** 空值状态下各时间段不显示 0，而是留空（与 DatePicker 的空值占位语义一致）。 */
const isEmpty = computed(() => !props.modelValue || Number.isNaN(props.modelValue.getTime()))

const hour = computed(() => props.modelValue?.getHours() ?? 0)
const minute = computed(() => props.modelValue?.getMinutes() ?? 0)
const second = computed(() => props.modelValue?.getSeconds() ?? 0)

/** 12 小时制下的显示小时（1–12）。 */
const displayHour = computed(() => {
    if (!is12Hour.value) {
        return hour.value
    }
    const value = hour.value % 12
    return value === 0 ? 12 : value
})

const isPm = computed(() => hour.value >= 12)

const amLabel = computed(() => messages.value.timePicker.am)
const pmLabel = computed(() => messages.value.timePicker.pm)

/** 空值展示：`--` 而不是 0，避免把「未填」误读为午夜。 */
const hourDisplay = computed(() => (isEmpty.value ? '' : String(displayHour.value)))
const minuteDisplay = computed(() => (isEmpty.value ? '' : String(minute.value)))
const secondDisplay = computed(() => (isEmpty.value ? '' : String(second.value)))

/** 描述插槽的 id：渲染时才绑定到 `aria-describedby`。 */
const descriptionId = computed(() => `${resolvedId.value}-description`)
const hasDescription = computed(() => Boolean(slots.description))

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, Math.round(value)))
}

/** 各段步进：`step.hour` / `step.minute` / `step.second`，缺省 1。 */
function stepOf(part: keyof TimePickerStep): number {
    const value = props.step?.[part]
    return value && Number.isFinite(value) && value > 0 ? value : 1
}

/** 把目标时刻夹到 `minValue` / `maxValue` 之间（只比较时间部分；`min > max` 的跨日区间不夹取）。 */
function clampToRange(next: Date): Date {
    const start = props.minValue
    const end = props.maxValue
    if (!start && !end) {
        return next
    }
    const target = next.getHours() * 3600 + next.getMinutes() * 60 + next.getSeconds()
    const minSeconds = start ? start.getHours() * 3600 + start.getMinutes() * 60 + start.getSeconds() : 0
    const maxSeconds = end ? end.getHours() * 3600 + end.getMinutes() * 60 + end.getSeconds() : 24 * 3600 - 1
    if (minSeconds > maxSeconds) {
        return next
    }
    const clamped = Math.min(maxSeconds, Math.max(minSeconds, target))
    if (clamped === target) {
        return next
    }
    const result = new Date(next)
    result.setHours(Math.floor(clamped / 3600), Math.floor((clamped % 3600) / 60), clamped % 60, 0)
    return result
}

/**
 * 把一次编辑写回 `Date`：日期部分沿用当前值（空值取今天），时间部分取编辑后的段值。
 * 未开启秒时强制秒归零，避免旧值的秒数在秒段不可见时仍然保留。
 */
function commit(next: { hour?: number, minute?: number, second?: number }): void {
    const base = props.modelValue && !Number.isNaN(props.modelValue.getTime())
        ? new Date(props.modelValue)
        : new Date()
    base.setHours(
        next.hour ?? hour.value,
        next.minute ?? minute.value,
        props.showSeconds ? (next.second ?? second.value) : 0,
        0,
    )
    emit('update:modelValue', clampToRange(base))
}

/** 读取输入框数值；空串或非法值返回 `undefined`。 */
function readNumber(event: Event): number | undefined {
    const raw = (event.target as HTMLInputElement).value.trim()
    if (raw === '') {
        return undefined
    }
    const value = Number(raw)
    return Number.isFinite(value) ? value : undefined
}

/** 把 DOM 值回滚到模型值（被拒绝或非法输入时避免 DOM 与模型不一致）。 */
function resetInput(event: Event, value: string): void {
    (event.target as HTMLInputElement).value = value
}

function onHourInput(event: Event): void {
    if (props.disabled || props.readonly) {
        resetInput(event, hourDisplay.value)
        return
    }
    const raw = readNumber(event)
    if (raw === undefined) {
        resetInput(event, hourDisplay.value)
        return
    }
    if (is12Hour.value) {
        const display = clamp(raw, 1, 12)
        const nextHour = display === 12
            ? (isPm.value ? 12 : 0)
            : (isPm.value ? display + 12 : display)
        commit({ hour: nextHour })
        return
    }
    commit({ hour: clamp(raw, 0, 23) })
}

function onMinuteInput(event: Event): void {
    if (props.disabled || props.readonly) {
        resetInput(event, minuteDisplay.value)
        return
    }
    const raw = readNumber(event)
    if (raw === undefined) {
        resetInput(event, minuteDisplay.value)
        return
    }
    commit({ minute: clamp(raw, 0, 59) })
}

function onSecondInput(event: Event): void {
    if (props.disabled || props.readonly) {
        resetInput(event, secondDisplay.value)
        return
    }
    const raw = readNumber(event)
    if (raw === undefined) {
        resetInput(event, secondDisplay.value)
        return
    }
    commit({ second: clamp(raw, 0, 59) })
}

/** 12 小时制日序切换：只调整小时，不改分 / 秒。 */
function onDayPeriodChange(event: Event): void {
    if (props.disabled || props.readonly) {
        ;(event.target as HTMLSelectElement).value = isPm.value ? 'pm' : 'am'
        return
    }
    const pm = (event.target as HTMLSelectElement).value === 'pm'
    const current = hour.value
    if (pm && current < 12) {
        commit({ hour: current + 12 })
    } else if (!pm && current >= 12) {
        commit({ hour: current - 12 })
    }
}

/** 键盘上下键按 `step` 调整当前段（原生 number 输入只按 1 step 走）。 */
function onSegmentKeydown(event: KeyboardEvent, part: 'hour' | 'minute' | 'second'): void {
    if (props.disabled || props.readonly) {
        return
    }
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
        return
    }
    const step = stepOf(part)
    const direction = event.key === 'ArrowUp' ? 1 : -1
    const current = part === 'hour' ? hour.value : part === 'minute' ? minute.value : second.value
    const size = part === 'hour' ? 24 : 60
    const next = ((current + direction * step) % size + size) % size
    event.preventDefault()
    commit({ [part]: next })
}
</script>

<template>
    <div
        :id="resolvedId"
        class="caomei-time-picker"
        :class="{'caomei-time-picker--disabled': disabled}"
    >
        <label
            v-if="label"
            :id="`${resolvedId}-label`"
            class="caomei-time-picker__label"
        >
            {{ label }}
        </label>
        <div
            class="caomei-time-picker__field"
            role="group"
            :aria-label="accessibleName"
            :aria-labelledby="label && !ariaLabel ? `${resolvedId}-label` : undefined"
            :aria-disabled="disabled || undefined"
            :aria-describedby="hasDescription ? descriptionId : undefined"
        >
            <input
                class="caomei-time-picker__segment"
                type="number"
                inputmode="numeric"
                :min="is12Hour ? 1 : 0"
                :max="is12Hour ? 12 : 23"
                :step="stepOf('hour')"
                :value="hourDisplay"
                :aria-label="hourLabel"
                :disabled="disabled"
                :readonly="readonly"
                @change="onHourInput"
                @keydown="onSegmentKeydown($event, 'hour')"
            >
            <span class="caomei-time-picker__separator" aria-hidden="true">:</span>
            <input
                class="caomei-time-picker__segment"
                type="number"
                inputmode="numeric"
                min="0"
                max="59"
                :step="stepOf('minute')"
                :value="minuteDisplay"
                :aria-label="minuteLabel"
                :disabled="disabled"
                :readonly="readonly"
                @change="onMinuteInput"
                @keydown="onSegmentKeydown($event, 'minute')"
            >
            <template v-if="showSeconds">
                <span class="caomei-time-picker__separator" aria-hidden="true">:</span>
                <input
                    class="caomei-time-picker__segment"
                    type="number"
                    inputmode="numeric"
                    min="0"
                    max="59"
                    :step="stepOf('second')"
                    :value="secondDisplay"
                    :aria-label="secondLabel"
                    :disabled="disabled"
                    :readonly="readonly"
                    @change="onSecondInput"
                    @keydown="onSegmentKeydown($event, 'second')"
                >
            </template>
            <select
                v-if="is12Hour"
                class="caomei-time-picker__day-period"
                :value="isPm ? 'pm' : 'am'"
                :aria-label="`${hourLabel} ${amLabel}/${pmLabel}`"
                :disabled="disabled"
                :aria-readonly="readonly || undefined"
                @change="onDayPeriodChange"
            >
                <option value="am">
                    {{ amLabel }}
                </option>
                <option value="pm">
                    {{ pmLabel }}
                </option>
            </select>
        </div>
        <span
            v-if="hasDescription"
            :id="descriptionId"
            class="caomei-time-picker__description"
        >
            <slot name="description" />
        </span>
    </div>
</template>

<style scoped>
.caomei-time-picker {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-1);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
}

.caomei-time-picker__label {
    color: var(--caomei-color-text);
    font-size: var(--caomei-font-size-sm);
    font-weight: 500;
}

/*
  宽度上限：与选择器家族（Select / MultiSelect / AutoComplete / DatePicker）同源，默认回退
  `--caomei-select-max-width`（20rem），避免字段在宽容器中被拉到过长；需要撑满所在列时在同一元素或
  其祖先上把 `--caomei-time-picker-max-width` 覆盖为 `none`。
*/
.caomei-time-picker__field {
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-space-1);
    box-sizing: border-box;
    width: 100%;
    max-width: var(--caomei-time-picker-max-width, var(--caomei-select-max-width));
    min-height: var(--caomei-time-picker-height, var(--caomei-control-height-md, 2.25rem));
    padding-inline: var(--caomei-time-picker-padding-inline, var(--caomei-space-2));
    border: 1px solid var(--caomei-time-picker-border, var(--caomei-color-border));
    border-radius: var(--caomei-time-picker-radius, var(--caomei-radius-md));
    background: var(--caomei-time-picker-bg, var(--caomei-color-bg));
    color: var(--caomei-time-picker-color, var(--caomei-color-text));
}

.caomei-time-picker__field:focus-within {
    border-color: var(--caomei-color-primary);
}

.caomei-time-picker--disabled .caomei-time-picker__field {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity, 0.6);
}

.caomei-time-picker__segment {
    box-sizing: border-box;
    width: 2.25rem;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    font-variant-numeric: tabular-nums;
    text-align: center;
    appearance: textfield;
}

.caomei-time-picker__segment:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-time-picker__separator {
    color: var(--caomei-color-text-muted);
}

.caomei-time-picker__day-period {
    min-height: var(--caomei-control-height-sm, 1.75rem);
    padding-inline: var(--caomei-space-1);
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
}

.caomei-time-picker__description {
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
