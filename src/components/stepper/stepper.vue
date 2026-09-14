<script setup lang="ts">
import { StepperRoot } from 'reka-ui'
import { computed, useAttrs, useTemplateRef } from 'vue'
import { useLocale } from '../../composables/use-locale'
import type { StepperExposed, StepperProps } from './types'

defineOptions({ name: 'CaomeiStepper', inheritAttrs: false })

const props = withDefaults(defineProps<StepperProps>(), {
    orientation: 'horizontal',
    linear: true,
})

const model = defineModel<number>()

const attrs = useAttrs()
const locale = useLocale()

/** 使用方透传的 aria-label 优先于 props，再回退到当前语言的内建文案 */
const ariaLabel = computed(
    () => (attrs['aria-label'] as string | undefined) ?? props.label ?? locale.value.stepper.label,
)

const stepperRef = useTemplateRef<StepperExposed>('stepperRef')

const rootClass = computed(() => `caomei-stepper--${props.orientation}`)

function goToStep(step: number): void {
    stepperRef.value?.goToStep(step)
}

function nextStep(): void {
    stepperRef.value?.nextStep()
}

function prevStep(): void {
    stepperRef.value?.prevStep()
}

defineExpose({ goToStep, nextStep, prevStep })
</script>

<template>
    <StepperRoot
        ref="stepperRef"
        v-bind="$attrs"
        v-model="model"
        :default-value="defaultValue"
        :orientation="orientation"
        :linear="linear"
        :dir="dir"
        :aria-label="ariaLabel"
        class="caomei-stepper"
        :class="rootClass"
    >
        <template #default="slotProps">
            <slot v-bind="slotProps" />
        </template>
    </StepperRoot>
</template>

<style scoped>
.caomei-stepper {
    box-sizing: border-box;
    display: flex;
    gap: var(--caomei-stepper-gap, var(--caomei-space-2));
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
}

.caomei-stepper[data-orientation='horizontal'] {
    flex-direction: row;
    align-items: flex-start;
}

.caomei-stepper[data-orientation='vertical'] {
    flex-direction: column;
}
</style>
