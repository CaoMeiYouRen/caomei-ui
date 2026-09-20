export type ButtonGroupOrientation = 'horizontal' | 'vertical'

export interface ButtonGroupProps {
    /**
     * 排列方向
     * @en Group orientation
     */
    orientation?: ButtonGroupOrientation
    /**
     * 分组可访问名（映射 `aria-label`）；默认不设置，由使用方根据上下文提供
     * @en Group accessible name (maps to `aria-label`); not set by default, provided by the consumer based on context
     */
    groupLabel?: string
}
