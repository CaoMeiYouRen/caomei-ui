export type DialogSize = 'sm' | 'md' | 'lg'

export interface DialogProps {
    /**
     * 对话框标题，同时作为无障碍名称（必填）
     * @en Dialog title, also used as the accessible name (required)
     */
    title: string
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
}
