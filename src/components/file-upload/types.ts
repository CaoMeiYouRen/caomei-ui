export interface FileUploadProps {
    /**
     * 接受的文件类型，使用原生 `accept` 语法（如 `image/*,.pdf`）；同时约束选择与拖拽。
     *
     * 匹配依据 `File.type`：当浏览器未提供该值（未知扩展名）时，`image/*` 等 MIME 通配无法匹配，
     * 仅扩展名（`.png`）与精确 MIME 可匹配。
     * @en Accepted file types, using native `accept` syntax (such as `image/*,.pdf`); constrains both selection and drag-and-drop. Matching is based on `File.type`: when the browser does not provide it (unknown extension), MIME wildcards such as `image/*` cannot match, and only extensions (`.png`) and exact MIME types match.
     */
    accept?: string
    /**
     * 是否允许选择多个文件；关闭时新选择会替换现有列表
     * @default false
     * @en Whether to allow selecting multiple files; when off, a new selection replaces the current list
     */
    multiple?: boolean
    /**
     * 是否禁用
     * @default false
     * @en Whether the upload is disabled
     */
    disabled?: boolean
    /**
     * 无可见提示文本时的可访问名，映射选择按钮的 `aria-label`。
     *
     * 仅在通过默认插槽自定义（可能无可见文本）提示内容时生效；使用内置提示文本时不生效，
     * 以免可访问名覆盖可见文案（WCAG 2.5.3）。
     * @en Accessible name when there is no visible prompt text, maps to the select button's `aria-label`. Only takes effect when the prompt content is customized via the default slot (which may have no visible text); it does not apply when the built-in prompt text is used, to avoid the accessible name overriding the visible text (WCAG 2.5.3).
     */
    label?: string
}
