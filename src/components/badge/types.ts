import type { ComponentSize, ComponentTone } from '../../types'

export type BadgeVariant = 'soft' | 'solid' | 'outline'

export interface BadgeProps {
    /** 语义色调 */
    tone?: ComponentTone
    /** 视觉变体 */
    variant?: BadgeVariant
    /** 尺寸 */
    size?: ComponentSize
    /** 显示的值（数字超出 max 时显示 `max+`） */
    value?: string | number
    /** 数值上限，超出时显示 `max+` */
    max?: number
    /** 仅显示圆点，不显示数值 */
    dot?: boolean
    /** 可访问名；圆点模式建议提供，数值模式会覆盖可见文本的朗读内容 */
    label?: string
}
