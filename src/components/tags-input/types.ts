import type { FieldIdentityProps, FieldProps } from '../_shared/field'

/**
 * 标签输入框的 props。
 * 多值 `v-model`（`string[]`）由 `defineModel` 承载，故本接口不含 `modelValue`。
 * @en Props for the tags input. The multi-value `v-model` (`string[]`) is carried by `defineModel`,
 * so this interface omits `modelValue`.
 */
export interface TagsInputProps extends FieldProps, FieldIdentityProps {
    /**
     * 是否允许重复标签；默认 `false`，重复输入被拒绝并抛出 `invalidInput`
     * @en Whether duplicate tags are allowed; defaults to `false`. Duplicates are rejected and
     * reported through `invalidInput`
     */
    allowDuplicate?: boolean
    /**
     * 触发新增标签的分隔符（字符串或正则）；默认 `,`
     * @en Delimiter that triggers adding a tag (a string or a regular expression); defaults to `,`
     */
    delimiter?: string | RegExp
    /**
     * 标签数量上限；达到上限后新增被拒绝并抛出 `invalidInput`；缺省不限
     * @en Maximum number of tags; additions beyond it are rejected and reported through
     * `invalidInput`; unlimited by default
     */
    max?: number
    /**
     * 粘贴时按分隔符拆分并批量新增；默认 `true`
     * @en Whether pasting text splits it by the delimiter and adds tags in bulk; defaults to `true`
     */
    addOnPaste?: boolean
    /**
     * Tab 键提交当前输入为标签；默认 `false`（保留 Tab 的焦点移动语义）
     * @en Whether Tab commits the current input as a tag; defaults to `false` (keeps Tab's
     * focus-moving semantics)
     */
    addOnTab?: boolean
    /**
     * 失焦时提交当前输入为标签；默认 `false`
     * @en Whether blur commits the current input as a tag; defaults to `false`
     */
    addOnBlur?: boolean
    /**
     * 是否必填；作用于隐藏表单控件以触发原生表单校验（需同时提供 `name`）
     * @en Whether it is required; targets the hidden form control to trigger native validation
     * (requires `name`)
     */
    required?: boolean
    /**
     * 有标签时是否显示清空按钮；默认 `false`
     * @en Whether to show a clear button when tags exist; defaults to `false`
     */
    showClear?: boolean
    /**
     * 清空按钮的可访问名，默认取当前语言的「清空」
     * @en Accessible name of the clear button; defaults to the current locale's "Clear"
     */
    clearLabel?: string
}
