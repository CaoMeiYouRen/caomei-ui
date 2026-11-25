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
        title: 'Step 1: create content',
        description: 'Start here to create your first item. The tour highlights the target and explains it in the card next to it.',
    },
    {
        target: () => second.value,
        title: 'Step 2: switch views',
        description: 'The second target shows how the highlight and card position are recalculated on step changes.',
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
                    Start tour
                </CaomeiButton>
            </span>
            <span
                ref="second"
                class="tour-demo__target"
            >
                <CaomeiButton variant="secondary">
                    Switch view
                </CaomeiButton>
            </span>
        </div>
        <p class="demo-text">
            {{ open ? `Step ${current + 1} of ${steps.length}` : 'Click "Start tour" to see the mask highlight and positioning' }}
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
