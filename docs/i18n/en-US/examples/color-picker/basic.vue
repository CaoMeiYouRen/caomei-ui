<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiColorPicker } from '@/components/color-picker'

const color = ref('#e63946')
</script>

<template>
    <div class="demo-column">
        <CaomeiColorPicker
            v-model="color"
            label="Theme color"
        />
        <p class="demo-text">
            Current value: {{ color }}
        </p>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
}

.demo-text {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
