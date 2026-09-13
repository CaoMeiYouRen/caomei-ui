<script setup lang="ts">
import { CaomeiSkeleton } from '@/components/skeleton'
</script>

<template>
    <div class="demo-card">
        <CaomeiSkeleton
            variant="circular"
            :width="48"
            :height="48"
        />
        <div class="demo-body">
            <CaomeiSkeleton :lines="3" />
        </div>
    </div>
</template>

<style scoped>
.demo-card {
    display: flex;
    gap: 12px;
    max-width: 360px;
    padding: 16px;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
}

.demo-body {
    flex: 1;
}
</style>
