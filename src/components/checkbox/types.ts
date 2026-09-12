import type { ComponentSize } from '../../types'

/** 受控状态：选中 / 未选中 / 半选 */
export type CheckboxState = boolean | 'indeterminate'

export interface CheckboxProps {
    /** 尺寸 */
    size?: ComponentSize
    /** 是否禁用 */
    disabled?: boolean
    /** 校验失败态，映射 aria-invalid */
    invalid?: boolean
    /** 是否必填（原生表单校验） */
    required?: boolean
    /** 表单字段名；提供后随表单提交 */
    name?: string
    /**
     * 提交时代表选中的值，默认 'on'。
     *
     * 仅面向单值表单提交；本组件未包装 CheckboxGroup，值为对象的分组场景暂不支持。
     */
    value?: string | number
    /** 关联 label 的 id，缺省自动生成 */
    id?: string
    /** 可见标签文本（也可用默认插槽自定义） */
    label?: string
}
