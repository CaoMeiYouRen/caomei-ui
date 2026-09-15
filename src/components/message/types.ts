import type { ComponentSize, ComponentTone } from '../../types'

/**
 * 视觉变体：`soft` / `solid` / `outline` 为带底色或描边的卡片形态，`simple` 为无背景 / 边框 / 内边距的行内形态
 * @en Visual variant: `soft` / `solid` / `outline` are card-like forms with a background or border, while
 * `simple` is an inline form with no background, border or padding
 */
export type MessageVariant = 'soft' | 'solid' | 'outline' | 'simple'

/**
 * 消息内容层的语义角色
 * @en Semantic role of the message content layer
 */
export type MessageRole = 'status' | 'alert'

export interface MessageProps {
    /**
     * 语义色调
     * @en Semantic tone
     */
    tone?: ComponentTone
    /**
     * 视觉变体
     * @en Visual variant
     */
    variant?: MessageVariant
    /**
     * 尺寸；`simple` 变体不消费内边距，仅影响字号与图标
     * @en Size; the `simple` variant consumes no padding and only affects font size and icon
     */
    size?: ComponentSize
    /**
     * 标题
     * @en Title
     */
    title?: string
    /**
     * 描述文本（也可用默认插槽）
     * @en Description text (also usable via the default slot)
     */
    description?: string
    /**
     * 是否显示语义图标；提供 `#icon` 插槽时以插槽为准
     * @en Whether to show the semantic icon; the `#icon` slot takes precedence when provided
     */
    icon?: boolean
    /**
     * 是否显示关闭按钮
     * @en Whether to show the close button
     */
    closable?: boolean
    /**
     * 关闭按钮可访问名；默认取当前语言的「关闭」文案
     * @en Accessible name of the close button; defaults to the current locale's "Close" text
     */
    closeLabel?: string
    /**
     * 消息内容层的语义角色：`status` 礼貌播报，`alert` 立即播报
     * @en Semantic role of the message content layer: `status` announces politely, `alert` announces immediately
     */
    role?: MessageRole
}
