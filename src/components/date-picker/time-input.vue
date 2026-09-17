<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '../../composables/use-locale'
import type { TimeParts } from './types'

// 自建时间输入：Reka TimeField 的 dayPeriod 判定仅识别英文（非英文 12 小时制会把
// 「下午」判为 AM，且方向键基于错误值加减 12），无法满足多语种 12 小时制。
defineOptions({ name: 'CaomeiTimeInput' })

const props = withDefaults(defineProps<{
    modelValue: TimeParts
    showSeconds?: boolean
    hourFormat?: '12' | '24'
    locale?: string
    disabled?: boolean
    readonly?: boolean
}>(), {
    showSeconds: false,
    hourFormat: '24',
    disabled: false,
    readonly: false,
})

const emit = defineEmits<{
    'update:modelValue': [value: TimeParts]
}>()

const messages = useLocale()

const timeLabel = computed(() => messages.value.datePicker.time)
const is12Hour = computed(() => props.hourFormat === '12')
const hourLabel = computed(() => messages.value.datePicker.hour)
const minuteLabel = computed(() => messages.value.datePicker.minute)
const secondLabel = computed(() => messages.value.datePicker.second)

/** 12 小时制下的显示小时（1–12） */
const displayHour = computed(() => {
    if (!is12Hour.value) {
        return props.modelValue.hour
    }

    const hour = props.modelValue.hour % 12
    return hour === 0 ? 12 : hour
})

const isPm = computed(() => props.modelValue.hour >= 12)

/** 日序文案由 Intl 提供，自动适配语言（上午/下午、AM/PM 等） */
function dayPeriodLabel(pm: boolean): string {
    const reference = new Date(2026, 0, 1, pm ? 21 : 9)
    const parts = new Intl.DateTimeFormat(props.locale, {
        hour: 'numeric',
        hour12: true,
    }).formatToParts(reference)

    return parts.find((part) => part.type === 'dayPeriod')?.value ?? (pm ? 'PM' : 'AM')
}

const amLabel = computed(() => dayPeriodLabel(false))
const pmLabel = computed(() => dayPeriodLabel(true))

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, Math.round(value)))
}

function setTargetValue(event: Event, value: string | number): void {
    (event.target as HTMLInputElement | HTMLSelectElement).value = String(value)
}

/**
 * 原生属性已拦截交互，这里再守卫一次；被拒绝或非法输入时把 DOM 值回滚到模型值，
 * 避免脚本改值绕过 readonly / disabled 后 DOM 与模型不一致。
 */
function rejectInput(event: Event, current: string | number): boolean {
    if (props.disabled || props.readonly) {
        setTargetValue(event, current)
        return true
    }

    return false
}

function parseInput(event: Event): number | undefined {
    const raw = (event.target as HTMLInputElement).value.trim()
    if (raw === '') {
        return undefined
    }

    const value = Number(raw)
    return Number.isFinite(value) ? value : undefined
}

function emitParts(next: Partial<TimeParts>): void {
    emit('update:modelValue', { ...props.modelValue, ...next })
}

function onHourChange(event: Event): void {
    if (rejectInput(event, displayHour.value)) {
        return
    }

    const raw = parseInput(event)
    if (raw === undefined) {
        setTargetValue(event, displayHour.value)
        return
    }

    if (!is12Hour.value) {
        emitParts({ hour: clamp(raw, 0, 23) })
        return
    }

    const display = clamp(raw, 1, 12)
    const hour = display === 12
        ? (isPm.value ? 12 : 0)
        : (isPm.value ? display + 12 : display)
    emitParts({ hour })
}

function onMinuteChange(event: Event): void {
    if (rejectInput(event, props.modelValue.minute)) {
        return
    }

    const raw = parseInput(event)
    if (raw === undefined) {
        setTargetValue(event, props.modelValue.minute)
        return
    }

    emitParts({ minute: clamp(raw, 0, 59) })
}

function onSecondChange(event: Event): void {
    if (rejectInput(event, props.modelValue.second)) {
        return
    }

    const raw = parseInput(event)
    if (raw === undefined) {
        setTargetValue(event, props.modelValue.second)
        return
    }

    emitParts({ second: clamp(raw, 0, 59) })
}

function onDayPeriodChange(event: Event): void {
    if (rejectInput(event, isPm.value ? 'pm' : 'am')) {
        return
    }

    const pm = (event.target as HTMLSelectElement).value === 'pm'
    const hour = props.modelValue.hour

    if (pm && hour < 12) {
        emitParts({ hour: hour + 12 })
    } else if (!pm && hour >= 12) {
        emitParts({ hour: hour - 12 })
    }
}
</script>

<template>
    <div
        class="caomei-time-input"
        role="group"
        :aria-label="timeLabel"
    >
        <input
            class="caomei-time-input__field"
            type="number"
            inputmode="numeric"
            :min="is12Hour ? 1 : 0"
            :max="is12Hour ? 12 : 23"
            :value="displayHour"
            :disabled="disabled"
            :readonly="readonly"
            :aria-label="hourLabel"
            @change="onHourChange"
        >
        <span class="caomei-time-input__separator">:</span>
        <input
            class="caomei-time-input__field"
            type="number"
            inputmode="numeric"
            min="0"
            max="59"
            :value="modelValue.minute"
            :disabled="disabled"
            :readonly="readonly"
            :aria-label="minuteLabel"
            @change="onMinuteChange"
        >
        <template v-if="showSeconds">
            <span class="caomei-time-input__separator">:</span>
            <input
                class="caomei-time-input__field"
                type="number"
                inputmode="numeric"
                min="0"
                max="59"
                :value="modelValue.second"
                :disabled="disabled"
                :readonly="readonly"
                :aria-label="secondLabel"
                @change="onSecondChange"
            >
        </template>
        <select
            v-if="is12Hour"
            class="caomei-time-input__period"
            :value="isPm ? 'pm' : 'am'"
            :disabled="disabled"
            :aria-readonly="readonly || undefined"
            :aria-label="`${amLabel} / ${pmLabel}`"
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
</template>

<style scoped>
.caomei-time-input {
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-space-1);
}

.caomei-time-input__field,
.caomei-time-input__period {
    box-sizing: border-box;
    height: var(--caomei-control-height-sm);
    padding: 0 var(--caomei-space-1);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-sm);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-sm);
    font-variant-numeric: tabular-nums;
}

.caomei-time-input__field {
    width: 3.25rem;
    text-align: center;
}

.caomei-time-input__period {
    padding: 0 var(--caomei-space-2);
    cursor: pointer;
}

.caomei-time-input__field:focus-visible,
.caomei-time-input__period:focus-visible {
    border-color: var(--caomei-color-primary);
    outline: 2px solid color-mix(in srgb, var(--caomei-color-primary) 20%, transparent);
    outline-offset: 1px;
}

.caomei-time-input__field:disabled,
.caomei-time-input__period:disabled {
    cursor: not-allowed;
    background: var(--caomei-color-bg-elevated);
    opacity: var(--caomei-disabled-opacity);
}

.caomei-time-input__field[readonly],
.caomei-time-input__period[aria-readonly='true'] {
    background: var(--caomei-color-bg-elevated);
}

.caomei-time-input__separator {
    color: var(--caomei-color-text-muted);
}
</style>
