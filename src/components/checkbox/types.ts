import type { FieldIdentityProps, FieldStateProps } from '../_shared/field'
import type { OptionValue } from '../_shared/option'

/** 受控状态：选中 / 未选中 / 半选 */
export type CheckboxState = boolean | 'indeterminate'

/**
 * 模型形态：单值状态，或分组用的值数组。
 * @en Model shape: a single state, or a value array for grouping.
 */
export type CheckboxModel = CheckboxState | OptionValue[]

/**
 * 与公共契约的差异：`id` 缺省时自动生成；`name` 提供后随表单提交。
 * @en Differences from the shared contract: `id` is auto-generated when omitted; `name` is submitted
 * with the form when provided.
 */
export interface CheckboxProps extends FieldStateProps, FieldIdentityProps {
    /**
     * 是否必填（原生表单校验）
     * @en Whether it is required (native form validation)
     */
    required?: boolean

    /**
     * 提交时代表选中的值，默认 'on'。
     *
     * `v-model` 传数组时改作该数组的成员标识：点击按 `value` 增删（对齐 PrimeVue 的分组语义），
     * 此时不可省略；分组容器与全选 / 半选见 `CaomeiCheckboxGroup`。
     * @en Value representing "checked" on submit, defaults to 'on'. When `v-model` is an array this becomes
     * the membership key toggled by clicking (matching PrimeVue's group semantics) and must be provided;
     * see `CaomeiCheckboxGroup` for a group container with select-all / indeterminate.
     */
    value?: string | number

    /**
     * 可见标签文本（也可用默认插槽自定义）
     * @en Visible label text (or customize via the default slot)
     */
    text?: string

}
