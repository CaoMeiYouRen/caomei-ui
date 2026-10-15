<script setup lang="ts">
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { CaomeiChart } from '@/components/chart'

// Register chart types and components on demand (the wrapper registers none; see the component page)
use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

const option = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr'] },
    yAxis: { type: 'value' },
    series: [{ name: 'Installs', type: 'bar', data: [120, 200, 150, 80] }],
}
</script>

<template>
    <CaomeiChart
        label="Monthly installs"
        :option="option"
    />
</template>
