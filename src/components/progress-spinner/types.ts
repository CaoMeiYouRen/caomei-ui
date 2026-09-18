import type { ComponentSize } from '../../types'

export interface ProgressSpinnerProps {
    /**
     * 尺寸
     * @en Size
     */
    size?: ComponentSize
    /**
     * 轨道（圆环）宽度。
     *
     * 数字按 px 处理（`2` → `2px`）；纯数字字符串同数字处理（`'2'` → `2px`，对齐 PrimeVue 的 `strokeWidth` 写法）；两者均要求 `0 ≤ 值 ≤ 1000`；
     * 其余字符串须为合法 `border-width`（`<length>` 或 `thin` / `medium` / `thick`，`%` 非法）并原样使用。
     * 未提供、为空串或为非法值时按 `size` 档位回退：`sm` / `md` 为 `2px`、`lg` 为 `3px`
     * （与 CSS 变量 `--caomei-progress-spinner-stroke` 的档位默认一致）。提供后**所有尺寸共用该值**，不再随档位联动。
     *
     * 与 PrimeVue 的语义差异：PrimeVue 的 `strokeWidth` 是 SVG 用户单位（随渲染尺寸等比缩放），本库是**不随组件尺寸缩放**的 CSS 长度。
     * @en Track (ring) width. A number is treated as px (`2` → `2px`) and so is a numeric string (`'2'` → `2px`, matching PrimeVue's `strokeWidth` style); both must satisfy `0 ≤ value ≤ 1000`; any other string must be a valid `border-width` (`<length>` or `thin` / `medium` / `thick`; `%` is invalid) and is used as-is. When omitted, empty or invalid it falls back to the `size` step default (`sm` / `md` → `2px`, `lg` → `3px`, matching the `--caomei-progress-spinner-stroke` CSS variable's step defaults). Once provided, **all sizes share that value** instead of following the step. Semantic difference from PrimeVue: its `strokeWidth` is in SVG user units (scales with the rendered size), whereas this is a CSS length that does not scale with the component size.
     */
    strokeWidth?: number | string
    /**
     * 可访问名；优先级高于透传的 `aria-label`，两者都未提供时取当前语言的「加载中」文案
     * @en Accessible name; takes precedence over a forwarded `aria-label`, falling back to the current locale's "Loading" text when neither is given
     */
    label?: string
}
