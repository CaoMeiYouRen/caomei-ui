<script setup lang="ts">
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers'
import { ref } from 'vue'
import { CaomeiConfigProvider } from '@/index'
import type { CaomeiLocale } from '@/locale'
import ChartThemeChart from './chart-theme-chart.vue'

/*
 * 图表主题 / 语言联动用例的独立夹具入口（见 `test/e2e/chart-theme.e2e.ts`）。
 *
 * 独立入口的理由：该用例需要 SVG 渲染器（使坐标轴文本在 DOM 中可读）与一个可切换语言的
 * `CaomeiConfigProvider`，属用例专属形态；独立入口可避免污染通用夹具的渲染器注册
 * （通用夹具按 canvas 断言画布像素）。形态同 `rich-text-editor-app.vue`。
 */

use([CanvasRenderer, SVGRenderer, BarChart, GridComponent, TooltipComponent])

const locale = ref<CaomeiLocale>('zh-CN')

function toggleLocale(): void {
    locale.value = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
}
</script>

<template>
    <main class="fixture">
        <CaomeiConfigProvider :locale="locale">
            <ChartThemeChart />
        </CaomeiConfigProvider>
        <button
            id="chart-locale-toggle"
            type="button"
            @click="toggleLocale"
        >
            切换语言
        </button>
    </main>
</template>

<style scoped>
.fixture {
    box-sizing: border-box;
    min-height: 100vh;
    padding: var(--caomei-space-4);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
}
</style>
