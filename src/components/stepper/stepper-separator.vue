<script setup lang="ts">
import { StepperSeparator } from 'reka-ui'
import type { StepperSeparatorProps } from './types'

defineOptions({ name: 'CaomeiStepperSeparator', inheritAttrs: false })

withDefaults(defineProps<StepperSeparatorProps>(), {
    asChild: false,
})
</script>

<template>
    <StepperSeparator
        v-bind="$attrs"
        :as-child="asChild"
        class="caomei-stepper__separator"
    />
</template>

<style scoped>
.caomei-stepper__separator {
    box-sizing: border-box;
    flex: 1 1 auto;
    align-self: center;
    border: 0;
    background: var(--caomei-stepper-separator-color, var(--caomei-color-border));
}

.caomei-stepper__separator[data-orientation='horizontal'] {
    height: 1px;
    min-width: var(--caomei-stepper-separator-min-length, var(--caomei-space-4));
}

.caomei-stepper__separator[data-orientation='vertical'] {
    align-self: stretch;
    width: 1px;
    min-height: var(--caomei-stepper-separator-min-length, var(--caomei-space-4));
}

.caomei-stepper__separator[data-state='completed'] {
    background: var(--caomei-stepper-completed-color, var(--caomei-color-success));
}
</style>
