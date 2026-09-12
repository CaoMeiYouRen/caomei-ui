export interface DialogProps {
    /** 对话框标题，同时作为无障碍名称（必填） */
    title: string
    /** 描述文本，用于无障碍 */
    description?: string
    /** 关闭按钮的无障碍标签 */
    closeLabel?: string
}
