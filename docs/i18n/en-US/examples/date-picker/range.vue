<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaomeiDatePicker, type DatePickerRange } from '@/components/date-picker'

const range = ref<DatePickerRange | null>([new Date(2026, 8, 1), new Date(2026, 8, 7)])
const minValue = new Date(2026, 0, 1)
const maxValue = new Date(2026, 11, 31)

const summary = computed(() => {
    const value = range.value
    if (!value) {
        return 'None'
    }
    return `${value[0].toLocaleDateString('en-US')} to ${value[1].toLocaleDateString('en-US')}`
})
</script>

<template>
    <div class="demo-column">
        <CaomeiDatePicker
            v-model="range"
            selection-mode="range"
            date-format="yy-mm-dd"
            locale="en-US"
            :min-value="minValue"
            :max-value="maxValue"
            label="Reporting period"
            placeholder="Select a start and end date"
        />
        <span class="demo-text">
            Selected range: {{ summary }}
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
