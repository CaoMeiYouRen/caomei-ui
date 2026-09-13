/** 占位形状 */
export type SkeletonVariant = 'text' | 'circular' | 'rectangular'

/** 动画方式 */
export type SkeletonAnimation = 'pulse' | 'wave' | 'none'

export interface SkeletonProps {
    /** 形状，默认 text */
    variant?: SkeletonVariant
    /** 宽度，数字按 px，字符串原样 */
    width?: string | number
    /** 高度，数字按 px，字符串原样 */
    height?: string | number
    /** text 变体的行数，多行时末行自动收窄 */
    lines?: number
    /** 动画方式，默认 pulse */
    animation?: SkeletonAnimation
}
