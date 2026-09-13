<script setup lang="ts">
import { CaomeiCard } from '@/components/card'

const variants = [
    { value: 'outlined', label: 'Outlined' },
    { value: 'elevated', label: 'Elevated' },
    { value: 'filled', label: 'Filled' },
] as const
</script>

<template>
    <div class="demo-grid">
        <CaomeiCard
            v-for="item in variants"
            :key="item.value"
            :variant="item.value"
            :title="item.label"
        >
            <p class="demo-text">
                variant: {{ item.value }}
            </p>
        </CaomeiCard>
    </div>
</template>

<style scoped>
.demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}

.demo-text {
    margin: 0;
}
</style>
