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

const current = ref(1)

const steps = [
    { title: '账户', description: '填写登录信息' },
    { title: '资料', description: '补充个人资料' },
    { title: '完成', description: '确认并提交' },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiStepper
            v-model="current"
            :linear="false"
        >
            <template #default="stepperProps">
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
                        <CaomeiStepperSeparator v-if="index < steps.length - 1" />
                    </CaomeiStepperItem>
                </CaomeiStepperList>
                <div class="demo-actions">
                    <button
                        type="button"
                        :disabled="stepperProps.isPrevDisabled"
                        @click="stepperProps.prevStep"
                    >
                        上一步
                    </button>
                    <button
                        type="button"
                        :disabled="stepperProps.isNextDisabled"
                        @click="stepperProps.nextStep"
                    >
                        下一步
                    </button>
                </div>
            </template>
        </CaomeiStepper>
        <p class="demo-value">
            当前步骤：{{ current }}
        </p>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
}

.demo-step-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.demo-actions {
    display: flex;
    gap: 8px;
}

.demo-actions button {
    padding: 6px 14px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 6px;
    background: var(--vp-c-bg-soft);
    color: var(--vp-c-text-1);
    cursor: pointer;
}

.demo-actions button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.demo-value {
    margin: 0;
    font-size: 13px;
    color: var(--vp-c-text-2);
}
</style>
