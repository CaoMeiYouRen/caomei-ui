<script setup lang="ts">
import { CaomeiProgressBar } from '@/components/progress-bar'

const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
    <div class="demo-col">
        <div
            v-for="size in sizes"
            :key="size"
            class="demo-item"
        >
            <p class="demo-label">
                {{ size }}
            </p>
            <CaomeiProgressBar
                :value="60"
                :size="size"
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
