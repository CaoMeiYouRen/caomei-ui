import type { ComponentTone } from '../../types'

/**
 * 视觉变体：**不含 `simple`**
 *
 * 行内无框形态（无背景 / 边框 / 内边距）用于字段校验等就地提示，属 `CaomeiMessage` 的场景；
 * Alert 的语义是「内联常驻提示」，恒为容器形态。需要 `simple` 形态请直接用 `CaomeiMessage`。
 * @en Visual variant: **`simple` is intentionally absent**. The inline, chrome-free form belongs to
 * `CaomeiMessage` (field-level hints); an alert is a persistent inline notice and always renders as a
 * container. Use `CaomeiMessage` directly when the `simple` form is required.
 */
export type AlertVariant = 'soft' | 'solid' | 'outline'

export interface AlertProps {
    /**
     * 语义色调
     * @default 'neutral'
     * @en Semantic tone
     */
    tone?: ComponentTone
    /**
     * 视觉变体（`soft` / `solid` / `outline`，无 `simple`）
     * @default 'soft'
     * @en Visual variant (`soft` / `solid` / `outline`, no `simple`)
     */
    variant?: AlertVariant
    /**
     * 标题（独立成行、加粗）
     * @en Title (its own line, bold)
     */
    title?: string
    /**
     * 描述文本（也可用默认插槽）
     * @en Description text (also usable via the default slot)
     */
    description?: string
    /**
     * 是否显示语义图标；提供 `#icon` 插槽时以插槽为准
     * @default true
     * @en Whether to show the semantic icon; the `#icon` slot takes precedence when provided
     */
    icon?: boolean
    /**
     * 是否显示关闭按钮（常驻提示通常不关闭）
     * @default false
     * @en Whether to show the close button (persistent notices usually stay open)
     */
    closable?: boolean
    /**
     * 关闭按钮可访问名；默认取当前语言的「关闭」文案
     * @en Accessible name of the close button; defaults to the current locale's "Close" text
     */
    closeLabel?: string
}
