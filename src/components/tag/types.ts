import type { ComponentSize, ComponentTone } from '../../types'

/**
 * 视觉变体
 * @en Visual variant
 */
export type TagVariant = 'soft' | 'solid' | 'outline'

export interface TagProps {
    /**
     * 语义色调
     * @en Semantic tone
     */
    tone?: ComponentTone
    /**
     * 视觉变体
     * @en Visual variant
     */
    variant?: TagVariant
    /**
     * 尺寸
     * @en Size
     */
    size?: ComponentSize
    /**
     * 是否为胶囊形态（圆角取 `--caomei-radius-full`）；默认 false
     * @en Whether to use the pill shape (`--caomei-radius-full`); defaults to false
     */
    rounded?: boolean
    /**
     * 是否显示关闭按钮
     * @en Whether to show the close button
     */
    closable?: boolean
    /**
     * 是否禁用（同时禁用关闭按钮）
     * @en Whether it is disabled (also disables the close button)
     */
    disabled?: boolean
    /**
     * 关闭按钮的可访问标签；默认取当前语言的「删除」文案
     * @en Accessible label of the close button; defaults to the current locale's "Remove" text
     */
    closeLabel?: string
}
