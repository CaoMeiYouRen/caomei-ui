import type { Component } from 'vue'

/**
 * 图表内核的加载与最小接口。
 *
 * 本模块刻意**不静态引用** `vue-echarts` / `echarts` 的类型或运行时值：两者是可选 peer，
 * 未安装时既不能阻断构建，也不能让包根 `.d.ts` 因缺类型而无法解析。所有访问都经动态
 * `import()`，并在包装组件内做失败降级（同 `CaomeiRichTextEditor` 的形态）。
 */

/** 内核中包装层实际使用到的最小接口。 */
export interface ChartModule {
    /** 图表组件（`vue-echarts` 的默认导出 `ECharts`） */
    VChart: Component
}

/**
 * 按需加载图表内核与样式（先样式后内核，避免首帧无样式闪烁）。
 *
 * `echarts` 的按需注册由使用方完成（`import { use } from 'echarts/core'` + `use([...])`）：
 * 本组件不代注册任何图表类型 / 组件，以免把全量内核带进下游产物。
 *
 * @throws 可选 peer `vue-echarts`（或其 peer `echarts`）未安装或加载失败时抛出，由包装组件降级为占位。
 */
export async function loadChart(): Promise<ChartModule> {
    await import('vue-echarts/style.css')
    const module = await import('vue-echarts')
    return {
        VChart: module.default as unknown as Component,
    }
}
