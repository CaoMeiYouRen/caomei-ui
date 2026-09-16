import type { FieldIdentityProps, FieldStateProps } from '../_shared/field'

/** 受控状态：选中 / 未选中 / 半选 */
export type CheckboxState = boolean | 'indeterminate'

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
     * 仅面向单值表单提交；本组件未包装 CheckboxGroup，值为对象的分组场景暂不支持。
     * @en Value representing "checked" on submit, defaults to 'on'. Only for single-value form submission; this component does not wrap CheckboxGroup, so object-valued group scenarios are not supported yet.
     */
    value?: string | number

    /**
     * 可见标签文本（也可用默认插槽自定义）
     * @en Visible label text (or customize via the default slot)
     */
    text?: string

}
