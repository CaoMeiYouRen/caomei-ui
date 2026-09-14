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
    { title: '已提交', description: '申请已受理', disabled: false, completed: true },
    { title: '审核中', description: '预计 1 个工作日', disabled: false, completed: false },
    { title: '待补充', description: '资料不完整', disabled: true, completed: false },
    { title: '已完成', description: '流程结束', disabled: false, completed: false },
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
            禁用步骤不可点击，已完成步骤通过 completed 标记。
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
