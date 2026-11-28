/** 进入编辑态的触发方式 */
export type EditableActivationMode = 'focus' | 'dblclick'

/** 提交编辑的方式：`enter` 仅回车、`blur` 仅失焦、`both` 两者、`none` 只认提交触发器 */
export type EditableSubmitMode = 'enter' | 'blur' | 'both' | 'none'

/**
 * 根组件 props。受控值由 `defineModel` 声明（`v-model`），故不在此重复 `modelValue`——
 * 否则 `defineProps` 与 `defineModel` 会在模板作用域里撞同一个键。
 */
export interface EditableProps {
    /**
     * 空值且未编辑时预览区展示的占位文案
     * @default 'Enter text...'
     * @en Placeholder shown in the preview when the value is empty and not editing
     */
    placeholder?: string
    /**
     * 禁用：不响应进入编辑、不渲染输入，值不可改
     * @default false
     * @en Disabled: cannot enter edit mode or change the value
     */
    disabled?: boolean
    /**
     * 只读：可聚焦、可进入编辑查看，但不接受输入
     * @default false
     * @en Read-only: focusable and can enter edit mode to view, but rejects input
     */
    readonly?: boolean
    /**
     * 进入编辑的方式：`focus` 聚焦即编辑、`dblclick` 双击才编辑
     * @default 'focus'
     * @en How editing starts: `focus` on focus, `dblclick` on double click
     */
    activationMode?: EditableActivationMode
    /**
     * 提交方式，语义见 {@link EditableSubmitMode}
     * @default 'blur'
     * @en How the value is submitted; see {@link EditableSubmitMode}
     */
    submitMode?: EditableSubmitMode
    /**
     * 进入编辑时全选现有文本
     * @default false
     * @en Select all existing text when editing starts
     */
    selectOnFocus?: boolean
    /**
     * 挂载即进入编辑态（受控初值场景）
     * @default false
     * @en Start in edit mode on mount (for controlled initial values)
     */
    startWithEditMode?: boolean
    /**
     * 输入长度上限（提交时截断）
     * @en Maximum input length (truncated on submit)
     */
    maxLength?: number
    /**
     * 输入框的可访问名；缺省时由外部 `label[for]` 或透传的 `aria-label` 推导
     * @en Accessible name of the input; falls back to an external `label[for]` or a forwarded `aria-label`
     */
    label?: string
}

export interface EditableInputProps {
    /**
     * 输入框的可访问名（行内编辑没有可见标签，名称必须由 prop 或外部 label 提供）
     * @en Accessible name of the input (inline editing has no visible label)
     */
    label?: string
}

export interface EditableTriggerProps {
    /**
     * 触发器的可访问名（触发器通常只有图标或短文案）
     * @en Accessible name of the trigger (usually icon-only or a short label)
     */
    label?: string
}
