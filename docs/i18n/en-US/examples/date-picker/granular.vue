<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiDatePicker } from '@/components/date-picker'

const month = ref<Date | null>(new Date(2026, 8, 1))
const year = ref<Date | null>(new Date(2026, 0, 1))
</script>

<template>
    <div class="demo-column">
        <CaomeiDatePicker
            v-model="month"
            selection-mode="month"
            label="Month"
        />
        <CaomeiDatePicker
            v-model="year"
            selection-mode="year"
            label="Year"
        />
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: 320px;
}
</style>
