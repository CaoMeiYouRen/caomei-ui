<script setup lang="ts">
import { computed, ref, type StyleValue } from 'vue'
import { useAttrForwarding } from '../_shared/use-attr-forwarding'
import type { TextareaProps } from './types'

defineOptions({ name: 'CaomeiTextarea', inheritAttrs: false })

const props = withDefaults(defineProps<TextareaProps>(), {
    size: 'md',
    disabled: false,
    readonly: false,
    invalid: false,
    placeholder: '',
    resize: 'vertical',
})

const emit = defineEmits<{
    focus: [event: FocusEvent]
    blur: [event: FocusEvent]
    change: [event: Event]
}>()

const model = defineModel<string>({ default: '' })

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const { rootAttrs, controlAttrs } = useAttrForwarding()

const rootClass = computed(() => [
    `caomei-textarea--${props.size}`,
    {
        'caomei-textarea--invalid': props.invalid,
        'caomei-textarea--disabled': props.disabled,
        'caomei-textarea--readonly': props.readonly,
    },
])

const controlStyle = computed<StyleValue>(() => ({
    resize: props.resize,
}))

function focus(): void {
    textareaRef.value?.focus()
}

function blur(): void {
    textareaRef.value?.blur()
}

defineExpose({ focus, blur, textareaRef })
</script>

<template>
    <div
        v-bind="rootAttrs"
        class="caomei-textarea"
        :class="rootClass"
    >
        <textarea
            :id="id"
            ref="textareaRef"
            v-model="model"
            v-bind="controlAttrs"
            class="caomei-textarea__control"
            :style="controlStyle"
            :disabled="disabled"
            :readonly="readonly"
            :placeholder="placeholder"
            :name="name"
            :autocomplete="autocomplete"
            :rows="rows"
            :aria-invalid="invalid || undefined"
            :aria-label="label"
            @focus="emit('focus', $event)"
            @blur="emit('blur', $event)"
            @change="emit('change', $event)"
        />
    </div>
</template>

<style scoped>
.caomei-textarea {
    box-sizing: border-box;
    display: block;
    width: 100%;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.caomei-textarea:focus-within {
    border-color: var(--caomei-color-primary);
    box-shadow: 0 0 0 2px var(--caomei-color-border);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-primary) 20%, transparent);
}

.caomei-textarea--invalid {
    border-color: var(--caomei-color-danger);
}

.caomei-textarea--invalid:focus-within {
    border-color: var(--caomei-color-danger);
    box-shadow: 0 0 0 2px var(--caomei-color-border);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-danger) 20%, transparent);
}

.caomei-textarea--disabled {
    cursor: not-allowed;
    background: var(--caomei-color-bg-elevated);
    opacity: 0.6;
}

.caomei-textarea--readonly {
    background: var(--caomei-color-bg-elevated);
}

.caomei-textarea__control {
    box-sizing: border-box;
    display: block;
    width: 100%;
    margin: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: inherit;
    font: inherit;
}

.caomei-textarea__control:disabled {
    cursor: not-allowed;
}

.caomei-textarea__control::placeholder {
    color: var(--caomei-color-text-muted);
}

.caomei-textarea--sm .caomei-textarea__control {
    padding: var(--caomei-space-1) var(--caomei-space-2);
    font-size: var(--caomei-font-size-sm);
}

.caomei-textarea--md .caomei-textarea__control {
    padding: var(--caomei-space-2) var(--caomei-space-3);
    font-size: var(--caomei-font-size-md);
}

.caomei-textarea--lg .caomei-textarea__control {
    padding: var(--caomei-space-3) var(--caomei-space-4);
    font-size: var(--caomei-font-size-lg);
}
</style>
