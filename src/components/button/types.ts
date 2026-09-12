import type { ComponentSize, ComponentVariant } from '../../types'

export interface ButtonProps {
    /** 视觉变体 */
    variant?: ComponentVariant
    /** 尺寸 */
    size?: ComponentSize
    /** 是否禁用 */
    disabled?: boolean
    /** 原生 button type */
    type?: 'button' | 'submit' | 'reset'
}
