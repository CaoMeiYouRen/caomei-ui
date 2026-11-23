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
                label="本月收入"
                :value="1234567.891"
                :precision="2"
                prefix="¥"
                suffix="元"
            />
            <CaomeiStatistic
                label="转化率"
                :value="38.642"
                :precision="1"
                suffix="%"
            />
            <CaomeiStatistic
                label="同比"
                :value="-12.5"
                suffix="%"
                size="sm"
            />
        </div>
        <div class="demo-row">
            <CaomeiStatistic
                label="加载态"
                :value="4200"
                :loading="loading"
            />
            <CaomeiStatistic
                label="暂无数据"
                :value="null"
                placeholder="暂无"
            />
            <CaomeiStatistic
                label="大额"
                :value="9876543210"
                size="lg"
            />
        </div>
        <CaomeiButton
            variant="secondary"
            @click="toggleLoading"
        >
            切换加载态
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
