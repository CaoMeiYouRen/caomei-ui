import type { ComponentSize } from '../../types'

export interface ToggleButtonProps {
    /** 是否禁用 */
    disabled?: boolean
    /** 尺寸 */
    size?: ComponentSize
    /** 无可见文本时的可访问名，映射 aria-label */
    label?: string
}
