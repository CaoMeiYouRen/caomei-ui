<script setup lang="ts">
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { CaomeiChart } from '@/components/chart'

// 图表类型与组件由使用方按需注册（封装层不代注册，见组件页「依赖与按需注册」）
use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

const option = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['一月', '二月', '三月', '四月'] },
    yAxis: { type: 'value' },
    series: [{ name: '安装量', type: 'bar', data: [120, 200, 150, 80] }],
}
</script>

<template>
    <CaomeiChart
        label="月度安装量"
        :option="option"
    />
</template>
