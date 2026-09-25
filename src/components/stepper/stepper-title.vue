<script setup lang="ts">
import { StepperTitle } from 'reka-ui'
import { useStepperLabelPresence } from './stepper-presence'
import type { StepperTitleProps } from './types'

defineOptions({ name: 'CaomeiStepperTitle', inheritAttrs: false })

withDefaults(defineProps<StepperTitleProps>(), {
    asChild: false,
})

/** 登记标题在位：缺席时触发器不输出悬空 `aria-labelledby` */
useStepperLabelPresence('title')
</script>

<template>
    <StepperTitle
        v-bind="$attrs"
        :as-child="asChild"
        class="caomei-stepper__title"
    >
        <slot />
    </StepperTitle>
</template>

<style scoped>
.caomei-stepper__title {
    color: var(--caomei-stepper-title-color, var(--caomei-color-text));
    font-size: var(--caomei-font-size-md);
    font-weight: 500;
    line-height: 1.4;
}

.caomei-stepper__item[data-state='active'] .caomei-stepper__title {
    color: var(--caomei-stepper-active-color, var(--caomei-color-primary));
}

.caomei-stepper__item[data-state='completed'] .caomei-stepper__title {
    color: var(--caomei-stepper-completed-color, var(--caomei-color-success));
}

.caomei-stepper__item[data-state='inactive'] .caomei-stepper__title {
    color: var(--caomei-stepper-inactive-color, var(--caomei-color-text-muted));
}
</style>
