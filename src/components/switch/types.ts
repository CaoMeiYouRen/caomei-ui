export interface SwitchProps {
    /** 是否禁用 */
    disabled?: boolean
    /** 是否必填（原生表单校验） */
    required?: boolean
    /** 表单字段名；提供后随表单提交 */
    name?: string
    /** 提交时代表开启的值；缺省时由 Reka 提供 'on' */
    value?: string
    /** 关联外部 label 的 id */
    id?: string
    /** 无可见标签时的可访问名，映射 aria-label */
    label?: string
}
