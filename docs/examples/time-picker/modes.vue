<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTimePicker } from '@/components/time-picker'

const inputTime = ref<Date | null>(new Date(2026, 0, 1, 9, 30, 0))
const wheelTime = ref<Date | null>(new Date(2026, 0, 1, 9, 30, 0))
const bothTime = ref<Date | null>(new Date(2026, 0, 1, 9, 30, 0))
</script>

<template>
    <div class="time-picker-modes">
        <CaomeiTimePicker
            v-model="inputTime"
            label="输入（默认）"
        />
        <CaomeiTimePicker
            v-model="wheelTime"
            label="滚轮"
            mode="wheel"
        />
        <CaomeiTimePicker
            v-model="bothTime"
            label="输入 + 滚轮"
            mode="both"
        />
    </div>
</template>

<style scoped>
.time-picker-modes {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-3);
}
</style>
