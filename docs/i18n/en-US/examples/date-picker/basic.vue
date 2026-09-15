<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiDatePicker } from '@/components/date-picker'

const value = ref<Date | null>(null)
</script>

<template>
    <div class="demo-column">
        <CaomeiDatePicker
            v-model="value"
            locale="en-US"
            placeholder="Select a date"
        />
        <span class="demo-text">
            Selected: {{ value ? value.toLocaleDateString('en-US') : 'None' }}
        </span>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

.demo-text {
    color: var(--caomei-color-text-muted);
    font-size: 14px;
}
</style>
