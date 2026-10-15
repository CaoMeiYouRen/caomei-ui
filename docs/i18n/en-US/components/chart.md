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
    import { CanvasRenderer, SVGRenderer } from 'echarts/renderers'
    import { BarChart } from 'echarts/charts'
    import { GridComponent, TooltipComponent } from 'echarts/components'

    use([CanvasRenderer, SVGRenderer, BarChart, GridComponent, TooltipComponent])
    ```

    **The renderer must be registered too**: `initOptions.renderer` only selects which one to use — both `canvas` and `svg` renderers must be imported via `use()` (`canvas` is the default); the `svg` renderer emits real DOM, which is convenient for tests and screenshot diffs.

- Registration and chart instances share one kernel module (`vue-echarts` and this library both take the runtime from `echarts/core`), so no extra wiring is needed.
- `vue-echarts` styles are **loaded on demand** by the component; no manual `import` is required.
- The kernel is loaded after mount, so **SSR / SSG only renders the placeholder** and never touches the DOM on the server.

## Container and autoresize

`height` sets the container height (a CSS length); when omitted it falls back to `--caomei-chart-height`, then to `20rem` — the kernel needs a container with a **definite height**, otherwise the canvas is 0 px tall. `autoresize` defaults to `true`: the chart resizes when the container changes size (grid reflow, sidebar toggling, window resizing); pass `false` to opt out.

## Loading and degradation

While the kernel loads, a placeholder is rendered (`role="status"`); if loading fails, a `role="alert"` placeholder is rendered together with a console warning, and **nothing is thrown** — a missing optional peer never blanks the page. `label` is rendered as the container's `aria-label` and, **when non-empty, also gives the container `role="group"`** (a forwarded `aria-label` behaves the same; ARIA 1.2 forbids naming a role-less generic element, so neither is emitted when both are empty). If you forward an explicit `role` (such as `role="figure"`), **yours wins** — the role's suitability and naming compliance are then your responsibility. The **accessibility of the chart content itself** is ECharts' `aria` option and is not set by this component.

## Dark mode and theme linkage

The chart theme is **derived automatically** from the host `--caomei-*` tokens — no manual `echarts.registerTheme` required: series colours come from the semantic colours, text, axes, borders and the tooltip surface come from their matching semantic tokens, and the background stays transparent (the chart sits on the host background).

<demo
    vue="../examples/chart/themed.vue"
    ssg="true"
/>

| Chart value | Source token |
| --- | --- |
| Series palette | `--caomei-color-primary` / `success` / `warning` / `danger` / `text-muted` (in that order) |
| Text and secondary text | `--caomei-color-text` / `--caomei-color-text-muted` |
| Axis and split lines | `--caomei-color-border` |
| Tooltip surface | `--caomei-color-bg-elevated` |
| Font | `--caomei-font-sans` |

The fifth colour uses the **secondary text colour** rather than `--caomei-color-neutral-solid`: the latter does not adapt to dark mode (it stays `#52525b`), giving less than 3:1 non-text contrast on the dark background; the secondary text colour is `#6b7280` / `#a1a1aa` in light / dark and clears the bar in both.

Linkage covers **dark mode** and **theme presets**: the component watches the root element's `class` / `data-theme` / `data-scheme` / `data-preset` and re-derives plus repaints whenever they change, so it follows any skin switcher on the site or app. Pass `theme` (a name or an object) to take over entirely.

## Locale and data-format linkage

- **Kernel UI strings**: `locale` is derived from `useLocaleCode()` and injected through `initOptions` (`zh-CN` / `zh-TW` → `ZH`, `en-US` → `EN`, `ja-JP` → `JA`, `ko-KR` → `KO`; the latter two language packs are loaded on demand and fall back to a built-in locale if registration fails). **Switching the locale recreates the chart instance** — `locale` is an `echarts.init` parameter and cannot be updated in place, so instance-local state such as zoom and highlights resets.
- **Data text**: numbers, percentages, dates and units come from `useChartFormat()`, which follows the host locale. Wire it into `option` callbacks and the linkage is automatic:

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

You can also use the pure functions `formatChartNumber` / `formatChartPercent` / `formatChartDate` / `formatChartUnit` directly, or `createChartFormat(locale)` to get a full set bound to one locale. **Prefer the latter for charts with many data points**: calls without options (the common axis-label and tooltip path) memoise their `Intl` instances per locale, but calls with custom `options` are not cached, and building `Intl` per data point is known to be costly. Percentages take a **ratio** (`0.42` → `42%`); unit labels are **concatenated verbatim** (no conversion, no rewriting) because `Intl`'s `style: 'unit'` only accepts canonical unit identifiers and cannot express business notations such as `MB` or `req/s`.

## Pitfalls

- **An `option` cannot be moved over as-is**: the kernel is ECharts, not Chart.js — the configuration must be rewritten (see the migration table below).
- **The renderer must be registered too**: `initOptions.renderer` only selects it; both `canvas` and `svg` need `use()`, and a missing registration silently falls back to the default renderer.
- **Missing chart type / component registration**: the symptom is a **series that does not render** (the axes still draw) — this library does not probe at runtime, so register everything in the app entry.
- **The container needs a definite height**: otherwise the canvas is 0 px tall (defaults to `--caomei-chart-height`, then `20rem`).
- **Chart content accessibility is not set for you**: the container `label` is provided here, while ECharts' `aria` option is up to the consumer.

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
