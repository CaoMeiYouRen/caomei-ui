<script setup lang="ts">
import { CaomeiTag } from '@/components/tag'

const tones = ['neutral', 'primary', 'success', 'warning', 'danger'] as const
</script>

<template>
    <div class="demo-row">
        <CaomeiTag
            v-for="tone in tones"
            :key="tone"
            :tone="tone"
        >
            {{ tone }}
        </CaomeiTag>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}
</style>
