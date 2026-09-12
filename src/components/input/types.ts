import type { ComponentSize } from '../../types'

export type InputType = 'text' | 'password' | 'email' | 'search' | 'tel' | 'url'

export interface InputProps {
    /** 尺寸 */
    size?: ComponentSize
    /** 原生 input 的 type；数值输入见 InputNumber */
    type?: InputType
    /** 是否禁用 */
    disabled?: boolean
    /** 是否只读 */
    readonly?: boolean
    /** 校验失败态，映射 aria-invalid */
    invalid?: boolean
    /** 占位文本 */
    placeholder?: string
    /** 表单字段名 */
    name?: string
    /** 关联 label 的 id */
    id?: string
    /** 浏览器自动填充提示 */
    autocomplete?: string
    /** 是否在有值时显示清除按钮 */
    clearable?: boolean
    /** 清除按钮的可访问标签；默认取当前语言的「清除」文案 */
    clearLabel?: string
    /** 无可见标签时的可访问名，映射 aria-label */
    label?: string
}
