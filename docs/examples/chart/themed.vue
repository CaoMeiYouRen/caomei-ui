<script setup lang="ts">
import { BarChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { CaomeiChart } from '@/components/chart'

use([CanvasRenderer, BarChart, GridComponent, LegendComponent, TooltipComponent])

// 不传 theme：配色 / 文字 / 坐标轴 / 提示框均按当前主题 token 派生，切换站点主题即可看到联动
const option = {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    xAxis: { type: 'category', data: ['一月', '二月', '三月', '四月'] },
    yAxis: { type: 'value' },
    series: [
        { name: '安装量', type: 'bar', data: [120, 200, 150, 80] },
        { name: '活跃量', type: 'bar', data: [90, 160, 130, 60] },
    ],
}
</script>

<template>
    <CaomeiChart
        label="安装量与活跃量"
        :option="option"
    />
</template>
