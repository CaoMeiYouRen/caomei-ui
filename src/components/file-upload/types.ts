/**
 * 上传界面形态
 * @en Upload UI mode
 */
export type FileUploadMode = 'advanced' | 'basic'

/** `select` 事件载荷 */
export interface FileUploadSelectEvent {
    /** 触发的原生事件（input change 或 drop） */
    originalEvent: Event
    /** 本次选择后的完整列表；全部文件被拒（类型 / 大小）时为当前未变化的列表 */
    files: File[]
}

/** `remove` 事件载荷 */
export interface FileUploadRemoveEvent {
    /** 被移除的文件 */
    file: File
    /** 移除后的剩余列表 */
    files: File[]
}

/** `uploader` 事件载荷 */
export interface FileUploadUploaderEvent {
    /** 待上传的文件列表 */
    files: File[]
}

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
     * 界面形态：`advanced` 为拖放区 + 文件列表，`basic` 为紧凑的选择按钮 + 已选文案
     * @default 'advanced'
     * @en UI mode: `advanced` renders the dropzone + file list, `basic` renders a compact choose button + chosen-file text
     */
    mode?: FileUploadMode
    /**
     * 自定义上传：组件不做传输，改为抛出 `uploader` 事件，由业务层上传（对齐 PrimeVue 的 `customUpload`）。
     * 关闭时组件仅负责选择与列表管理，`uploader` 不触发。
     * @default false
     * @en Custom upload: the component performs no transfer and instead emits `uploader` for the application to handle (aligned with PrimeVue's `customUpload`). When off, the component only handles selection and list management and `uploader` never fires.
     */
    customUpload?: boolean
    /**
     * 选择完成后自动请求上传（`customUpload` 下即抛出 `uploader`）
     * @default false
     * @en Automatically request upload after selection completes (under `customUpload` this emits `uploader`)
     */
    auto?: boolean
    /**
     * 单个文件字节上限；超限文件不进入列表，并显示内建大小提示（可经 locale 覆盖）
     * @en Per-file size limit in bytes; over-limit files are rejected and a built-in size message is shown (overridable via locale)
     */
    maxFileSize?: number
    /**
     * 选择按钮 / 拖放区的提示文案；缺省取内建 locale（`basic` 取「选择文件」、`advanced` 取拖放提示）
     * @en Choose button / dropzone label; defaults to the built-in locale (the basic choose label or the advanced dropzone prompt)
     */
    chooseLabel?: string
    /**
     * 无可见提示文本时的可访问名，映射选择按钮的 `aria-label`。
     *
     * 仅在通过默认插槽自定义（可能无可见文本）提示内容时生效；使用内置提示文本时不生效，
     * 以免可访问名覆盖可见文案（WCAG 2.5.3）。
     * @en Accessible name when there is no visible prompt text, maps to the select button's `aria-label`. Only takes effect when the prompt content is customized via the default slot (which may have no visible text); it does not apply when the built-in prompt text is used, to avoid the accessible name overriding the visible text (WCAG 2.5.3).
     */
    label?: string
}
