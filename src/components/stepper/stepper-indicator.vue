<script setup lang="ts">
import { StepperIndicator } from 'reka-ui'
import type { StepperIndicatorProps } from './types'

defineOptions({ name: 'CaomeiStepperIndicator', inheritAttrs: false })

withDefaults(defineProps<StepperIndicatorProps>(), {
    asChild: false,
})

defineSlots<{
    /**
     * 指示器内容，接收当前步骤序号
     * @en Indicator content, receives the current step index
     */
    default?: (props: { step: number }) => unknown
}>()
</script>

<template>
    <StepperIndicator
        v-bind="$attrs"
        :as-child="asChild"
        class="caomei-stepper__indicator"
    >
        <template #default="indicatorProps">
            <slot :step="indicatorProps.step" />
        </template>
    </StepperIndicator>
</template>

<style scoped>
.caomei-stepper__indicator {
    box-sizing: border-box;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: var(--caomei-stepper-indicator-size, 1.75rem);
    height: var(--caomei-stepper-indicator-size, 1.75rem);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-full);
    background: var(--caomei-stepper-indicator-bg, var(--caomei-color-bg));
    color: var(--caomei-stepper-indicator-color, var(--caomei-color-text-muted));
    font-size: var(--caomei-font-size-sm);
    font-weight: 500;
    line-height: 1;
}

.caomei-stepper__item[data-state='active'] .caomei-stepper__indicator {
    border-color: var(--caomei-stepper-active-color, var(--caomei-color-primary));
    background: var(--caomei-stepper-active-bg, var(--caomei-color-primary));
    color: var(--caomei-stepper-active-indicator-color, var(--caomei-color-primary-foreground));
}

.caomei-stepper__item[data-state='completed'] .caomei-stepper__indicator {
    border-color: var(--caomei-stepper-completed-color, var(--caomei-color-success));
    color: var(--caomei-stepper-completed-color, var(--caomei-color-success));
}

.caomei-stepper__item[data-disabled] .caomei-stepper__indicator {
    opacity: 0.5;
}
</style>
