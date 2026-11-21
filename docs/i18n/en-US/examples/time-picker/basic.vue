<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTimePicker } from '@/components/time-picker'

const time = ref<Date | null>(new Date(2026, 0, 1, 9, 30, 0))
</script>

<template>
    <CaomeiTimePicker
        v-model="time"
        label="Time"
    />
</template>
