<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiTour } from '@/components/tour'
import type { TourStep } from '@/components/tour'

const open = ref(false)
const current = ref(0)
const card = ref<HTMLElement | null>(null)

const steps: TourStep[] = [
    { target: () => card.value, title: 'Pre-publish checklist' },
]

function start(): void {
    current.value = 0
    open.value = true
}
</script>

<template>
    <div class="tour-demo">
        <CaomeiButton @click="start">
            Start tour
        </CaomeiButton>
        <div
            ref="card"
            class="tour-demo__card"
        >
            Publish settings
        </div>
        <CaomeiTour
            v-model:open="open"
            v-model:current="current"
            :steps="steps"
        >
            <template #default="{index, total}">
                <p class="tour-demo__lead">
                    Before publishing, confirm:
                </p>
                <ul class="tour-demo__list">
                    <li>The default slot takes over the body and can hold lists, links or form controls.</li>
                    <li>The slot scope exposes the step, index and total ({{ index + 1 }} / {{ total }}).</li>
                </ul>
            </template>
        </CaomeiTour>
    </div>
</template>

<style scoped>
.tour-demo {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
}

.tour-demo__card {
    padding: 16px;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    color: var(--caomei-color-text-muted);
}

.tour-demo__lead {
    margin: 0;
    color: var(--caomei-color-text);
}

.tour-demo__list {
    margin: 8px 0 0;
    padding-left: 18px;
}
</style>
