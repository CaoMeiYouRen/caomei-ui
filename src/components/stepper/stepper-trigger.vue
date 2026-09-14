<script setup lang="ts">
import { StepperTrigger } from 'reka-ui'
import type { StepperTriggerProps } from './types'

defineOptions({ name: 'CaomeiStepperTrigger', inheritAttrs: false })

withDefaults(defineProps<StepperTriggerProps>(), {
    asChild: false,
})
</script>

<template>
    <StepperTrigger
        v-bind="$attrs"
        :as-child="asChild"
        class="caomei-stepper__trigger"
    >
        <slot />
    </StepperTrigger>
</template>

<style scoped>
.caomei-stepper__trigger {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-stepper-trigger-gap, var(--caomei-space-2));
    padding: var(--caomei-stepper-trigger-padding, var(--caomei-space-1));
    border: 0;
    border-radius: var(--caomei-radius-md);
    background: transparent;
    color: var(--caomei-stepper-inactive-color, var(--caomei-color-text-muted));
    font: inherit;
    text-align: start;
    cursor: pointer;
    transition: color 0.15s ease, background-color 0.15s ease;
}

.caomei-stepper__trigger:hover:not([data-disabled]) {
    background: var(--caomei-color-bg-elevated);
}

.caomei-stepper__trigger:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}

.caomei-stepper__trigger[data-state='active'] {
    color: var(--caomei-stepper-active-color, var(--caomei-color-primary));
}

.caomei-stepper__trigger[data-state='completed'] {
    color: var(--caomei-stepper-completed-color, var(--caomei-color-success));
}

.caomei-stepper__trigger[data-disabled] {
    cursor: not-allowed;
    opacity: 0.5;
}

@media (prefers-reduced-motion: reduce) {
    .caomei-stepper__trigger {
        transition: none;
    }
}
</style>
