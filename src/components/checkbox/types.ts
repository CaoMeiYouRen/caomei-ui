import type { ComponentSize } from '../../types'

/** 受控状态：选中 / 未选中 / 半选 */
export type CheckboxState = boolean | 'indeterminate'

export interface CheckboxProps {
    /**
     * 尺寸
     * @en Size
     */
    size?: ComponentSize
    /**
     * 是否禁用
     * @en Whether the checkbox is disabled
     */
    disabled?: boolean
    /**
     * 校验失败态，映射 aria-invalid
     * @en Validation failure state, maps to aria-invalid
     */
    invalid?: boolean
    /**
     * 是否必填（原生表单校验）
     * @en Whether it is required (native form validation)
     */
    required?: boolean
    /**
     * 表单字段名；提供后随表单提交
     * @en Form field name; submitted with the form when provided
     */
    name?: string
    /**
     * 提交时代表选中的值，默认 'on'。
     *
     * 仅面向单值表单提交；本组件未包装 CheckboxGroup，值为对象的分组场景暂不支持。
     * @en Value representing "checked" on submit, defaults to 'on'. Only for single-value form submission; this component does not wrap CheckboxGroup, so object-valued group scenarios are not supported yet.
     */
    value?: string | number
    /**
     * 关联 label 的 id，缺省自动生成
     * @en Id of the associated label; auto-generated when omitted
     */
    id?: string
    /**
     * 可见标签文本（也可用默认插槽自定义）
     * @en Visible label text (or customize via the default slot)
     */
    text?: string
    /**
     * 无可见标签时的可访问名，映射 aria-label
     * @en Accessible name when there is no visible label, maps to aria-label
     */
    label?: string
}
