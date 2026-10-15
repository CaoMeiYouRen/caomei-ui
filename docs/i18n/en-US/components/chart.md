# Chart

The chart wrapper renders Apache ECharts charts inside a page: `option` is forwarded verbatim, the container resizes automatically, and the kernel is **loaded on demand** with a placeholder fallback when it is missing.

> **Prerequisite: install `vue-echarts` and `echarts` before use**
>
> ```bash
> pnpm add vue-echarts echarts
> ```
>
> Both are **optional peer dependencies** (this library never installs them for you, and downstreams that do not use this component are unaffected). **Importing this component without them** fails to resolve at bundle time (verified in this repo with esbuild: `Could not resolve "vue-echarts/style.css"`). **The package root and downstreams that do not use this component are unaffected** — the root never imports the kernel statically, so the module is tree-shaken away. See “Dependencies and on-demand registration” below.

## Basic usage

`option` is an ECharts option object; this component **only forwards it and never reads its fields**. Chart types and components are registered on demand by the consumer.

<demo
    vue="../examples/chart/basic.vue"
    ssg="true"
/>

## Dependencies and on-demand registration

- **This library registers no chart type or component for you**: registration is the consumer's job, and registering only what you use is what keeps the kernel small (the full `echarts` bundle is about 1 MB; on-demand registration is usually well under half):

    ```ts
    import { use } from 'echarts/core'
    import { CanvasRenderer } from 'echarts/renderers'
    import { BarChart } from 'echarts/charts'
    import { GridComponent, TooltipComponent } from 'echarts/components'

    use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])
    ```

- Registration and chart instances share one kernel module (`vue-echarts` and this library both take the runtime from `echarts/core`), so no extra wiring is needed.
- `vue-echarts` styles are **loaded on demand** by the component; no manual `import` is required.
- The kernel is loaded after mount, so **SSR / SSG only renders the placeholder** and never touches the DOM on the server.

## Container and autoresize

`height` sets the container height (a CSS length); when omitted it falls back to `--caomei-chart-height`, then to `20rem` — the kernel needs a container with a **definite height**, otherwise the canvas is 0 px tall. `autoresize` defaults to `true`: the chart resizes when the container changes size (grid reflow, sidebar toggling, window resizing); pass `false` to opt out.

## Loading and degradation

While the kernel loads, a placeholder is rendered (`role="status"`); if loading fails, a `role="alert"` placeholder is rendered together with a console warning, and **nothing is thrown** — a missing optional peer never blanks the page. `label` is rendered as the container's `aria-label` and, **when non-empty, also gives the container `role="group"`** (a forwarded `aria-label` behaves the same; ARIA 1.2 forbids naming a role-less generic element, so neither is emitted when both are empty). If you forward an explicit `role` (such as `role="figure"`), **yours wins** — the role's suitability and naming compliance are then your responsibility. The **accessibility of the chart content itself** is ECharts' `aria` option and is not set by this component.

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `<Chart type="bar" :data="…" :options="…" />` (wraps **Chart.js**) | `CaomeiChart`'s `option` (wraps **ECharts**) |
| `data` / `options` pair (Chart.js dataset model) | Merged into a single `option` (an ECharts option object) holding datasets, axes and series |
| `type` (a Chart.js chart type string) | **No counterpart prop**: the type lives in `option.series[].type`, and the matching chart module must be registered by the consumer |
| `plugins` (Chart.js plugins) | **No counterpart prop**: use ECharts component registration and `option` instead |
| `width` / `height` (canvas size) | `height` (a CSS length) plus automatic container-width tracking |
| `canvasProps` / `pt` / `dt` / `unstyled` | Not implemented (style through the root class and CSS variables) |

**Known intentional differences**: ① the kernel differs (ECharts is not Chart.js), so **an `option` cannot be moved over as-is** — the configuration must be rewritten; ② chart types and components must be registered on demand by the consumer, this library registers none (bundle-size control); ③ this component performs no data transformation — `option` is forwarded verbatim. **Added by this library**: `autoresize` (on by default), `label`, `loading`, `group`, and the `initOptions` / `updateOptions` / `theme` escape hatches.

<ComponentApi name="chart" />
