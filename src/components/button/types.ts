import type { ComponentSize, ComponentVariant } from '../../types'

export interface ButtonProps {
    /**
     * 视觉变体
     * @en Visual variant
     */
    variant?: ComponentVariant
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
     * 无可见文本时的可访问名（映射 aria-label）
     * @en Accessible name when there is no visible text (maps to aria-label)
     */
    label?: string
    /**
     * 原生 button 的 type
     * @en Native button type
     */
    type?: 'button' | 'submit' | 'reset'
}
