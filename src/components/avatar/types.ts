import type { ComponentSize } from '../../types'

export type AvatarShape = 'circle' | 'square'

export interface AvatarProps {
    /** 图片地址；缺省或加载失败时显示回退内容 */
    src?: string
    /** 替代文本，用于 `img` 的 `alt` 与回退内容可访问名 */
    alt?: string
    /** 回退文本；缺省时取 `alt` 首字符 */
    fallback?: string
    /** 尺寸 */
    size?: ComponentSize
    /** 形状 */
    shape?: AvatarShape
    /** 回退内容延迟显示的毫秒数，避免图片加载瞬间闪现 */
    delayMs?: number
}
