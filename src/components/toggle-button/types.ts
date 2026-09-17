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
     * 按下态显示文本；仅在 `offLabel` 同时提供时生效
     * @en Label shown while pressed; only takes effect when `offLabel` is also provided
     */
    onLabel?: string
    /**
     * 未按下态显示文本；仅在 `onLabel` 同时提供时生效
     * @en Label shown while not pressed; only takes effect when `onLabel` is also provided
     */
    offLabel?: string
    /**
     * 无可见文本时的可访问名，映射 aria-label
     * @en Accessible name when there is no visible text, maps to aria-label
     */
    label?: string
}
