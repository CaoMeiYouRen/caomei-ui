<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiCalendar } from '@/components/calendar'

// Only 2026-09-10 ~ 2026-09-20 can be selected
const minValue = new Date(2026, 8, 10)
const maxValue = new Date(2026, 8, 20)
const value = ref<Date | null>(new Date(2026, 8, 15))
</script>

<template>
    <CaomeiCalendar
        v-model="value"
        locale="en-US"
        :min-value="minValue"
        :max-value="maxValue"
    />
</template>
