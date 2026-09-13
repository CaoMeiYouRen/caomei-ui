import type { ComponentSize } from '../../types'

export interface SelectOption {
    /**
     * 选项显示文本
     * @en Option display text
     */
    label: string
    /**
     * 选项值，需在单个 Select 内唯一
     * @en Option value; must be unique within a single Select
     */
    value: string
    /**
     * 是否禁用该选项
     * @en Whether the option is disabled
     */
    disabled?: boolean
}

export interface SelectProps {
    /**
     * 选项列表
     * @en Option list
     */
    options?: SelectOption[]
    /**
     * 未选择时的占位文本
     * @en Placeholder text when nothing is selected
     */
    placeholder?: string
    /**
     * 尺寸
     * @en Size
     */
    size?: ComponentSize
    /**
     * 是否禁用
     * @en Whether the select is disabled
     */
    disabled?: boolean
    /**
     * 校验失败态，映射 aria-invalid
     * @en Validation failure state, maps to aria-invalid
     */
    invalid?: boolean
    /**
     * 表单字段名
     * @en Form field name
     */
    name?: string
    /**
     * 关联 label 的 id
     * @en Id of the associated label
     */
    id?: string
    /**
     * 无可见标签时的可访问名，映射 aria-label
     * @en Accessible name when there is no visible label, maps to aria-label
     */
    label?: string
    /**
     * 展开时是否锁定页面滚动（映射自 Reka SelectContent 的 `bodyLock`）；默认 false，避免滚动条消失引起布局跳动
     * @en Whether to lock page scroll when expanded (mapped from Reka SelectContent's `bodyLock`); defaults to false to avoid layout shift from the disappearing scrollbar
     */
    bodyLock?: boolean
}
