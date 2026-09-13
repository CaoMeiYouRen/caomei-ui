import type { ComponentSize } from '../../types'

/** 单个选项的值 */
export type SelectButtonValue = string | number

/** 单选为单值、多选为值数组 */
export type SelectButtonModelValue = SelectButtonValue | SelectButtonValue[]

export interface SelectButtonOption {
    /** 选项显示文本 */
    label: string
    /** 选项值，需在同一组件内唯一 */
    value: SelectButtonValue
    /** 是否禁用该选项 */
    disabled?: boolean
    /** 允许携带额外字段（如 icon），供 `#option` 插槽使用 */
    [key: string]: unknown
}

export interface SelectButtonProps {
    /** 选项列表 */
    options?: SelectButtonOption[]
    /** 是否多选；默认 false 为单选 */
    multiple?: boolean
    /** 尺寸 */
    size?: ComponentSize
    /** 是否禁用整组 */
    disabled?: boolean
    /** 校验失败态，映射 aria-invalid */
    invalid?: boolean
    /** 表单字段名；提供且已选中时随表单提交（单选未选中不产出字段） */
    name?: string
    /** 根元素 id；根为 `role="group"` 不可被 `<label for>` 关联，外部标签请改用 `aria-labelledby` */
    id?: string
    /** 无可见标签时的可访问名，映射 aria-label */
    label?: string
}
