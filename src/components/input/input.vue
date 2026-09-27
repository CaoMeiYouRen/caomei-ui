<script setup lang="ts">
import { X } from '@lucide/vue'
import { computed, ref } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon } from '../../icons'
import { useAttrForwarding } from '../_shared/use-attr-forwarding'
import { useFocusControl } from '../_shared/use-focus-control'
import { labelAttrs } from '../_shared/use-label-attrs'
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

const locale = useLocale()
const clearLabel = computed(() => props.clearLabel ?? locale.value.input.clear)

const showClear = computed(
    () => props.clearable && Boolean(model.value) && !props.disabled && !props.readonly,
)

const rootClass = computed(() => [
    `caomei-field--${props.size}`,
    {
        'caomei-field--invalid': props.invalid,
        'caomei-field--disabled': props.disabled,
        'caomei-field--readonly': props.readonly,
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

const { focus, blur } = useFocusControl(inputRef)

defineExpose({ focus, blur, inputRef })
</script>

<template>
    <div
        v-bind="rootAttrs"
        class="caomei-field caomei-input"
        :class="rootClass"
        :data-filled="model ? 'true' : undefined"
    >
        <span v-if="$slots.prefix" class="caomei-input__prefix">
            <slot name="prefix" />
        </span>
        <input
            :id="id"
            ref="inputRef"
            v-model="model"
            v-bind="{...controlAttrs, ...labelAttrs(label)}"
            class="caomei-field__control caomei-input__control"
            :type="type"
            :disabled="disabled"
            :readonly="readonly"
            :placeholder="placeholder"
            :name="name"
            :autocomplete="autocomplete"
            :aria-invalid="invalid || undefined"
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
/*
  Input 组件特有样式：仅包含布局结构（inline-flex + gap）、前缀/后缀/清除按钮对齐、
  以及控件内部细节。外壳样式（边框/圆角/背景/色值/聚焦/非法/禁用/只读/尺寸档位）由
  共享层 `field-shell.css` 的 `.caomei-field` 基类提供。
*/
.caomei-input {
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-space-1);
    /* width: 100% 由 .caomei-field 基类提供 */
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
