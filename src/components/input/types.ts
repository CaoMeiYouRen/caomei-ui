import type { FieldProps, FieldIdentityProps } from '../_shared/field'

export type InputType = 'text' | 'password' | 'email' | 'search' | 'tel' | 'url'

export interface InputProps extends FieldProps, FieldIdentityProps {
    /**
     * 原生 input 的 type；数值输入见 InputNumber
     * @en Native input type; for number inputs see InputNumber
     */
    type?: InputType
    /**
     * 是否只读
     * @en Whether the input is read-only
     */
    readonly?: boolean
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
}
