<script setup lang="ts">
import { ref } from 'vue'
import {
    CaomeiStepper,
    CaomeiStepperDescription,
    CaomeiStepperIndicator,
    CaomeiStepperItem,
    CaomeiStepperList,
    CaomeiStepperTitle,
    CaomeiStepperTrigger,
} from '@/components/stepper'

const current = ref(2)

const steps = [
    { title: 'Account', description: 'Set a username and password' },
    { title: 'Contact', description: 'Add your email and phone' },
    { title: 'Permissions', description: 'Choose accessible modules' },
]
</script>

<template>
    <CaomeiStepper
        v-model="current"
        orientation="vertical"
    >
        <CaomeiStepperList>
            <CaomeiStepperItem
                v-for="(step, index) in steps"
                :key="step.title"
                :step="index + 1"
            >
                <CaomeiStepperTrigger>
                    <CaomeiStepperIndicator>{{ index + 1 }}</CaomeiStepperIndicator>
                    <div class="demo-step-text">
                        <CaomeiStepperTitle>{{ step.title }}</CaomeiStepperTitle>
                        <CaomeiStepperDescription>{{ step.description }}</CaomeiStepperDescription>
                    </div>
                </CaomeiStepperTrigger>
            </CaomeiStepperItem>
        </CaomeiStepperList>
    </CaomeiStepper>
</template>

<style scoped>
.demo-step-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
}
</style>
