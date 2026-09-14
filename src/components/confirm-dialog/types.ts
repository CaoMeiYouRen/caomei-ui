export interface ConfirmDialogProps {
    /**
     * 默认确认按钮文案；缺省取当前语言的「确定」文案，单次请求的 `confirmLabel` 优先
     * @en Default confirm button text; defaults to the current locale's "Confirm" text; a request's `confirmLabel` takes precedence
     */
    confirmLabel?: string
    /**
     * 默认取消按钮文案；缺省取当前语言的「取消」文案，单次请求的 `cancelLabel` 优先
     * @en Default cancel button text; defaults to the current locale's "Cancel" text; a request's `cancelLabel` takes precedence
     */
    cancelLabel?: string
}
