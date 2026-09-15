<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiDatePicker } from '@/components/date-picker'

const iso = ref<Date | null>(new Date(2026, 8, 5))
const localized = ref<Date | null>(new Date(2026, 8, 5))
</script>

<template>
    <div class="demo-column">
        <CaomeiDatePicker
            v-model="iso"
            locale="en-US"
            date-format="yy-mm-dd"
            placeholder="yy-mm-dd"
        />
        <CaomeiDatePicker
            v-model="localized"
            locale="en-US"
            date-format="MM dd, yyyy"
            placeholder="MM dd, yyyy"
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
