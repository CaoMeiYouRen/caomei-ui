<script setup lang="ts">
import { X } from '@lucide/vue'
import { computed, ref } from 'vue'
import { CaomeiIcon } from '../../icons'
import { defaultLocaleMessages } from '../../locale'
import { useAttrForwarding } from '../_shared/use-attr-forwarding'
import type { InputProps } from './types'

defineOptions({ name: 'CaomeiInput', inheritAttrs: false })

const props = withDefaults(defineProps<InputProps>(), {
    size: 'md',
    type: 'text',
    disabled: false,
    readonly: false,
    invalid: false,
    placeholder: '',
    clearable: false,
    clearLabel: defaultLocaleMessages.input.clear,
})

const emit = defineEmits<{
    focus: [event: FocusEvent]
    blur: [event: FocusEvent]
    change: [event: Event]
    clear: []
    enter: [event: KeyboardEvent]
}>()

defineSlots<{
    prefix?: () => unknown
    suffix?: () => unknown
}>()

const model = defineModel<string>({ default: '' })

const inputRef = ref<HTMLInputElement | null>(null)

const { rootAttrs, controlAttrs } = useAttrForwarding()

const showClear = computed(
    () => props.clearable && Boolean(model.value) && !props.disabled && !props.readonly,
)

const rootClass = computed(() => [
    `caomei-input--${props.size}`,
    {
        'caomei-input--invalid': props.invalid,
        'caomei-input--disabled': props.disabled,
        'caomei-input--readonly': props.readonly,
    },
])

function onClear(): void {
    model.value = ''
    emit('clear')
    inputRef.value?.focus()
}

function onEnter(event: KeyboardEvent): void {
    emit('enter', event)
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
        class="caomei-input"
        :class="rootClass"
    >
        <span v-if="$slots.prefix" class="caomei-input__prefix">
            <slot name="prefix" />
        </span>
        <input
            :id="id"
            ref="inputRef"
            v-model="model"
            v-bind="controlAttrs"
            class="caomei-input__control"
            :type="type"
            :disabled="disabled"
            :readonly="readonly"
            :placeholder="placeholder"
            :name="name"
            :autocomplete="autocomplete"
            :aria-invalid="invalid || undefined"
            :aria-label="label"
            @focus="emit('focus', $event)"
            @blur="emit('blur', $event)"
            @change="emit('change', $event)"
            @keydown.enter="onEnter"
        >
        <button
            v-if="showClear"
            type="button"
            class="caomei-input__clear"
            :aria-label="clearLabel"
            @click="onClear"
        >
            <CaomeiIcon :icon="X" />
        </button>
        <span v-if="$slots.suffix" class="caomei-input__suffix">
            <slot name="suffix" />
        </span>
    </div>
</template>

<style scoped>
.caomei-input {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-space-1);
    width: 100%;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.caomei-input:focus-within {
    border-color: var(--caomei-color-primary);
    box-shadow: 0 0 0 2px var(--caomei-color-border);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-primary) 20%, transparent);
}

.caomei-input--invalid {
    border-color: var(--caomei-color-danger);
}

.caomei-input--invalid:focus-within {
    border-color: var(--caomei-color-danger);
    box-shadow: 0 0 0 2px var(--caomei-color-border);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-danger) 20%, transparent);
}

.caomei-input--disabled {
    cursor: not-allowed;
    background: var(--caomei-color-bg-elevated);
    opacity: 0.6;
}

.caomei-input--readonly {
    background: var(--caomei-color-bg-elevated);
}

.caomei-input--sm {
    height: var(--caomei-control-height-sm);
    padding: 0 var(--caomei-space-2);
    font-size: var(--caomei-font-size-sm);
}

.caomei-input--md {
    height: var(--caomei-control-height-md);
    padding: 0 var(--caomei-space-3);
    font-size: var(--caomei-font-size-md);
}

.caomei-input--lg {
    height: var(--caomei-control-height-lg);
    padding: 0 var(--caomei-space-4);
    font-size: var(--caomei-font-size-lg);
}

.caomei-input__control {
    flex: 1;
    min-width: 0;
    padding: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: inherit;
    font: inherit;
}

.caomei-input__control:disabled {
    cursor: not-allowed;
}

.caomei-input__control::placeholder {
    color: var(--caomei-color-text-muted);
}

.caomei-input__prefix,
.caomei-input__suffix,
.caomei-input__clear {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    color: var(--caomei-color-text-muted);
}

.caomei-input__clear {
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
}

.caomei-input__clear:hover {
    color: var(--caomei-color-text);
}
</style>
