<script setup lang="ts">
import type { ButtonProps } from './types'

withDefaults(defineProps<ButtonProps>(), {
    variant: 'primary',
    size: 'md',
    disabled: false,
    type: 'button',
})

defineEmits<{
    click: [event: MouseEvent]
}>()

defineSlots<{
    default?: () => unknown
}>()
</script>

<template>
    <button
        class="caomei-button"
        :class="[`caomei-button--${variant}`, `caomei-button--${size}`]"
        :type="type"
        :disabled="disabled"
        @click="$emit('click', $event)"
    >
        <slot />
    </button>
</template>

<style scoped>
.caomei-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--caomei-space-1);
    border: 1px solid transparent;
    border-radius: var(--caomei-radius-md);
    font-family: var(--caomei-font-sans);
    line-height: 1;
    cursor: pointer;
    transition: opacity 0.15s ease;
}

.caomei-button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
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
    height: 28px;
    padding: 0 var(--caomei-space-2);
    font-size: 12px;
}

.caomei-button--md {
    height: 36px;
    padding: 0 var(--caomei-space-3);
    font-size: 14px;
}

.caomei-button--lg {
    height: 44px;
    padding: 0 var(--caomei-space-4);
    font-size: 16px;
}
</style>
