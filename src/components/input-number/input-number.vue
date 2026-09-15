<script setup lang="ts">
import { Minus, Plus } from '@lucide/vue'
import {
    NumberFieldDecrement,
    NumberFieldIncrement,
    NumberFieldInput,
    NumberFieldRoot,
} from 'reka-ui'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon } from '../../icons'
import { useAttrForwarding } from '../_shared/use-attr-forwarding'
import type { InputNumberProps } from './types'

defineOptions({ name: 'CaomeiInputNumber', inheritAttrs: false })

const props = withDefaults(defineProps<InputNumberProps>(), {
    size: 'md',
    step: 1,
    disabled: false,
    readonly: false,
    invalid: false,
    placeholder: '',
    controls: true,
    useGrouping: true,
})

const emit = defineEmits<{
    focus: [event: FocusEvent]
    blur: [event: FocusEvent]
    change: [value: number | null]
}>()

const model = defineModel<number | null>({ default: null })

const { rootAttrs, controlAttrs } = useAttrForwarding()

const inputRef = ref<HTMLInputElement | null>(null)

const locale = useLocale()
const increaseLabel = computed(() => props.increaseLabel ?? locale.value.inputNumber.increase)
const decreaseLabel = computed(() => props.decreaseLabel ?? locale.value.inputNumber.decrease)

/** 归一化小数位参数：仅接受 0–20 的整数，非法值按未提供处理 */
function resolveFractionDigits(value: number | undefined): number | undefined {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 20) {
        return undefined
    }
    return value
}

/** 归一化 precision：仅接受 0–100 的整数，非法值按未提供处理 */
function resolvePrecision(value: number | undefined): number | undefined {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 100) {
        return undefined
    }
    return value
}

/**
 * 展示格式：未显式设置 `maxFractionDigits` 时上限放宽到 20（避免 Reka 按更小上限格式化、
 * 失焦回读时把模型截断），分组默认开启。
 *
 * 展示上限取 `max(maxFractionDigits ?? 20, precision ?? 0)`：公开契约声明 `precision` 优先，
 * 若展示上限低于 `precision`，Reka 会先按上限格式化再由失焦回读覆盖模型，使 `precision` 失效。
 *
 * `minimumFractionDigits` 大于 `maximumFractionDigits` 会让 Intl 抛 RangeError，故冲突时丢弃最小值。
 */
const formatOptions = computed<Intl.NumberFormatOptions>(() => {
    const minimum = resolveFractionDigits(props.minFractionDigits)
    const maximum = resolveFractionDigits(props.maxFractionDigits)
    const precision = resolvePrecision(props.precision)
    const conflict = minimum !== undefined && maximum !== undefined && minimum > maximum

    return {
        minimumFractionDigits: conflict ? undefined : minimum,
        maximumFractionDigits: Math.max(maximum ?? 20, precision ?? 0),
        useGrouping: props.useGrouping,
    }
})

const inputAttrs = computed<Record<string, unknown>>(() => {
    const merged = { ...controlAttrs.value }
    if (props.autocomplete) {
        merged.autocomplete = props.autocomplete
    }
    return merged
})

const rootClass = computed(() => [
    `caomei-input-number--${props.size}`,
    {
        'caomei-input-number--invalid': props.invalid,
        'caomei-input-number--disabled': props.disabled,
        'caomei-input-number--readonly': props.readonly,
    },
])

const resolvedStep = computed(() =>
    typeof props.step === 'number' && props.step > 0 ? props.step : 1,
)

/** 先按精度取整（`precision` 优先于 `maxFractionDigits`），再钳制到 min/max */
function normalize(value: number): number {
    let next = value
    const roundingDigits = resolvePrecision(props.precision) ?? resolveFractionDigits(props.maxFractionDigits)

    if (roundingDigits !== undefined) {
        const factor = 10 ** roundingDigits
        next = Math.round(next * factor) / factor
    }
    if (props.min !== undefined) {
        next = Math.max(props.min, next)
    }
    if (props.max !== undefined) {
        next = Math.min(props.max, next)
    }
    return next
}

function onModelUpdate(value: number | null | undefined): void {
    if (value === undefined || value === null || Number.isNaN(value)) {
        model.value = null
        return
    }
    model.value = normalize(value)
}

let stepActive = false

function markStepStart(): void {
    if (props.disabled || props.readonly) {
        return
    }
    stepActive = true
}

function flushStepChange(): void {
    if (!stepActive) {
        return
    }
    stepActive = false
    emit('change', model.value)
}

function onWindowPointerEnd(): void {
    flushStepChange()
}

