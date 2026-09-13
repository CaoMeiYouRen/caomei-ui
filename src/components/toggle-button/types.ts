import type { ComponentSize } from '../../types'

export interface ToggleButtonProps {
    /**
     * 是否禁用
     * @en Whether the toggle button is disabled
     */
    disabled?: boolean
    /**
     * 尺寸
     * @en Size
     */
    size?: ComponentSize
    /**
     * 无可见文本时的可访问名，映射 aria-label
     * @en Accessible name when there is no visible text, maps to aria-label
     */
    label?: string
}
