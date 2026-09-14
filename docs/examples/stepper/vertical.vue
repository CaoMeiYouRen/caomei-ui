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
    { title: '账号信息', description: '设置用户名与密码' },
    { title: '联系方式', description: '填写邮箱与手机号' },
    { title: '权限设置', description: '选择可访问的模块' },
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
