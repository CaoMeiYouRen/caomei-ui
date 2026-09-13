<script setup lang="ts">
import { CaomeiProgressBar } from '@/components/progress-bar'
</script>

<template>
    <div class="demo-col">
        <div>
            <p class="demo-label">
                Loading (60%)
            </p>
            <CaomeiProgressBar :value="60" />
        </div>
        <div>
            <p class="demo-label">
                Complete
            </p>
            <CaomeiProgressBar :value="100" />
        </div>
        <div>
            <p class="demo-label">
                Indeterminate
            </p>
            <CaomeiProgressBar :value="null" />
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
