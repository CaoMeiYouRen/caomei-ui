<script setup lang="ts">
import { CaomeiProgressSpinner } from '@/components/progress-spinner'
</script>

<template>
    <div class="demo-col">
        <div class="demo-row">
            <CaomeiProgressSpinner label="Submitting the form" />
            <span class="demo-text">Custom accessible name (label)</span>
        </div>
        <div class="demo-row">
            <CaomeiProgressSpinner class="demo-brand" />
            <span class="demo-text">Override the color via CSS variables</span>
        </div>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.demo-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.demo-text {
    color: var(--caomei-color-text-muted);
    font-size: 14px;
}

.demo-brand {
    --caomei-progress-spinner-color: #16a34a;
    --caomei-progress-spinner-track: #d1fae5;
}
</style>
