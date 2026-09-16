import type { ComponentSize, ComponentTone } from '../../types'

/**
 * 视觉变体
 * @en Visual variant
 */
export type BadgeVariant = 'soft' | 'solid' | 'outline'

export interface BadgeProps {
    /**
     * 语义色调
     * @en Semantic tone
     */
    tone?: ComponentTone
    /**
     * 视觉变体
     * @en Visual variant
     */
    variant?: BadgeVariant
    /**
     * 尺寸
     * @en Size
     */
    size?: ComponentSize
    /**
     * 显示的值（数字超出 max 时显示 `max+`）
     * @en Displayed value (shows `max+` when a number exceeds max)
     */
    value?: string | number | null
    /**
     * 数值上限，超出时显示 `max+`
     * @en Numeric maximum; shows `max+` when exceeded
     */
    max?: number
    /**
     * 仅显示圆点，不显示数值
     * @en Show only a dot without a value
     */
    dot?: boolean
    /**
     * 可访问名；圆点模式建议提供，数值模式会覆盖可见文本的朗读内容
     * @en Accessible name; recommended in dot mode, and in numeric mode it overrides the spoken text of the visible value
     */
    label?: string
}
