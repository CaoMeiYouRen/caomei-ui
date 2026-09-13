<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSlider } from '@/components/slider'

const score = ref(50)
const fixed = ref(3)
</script>

<template>
    <div class="demo-col">
        <div>
            <p class="demo-label">
                步进为 10
            </p>
            <CaomeiSlider
                v-model="score"
                :min="0"
                :max="100"
                :step="10"
                label="评分"
            />
        </div>
        <div>
            <p class="demo-label">
                禁用
            </p>
            <CaomeiSlider
                v-model="fixed"
                :min="0"
                :max="10"
                disabled
                label="固定档位"
            />
        </div>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 320px;
}

.demo-label {
    margin: 0 0 8px;
    color: var(--caomei-color-text-muted);
    font-size: 13px;
}
</style>
