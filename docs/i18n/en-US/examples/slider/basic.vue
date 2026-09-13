<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSlider } from '@/components/slider'

const volume = ref(40)
</script>

<template>
    <div class="demo-col">
        <CaomeiSlider
            v-model="volume"
            label="Volume"
        />
        <p class="demo-state">
            Current volume: {{ volume }}
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
