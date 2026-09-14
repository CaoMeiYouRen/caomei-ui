export type DividerOrientation = 'horizontal' | 'vertical'

export type DividerAlign = 'left' | 'center' | 'right'

export type DividerVariant = 'solid' | 'dashed' | 'dotted'

export interface DividerProps {
    /**
     * 方向
     * @en Orientation
     */
    orientation?: DividerOrientation
    /**
     * 带内容时内容的对齐位置（仅水平方向生效）
     * @en Alignment of the content when a slot is provided (horizontal only)
     */
    align?: DividerAlign
    /**
     * 线条样式
     * @en Line style
     */
    variant?: DividerVariant
}
