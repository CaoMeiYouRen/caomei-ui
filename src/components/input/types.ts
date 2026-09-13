import type { ComponentSize } from '../../types'

export type InputType = 'text' | 'password' | 'email' | 'search' | 'tel' | 'url'

export interface InputProps {
    /**
     * 尺寸
     * @en Size
     */
    size?: ComponentSize
    /**
     * 原生 input 的 type；数值输入见 InputNumber
     * @en Native input type; for number inputs see InputNumber
     */
    type?: InputType
    /**
     * 是否禁用
     * @en Whether the input is disabled
     */
    disabled?: boolean
    /**
     * 是否只读
     * @en Whether the input is read-only
     */
    readonly?: boolean
    /**
     * 校验失败态，映射 aria-invalid
     * @en Validation failure state, maps to aria-invalid
     */
    invalid?: boolean
    /**
     * 占位文本
     * @en Placeholder text
     */
    placeholder?: string
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
     * 浏览器自动填充提示
     * @en Browser autocomplete hint
     */
    autocomplete?: string
    /**
     * 是否在有值时显示清除按钮
     * @en Whether to show a clear button when there is a value
     */
    clearable?: boolean
    /**
     * 清除按钮的可访问标签；默认取当前语言的「清除」文案
     * @en Accessible label of the clear button; defaults to the current locale's "Clear" text
     */
    clearLabel?: string
    /**
     * 无可见标签时的可访问名，映射 aria-label
     * @en Accessible name when there is no visible label, maps to aria-label
     */
    label?: string
}
