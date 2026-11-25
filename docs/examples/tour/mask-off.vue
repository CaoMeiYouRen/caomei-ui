<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiTour } from '@/components/tour'
import type { TourStep } from '@/components/tour'

const open = ref(false)
const current = ref(0)
const mask = ref(false)
const target = ref<HTMLElement | null>(null)

const steps: TourStep[] = [
    { target: () => target.value, title: '非模态引导', description: '没有遮罩，页面仍可交互，Tab 可以离开卡片。' },
]

function start(): void {
    current.value = 0
    open.value = true
}
</script>

<template>
    <div class="tour-demo">
        <div class="tour-demo__row">
            <CaomeiButton @click="start">
                开始引导
            </CaomeiButton>
            <label class="tour-demo__switch">
                <input
                    v-model="mask"
                    type="checkbox"
                >
                使用遮罩
            </label>
        </div>
        <div
            ref="target"
            class="tour-demo__panel"
        >
            目标区域
        </div>
        <CaomeiTour
            v-model:open="open"
            v-model:current="current"
            :steps="steps"
            :mask="mask"
        />
    </div>
</template>

<style scoped>
.tour-demo {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
}

.tour-demo__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}

.tour-demo__switch {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--caomei-color-text-muted);
}

.tour-demo__panel {
    padding: 16px;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
}
</style>
