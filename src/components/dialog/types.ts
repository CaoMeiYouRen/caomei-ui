export type DialogSize = 'sm' | 'md' | 'lg'

export interface DialogProps {
    /** 对话框标题，同时作为无障碍名称（必填） */
    title: string
    /** 描述文本，用于无障碍 */
    description?: string
    /** 尺寸 */
    size?: DialogSize
    /** 是否显示右上角关闭按钮 */
    closable?: boolean
    /** 关闭按钮的可访问标签；默认取当前语言的「关闭」文案 */
    closeLabel?: string
    /** 点击遮罩是否关闭 */
    closeOnOverlay?: boolean
    /** 按下 Esc 是否关闭 */
    closeOnEsc?: boolean
    /** 是否为模态对话框（模态会锁定页面滚动并阻止背景交互） */
    modal?: boolean
}
