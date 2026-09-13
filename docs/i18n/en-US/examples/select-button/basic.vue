<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSelectButton } from '@/components/select-button'

const align = ref<string | number>('left')

const options = [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiSelectButton
            v-model="align"
            :options="options"
            label="Text alignment"
        />
        <p class="demo-state">
            Current value: {{ align }}
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

.demo-state {
    margin: 0;
    color: var(--vp-c-text-2);
    font-size: 13px;
}
</style>
