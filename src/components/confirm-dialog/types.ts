export interface ConfirmDialogProps {
    /**
     * 默认确认按钮文案；单次请求的 `confirmLabel` 优先
     * @en Default confirm button text; a request's `confirmLabel` takes precedence
     */
    confirmLabel?: string
    /**
     * 默认取消按钮文案；单次请求的 `cancelLabel` 优先
     * @en Default cancel button text; a request's `cancelLabel` takes precedence
     */
    cancelLabel?: string
}
