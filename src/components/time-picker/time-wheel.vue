<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '../../composables/use-locale'
import WheelColumn from './wheel-column.vue'
import { buildTimeValue } from './utils'
import type { TimeWheelOption } from './types'

defineOptions({ name: 'CaomeiTimeWheel' })

const props = withDefaults(defineProps<{
    modelValue?: Date | null
    showSeconds?: boolean
    hourFormat?: '12' | '24'
    minValue?: Date
    maxValue?: Date
    disabled?: boolean
    readonly?: boolean
}>(), {
    modelValue: null,
    showSeconds: false,
    hourFormat: '24',
    minValue: undefined,
    maxValue: undefined,
    disabled: false,
    readonly: false,
})

const emit = defineEmits<{
    'update:modelValue': [value: Date]
}>()

const messages = useLocale()

const hourLabel = computed(() => messages.value.timePicker.hour)
const minuteLabel = computed(() => messages.value.timePicker.minute)
const secondLabel = computed(() => messages.value.timePicker.second)
const amLabel = computed(() => messages.value.timePicker.am)
const pmLabel = computed(() => messages.value.timePicker.pm)

const is12Hour = computed(() => props.hourFormat === '12')

/** 非法日期按空值处理（取 0 点），避免 NaN 进入 `setHours`。 */
function partOf(read: (date: Date) => number): number {
    const value = props.modelValue ? read(props.modelValue) : 0
    return Number.isFinite(value) ? value : 0
}

const hour24 = computed(() => partOf((date) => date.getHours()))
const minute = computed(() => partOf((date) => date.getMinutes()))
const second = computed(() => partOf((date) => date.getSeconds()))
const isPm = computed(() => hour24.value >= 12)

/** 12 小时制下的显示小时（1–12）。 */
const displayHour = computed(() => {
    if (!is12Hour.value) {
        return hour24.value
    }
    const value = hour24.value % 12
    return value === 0 ? 12 : value
})

function pad(value: number): string {
    return String(value).padStart(2, '0')
}

function range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

const hourOptions = computed<TimeWheelOption[]>(() => {
    if (is12Hour.value) {
        return range(1, 12).map((value) => ({ value, label: pad(value) }))
    }
    return range(0, 23).map((value) => ({ value, label: pad(value) }))
})

const minuteOptions = computed<TimeWheelOption[]>(() => range(0, 59).map((value) => ({ value, label: pad(value) })))
const secondOptions = computed<TimeWheelOption[]>(() => range(0, 59).map((value) => ({ value, label: pad(value) })))

const periodOptions = computed<TimeWheelOption[]>(() => [
    { value: 'am', label: amLabel.value },
    { value: 'pm', label: pmLabel.value },
])

const hourValue = computed(() => (is12Hour.value ? displayHour.value : hour24.value))
const periodValue = computed(() => (isPm.value ? 'pm' : 'am'))
const periodLabel = computed(() => `${hourLabel.value} ${amLabel.value}/${pmLabel.value}`)

/** 一次选择总是回写完整的时 / 分 / 秒，避免空值底座取「当前时刻」导致未操作的段跳变。 */
function emitTime(parts: { hour?: number, minute?: number, second?: number } = {}): void {
    emit('update:modelValue', buildTimeValue(props.modelValue, {
        hour: parts.hour ?? hour24.value,
        minute: parts.minute ?? minute.value,
        second: parts.second ?? second.value,
    }, {
        showSeconds: props.showSeconds,
        minValue: props.minValue,
        maxValue: props.maxValue,
    }))
}

function onHour(value: string | number): void {
    const display = Number(value)
    if (!is12Hour.value) {
        emitTime({ hour: display })
        return
    }
    const next = display === 12
        ? (isPm.value ? 12 : 0)
        : (isPm.value ? display + 12 : display)
    emitTime({ hour: next })
}

function onMinute(value: string | number): void {
    emitTime({ minute: Number(value) })
}

function onSecond(value: string | number): void {
    emitTime({ second: Number(value) })
}

function onPeriod(value: string | number): void {
    const pm = value === 'pm'
    if (pm === isPm.value) {
        return
    }
    emitTime({ hour: pm ? (hour24.value % 12) + 12 : hour24.value % 12 })
}
</script>

<template>
    <div
        class="caomei-time-wheel"
        :class="{
            'caomei-time-wheel--disabled': disabled,
            'caomei-time-wheel--readonly': readonly
        }"
    >
        <span class="caomei-time-wheel__band" aria-hidden="true" />
        <WheelColumn
            :label="hourLabel"
            :options="hourOptions"
            :model-value="hourValue"
            :disabled="disabled"
            :readonly="readonly"
            @update:model-value="onHour"
        />
        <span class="caomei-time-wheel__separator" aria-hidden="true">:</span>
        <WheelColumn
            :label="minuteLabel"
            :options="minuteOptions"
            :model-value="minute"
            :disabled="disabled"
            :readonly="readonly"
            @update:model-value="onMinute"
        />
        <template v-if="showSeconds">
            <span class="caomei-time-wheel__separator" aria-hidden="true">:</span>
            <WheelColumn
                :label="secondLabel"
                :options="secondOptions"
                :model-value="second"
                :disabled="disabled"
                :readonly="readonly"
                @update:model-value="onSecond"
            />
        </template>
        <WheelColumn
            v-if="is12Hour"
            class="caomei-time-wheel__period"
            :label="periodLabel"
            :options="periodOptions"
            :model-value="periodValue"
            :disabled="disabled"
            :readonly="readonly"
            @update:model-value="onPeriod"
        />
    </div>
</template>

<style scoped>
:where(.caomei-time-wheel) {
    --caomei-time-picker-wheel-item-height: 2.25rem;
}

.caomei-time-wheel {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--caomei-space-1);
    padding-inline: var(--caomei-space-1);
}

.caomei-time-wheel__band {
    position: absolute;
    inset-block-start: calc(50% - var(--caomei-time-picker-wheel-item-height) * 0.5);
    inset-inline: 0;
    height: var(--caomei-time-picker-wheel-item-height);
    border-radius: var(--caomei-radius-sm);
    background: color-mix(in srgb, var(--caomei-color-primary) 10%, transparent);
    pointer-events: none;
}

.caomei-time-wheel__separator {
    position: relative;
    z-index: var(--caomei-z-raise);
    color: var(--caomei-color-text-muted);
    font-variant-numeric: tabular-nums;
}

:where(.caomei-time-wheel__period) {
    --caomei-time-picker-wheel-column-width: 3.75rem;
}
</style>