onMounted(() => {
    window.addEventListener('pointerup', onWindowPointerEnd)
    window.addEventListener('pointercancel', onWindowPointerEnd)
})

onBeforeUnmount(() => {
    window.removeEventListener('pointerup', onWindowPointerEnd)
    window.removeEventListener('pointercancel', onWindowPointerEnd)
})

function onFocus(event: FocusEvent): void {
    emit('focus', event)
}

function onBlur(event: FocusEvent): void {
    emit('blur', event)
    emit('change', model.value)
}

function onEnter(): void {
    emit('change', model.value)
}

function setInputRef(el: unknown): void {
    const element = (el as { $el?: unknown } | null)?.$el ?? el
    inputRef.value = (element as HTMLInputElement | null) ?? null
}

function focus(): void {
    inputRef.value?.focus()
}

function blur(): void {
    inputRef.value?.blur()
}

defineExpose({ focus, blur, inputRef })
</script>

<template>
    <NumberFieldRoot
        v-bind="rootAttrs"
        :id="id"
        :model-value="model"
        :min="min"
        :max="max"
        :step="resolvedStep"
        :step-snapping="false"
        :format-options="formatOptions"
        :disabled="disabled"
        :readonly="readonly"
        :name="name"
        class="caomei-input-number"
        :class="rootClass"
        :data-filled="model !== null && model !== undefined ? 'true' : undefined"
        @update:model-value="onModelUpdate"
    >
        <NumberFieldDecrement
            v-if="controls"
            class="caomei-input-number__button"
            :aria-label="decreaseLabel"
            @pointerdown="markStepStart"
            @pointerup="flushStepChange"
            @pointercancel="flushStepChange"
        >
            <CaomeiIcon :icon="Minus" />
        </NumberFieldDecrement>
        <NumberFieldInput
            :ref="setInputRef"
            v-bind="inputAttrs"
            class="caomei-input-number__control"
            :placeholder="placeholder"
            :aria-invalid="invalid || undefined"
            :aria-label="label"
            @focus="onFocus"
            @blur="onBlur"
            @keydown.enter="onEnter"
        />
        <NumberFieldIncrement
            v-if="controls"
            class="caomei-input-number__button"
            :aria-label="increaseLabel"
            @pointerdown="markStepStart"
            @pointerup="flushStepChange"
            @pointercancel="flushStepChange"
        >
            <CaomeiIcon :icon="Plus" />
        </NumberFieldIncrement>
    </NumberFieldRoot>
</template>

<style scoped>
.caomei-input-number {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    width: 100%;
    max-width: var(--caomei-input-number-max-width);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.caomei-input-number:focus-within {
    border-color: var(--caomei-color-primary);
    box-shadow: 0 0 0 2px var(--caomei-color-border);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-primary) 20%, transparent);
}

.caomei-input-number--invalid {
    border-color: var(--caomei-color-danger);
}

.caomei-input-number--invalid:focus-within {
    border-color: var(--caomei-color-danger);
    box-shadow: 0 0 0 2px var(--caomei-color-border);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-danger) 20%, transparent);
}

.caomei-input-number--disabled {
    cursor: not-allowed;
    background: var(--caomei-color-bg-elevated);
    opacity: 0.6;
}

.caomei-input-number--readonly {
    background: var(--caomei-color-bg-elevated);
}

.caomei-input-number--sm {
    height: var(--caomei-control-height-sm);
    font-size: var(--caomei-font-size-sm);
}

.caomei-input-number--md {
    height: var(--caomei-control-height-md);
    font-size: var(--caomei-font-size-md);
}

.caomei-input-number--lg {
    height: var(--caomei-control-height-lg);
    font-size: var(--caomei-font-size-lg);
}

.caomei-input-number--sm .caomei-input-number__button {
    width: var(--caomei-control-height-sm);
}

.caomei-input-number--md .caomei-input-number__button {
    width: var(--caomei-control-height-md);
}

.caomei-input-number--lg .caomei-input-number__button {
    width: var(--caomei-control-height-lg);
}

.caomei-input-number__control {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0 var(--caomei-space-1);
    border: 0;
    outline: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: center;
}

.caomei-input-number__control:disabled {
    cursor: not-allowed;
}

.caomei-input-number__control::placeholder {
    color: var(--caomei-color-text-muted);
}

.caomei-input-number__button {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--caomei-color-text-muted);
    cursor: pointer;
}

.caomei-input-number__button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.caomei-input-number__button:hover:not(:disabled) {
    color: var(--caomei-color-text);
}
</style>
