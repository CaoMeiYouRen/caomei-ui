import type { ComponentSize } from '../../types'

/**
 * 表单控件的尺寸与校验状态。
 * @en Size and validation state shared by form controls.
 */
export interface FieldStateProps {
    /**
     * 尺寸
     * @en Size
     */
    size?: ComponentSize
    /**
     * 是否禁用
     * @en Whether the control is disabled
     */
    disabled?: boolean
    /**
     * 校验失败态，映射 aria-invalid
     * @en Validation failure state, maps to aria-invalid
     */
    invalid?: boolean
}

/**
 * 输入类表单控件的公共 props：在状态之外增加占位文本。
 * @en Common props for input-like controls: field state plus placeholder.
 */
export interface FieldProps extends FieldStateProps {
    /**
     * 占位文本
     * @en Placeholder text
     */
    placeholder?: string
}

/**
 * 表单字段的身份与可访问名。
 * @en Field identity and accessible name.
 */
export interface FieldIdentityProps {
    /**
     * 表单字段名
     * @en Form field name
     */
    name?: string
    /**
     * 关联 label 的 id
     * @en Id of the associated label
     */
    id?: string
    /**
     * 无可见标签时的可访问名，映射 aria-label
     * @en Accessible name when there is no visible label, maps to aria-label
     */
    label?: string
}
