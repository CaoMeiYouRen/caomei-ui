<script setup lang="ts">
import { StepperDescription } from 'reka-ui'
import type { StepperDescriptionProps } from './types'

defineOptions({ name: 'CaomeiStepperDescription', inheritAttrs: false })

withDefaults(defineProps<StepperDescriptionProps>(), {
    asChild: false,
})
</script>

<template>
    <StepperDescription
        v-bind="$attrs"
        :as-child="asChild"
        class="caomei-stepper__description"
    >
        <slot />
    </StepperDescription>
</template>

<style scoped>
.caomei-stepper__description {
    color: var(--caomei-stepper-description-color, var(--caomei-color-text-muted));
    font-size: var(--caomei-font-size-sm);
    line-height: 1.5;
}
</style>
