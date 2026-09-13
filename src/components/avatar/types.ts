import type { ComponentSize } from '../../types'

/**
 * 头像形状
 * @en Avatar shape
 */
export type AvatarShape = 'circle' | 'square'

export interface AvatarProps {
    /**
     * 图片地址；缺省或加载失败时显示回退内容
     * @en Image URL; shows fallback content when missing or failed to load
     */
    src?: string
    /**
     * 替代文本，用于 `img` 的 `alt` 与回退内容可访问名
     * @en Alternative text, used for the `img` `alt` and the fallback content's accessible name
     */
    alt?: string
    /**
     * 回退文本；缺省时取 `alt` 首字符
     * @en Fallback text; defaults to the first character of `alt`
     */
    fallback?: string
    /**
     * 尺寸
     * @en Size
     */
    size?: ComponentSize
    /**
     * 形状
     * @en Shape
     */
    shape?: AvatarShape
    /**
     * 回退内容延迟显示的毫秒数，避免图片加载瞬间闪现
     * @en Milliseconds to delay the fallback content, avoiding a flash while the image loads
     */
    delayMs?: number
}
