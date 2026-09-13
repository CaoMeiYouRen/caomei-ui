import type { ComponentSize } from '../../types'

export interface MultiSelectOption {
    /**
     * 选项显示文本
     * @en Option display text
     */
    label: string
    /**
     * 选项值，需在单个 MultiSelect 内唯一
     * @en Option value; must be unique within a single MultiSelect
     */
    value: string
    /**
     * 是否禁用该选项
     * @en Whether the option is disabled
     */
    disabled?: boolean
}

export interface MultiSelectProps {
    /**
     * 选项列表
     * @en Option list
     */
    options?: MultiSelectOption[]
    /**
     * 未选择任何项时的占位文本
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
     * 表单字段名；Reka 会为每个选中值生成 `name[index]` 隐藏控件
     * @en Form field name; Reka generates a `name[index]` hidden control per selected value
     */
    name?: string
    /**
     * 是否必填；作用于隐藏表单控件以触发原生表单校验（需同时提供 name）
     * @en Whether it is required; targets the hidden form controls to trigger native validation (requires name)
     */
    required?: boolean
    /**
     * 关联 label 的 id（落在内层输入框上）
     * @en Id of the associated label (lands on the inner input)
     */
    id?: string
    /**
     * 无可见标签时的可访问名，映射 aria-label
     * @en Accessible name when there is no visible label, maps to aria-label
     */
    label?: string
    /**
     * 展开时是否锁定页面滚动；默认 false，避免滚动条消失引起布局跳动
     * @en Whether to lock page scroll when open; defaults to false to avoid layout shift from the disappearing scrollbar
     */
    bodyLock?: boolean
    /**
     * 展开触发器可访问名；默认取当前语言的「展开选项」
     * @en Accessible name of the open trigger; defaults to the current locale's "Show options" text
     */
    openLabel?: string
    /**
     * 已选项移除按钮可访问名前缀；默认取当前语言的「移除」
     * @en Prefix of the remove button's accessible name for a selected value; defaults to the current locale's "Remove" text
     */
    removeLabel?: string
    /**
     * 无匹配选项时的提示文案；默认取当前语言的「无匹配选项」
     * @en Text shown when no options match; defaults to the current locale's "No matching options" text
     */
    emptyLabel?: string
}
