/**
 * `CaomeiForm` 的属性。
 *
 * 其余原生属性（`action` / `method` / `target` 等）经 attrs 透传到根 `<form>`；但组件的
 * `submit` 处理**始终调用 `preventDefault()`**，因此 `action` / `method` 不会触发页面跳转，
 * 提交逻辑由 `submit` 事件接管。
 * @en Props of `CaomeiForm`.
 *
 * Other native attributes (`action` / `method` / `target`, etc.) are forwarded to the root
 * `<form>`; however, the component's `submit` handler **always calls `preventDefault()`**, so
 * `action` / `method` do not navigate. Submit logic is owned by the `submit` event.
 */
export interface FormProps {
    /**
     * 是否关闭浏览器原生校验气泡（映射原生 `novalidate`）
     * @en Whether to disable the browser's native validation bubbles (maps to the native `novalidate`)
     */
    novalidate?: boolean
}

/**
 * `CaomeiForm` 暴露的实例方法。
 * @en Instance methods exposed by `CaomeiForm`.
 */
export interface FormExposed {
    /**
     * 根 `<form>` 元素（只读）
     * @en The root `<form>` element (read-only)
     */
    form: HTMLFormElement | null
    /**
     * 以原生 `requestSubmit()` 触发提交（会执行原生校验并走组件的 submit 事件）
     * @en Trigger submission through native `requestSubmit()` (runs native validation and the component's submit event)
     */
    submit: () => void
}

/**
 * `CaomeiFormItem` 的属性。
 * @en Props of `CaomeiFormItem`.
 */
export interface FormItemProps {
    /**
     * 控件 id；缺省时按实例生成稳定 id（SSR 安全）。同页挂载多个 Vue app 时，建议为每个 app
     * 设置 `app.config.idPrefix`，避免 `useId()` 各自从同一起点生成重复 id
     * @en Control id; when omitted, a stable per-instance id is generated (SSR-safe). When several
     * Vue apps share a page, set `app.config.idPrefix` per app so `useId()` does not generate
     * duplicate ids from the same starting point
     */
    id?: string
    /**
     * 表单字段名，原样提供给插槽作用域
     * @en Form field name, passed through to the slot scope
     */
    name?: string
    /**
     * 可见标签文本；提供时生成 `aria-labelledby` 目标
     * @en Visible label text; when provided, an `aria-labelledby` target is generated
     */
    label?: string
    /**
     * 辅助提示文本，经 `aria-describedby` 关联
     * @en Helper hint text, associated through `aria-describedby`
     */
    hint?: string
    /**
     * 错误文本；非空时自动视为校验失败，并渲染 `role="alert"` 的错误行
     * @en Error text; a non-empty value implies an invalid state and renders a `role="alert"` error row
     */
    error?: string
    /**
     * 是否显示必填标记（仅视觉标记，不向控件注入 `required` / `aria-required`；控件语义由使用方按字段族绑定）
     * @en Whether to show the required marker (visual only; does not inject `required` / `aria-required`
     * into the control; bind the control semantics yourself per field family)
     */
    required?: boolean
    /**
     * 校验失败态；`error` 非空时自动为 true
     * @en Validation failure state; automatically true when `error` is non-empty
     */
    invalid?: boolean
}

/**
 * `CaomeiFormItem` 默认插槽的作用域。
 *
 * 使用方把 `id` / `name` / `aria-*` / `invalid` 绑定到内部字段组件；组型控件用
 * `aria-labelledby` 关联可见标签，`Switch` 没有校验状态通道，不要绑定 `invalid`。
 * @en Scope of the `CaomeiFormItem` default slot.
 *
 * Consumers bind `id` / `name` / `aria-*` / `invalid` to the inner field component. Group
 * controls use `aria-labelledby` for the visible label; `Switch` has no validation-state
 * channel, so do not bind `invalid` to it.
 */
export interface FormItemSlotProps {
    /**
     * 控件 id（显式传入或按实例生成）
     * @en Control id (explicit or generated per instance)
     */
    id: string
    /**
     * 表单字段名
     * @en Form field name
     */
    name: string | undefined
    /**
     * 可见标签的 id；无标签时为 undefined
     * @en Id of the visible label; undefined when there is no label
     */
    'aria-labelledby': string | undefined
    /**
     * hint / error 的 id 列表；二者都缺省时为 undefined
     * @en Id list of hint / error; undefined when both are omitted
     */
    'aria-describedby': string | undefined
    /**
     * 校验失败态（`invalid` 或非空 `error`）
     * @en Validation failure state (`invalid` or a non-empty `error`)
     */
    invalid: boolean
}
