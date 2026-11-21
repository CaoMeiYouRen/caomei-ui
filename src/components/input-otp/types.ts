import type { FieldIdentityProps, FieldStateProps } from '../_shared/field'

/**
 * 验证码输入类型：`numeric` 只接受数字，`alphanumeric` 接受字母与数字
 * @en Verification-code input type: `numeric` accepts digits only, `alphanumeric` accepts letters and digits
 */
export type InputOtpType = 'numeric' | 'alphanumeric'

/**
 * 验证码输入的 props。
 * 字符串 `v-model` 由 `defineModel` 承载，故本接口不含 `modelValue`。
 * @en Props for the verification-code input. The string `v-model` is carried by `defineModel`,
 * so this interface omits `modelValue`.
 */
export interface InputOtpProps extends FieldStateProps, FieldIdentityProps {
    /**
     * 输入格数；默认 `6`
     * @en Number of input cells; defaults to `6`
     */
    length?: number
    /**
     * 输入类型；默认 `numeric`
     * @en Input type; defaults to `numeric`
     */
    type?: InputOtpType
    /**
     * 空格占位字符
     * @en Placeholder character for empty cells
     */
    placeholder?: string
    /**
     * 是否以密码形态遮挡已输入内容；默认 `false`
     * @en Whether typed content is masked as a password; defaults to `false`
     */
    mask?: boolean
    /**
     * 是否启用一次性验证码语义（逐格顺序填充）；默认 `true`，同时输出 `autocomplete="one-time-code"`
     * @en Whether one-time-code semantics are enabled (cells fill in order); defaults to `true`,
     * which also emits `autocomplete="one-time-code"`
     */
    otp?: boolean
    /**
     * 是否只读
     * @en Whether the input is read-only
     */
    readonly?: boolean
    /**
     * 是否必填；作用于隐藏表单控件以触发原生表单校验（需同时提供 `name`）
     * @en Whether it is required; targets the hidden form control to trigger native validation
     * (requires `name`)
     */
    required?: boolean
}

/**
 * 验证码输入抛出的事件。
 * @en Events emitted by the verification-code input.
 */
export interface InputOtpEmits {
    /**
     * 填满全部输入格后抛出，载荷为完整字符串
     * @en Emitted once all cells are filled; the payload is the full string
     */
    complete: [value: string]
}
