<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiTour } from '@/components/tour'
import type { TourStep } from '@/components/tour'

const open = ref(false)
const current = ref(0)
const target = ref<HTMLElement | null>(null)

const steps: TourStep[] = [
    { target: () => target.value, title: 'Controlled step', description: 'The step index is written by both the external buttons and the tour itself.' },
    { target: () => target.value, title: 'Step 2', description: 'The external next button and the in-card button share the same current value.' },
    { target: () => target.value, title: 'Step 3', description: 'On the last step the in-card button reads "Finish".' },
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
                Open tour
            </CaomeiButton>
            <CaomeiButton
                variant="secondary"
                :disabled="!open || !canPrev"
                @click="current -= 1"
            >
                External previous
            </CaomeiButton>
            <CaomeiButton
                variant="secondary"
                :disabled="!open || !canNext"
                @click="current += 1"
            >
                External next
            </CaomeiButton>
        </div>
        <div
            ref="target"
            class="tour-demo__panel"
        >
            current = {{ current }}; open = {{ open }}
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
