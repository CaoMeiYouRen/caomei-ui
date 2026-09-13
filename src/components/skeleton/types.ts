/**
 * 占位形状
 * @en Placeholder shape
 */
export type SkeletonVariant = 'text' | 'circular' | 'rectangular'

/**
 * 动画方式
 * @en Animation type
 */
export type SkeletonAnimation = 'pulse' | 'wave' | 'none'

export interface SkeletonProps {
    /**
     * 形状，默认 text
     * @en Shape, text by default
     */
    variant?: SkeletonVariant
    /**
     * 宽度，数字按 px，字符串原样
     * @en Width; numbers are in px, strings are used as-is
     */
    width?: string | number
    /**
     * 高度，数字按 px，字符串原样
     * @en Height; numbers are in px, strings are used as-is
     */
    height?: string | number
    /**
     * text 变体的行数，多行时末行自动收窄
     * @en Number of lines for the text variant; the last line narrows automatically with multiple lines
     */
    lines?: number
    /**
     * 动画方式，默认 pulse
     * @en Animation type, pulse by default
     */
    animation?: SkeletonAnimation
}
