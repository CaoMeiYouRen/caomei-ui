import type { ComponentSize } from '../../types'

export interface SelectOption {
    /** 选项显示文本 */
    label: string
    /** 选项值，需在单个 Select 内唯一 */
    value: string
    /** 是否禁用该选项 */
    disabled?: boolean
}

export interface SelectProps {
    /** 选项列表 */
    options?: SelectOption[]
    /** 未选择时的占位文本 */
    placeholder?: string
    /** 尺寸 */
    size?: ComponentSize
    /** 是否禁用 */
    disabled?: boolean
    /** 校验失败态，映射 aria-invalid */
    invalid?: boolean
    /** 表单字段名 */
    name?: string
    /** 关联 label 的 id */
    id?: string
    /** 无可见标签时的可访问名，映射 aria-label */
    label?: string
    /** 展开时是否锁定页面滚动；默认 false，避免滚动条消失引起布局跳动 */
    bodyLock?: boolean
}
