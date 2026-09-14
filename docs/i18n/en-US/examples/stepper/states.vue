<script setup lang="ts">
import { ref } from 'vue'
import {
    CaomeiStepper,
    CaomeiStepperDescription,
    CaomeiStepperIndicator,
    CaomeiStepperItem,
    CaomeiStepperList,
    CaomeiStepperSeparator,
    CaomeiStepperTitle,
    CaomeiStepperTrigger,
} from '@/components/stepper'

const current = ref(2)

const steps = [
    { title: 'Submitted', description: 'Request received', disabled: false, completed: true },
    { title: 'Under review', description: 'About 1 business day', disabled: false, completed: false },
    { title: 'More info needed', description: 'Incomplete documents', disabled: true, completed: false },
    { title: 'Completed', description: 'Process finished', disabled: false, completed: false },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiStepper v-model="current">
            <CaomeiStepperList>
                <CaomeiStepperItem
                    v-for="(step, index) in steps"
                    :key="step.title"
                    :step="index + 1"
                    :disabled="step.disabled"
                    :completed="step.completed"
                >
                    <CaomeiStepperTrigger>
                        <CaomeiStepperIndicator>{{ index + 1 }}</CaomeiStepperIndicator>
                        <div class="demo-step-text">
                            <CaomeiStepperTitle>{{ step.title }}</CaomeiStepperTitle>
                            <CaomeiStepperDescription>{{ step.description }}</CaomeiStepperDescription>
                        </div>
                    </CaomeiStepperTrigger>
                    <CaomeiStepperSeparator v-if="index < steps.length - 1" />
                </CaomeiStepperItem>
            </CaomeiStepperList>
        </CaomeiStepper>
        <p class="demo-value">
            Disabled steps cannot be clicked; completed steps are marked via completed.
        </p>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

.demo-step-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.demo-value {
    margin: 0;
    font-size: 13px;
    color: var(--vp-c-text-2);
}
</style>
