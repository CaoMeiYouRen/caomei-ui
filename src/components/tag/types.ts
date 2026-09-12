import type { ComponentSize, ComponentTone } from '../../types'

export type TagVariant = 'soft' | 'solid' | 'outline'

export interface TagProps {
    /** 语义色调 */
    tone?: ComponentTone
    /** 视觉变体 */
    variant?: TagVariant
    /** 尺寸 */
    size?: ComponentSize
    /** 是否显示关闭按钮 */
    closable?: boolean
    /** 是否禁用（同时禁用关闭按钮） */
    disabled?: boolean
    /** 关闭按钮的可访问标签；默认取当前语言的「删除」文案 */
    closeLabel?: string
}
