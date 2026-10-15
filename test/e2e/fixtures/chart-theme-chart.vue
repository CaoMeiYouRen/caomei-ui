<script setup lang="ts">
import { computed } from 'vue'
import { CaomeiChart, useChartFormat } from '@/index'

/*
 * 图表宿主：必须是 `CaomeiConfigProvider` 的**后代**才能读到注入的语言（provide / inject 只沿
 * 祖先链查找），故与 provider 拆成两个文件。
 */
const { formatDate } = useChartFormat()

const option = computed(() => ({
    xAxis: {
        type: 'category',
        data: ['2026-10-01', '2026-10-02', '2026-10-03'],
        axisLabel: { formatter: (value: string): string => formatDate(new Date(value)) },
    },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: [12, 20, 15] }],
}))
</script>

<template>
    <CaomeiChart
        id="chart-themed"
        label="月度趋势"
        :option="option"
        :init-options="{renderer: 'svg'}"
    />
</template>
