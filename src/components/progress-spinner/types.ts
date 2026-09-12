import type { ComponentSize } from '../../types'

export interface ProgressSpinnerProps {
    /** 尺寸 */
    size?: ComponentSize
    /** 可访问名；默认取当前语言的「加载中」文案 */
    label?: string
}
