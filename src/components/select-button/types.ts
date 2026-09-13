import type { ComponentSize } from '../../types'

/**
 * 单个选项的值
 * @en Value of a single option
 */
export type SelectButtonValue = string | number

/**
 * 单选为单值、多选为值数组
 * @en A single value for single-select, an array of values for multi-select
 */
export type SelectButtonModelValue = SelectButtonValue | SelectButtonValue[]

export interface SelectButtonOption {
    /**
     * 选项显示文本
     * @en Option display text
     */
    label: string
    /**
     * 选项值，需在同一组件内唯一
     * @en Option value; must be unique within the component
     */
    value: SelectButtonValue
    /**
     * 是否禁用该选项
     * @en Whether the option is disabled
     */
    disabled?: boolean
    /**
     * 允许携带额外字段（如 icon），供 `#option` 插槽使用
     * @en Allows extra fields (such as icon) for the `#option` slot
     */
    [key: string]: unknown
}

export interface SelectButtonProps {
    /**
     * 选项列表
     * @en Option list
     */
    options?: SelectButtonOption[]
    /**
     * 是否多选；默认 false 为单选
     * @en Whether multi-select; defaults to false (single-select)
     */
    multiple?: boolean
    /**
     * 尺寸
     * @en Size
     */
    size?: ComponentSize
    /**
     * 是否禁用整组
     * @en Whether the whole group is disabled
     */
    disabled?: boolean
    /**
     * 校验失败态，映射 aria-invalid
     * @en Validation failure state, maps to aria-invalid
     */
    invalid?: boolean
    /**
     * 表单字段名；提供且已选中时随表单提交（单选未选中不产出字段）
     * @en Form field name; submitted with the form when provided and a value is selected (single-select produces no field when nothing is selected)
     */
    name?: string
    /**
     * 根元素 id；根为 `role="group"` 不可被 `<label for>` 关联，外部标签请改用 `aria-labelledby`
     * @en Root element id; the root is `role="group"` and cannot be associated via `<label for>` — use `aria-labelledby` for an external label instead
     */
    id?: string
    /**
     * 无可见标签时的可访问名，映射 aria-label
     * @en Accessible name when there is no visible label, maps to aria-label
     */
    label?: string
}
