# Chart 图表

图表封装用于在页面内渲染 Apache ECharts 图表：`option` 原样透传、容器尺寸变化自动 `resize`、内核**按需加载**并在缺失时降级为占位。

> **前置依赖：使用前须先安装 `vue-echarts` 与 `echarts`**
>
> ```bash
> pnpm add vue-echarts echarts
> ```
>
> 两者均为**可选 peer 依赖**（本库不强制安装，未使用本组件的下游不受影响）。**未安装就引入本组件**会在打包期解析失败（本仓以 esbuild 实测：`Could not resolve "vue-echarts/style.css"`）；**包根与未使用本组件的下游不受影响**——包根不静态引用内核，模块会被 tree-shaking 丢弃。详见下文「依赖与按需注册」。

## 基础用法

`option` 为 ECharts 配置对象，本组件**只透传、不读取其字段**；图表类型与组件由使用方按需注册。

<demo
    vue="../examples/chart/basic.vue"
    ssg="true"
/>

## 依赖与按需注册

- **本库不代注册任何图表类型 / 组件**：注册是使用方职责，只注册用到的部分才能把内核体积压到最小（全量 `echarts` 约 1MB，按需注册通常在半量以下）：

    ```ts
    import { use } from 'echarts/core'
    import { CanvasRenderer } from 'echarts/renderers'
    import { BarChart } from 'echarts/charts'
    import { GridComponent, TooltipComponent } from 'echarts/components'

    use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])
    ```

- 注册与图表实例共享同一份内核模块（`vue-echarts` 与本库都从 `echarts/core` 取运行时），无需额外传参。
- `vue-echarts` 的样式由组件**按需加载**，宿主无需手工 `import`。
- 内核加载在挂载后发起，因此 **SSR / SSG 只输出占位**，不会在服务端触碰 DOM。

## 容器与自适应

`height` 指定容器高度（CSS 长度）；缺省取 `--caomei-chart-height`，再回退 `20rem`——内核要求容器具备**确定高度**，否则画布高度为 0。`autoresize` 默认 `true`：容器尺寸变化（栅格重排、侧栏开合、窗口缩放）时自动 `resize`；显式传 `false` 可关闭。

## 加载与降级

内核加载中渲染占位（`role="status"`）；加载失败时渲染 `role="alert"` 占位并输出控制台告警，**不抛出**——未安装可选 peer 时页面不会白屏。`label` 渲染为容器 `aria-label`，**非空即同时赋予 `role="group"`**（透传的 `aria-label` 同理；ARIA 1.2 禁止在无角色的通用元素上命名，故两者皆空时既不授角色也不输出该属性）。若显式透传 `role`（如 `role="figure"`），**以使用方为准**——此时角色的适用性与命名合规性由使用方承担。**图表内容自身的可访问性**由 ECharts 的 `aria` 配置项负责，本组件不代设。

## 从 PrimeVue 迁移

| PrimeVue | 本组件 |
| --- | --- |
| `<Chart type="bar" :data="…" :options="…" />`（包装 **Chart.js**） | `CaomeiChart` 的 `option`（包装 **ECharts**） |
| `data` / `options` 双入参（Chart.js 数据集模型） | 合并为单一 `option`（ECharts 配置对象）：数据集、坐标轴与系列都在其中 |
| `type`（Chart.js 图表类型字符串） | **无对应 prop**：类型写在 `option.series[].type`，且需在使用方注册对应图表模块 |
| `plugins`（Chart.js 插件） | **无对应 prop**：改用 ECharts 的组件注册与 `option` 配置 |
| `width` / `height`（Canvas 尺寸） | `height`（CSS 长度）+ 容器宽度自适应 |
| `canvasProps` / `pt` / `dt` / `unstyled` | 未实现（样式经组件根类与 CSS 变量覆盖） |

**已知差异（有意）**：① 内核不同（ECharts 不等于 Chart.js），**`option` 结构不可直接搬运**，迁移需重写配置；② 图表类型与组件必须由使用方按需注册，本库不代注册（体积控制）；③ 本组件不做数据格式转换，`option` 原样透传。**本库新增**：`autoresize`（默认开启）、`label`、`loading`、`group` 与 `initOptions` / `updateOptions` / `theme` 逃生舱。

<ComponentApi name="chart" />
