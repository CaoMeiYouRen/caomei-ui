import type { InputProps } from '../input'

export interface PasswordProps extends Omit<InputProps, 'type'> {
    /** 显示明文按钮的可访问标签；默认取当前语言的「显示密码」 */
    showLabel?: string
    /** 隐藏明文按钮的可访问标签；默认取当前语言的「隐藏密码」 */
    hideLabel?: string
}
