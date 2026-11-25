<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiTour } from '@/components/tour'
import type { TourStep } from '@/components/tour'

const open = ref(false)
const current = ref(0)
const target = ref<HTMLElement | null>(null)

const steps: TourStep[] = [
    { target: () => target.value, title: '受控步骤', description: '步骤索引由外部按钮与引导自身共同写入。' },
    { target: () => target.value, title: '第二步', description: '外部「下一步」与卡片内按钮共享同一份 current。' },
    { target: () => target.value, title: '第三步', description: '到达末步后卡片按钮显示「完成」。' },
]

const canPrev = computed(() => current.value > 0)
const canNext = computed(() => current.value < steps.length - 1)

function start(): void {
    current.value = 0
    open.value = true
}
</script>

<template>
    <div class="tour-demo">
        <div class="tour-demo__row">
            <CaomeiButton @click="start">
                打开引导
            </CaomeiButton>
            <CaomeiButton
                variant="secondary"
                :disabled="!open || !canPrev"
                @click="current -= 1"
            >
                外部上一步
            </CaomeiButton>
            <CaomeiButton
                variant="secondary"
                :disabled="!open || !canNext"
                @click="current += 1"
            >
                外部下一步
            </CaomeiButton>
        </div>
        <div
            ref="target"
            class="tour-demo__panel"
        >
            current = {{ current }}；open = {{ open }}
        </div>
        <CaomeiTour
            v-model:open="open"
            v-model:current="current"
            :steps="steps"
            :mask="false"
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

.tour-demo__panel {
    padding: 16px;
    border: 1px dashed var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    color: var(--caomei-color-text-muted);
}
</style>
