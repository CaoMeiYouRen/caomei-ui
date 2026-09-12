<script setup lang="ts">
import { CaomeiProgressSpinner } from '@/components/progress-spinner'
</script>

<template>
    <div class="demo-row">
        <CaomeiProgressSpinner size="sm" />
        <CaomeiProgressSpinner size="md" />
        <CaomeiProgressSpinner size="lg" />
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    align-items: center;
    gap: 16px;
}
</style>
