export type DialogSize = 'sm' | 'md' | 'lg'

/**
 * 响应式断点宽度：键为视口最大宽度（如 `'640px'`），值为该视口上限内生效的面板宽度（如 `'100vw'`）。
 *
 * 命中多个断点时以**最窄档**为准（与键顺序无关）；键须为 px 长度、值须为受限的安全 CSS 长度，非法条目忽略。
 * @en Responsive breakpoint widths: keys are viewport max-widths (such as `'640px'`), values are the panel width in effect at or below that viewport (such as `'100vw'`).
 *
 * When several breakpoints match, the **narrowest** wins regardless of key order; keys must be px lengths and values must be restricted safe CSS lengths, invalid entries are ignored.
 */
export type DialogBreakpoints = Record<string, string>

export interface DialogProps {
    /**
     * 对话框标题，同时作为无障碍名称；缺省时回退内建「对话框」文案作为不可见可访问名
     * @en Dialog title, also used as the accessible name; when omitted, the built-in "Dialog" text is used as a visually hidden accessible name
     */
    title?: string
    /**
     * 描述文本，用于无障碍
     * @en Description text for accessibility
     */
    description?: string
    /**
     * 尺寸
     * @en Size
     */
    size?: DialogSize
    /**
     * 是否显示右上角关闭按钮
     * @en Whether to show the close button in the top-right corner
     */
    closable?: boolean
    /**
     * 关闭按钮的可访问标签；默认取当前语言的「关闭」文案
     * @en Accessible label of the close button; defaults to the current locale's "Close" text
     */
    closeLabel?: string
    /**
     * 点击遮罩是否关闭
     * @en Whether clicking the overlay closes the dialog
     */
    closeOnOverlay?: boolean
    /**
     * 按下 Esc 是否关闭
     * @en Whether pressing Esc closes the dialog
     */
    closeOnEsc?: boolean
    /**
     * 是否为模态对话框（模态会锁定页面滚动并阻止背景交互）
     * @en Whether the dialog is modal (modal locks page scroll and blocks background interaction)
     */
    modal?: boolean
    /**
     * 是否渲染头部（标题区域与关闭按钮）；为 `false` 时头部整体不渲染，标题转为不可见可访问名
     * @default true
     * @en Whether to render the header (title area and close button); when `false` the whole header is not rendered and the title becomes a visually hidden accessible name
     */
    showHeader?: boolean
    /**
     * 按视口宽度上限设置面板宽度（见 `DialogBreakpoints`）；未提供时按 `size` 档位宽度
     * @en Set the panel width by viewport max-width (see `DialogBreakpoints`); when omitted, the `size` preset width applies
     */
    breakpoints?: DialogBreakpoints
}
