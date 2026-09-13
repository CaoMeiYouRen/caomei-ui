<script setup lang="ts">
import { CaomeiSkeleton } from '@/components/skeleton'
</script>

<template>
    <div class="demo-col">
        <div class="demo-row">
            <CaomeiSkeleton variant="circular" />
            <CaomeiSkeleton variant="text" width="40%" />
        </div>
        <CaomeiSkeleton
            variant="rectangular"
            :height="120"
        />
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 360px;
}

.demo-row {
    display: flex;
    align-items: center;
    gap: 12px;
}
</style>
