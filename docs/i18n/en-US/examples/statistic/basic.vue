<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiStatistic } from '@/components/statistic'

const loading = ref(false)

function toggleLoading(): void {
    loading.value = !loading.value
}
</script>

<template>
    <div class="demo-column">
        <div class="demo-row">
            <CaomeiStatistic
                label="Monthly revenue"
                :value="1234567.891"
                :precision="2"
                prefix="$"
                suffix="USD"
            />
            <CaomeiStatistic
                label="Conversion rate"
                :value="38.642"
                :precision="1"
                suffix="%"
            />
            <CaomeiStatistic
                label="Year over year"
                :value="-12.5"
                suffix="%"
                size="sm"
            />
        </div>
        <div class="demo-row">
            <CaomeiStatistic
                label="Loading"
                :value="4200"
                :loading="loading"
            />
            <CaomeiStatistic
                label="No data"
                :value="null"
                placeholder="N/A"
            />
            <CaomeiStatistic
                label="Large value"
                :value="9876543210"
                size="lg"
            />
        </div>
        <CaomeiButton
            variant="secondary"
            @click="toggleLoading"
        >
            Toggle loading
        </CaomeiButton>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
}

.demo-row {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    align-items: flex-end;
}
</style>
