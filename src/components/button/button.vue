<script setup lang="ts">
import { computed } from 'vue'
import type { ButtonProps } from './types'

defineOptions({ name: 'CaomeiButton' })

const props = withDefaults(defineProps<ButtonProps>(), {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    block: false,
    type: 'button',
})

const emit = defineEmits<{
    click: [event: MouseEvent]
}>()

defineSlots<{
    default?: () => unknown
    icon?: () => unknown
}>()

const isInactive = computed(() => props.disabled || props.loading)

const rootClass = computed(() => [
    `caomei-button--${props.variant}`,
    `caomei-button--${props.size}`,
    {
        'caomei-button--block': props.block,
        'caomei-button--loading': props.loading,
    },
])

function onClick(event: MouseEvent): void {
    emit('click', event)
}
</script>

<template>
    <button
        class="caomei-button"
        :class="rootClass"
        :type="type"
        :disabled="isInactive"
        :aria-busy="loading || undefined"
        :aria-label="label"
        @click="onClick"
    >
        <span
            v-if="loading"
            class="caomei-button__spinner"
            aria-hidden="true"
        />
        <span v-else-if="$slots.icon" class="caomei-button__icon">
            <slot name="icon" />
        </span>
        <span class="caomei-button__content">
            <slot />
        </span>
    </button>
</template>

<style scoped>
.caomei-button {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--caomei-space-1);
    border: 1px solid transparent;
    border-radius: var(--caomei-radius-md);
    font-family: var(--caomei-font-sans);
    line-height: 1;
    cursor: pointer;
    user-select: none;
    transition: opacity 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
}

.caomei-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.caomei-button:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}

.caomei-button--block {
    width: 100%;
}

.caomei-button--primary {
    background: var(--caomei-color-primary);
    color: var(--caomei-color-primary-foreground);
}

.caomei-button--secondary {
    background: var(--caomei-color-bg);
    border-color: var(--caomei-color-border);
    color: var(--caomei-color-text);
}

.caomei-button--ghost {
    background: transparent;
    color: var(--caomei-color-text);
}

.caomei-button--sm {
    height: var(--caomei-control-height-sm);
    padding: 0 var(--caomei-space-2);
    font-size: var(--caomei-font-size-sm);
}

.caomei-button--md {
    height: var(--caomei-control-height-md);
    padding: 0 var(--caomei-space-3);
    font-size: var(--caomei-font-size-md);
}

.caomei-button--lg {
    height: var(--caomei-control-height-lg);
    padding: 0 var(--caomei-space-4);
    font-size: var(--caomei-font-size-lg);
}

.caomei-button__icon,
.caomei-button__spinner,
.caomei-button__content {
    display: inline-flex;
    align-items: center;
}

.caomei-button__icon,
.caomei-button__spinner {
    flex-shrink: 0;
}

.caomei-button__spinner {
    width: 1em;
    height: 1em;
    border: 2px solid currentcolor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: caomei-button-spin 0.6s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
    .caomei-button {
        transition: none;
    }

    .caomei-button__spinner {
        animation: none;
    }
}

@keyframes caomei-button-spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
