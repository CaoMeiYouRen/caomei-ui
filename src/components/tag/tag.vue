<script setup lang="ts">
import { X } from '@lucide/vue'
import { computed } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon } from '../../icons'
import type { TagProps } from './types'

defineOptions({ name: 'CaomeiTag' })

const props = withDefaults(defineProps<TagProps>(), {
    tone: 'neutral',
    variant: 'soft',
    size: 'md',
    rounded: false,
    closable: false,
    disabled: false,
    selectable: false,
})

const selected = defineModel<boolean>('selected', { default: false })

const emit = defineEmits<{
    close: []
}>()

defineSlots<{
    default?: () => unknown
    icon?: () => unknown
}>()

const locale = useLocale()
const closeLabel = computed(() => props.closeLabel ?? locale.value.tag.close)

const rootClass = computed(() => [
    `caomei-tag--${props.tone}`,
    `caomei-tag--${props.variant}`,
    `caomei-tag--${props.size}`,
    {
        'caomei-tag--rounded': props.rounded,
        'caomei-tag--disabled': props.disabled,
        'caomei-tag--selectable': props.selectable,
        'caomei-tag--selected': props.selectable && selected.value,
    },
])

function onClose(): void {
    if (props.disabled) {
        return
    }
    emit('close')
}

function onToggle(): void {
    if (props.disabled || !props.selectable) {
        return
    }
    selected.value = !selected.value
}
</script>

<template>
    <span
        class="caomei-tag"
        :class="rootClass"
        :role="selectable ? 'button' : undefined"
        :tabindex="selectable && !disabled ? 0 : undefined"
        :aria-pressed="selectable ? selected : undefined"
        @click="onToggle"
        @keydown.enter="onToggle"
        @keydown.space.prevent="onToggle"
    >
        <span v-if="$slots.icon" class="caomei-tag__icon">
            <slot name="icon" />
        </span>
        <span class="caomei-tag__content">
            <slot />
        </span>
        <button
            v-if="closable"
            type="button"
            class="caomei-tag__close"
            :disabled="disabled"
            :aria-label="closeLabel"
            @click.stop="onClose"
        >
            <CaomeiIcon :icon="X" />
        </button>
    </span>
</template>

<style scoped>
.caomei-tag {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-space-1);
    border: 1px solid transparent;
    border-radius: var(--caomei-radius-sm);
    font-family: var(--caomei-font-sans);
    line-height: 1;
    white-space: nowrap;
    vertical-align: middle;
}

:where(.caomei-tag--primary) {
    --caomei-tag-tone: var(--caomei-color-primary);
    --caomei-tag-solid: var(--caomei-color-primary-solid);
}

:where(.caomei-tag--success) {
    --caomei-tag-tone: var(--caomei-color-success);
    --caomei-tag-solid: var(--caomei-color-success-solid);
}

:where(.caomei-tag--warning) {
    --caomei-tag-tone: var(--caomei-color-warning);
    --caomei-tag-solid: var(--caomei-color-warning-solid);
}

:where(.caomei-tag--danger) {
    --caomei-tag-tone: var(--caomei-color-danger);
    --caomei-tag-solid: var(--caomei-color-danger-solid);
}

:where(.caomei-tag--neutral) {
    --caomei-tag-tone: var(--caomei-color-text-muted);
    --caomei-tag-solid: var(--caomei-color-neutral-solid);
}

.caomei-tag--soft {
    background: color-mix(in srgb, var(--caomei-tag-tone) 12%, transparent);
    color: var(--caomei-tag-tone);
}

.caomei-tag--solid {
    background: var(--caomei-tag-solid);
    color: var(--caomei-color-on-solid);
}

.caomei-tag--outline {
    border-color: var(--caomei-tag-tone);
    color: var(--caomei-tag-tone);
}

.caomei-tag--sm {
    height: var(--caomei-control-height-sm);
    padding: 0 var(--caomei-space-2);
    font-size: var(--caomei-font-size-sm);
}

.caomei-tag--md {
    height: var(--caomei-control-height-md);
    padding: 0 var(--caomei-space-3);
    font-size: var(--caomei-font-size-md);
}

.caomei-tag--lg {
    height: var(--caomei-control-height-lg);
    padding: 0 var(--caomei-space-4);
    font-size: var(--caomei-font-size-lg);
}

.caomei-tag--disabled {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-tag--rounded {
    border-radius: var(--caomei-radius-full);
}

.caomei-tag__icon,
.caomei-tag__content,
.caomei-tag__close {
    display: inline-flex;
    align-items: center;
}

.caomei-tag__close {
    flex-shrink: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
}

.caomei-tag__close:disabled {
    cursor: not-allowed;
}

.caomei-tag__close:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
    border-radius: var(--caomei-radius-sm);
}

/* 可选中态 */
.caomei-tag--selectable {
    cursor: pointer;
    user-select: none;
}

.caomei-tag--selectable:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

/* 选中态：边框 + 背景加深 */
.caomei-tag--selected {
    border-color: var(--caomei-tag-tone);
    background: color-mix(in srgb, var(--caomei-tag-tone) 24%, transparent);
}
</style>
