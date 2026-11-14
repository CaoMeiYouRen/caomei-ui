import type { ComponentSize, ComponentTone, ComponentVariant } from '../../types'
import type { TooltipProp } from '../tooltip/types'

export type ButtonIconPosition = 'start' | 'end'

export interface ButtonProps {
    /**
     * 是否为纯图标按钮（方形、图标居中、不渲染文本内容）
     * 开启时需配合 `label` 提供可访问名（映射 aria-label）
     * @en Whether the button is icon-only (square, centered icon, no text content).
     * When enabled, `label` is required for accessible name (maps to aria-label).
     */
    iconOnly?: boolean
    /**
     * 图标相对文本的位置；`iconOnly` 时忽略
     * @en Icon position relative to the label; ignored when `iconOnly` is true
     */
    iconPosition?: ButtonIconPosition
    /**
     * 视觉变体：`primary` 实底、`secondary` 描边、`ghost` 无底色
     * @en Visual variant: `primary` solid, `secondary` outlined, `ghost` plain
     */
    variant?: ComponentVariant
    /**
     * 语义色调；不设置时沿用变体默认配色
     * @en Semantic tone; falls back to the variant's default colors when unset
     */
    tone?: ComponentTone
    /**
     * 尺寸
     * @en Size
     */
    size?: ComponentSize
    /**
     * 是否禁用
     * @en Whether the button is disabled
     */
    disabled?: boolean
    /**
     * 是否处于加载态；加载时自动禁用交互
     * @en Whether the button is loading; interaction is disabled while loading
     */
    loading?: boolean
    /**
     * 是否撑满父容器宽度
     * @en Whether the button fills the parent width
     */
    block?: boolean
    /**
     * 是否为胶囊圆角
     * @en Whether the button uses pill radius
     */
    rounded?: boolean
    /**
     * 角标内容；提供非空字符串时渲染在按钮右上角（对齐 PrimeVue `:badge`）
     * @en Badge content; a non-empty string renders a badge at the button's top-right corner
     * (matching PrimeVue's `:badge`)
     */
    badge?: string
    /**
     * 角标色调；默认 `neutral`（对应 PrimeVue `badgeSeverity` 默认值 `secondary`）
     * @en Badge tone; defaults to `neutral` (matching PrimeVue's default `secondary` badge severity)
     */
    badgeTone?: ComponentTone
    /**
     * 无可见文本时的可访问名（映射 aria-label）
     * @en Accessible name when there is no visible text (maps aria-label)
     */
    label?: string
    /**
     * 内建提示。
     *
     * `true` 取 `label` / 可见文本，字符串直接作为提示内容，对象可分别指定 `content` 与 `mode`。
     * 默认触发模式：`iconOnly` 或显式提供内容时「始终显示」，只有「文本按钮 + `true`」才是
     * 「仅在文字被截断时显示」。
     * 设置后不再向 DOM 透传原生 `title`（其值作为提示内容的兜底），避免系统提示与内建提示双显。
     * @en Built-in tooltip. `true` derives the text from `label` / visible text, a string is the content, and the object form sets `content` and `mode` separately. `iconOnly` defaults to "always" (text from the accessible name) and text buttons default to "only when the text is truncated". Once set, the native `title` is no longer forwarded to the DOM (its value backs the tooltip content) so the system tooltip does not show alongside.
     */
    tooltip?: TooltipProp
    /**
     * 原生 button 的 type
     * @en Native button type
     */
    type?: 'button' | 'submit' | 'reset'
}
