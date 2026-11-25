<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiTour } from '@/components/tour'
import type { TourStep } from '@/components/tour'

const open = ref(false)
const current = ref(0)
const first = ref<HTMLElement | null>(null)
const second = ref<HTMLElement | null>(null)

const steps: TourStep[] = [
    {
        target: () => first.value,
        title: '第一步：创建内容',
        description: '从这里开始创建第一条内容，引导会高亮目标并贴在下方的卡片里说明。',
    },
    {
        target: () => second.value,
        title: '第二步：切换视图',
        description: '第二个目标用于验证翻页时的高亮与卡片位置重算。',
    },
]

function start(): void {
    current.value = 0
    open.value = true
}
</script>

<template>
    <div class="tour-demo">
        <div class="tour-demo__row">
            <span
                ref="first"
                class="tour-demo__target"
            >
                <CaomeiButton @click="start">
                    开始引导
                </CaomeiButton>
            </span>
            <span
                ref="second"
                class="tour-demo__target"
            >
                <CaomeiButton variant="secondary">
                    切换视图
                </CaomeiButton>
            </span>
        </div>
        <p class="demo-text">
            {{ open ? `第 ${current + 1} 步，共 ${steps.length} 步` : '点击「开始引导」体验遮罩高亮与定位' }}
        </p>
        <CaomeiTour
            v-model:open="open"
            v-model:current="current"
            :steps="steps"
        />
    </div>
</template>

<style scoped>
.tour-demo {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.tour-demo__row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.tour-demo__target {
    display: inline-flex;
}
</style>
