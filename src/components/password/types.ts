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
    /**
     * 是否显示密码强度指示；默认关闭，需显式开启（PrimeVue 默认开启；下游未显式传参的 24 处大多为密钥 / Token 字段，强度条无意义）
     * @en Whether to show the password strength indicator; off by default and opt-in (PrimeVue defaults to on; most of the 24 downstream call sites that omit it are secret / token fields where a strength meter is meaningless)
     */
    feedback?: boolean
    /**
     * 未输入时的强度提示文案；默认取当前语言的「请输入密码」
     * @en Prompt text shown while the field is empty; defaults to the current locale's "Enter a password" text
     */
    promptLabel?: string
    /**
     * 弱强度文案；默认取当前语言的「强度：弱」
     * @en Weak-strength text; defaults to the current locale's "Strength: weak" text
     */
    weakLabel?: string
    /**
     * 中强度文案；默认取当前语言的「强度：中」
     * @en Medium-strength text; defaults to the current locale's "Strength: medium" text
     */
    mediumLabel?: string
    /**
     * 高强度文案；默认取当前语言的「强度：强」
     * @en Strong-strength text; defaults to the current locale's "Strength: strong" text
     */
    strongLabel?: string
}
