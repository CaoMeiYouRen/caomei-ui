<script setup lang="ts">
import { BarChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { CaomeiChart } from '@/components/chart'

use([CanvasRenderer, BarChart, GridComponent, LegendComponent, TooltipComponent])

// No theme passed: colours, text, axes and tooltip all derive from the current theme tokens
const option = {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr'] },
    yAxis: { type: 'value' },
    series: [
        { name: 'Installs', type: 'bar', data: [120, 200, 150, 80] },
        { name: 'Active', type: 'bar', data: [90, 160, 130, 60] },
    ],
}
</script>

<template>
    <CaomeiChart
        label="Installs and active users"
        :option="option"
    />
</template>
