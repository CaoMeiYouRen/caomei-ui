<script setup lang="ts">
import { CaomeiBadge } from '@/components/badge'

const tones = ['neutral', 'primary', 'success', 'warning', 'danger'] as const
const variants = ['soft', 'solid', 'outline'] as const
</script>

<template>
    <div class="demo-column">
        <div class="demo-row">
            <CaomeiBadge
                v-for="tone in tones"
                :key="tone"
                :value="8"
                :tone="tone"
            />
        </div>
        <div class="demo-row">
            <CaomeiBadge
                v-for="variant in variants"
                :key="variant"
                :value="8"
                :variant="variant"
            />
        </div>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
}
</style>
