<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiProgressBar } from '@/components/progress-bar'

const value = ref(40)
</script>

<template>
    <div class="demo-col">
        <CaomeiProgressBar
            :value="value"
            label="Upload progress"
        />
        <p class="demo-state">
            Current progress: {{ value }}%
        </p>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 320px;
}

.demo-state {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: 14px;
}
</style>
