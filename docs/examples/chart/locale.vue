<script setup lang="ts">
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { CaomeiChart, useChartFormat } from '@/components/chart'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

// 轴标签跟随宿主语言：切换站点语言即可看到数字 / 日期写法变化
const { formatDate, formatUnit } = useChartFormat()

const days = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']

const option = {
    tooltip: { trigger: 'axis' },
    xAxis: {
        type: 'category',
        data: days,
        axisLabel: { formatter: (value: string): string => formatDate(new Date(value)) },
    },
    yAxis: {
        type: 'value',
        axisLabel: { formatter: (value: number): string => formatUnit(value, 'MB') },
    },
    series: [{ name: '流量', type: 'bar', data: [1250000, 2100000, 1580000, 860000] }],
}
</script>

<template>
    <CaomeiChart
        label="每日流量"
        :option="option"
    />
</template>
