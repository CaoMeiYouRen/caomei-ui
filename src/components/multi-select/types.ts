import type { ComponentSize } from '../../types'

export interface MultiSelectOption {
    /** 选项显示文本 */
    label: string
    /** 选项值，需在单个 MultiSelect 内唯一 */
    value: string
    /** 是否禁用该选项 */
    disabled?: boolean
}

export interface MultiSelectProps {
    /** 选项列表 */
    options?: MultiSelectOption[]
    /** 未选择任何项时的占位文本 */
    placeholder?: string
    /** 尺寸 */
    size?: ComponentSize
    /** 是否禁用 */
    disabled?: boolean
    /** 校验失败态，映射 aria-invalid */
    invalid?: boolean
    /** 表单字段名；Reka 会为每个选中值生成 `name[index]` 隐藏控件 */
    name?: string
    /** 是否必填；作用于隐藏表单控件以触发原生表单校验（需同时提供 name） */
    required?: boolean
    /** 关联 label 的 id（落在内层输入框上） */
    id?: string
    /** 无可见标签时的可访问名，映射 aria-label */
    label?: string
    /** 展开时是否锁定页面滚动；默认 false，避免滚动条消失引起布局跳动 */
    bodyLock?: boolean
    /** 展开触发器可访问名；默认取当前语言的「展开选项」 */
    openLabel?: string
    /** 已选项移除按钮可访问名前缀；默认取当前语言的「移除」 */
    removeLabel?: string
    /** 无匹配选项时的提示文案；默认取当前语言的「无匹配选项」 */
    emptyLabel?: string
}
