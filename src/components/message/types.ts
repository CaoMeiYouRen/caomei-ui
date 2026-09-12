import type { ComponentTone } from '../../types'

export type MessageVariant = 'soft' | 'solid' | 'outline'

export type MessageRole = 'status' | 'alert'

export interface MessageProps {
    /** 语义色调 */
    tone?: ComponentTone
    /** 视觉变体 */
    variant?: MessageVariant
    /** 标题 */
    title?: string
    /** 描述文本（也可用默认插槽） */
    description?: string
    /** 是否显示语义图标；提供 `#icon` 插槽时以插槽为准 */
    icon?: boolean
    /** 是否显示关闭按钮 */
    closable?: boolean
    /** 关闭按钮可访问名；默认取当前语言的「关闭」文案 */
    closeLabel?: string
    /** 消息内容层的语义角色：`status` 礼貌播报，`alert` 立即播报 */
    role?: MessageRole
}
