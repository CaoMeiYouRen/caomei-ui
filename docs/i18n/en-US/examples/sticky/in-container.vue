<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSticky } from '@/components/sticky'

const state = ref<'idle' | 'stuck' | 'constrained'>('idle')

function onChange(next: { stuck: boolean, constrained: boolean }): void {
    if (next.constrained) {
        state.value = 'constrained'
        return
    }
    state.value = next.stuck ? 'stuck' : 'idle'
}
</script>

<template>
    <div class="sticky-demo">
        <div class="sticky-demo__scroll">
            <div class="sticky-demo__card">
                <CaomeiSticky
                    class="sticky-demo__bar"
                    @change="onChange"
                >
                    Card title
                    <span class="sticky-demo__state">
                        {{ state === 'stuck' ? 'Stuck' : state === 'constrained' ? 'At container end' : 'Not stuck' }}
                    </span>
                </CaomeiSticky>
                <p
                    v-for="index in 4"
                    :key="index"
                    class="sticky-demo__line"
                >
                    Inside the card, paragraph {{ index }}
                </p>
            </div>
            <p
                v-for="index in 8"
                :key="`tail-${index}`"
                class="sticky-demo__line"
            >
                After the card {{ index }}: scroll the card out and the title is pushed away.
            </p>
        </div>
    </div>
</template>

<style scoped>
.sticky-demo__scroll {
    max-height: 11rem;
    overflow-y: auto;
    padding: var(--caomei-space-2);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
}

.sticky-demo__card {
    /* Stickiness is bounded by this containing block */
    border: 1px dashed var(--caomei-color-border);
}

.sticky-demo__bar {
    display: flex;
    gap: var(--caomei-space-2);
    align-items: center;
    justify-content: space-between;
    padding: var(--caomei-space-2) var(--caomei-space-3);
    border-bottom: 1px solid var(--caomei-color-border);
    font-weight: 600;
}

.sticky-demo__state {
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
    font-weight: 400;
}

.sticky-demo__line {
    margin: var(--caomei-space-2) 0;
    color: var(--caomei-color-text);
    line-height: 1.6;
}
</style>
