<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiCalendar } from '@/components/calendar'

const value = ref<Date | null>(new Date(2026, 8, 15))
</script>

<template>
    <div class="demo-column">
        <CaomeiCalendar
            v-model="value"
            locale="en-US"
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
    align-items: flex-start;
    width: 100%;
}

.demo-text {
    color: var(--caomei-color-text-muted);
    font-size: 14px;
}
</style>
