<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiToggleButton } from '@/components/toggle-button'

const bold = ref(false)
</script>

<template>
    <div class="demo-col">
        <CaomeiToggleButton
            v-model="bold"
            label="Bold"
        >
            Bold
        </CaomeiToggleButton>
        <p class="demo-state">
            Current state: {{ bold ? 'Pressed' : 'Not pressed' }}
        </p>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    align-items: center;
    gap: 12px;
}

.demo-state {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: 14px;
}
</style>
