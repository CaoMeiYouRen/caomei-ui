import type { InputProps } from '../input'

export interface PasswordProps extends Omit<InputProps, 'type'> {
    /**
     * 显示明文按钮的可访问标签；默认取当前语言的「显示密码」
     * @en Accessible label of the show-password button; defaults to the current locale's "Show password" text
     */
    showLabel?: string
    /**
     * 隐藏明文按钮的可访问标签；默认取当前语言的「隐藏密码」
     * @en Accessible label of the hide-password button; defaults to the current locale's "Hide password" text
     */
    hideLabel?: string
}
