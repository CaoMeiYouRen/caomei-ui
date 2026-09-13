<script setup lang="ts">
import { CaomeiCard } from '@/components/card'

const paddings = ['none', 'sm', 'md', 'lg'] as const
</script>

<template>
    <div class="demo-grid">
        <CaomeiCard
            v-for="padding in paddings"
            :key="padding"
            variant="filled"
            :padding="padding"
            :title="`padding: ${padding}`"
        >
            <p class="demo-text">
                Adjust the padding step.
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
