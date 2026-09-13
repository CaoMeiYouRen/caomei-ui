import type { ComponentSize } from '../../types'

export interface ProgressBarProps {
    /**
     * 当前值；`null` / `undefined` 表示不确定进度
     * @en Current value; `null` / `undefined` means indeterminate
     */
    value?: number | null
    /**
     * 最大值，默认 100
     * @en Maximum value, 100 by default
     */
    max?: number
    /**
     * 尺寸
     * @en Size
     */
    size?: ComponentSize
    /**
     * 可访问名；默认取当前语言的「进度」文案
     * @en Accessible name; defaults to the current locale's "Progress" text
     */
    label?: string
}
