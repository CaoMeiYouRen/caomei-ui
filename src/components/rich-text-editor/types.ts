/**
 * 图片上传处理器：接收用户选择的图片文件，返回可供 Markdown 引用的 URL 列表。
 * @en Image upload handler: receives the image files picked by the user and returns the URLs to
 * embed in the Markdown source.
 */
export type RichTextEditorUploader = (files: File[]) => Promise<string[]> | string[]

/**
 * 富文本编辑器（Markdown）包装组件的 props。
 *
 * `v-model`（`string`，Markdown 源）由 `defineModel` 承载，故本接口不含 `modelValue`。
 * 编辑器内核来自可选 peer 依赖 `md-editor-v3`：暗色由宿主状态派生、语言由本库 locale 派生，
 * 均不开放逐项手工传参（`theme` 仅作逃生舱）。
 * @en Props for the rich text editor (Markdown) wrapper. The `v-model` (`string`, Markdown source)
 * is carried by `defineModel`, so this interface omits `modelValue`. The editor kernel comes from
 * the optional peer dependency `md-editor-v3`: the theme is derived from the host state and the
 * language from the host locale, neither exposed for per-item manual wiring (`theme` is an escape
 * hatch only).
 */
export interface RichTextEditorProps {
    /**
     * 占位提示；缺省由编辑器给出
     * @en Placeholder hint; the editor provides its own default
     */
    placeholder?: string
    /**
     * 只读（可预览 / 滚动 / 复制，但不可编辑）；默认 `false`
     * @en Read-only (preview / scroll / copy, but not edit); defaults to `false`
     */
    readonly?: boolean
    /**
     * 禁用整个编辑器；默认 `false`
     * @en Disables the whole editor; defaults to `false`
     */
    disabled?: boolean
    /**
     * 编辑器高度（CSS 长度，如 `'20rem'`）；缺省由编辑器默认高度决定
     * @en Editor height (a CSS length such as `'20rem'`); falls back to the editor's default height
     */
    height?: string
    /**
     * 是否显示预览面板；默认 `true`
     * @en Whether to show the preview pane; defaults to `true`
     */
    preview?: boolean
    /**
     * 工具栏项列表；缺省使用编辑器默认工具栏。取值口径见编辑器文档的 `toolbars`
     * @en Toolbar item list; falls back to the editor's default toolbar. See the editor's `toolbars`
     * documentation for accepted values
     */
    toolbars?: string[]
    /**
     * 禁用图片上传入口；默认 `false`。缺省时编辑器使用其内建行为（无 `uploader` 时把图片内联为 data URL）
     * @en Disables the image upload entry; defaults to `false`. When left default, the editor uses its
     * built-in behavior (inlines the image as a data URL when no `uploader` is given)
     */
    noUploadImg?: boolean
    /**
     * 挂载后自动聚焦文本区；默认 `false`
     * @en Focuses the text area after mount; defaults to `false`
     */
    autoFocus?: boolean
    /**
     * 文本区允许的最大字符数；缺省不限
     * @en Maximum characters allowed in the text area; unlimited by default
     */
    maxLength?: number
    /**
     * 逃生舱：手工覆盖主题。缺省跟随宿主暗色状态（见组件页「暗色与国际化联动」）
     * @en Escape hatch: overrides the theme manually. By default it follows the host dark state
     * (see "Theme and locale linkage" on the component page)
     */
    theme?: 'light' | 'dark'
    /**
     * 图片上传处理器：返回图片 URL 列表；缺省时由编辑器内建行为处理（内联为 data URL）
     * @en Image upload handler returning the image URLs; when omitted the editor's built-in behavior
     * applies (inlines the image as a data URL)
     */
    uploader?: RichTextEditorUploader
    /**
     * 可访问名，渲染为编辑器容器的 `aria-label`（同时赋予 `role="group"`）；缺省不输出
     * @en Accessible name rendered as the editor container's `aria-label` (together with
     * `role="group"`); not rendered by default
     */
    label?: string
}
