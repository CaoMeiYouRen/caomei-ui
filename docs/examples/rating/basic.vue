<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiRating } from '@/components/rating'

const score = ref(3)
const halfScore = ref(2.5)
</script>

<template>
    <div class="demo-stack">
        <CaomeiRating v-model="score" label="满意度" />
        <p class="demo-value">
            当前评分：{{ score }}
        </p>
        <CaomeiRating
            v-model="halfScore"
            label="半星评分"
            :step="0.5"
        />
        <p class="demo-value">
            当前评分：{{ halfScore }}
        </p>
    </div>
</template>

<style scoped>
.demo-stack {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-2);
}

.demo-value {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
