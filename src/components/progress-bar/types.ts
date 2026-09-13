import type { ComponentSize } from '../../types'

export interface ProgressBarProps {
    /** 当前值；`null` / `undefined` 表示不确定进度 */
    value?: number | null
    /** 最大值，默认 100 */
    max?: number
    /** 尺寸 */
    size?: ComponentSize
    /** 可访问名；默认取当前语言的「进度」文案 */
    label?: string
}
