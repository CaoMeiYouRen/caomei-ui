<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiDatePicker } from '@/components/date-picker'

const h24 = ref<Date | null>(new Date(2026, 8, 5, 14, 30))
const h12 = ref<Date | null>(new Date(2026, 8, 5, 14, 30, 9))
</script>

<template>
    <div class="demo-column">
        <CaomeiDatePicker
            v-model="h24"
            locale="en-US"
            show-time
            hour-format="24"
            placeholder="24-hour"
        />
        <CaomeiDatePicker
            v-model="h12"
            locale="en-US"
            show-time
            hour-format="12"
            show-seconds
            placeholder="12-hour with seconds"
        />
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}
</style>
