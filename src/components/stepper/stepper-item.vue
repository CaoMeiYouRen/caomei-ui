<script setup lang="ts">
import { StepperItem } from 'reka-ui'
import type { StepperItemProps } from './types'

defineOptions({ name: 'CaomeiStepperItem', inheritAttrs: false })

withDefaults(defineProps<StepperItemProps>(), {
    disabled: false,
    completed: false,
})
</script>

<template>
    <StepperItem
        v-bind="$attrs"
        :step="step"
        :disabled="disabled"
        :completed="completed"
        class="caomei-stepper__item"
    >
        <template #default="slotProps">
            <slot v-bind="slotProps" />
        </template>
    </StepperItem>
</template>

<style scoped>
.caomei-stepper__item {
    box-sizing: border-box;
    display: flex;
    flex: 1 1 0;
    align-items: center;
    gap: var(--caomei-stepper-item-gap, var(--caomei-space-2));
    min-width: 0;
}

:where(.caomei-stepper[data-orientation='vertical']) .caomei-stepper__item {
    align-items: flex-start;
}
</style>
