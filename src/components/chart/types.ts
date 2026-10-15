/**
 * 图表配置对象（结构与 `echarts` 的 `EChartsOption` 兼容）。
 *
 * 取**最宽的对象类型**而非 `Record<string, unknown>`：后者要求索引签名，会把下游以
 * `EChartsOption`（interface 组合）标注的变量挡在类型面之外。本组件对 `option` **只透传、
 * 不读取内部字段**，故不在此自定义 schema——精确类型检查留给下游的 `EChartsOption`。
 * @en Chart option object (structurally compatible with `echarts`'s `EChartsOption`). The widest
 * object type is used instead of `Record<string, unknown>`, whose index-signature requirement would
 * reject downstream variables typed as `EChartsOption` (a composition of interfaces). This component
 * only forwards `option` without reading its fields, so no schema is redefined here — precise typing
 * stays with the downstream `EChartsOption`.
 */
export type ChartOption = object

export interface ChartProps {
    /**
     * 图表配置对象，原样透传给 ECharts（本组件不读取 / 不改写其字段）
     * @en Chart option forwarded verbatim to ECharts (this component neither reads nor rewrites it)
     */
    option: ChartOption
    /**
     * 容器高度（CSS 长度，如 `'20rem'`）；缺省取 `--caomei-chart-height`，再回退 `20rem`
     * @en Container height (a CSS length such as `'20rem'`); falls back to `--caomei-chart-height`,
     * then to `20rem`
     */
    height?: string
    /**
     * 容器尺寸变化时自动 `resize`（默认 `true`）；关闭后需自行调用实例方法
     * @en Automatically resize when the container size changes (default `true`); when disabled,
     * call the instance method yourself
     */
    autoresize?: boolean
    /**
     * 是否显示加载遮罩（透传内核同名能力）
     * @en Whether to show the loading mask (forwarded to the kernel's same-named capability)
     */
    loading?: boolean
    /**
     * 连通多个图表实例（透传内核同名能力），常用于同一页面内的联动高亮
     * @en Connects chart instances (forwarded to the kernel's same-named capability), typically for
     * linked highlighting within one page
     */
    group?: string
    /**
     * `echarts.init` 的初始化参数（如 `renderer` / `locale`）；**原样透传**，本组件不注入、不合并缺省值
     * @en Options for `echarts.init` (such as `renderer` / `locale`); forwarded **verbatim** — this
     * component injects no defaults and merges nothing
     */
    initOptions?: Record<string, unknown>
    /**
     * 配置更新行为（透传内核同名能力），如 `notMerge` / `lazyUpdate` / `replaceMerge`
     * @en Update behaviour (forwarded to the kernel's same-named capability), e.g. `notMerge` /
     * `lazyUpdate` / `replaceMerge`
     */
    updateOptions?: Record<string, unknown>
    /**
     * ECharts 主题（主题名或主题对象）；缺省不传，使用 ECharts 默认主题
     * @en ECharts theme (a name or a theme object); when omitted, ECharts' default theme applies
     */
    theme?: string | object
    /**
     * 可访问名，渲染为容器 `aria-label`；非空时同时赋予容器 `role="group"`（显式透传的 `role` 优先，
     * 见下）。缺省不输出，此时透传的 `aria-label` 同样生效（ARIA 1.2 禁止在无角色的通用元素上命名，
     * 故两者皆空时不输出该属性）
     * @en Accessible name rendered as the container's `aria-label`; a non-empty name also gives the
     * container `role="group"` (an explicitly forwarded `role` wins — see the component page). Not
     * rendered by default, in which case a forwarded `aria-label` applies instead (ARIA 1.2 forbids
     * naming a role-less generic element, so the attribute is omitted when both are empty)
     */
    label?: string
}
