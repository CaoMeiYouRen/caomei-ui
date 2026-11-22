import type { InjectionKey } from 'vue'

/**
 * 校验触发时机。
 *
 * - `onSubmit`（默认）：首次提交前不展示校验错误，提交过一次后转为「变更即复检」
 * - `onBlur`：字段失焦时校验
 * - `onChange`：字段值变更时校验
 * @en When validation runs.
 */
export type FormValidationMode = 'onSubmit' | 'onBlur' | 'onChange'

/**
 * `validate` 的返回值：单条文案 / 文案数组 / 空值。
 *
 * 空值（`''` / `null` / `undefined`）表示通过；**不提供布尔约定**。
 * @en Return value of `validate`: a message, a message list, or an empty value.
 *
 * An empty value means valid; there is deliberately no boolean convention.
 */
// `void` 是契约的一部分：校验器可以没有返回值（空值即通过）
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type FormValidateResult = string | string[] | null | undefined | void

/**
 * 字段校验函数。`value` 为该字段的 `modelValue`，`values` 为表单级值集（键为字段 `name`）。
 * @en Field validator. `value` is the field's `modelValue`; `values` is the form-level value map
 * keyed by field `name`.
 */
export type FormValidateFn = (
    value: unknown,
    values: Record<string, unknown>,
) => FormValidateResult | Promise<FormValidateResult>

/**
 * 校验结果形态：同步布尔或异步 Promise（同步优先，避免无异步校验时把提交推迟到微任务）。
 * @en Validation outcome: a boolean, or a Promise when a validator is asynchronous. Sync results
 * keep submission synchronous when no async validator is involved.
 */
export type FormValidateOutcome = boolean | Promise<boolean>

/**
 * 判断是否为 thenable。
 * @en Whether the value is thenable.
 */
export function isPromiseLike<T>(value: T | Promise<T>): value is Promise<T> {
    return typeof value === 'object' && value !== null && typeof (value as Promise<T>).then === 'function'
}

/**
 * 字段向表单注册的只读视图。
 * @en Read-only view a field registers with the form.
 */
export interface FormItemRegistration {
    /** 字段名；未提供 `name` 时不参与 `errors` 匹配与 `values` 汇总 */
    name: () => string | undefined
    /** 字段当前值（来自 `modelValue` 只读通道） */
    value: () => unknown
    /** 字段根元素，用于按文档顺序确定首个无效字段 */
    root: () => HTMLElement | null
    /** 字段内首个可聚焦控件 */
    control: () => HTMLElement | null
    /** 执行校验，返回是否通过；同步校验返回布尔，异步校验返回 Promise */
    validate: () => FormValidateOutcome
    /** 当前失败态（受控 `error` / `invalid` / 本地校验 / 服务端错误任一成立） */
    invalid: () => boolean
}

/**
 * `CaomeiForm` 向 `CaomeiFormItem` 提供的上下文。
 * @en Context provided by `CaomeiForm` to `CaomeiFormItem`.
 */
export interface FormContext {
    /** 服务端错误映射（只读） */
    errors: () => Record<string, string | string[] | undefined>
    /** 表单级默认校验时机 */
    validationMode: () => FormValidationMode
    /** 已发生的提交次数（`onSubmit` 模式据此从「首次提交后」转为变更复检） */
    submitCount: () => number
    /** 注册字段，返回注销函数 */
    register: (item: FormItemRegistration) => () => void
    /** 汇总已注册字段的值集 */
    getValues: () => Record<string, unknown>
}

export const formContextKey: InjectionKey<FormContext> = Symbol('caomei-form')
