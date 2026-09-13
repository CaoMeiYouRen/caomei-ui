export interface SwitchProps {
    /**
     * 是否禁用
     * @en Whether the switch is disabled
     */
    disabled?: boolean
    /**
     * 是否必填（原生表单校验）
     * @en Whether it is required (native form validation)
     */
    required?: boolean
    /**
     * 表单字段名；提供后随表单提交
     * @en Form field name; when provided the switch is submitted with the form
     */
    name?: string
    /**
     * 提交时代表开启的值；缺省时由 Reka 提供 'on'
     * @en Value representing "on" when submitted; defaults to Reka's 'on'
     */
    value?: string
    /**
     * 关联外部 label 的 id
     * @en Id of the associated external label
     */
    id?: string
    /**
     * 无可见标签时的可访问名，映射 aria-label
     * @en Accessible name when there is no visible label, maps to aria-label
     */
    label?: string
}
