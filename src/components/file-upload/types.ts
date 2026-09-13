export interface FileUploadProps {
    /**
     * 接受的文件类型，使用原生 `accept` 语法（如 `image/*,.pdf`）；同时约束选择与拖拽。
     *
     * 匹配依据 `File.type`：当浏览器未提供该值（未知扩展名）时，`image/*` 等 MIME 通配无法匹配，
     * 仅扩展名（`.png`）与精确 MIME 可匹配。
     */
    accept?: string
    /**
     * 是否允许选择多个文件；关闭时新选择会替换现有列表
     * @default false
     */
    multiple?: boolean
    /**
     * 是否禁用
     * @default false
     */
    disabled?: boolean
    /**
     * 无可见提示文本时的可访问名，映射选择按钮的 `aria-label`。
     *
     * 仅在通过默认插槽自定义（可能无可见文本）提示内容时生效；使用内置提示文本时不生效，
     * 以免可访问名覆盖可见文案（WCAG 2.5.3）。
     */
    label?: string
}
