<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiCalendar } from '@/components/calendar'

// 仅允许选择 2026-09-10 ~ 2026-09-20
const minValue = new Date(2026, 8, 10)
const maxValue = new Date(2026, 8, 20)
const value = ref<Date | null>(new Date(2026, 8, 15))
</script>

<template>
    <CaomeiCalendar
        v-model="value"
        :min-value="minValue"
        :max-value="maxValue"
    />
</template>
