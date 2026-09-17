import type { ComponentSize, ComponentTone, ComponentVariant } from '../../types'

export type ButtonIconPosition = 'start' | 'end'

export interface ButtonProps {
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
     * 图标相对文本的位置
     * @en Icon position relative to the label
     */
    iconPosition?: ButtonIconPosition
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
     * 原生 button 的 type
     * @en Native button type
     */
    type?: 'button' | 'submit' | 'reset'
}
