<script setup lang="ts">
import { CaomeiSkeleton } from '@/components/skeleton'

const animations = ['pulse', 'wave', 'none'] as const
</script>

<template>
    <div class="demo-col">
        <div
            v-for="animation in animations"
            :key="animation"
            class="demo-item"
        >
            <p class="demo-label">
                {{ animation }}
            </p>
            <CaomeiSkeleton
                :animation="animation"
                :lines="2"
            />
        </div>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 360px;
}

.demo-label {
    margin: 0 0 8px;
    color: var(--caomei-color-text-muted);
    font-size: 13px;
}
</style>
