import type { ComponentSize, ComponentVariant } from '../../types'

export interface ButtonProps {
    /** 视觉变体 */
    variant?: ComponentVariant
    /** 尺寸 */
    size?: ComponentSize
    /** 是否禁用 */
    disabled?: boolean
    /** 是否处于加载态；加载时自动禁用交互 */
    loading?: boolean
    /** 是否撑满父容器宽度 */
    block?: boolean
    /** 无可见文本时的可访问名（映射 aria-label） */
    label?: string
    /** 原生 button 的 type */
    type?: 'button' | 'submit' | 'reset'
}
