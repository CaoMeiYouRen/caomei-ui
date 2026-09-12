<script setup lang="ts">
import { Minus, Plus } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { CaomeiIcon } from '../../icons'
import { defaultLocaleMessages } from '../../locale'
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
    increaseLabel: defaultLocaleMessages.inputNumber.increase,
    decreaseLabel: defaultLocaleMessages.inputNumber.decrease,
})

const emit = defineEmits<{
    focus: [event: FocusEvent]
    blur: [event: FocusEvent]
    change: [value: number | null]
}>()

const model = defineModel<number | null>({ default: null })

const { rootAttrs, controlAttrs } = useAttrForwarding()

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)

function formatValue(value: number | null): string {
    if (value === null || Number.isNaN(value)) {
        return ''
    }
    return String(value)
}

const text = ref(formatValue(model.value))

watch(model, (value) => {
    if (!isFocused.value) {
        text.value = formatValue(value)
    }
})

const rootClass = computed(() => [
    `caomei-input-number--${props.size}`,
    {
        'caomei-input-number--invalid': props.invalid,
        'caomei-input-number--disabled': props.disabled,
        'caomei-input-number--readonly': props.readonly,
    },
])

const resolvedStep = computed(() => (props.step > 0 ? props.step : 1))

const canDecrease = computed(
    () =>
        !props.disabled
        && !props.readonly
        && !(props.min !== undefined && model.value !== null && model.value <= props.min),
)

const canIncrease = computed(
    () =>
        !props.disabled
        && !props.readonly
        && !(props.max !== undefined && model.value !== null && model.value >= props.max),
)

function clamp(value: number): number {
    let next = value
    if (props.min !== undefined) {
        next = Math.max(props.min, next)
    }
    if (props.max !== undefined) {
        next = Math.min(props.max, next)
    }
    return next
}

function round(value: number): number {
    const { precision } = props
    if (precision === undefined || !Number.isInteger(precision) || precision < 0) {
        return value
    }
    const factor = 10 ** precision
    return Math.round(value * factor) / factor
}

function normalize(value: number): number {
    return clamp(round(value))
}

function onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value
    text.value = raw
    if (raw === '') {
        model.value = null
        return
    }
    const parsed = Number(raw)
    if (!Number.isNaN(parsed)) {
        model.value = parsed
    }
}

function onFocus(event: FocusEvent): void {
    isFocused.value = true
    emit('focus', event)
}

function onBlur(event: FocusEvent): void {
    isFocused.value = false
    const value = model.value === null ? null : normalize(model.value)
    model.value = value
    text.value = formatValue(value)
    emit('blur', event)
    emit('change', value)
}

function stepBy(direction: 1 | -1): void {
    if (props.disabled || props.readonly) {
        return
    }
    const base = model.value ?? 0
    const value = normalize(base + direction * resolvedStep.value)
    model.value = value
    text.value = formatValue(value)
    emit('change', value)
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
    <div
        v-bind="rootAttrs"
        class="caomei-input-number"
        :class="rootClass"
    >
        <button
            v-if="controls"
            type="button"
            class="caomei-input-number__button"
            :disabled="!canDecrease"
            :aria-label="decreaseLabel"
            @mousedown.prevent
            @click="stepBy(-1)"
        >
            <CaomeiIcon :icon="Minus" />
        </button>
        <input
            :id="id"
            ref="inputRef"
            v-bind="controlAttrs"
            class="caomei-input-number__control"
            :value="text"
            type="number"
            inputmode="decimal"
            :min="min"
            :max="max"
            :step="resolvedStep"
            :disabled="disabled"
            :readonly="readonly"
            :placeholder="placeholder"
            :name="name"
            :autocomplete="autocomplete"
            :aria-invalid="invalid || undefined"
            :aria-label="label"
            @input="onInput"
            @focus="onFocus"
            @blur="onBlur"
        >
        <button
            v-if="controls"
            type="button"
            class="caomei-input-number__button"
            :disabled="!canIncrease"
            :aria-label="increaseLabel"
            @mousedown.prevent
            @click="stepBy(1)"
        >
            <CaomeiIcon :icon="Plus" />
        </button>
    </div>
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
    appearance: textfield;
}

.caomei-input-number__control::-webkit-outer-spin-button,
.caomei-input-number__control::-webkit-inner-spin-button {
    margin: 0;
    appearance: none;
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
