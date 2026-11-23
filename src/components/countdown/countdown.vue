<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { CountdownProps, CountdownTarget } from './types'

defineOptions({ name: 'CaomeiCountdown' })

const props = withDefaults(defineProps<CountdownProps>(), {
    target: null,
    format: 'HH:mm:ss',
    autoStart: true,
    interval: 1000,
    finishText: '',
    label: '',
})

const emit = defineEmits<{
    /** 进入「到点」状态时触发一次；同一目标不重复通知，更换 target 后再次到点会重新通知 */
    finish: []
}>()

/** 归一化目标时间：`Date` / 时间戳 / 可解析字符串；无效值返回 `null`。 */
function toTimestamp(target: CountdownTarget): number | null {
    if (target === null || target === undefined || target === '') {
        return null
    }
    if (target instanceof Date) {
        const time = target.getTime()
        return Number.isFinite(time) ? time : null
    }
    if (typeof target === 'number') {
        return Number.isFinite(target) ? target : null
    }
    const time = new Date(target).getTime()
    return Number.isFinite(time) ? time : null
}

const targetTime = computed(() => toTimestamp(props.target))
const now = ref(Date.now())

let timer: ReturnType<typeof setInterval> | null = null
/** 已为其发出过 `finish` 的目标时间戳；用于同一目标不重复通知，并在到点后冻结。 */
let notifiedTarget: number | null = null
/** 最近一次评估的目标时间戳；目标变化时重置通知门闩（切回已到点的目标视为新的到点）。 */
let evaluatedTarget: number | null = null

const remaining = computed(() => {
    if (targetTime.value === null) {
        return 0
    }
    return Math.max(0, targetTime.value - now.value)
})

const finished = computed(() => targetTime.value !== null && remaining.value === 0)

const parts = computed(() => {
    const totalSeconds = Math.floor(remaining.value / 1000)
    return {
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor(totalSeconds / 3600),
        hoursInDay: Math.floor(totalSeconds / 3600) % 24,
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        milliseconds: remaining.value % 1000,
    }
})

function pad(value: number, length = 2): string {
    return String(value).padStart(length, '0')
}

/**
 * 格式化：
 * - 模板含 `DD` 时 `HH` 取「当日小时」（0–23），否则 `HH` 取累计小时（可 ≥24）；
 * - `SSS` 取毫秒余数。
 */
const text = computed(() => {
    if (props.finishText && finished.value) {
        return props.finishText
    }
    const { days, hours, hoursInDay, minutes, seconds, milliseconds } = parts.value
    const tokens: Record<string, string> = {
        DD: pad(days),
        HH: pad(props.format.includes('DD') ? hoursInDay : hours),
        mm: pad(minutes),
        ss: pad(seconds),
        SSS: pad(milliseconds, 3),
    }
    return props.format.replace(/DD|HH|mm|ss|SSS/g, (token) => tokens[token] ?? token)
})

function stopTimer(): void {
    if (timer !== null) {
        clearInterval(timer)
        timer = null
    }
}

function tick(): void {
    now.value = Date.now()
    if (!finished.value) {
        return
    }
    const target = targetTime.value
    if (target !== null && notifiedTarget !== target) {
        notifiedTarget = target
        emit('finish')
    }
    stopTimer()
}

function startTimer(): void {
    stopTimer()

    const target = targetTime.value
    if (target !== evaluatedTarget) {
        evaluatedTarget = target
        notifiedTarget = null
    }
    if (!props.autoStart || target === null) {
        return
    }
    // 该目标已到点：保持冻结（不刷新 now，也不重复通知），更换目标后才重新评估
    if (notifiedTarget === target) {
        return
    }

    now.value = Date.now()
    if (finished.value) {
        notifiedTarget = target
        emit('finish')
        return
    }
    const interval = Number.isFinite(props.interval) && props.interval > 0 ? props.interval : 1000
    timer = setInterval(tick, interval)
}

onMounted(startTimer)

/** 三个影响计时的入参任一变化都重排一次定时器。 */
function watchSource(): [CountdownTarget, boolean, number] {
    return [props.target, props.autoStart, props.interval]
}

watch(watchSource, (): void => {
    startTimer()
})
onBeforeUnmount(stopTimer)
</script>

<template>
    <span
        class="caomei-countdown"
        role="timer"
        :aria-label="label || undefined"
        :data-finished="finished ? '' : undefined"
    >
        {{ text }}
    </span>
</template>

<style scoped>
.caomei-countdown {
    display: inline-block;
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-countdown-font-size, inherit);
    font-variant-numeric: tabular-nums;
    color: var(--caomei-countdown-color, inherit);
    white-space: nowrap;
}

.caomei-countdown[data-finished] {
    color: var(--caomei-countdown-finished-color, var(--caomei-color-text-muted));
}
</style>
