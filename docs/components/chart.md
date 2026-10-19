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
    import { CanvasRenderer, SVGRenderer } from 'echarts/renderers'
    import { BarChart } from 'echarts/charts'
    import { GridComponent, TooltipComponent } from 'echarts/components'

    use([CanvasRenderer, SVGRenderer, BarChart, GridComponent, TooltipComponent])
    ```

    **渲染器也要注册**：`initOptions.renderer` 只是选择用哪一个，`canvas` / `svg` 渲染器均须经 `use()` 引入（默认 `canvas`）；`svg` 渲染器的产物是真 DOM，便于测试与截图比对。

- 注册与图表实例共享同一份内核模块（`vue-echarts` 与本库都从 `echarts/core` 取运行时），无需额外传参。
- `vue-echarts` 的样式由组件**按需加载**，宿主无需手工 `import`。
- 内核加载在挂载后发起，因此 **SSR / SSG 只输出占位**，不会在服务端触碰 DOM。

## 容器与自适应

`height` 指定容器高度（CSS 长度）；缺省取 `--caomei-chart-height`，再回退 `20rem`——内核要求容器具备**确定高度**，否则画布高度为 0。`autoresize` 默认 `true`：容器尺寸变化（栅格重排、侧栏开合、窗口缩放）时自动 `resize`；显式传 `false` 可关闭。

## 加载与降级

内核加载中渲染占位（`role="status"`）；加载失败时渲染 `role="alert"` 占位并输出控制台告警，**不抛出**——未安装可选 peer 时页面不会白屏。`label` 渲染为容器 `aria-label`，**非空即同时赋予 `role="group"`**（透传的 `aria-label` 同理；ARIA 1.2 禁止在无角色的通用元素上命名，故两者皆空时既不授角色也不输出该属性）。若显式透传 `role`（如 `role="figure"`），**以使用方为准**——此时角色的适用性与命名合规性由使用方承担。**图表内容自身的可访问性**由 ECharts 的 `aria` 配置项负责，本组件不代设。

## 暗色与主题联动

图表主题由组件按宿主 `--caomei-*` token **自动派生**，无需手工 `echarts.registerTheme`：系列配色取语义色，文字、坐标轴、边框与提示框底色取对应语义 token，背景保持透明（图表落在宿主背景之上）。

<demo
    vue="../examples/chart/themed.vue"
    ssg="true"
/>

| 图表取值 | 来源 token |
| --- | --- |
| 系列配色 | `--caomei-color-primary` / `success` / `warning` / `danger` / `text-muted`（顺序即配色顺序） |
| 文字与次级文字 | `--caomei-color-text` / `--caomei-color-text-muted` |
| 轴线与分割线 | `--caomei-color-border` |
| 提示框底色 | `--caomei-color-bg-elevated` |
| 字体 | `--caomei-font-sans` |

第 5 色取**次级文本色**而非 `--caomei-color-neutral-solid`：后者不随暗色调整（恒为 `#52525b`），在暗色底上非文本对比度不足 3:1；次级文本色在亮 / 暗两档分别为 `#6b7280` / `#a1a1aa`，两档均达标。

联动范围涵盖**暗色**与**主题预设**：组件观察根元素的 `class` / `data-theme` / `data-scheme` / `data-preset`，任一变化即重算主题并重绘——与站点 / 应用的换肤按钮天然同步。需要完全接管时传 `theme`（主题名或主题对象）即可整体覆盖。

## 语言与数据格式联动

- **内核界面文案**：`locale` 由 `useLocaleCode()` 派生并经 `initOptions` 注入（`zh-CN` / `zh-TW` → `ZH`、`en-US` → `EN`、`ja-JP` → `JA`、`ko-KR` → `KO`、`es-ES` → `ES`、`fr-FR` → `FR`、`de-DE` → `DE`、`ru-RU` → `RU`、`pt-BR` → `PT-br`；除内置 `ZH` / `EN` 外的 7 门语言包按需动态导入，注册失败回落内置语言）。**语言切换会重建图表实例**——`locale` 是 `echarts.init` 的初始化参数、无法热更新，实例内的缩放 / 高亮等临时状态会随之重置。
- **数据文本**：数字 / 百分比 / 日期 / 单位由 `useChartFormat()` 提供，跟随宿主语言，把它接进 `option` 的回调即可联动：

    ```ts
    import { useChartFormat } from 'caomei-ui'

    const { formatDate, formatUnit } = useChartFormat()

    const option = {
        xAxis: { type: 'category', data: dates, axisLabel: { formatter: (value: string) => formatDate(new Date(value)) } },
        yAxis: { type: 'value', axisLabel: { formatter: (value: number) => formatUnit(value, 'MB') } },
        series: [{ type: 'bar', data: values }],
    }
    ```

<demo
    vue="../examples/chart/locale.vue"
    ssg="true"
/>

也可直接使用纯函数 `formatChartNumber` / `formatChartPercent` / `formatChartDate` / `formatChartUnit`，或用 `createChartFormat(locale)` 一次性取一组固定语言的格式化器。**数据点很多时建议用后者**：无参调用（轴标签与 tooltip 的常见路径）内部已按语言记忆化 `Intl` 实例，但带自定义 `options` 的调用不做缓存，逐点构造 `Intl` 属已知重操作。百分比的入参是**比值**（`0.42` → `42%`）；单位标签**原样拼接**（不换算、不改写），因为 `Intl` 的 `style: 'unit'` 只接受规范化单位标识，无法承载 `MB` / `req/s` 一类业务写法。

## 常见陷阱

- **`option` 结构不可直接搬运**：内核是 ECharts 而非 Chart.js，迁移须重写配置（见下方迁移表）。
- **渲染器同样要注册**：`initOptions.renderer` 只负责选择，`canvas` / `svg` 都需 `use()` 引入，漏注册会静默回落默认渲染器。
- **图表类型 / 组件漏注册**：现象是**系列不渲染**（坐标轴仍绘制）——本库不做运行期探测，请在应用入口统一注册。
- **容器必须有确定高度**：否则画布高度为 0（缺省由 `--caomei-chart-height` 回退 `20rem`）。
- **图表内容的可访问性不代设**：容器级 `label` 由本组件提供，ECharts 的 `aria` 配置项由使用方按需开启。

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
