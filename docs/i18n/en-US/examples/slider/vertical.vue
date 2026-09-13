<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSlider } from '@/components/slider'

const height = ref(60)
</script>

<template>
    <div class="demo-col">
        <CaomeiSlider
            v-model="height"
            orientation="vertical"
            label="Height"
        />
        <p class="demo-state">
            Current height: {{ height }}
        </p>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    align-items: center;
    gap: 16px;
}

.demo-state {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: 14px;
}
</style>
