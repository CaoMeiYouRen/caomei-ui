/** 工具条方向 */
export type ToolbarOrientation = 'horizontal' | 'vertical'

/** 阅读方向 */
export type ToolbarDirection = 'ltr' | 'rtl'

export interface ToolbarProps {
    /** 方向，默认水平 */
    orientation?: ToolbarOrientation
    /** 阅读方向 */
    dir?: ToolbarDirection
    /** 键盘导航是否首尾循环 */
    loop?: boolean
    /** 无可见标题时的可访问名，映射 aria-label */
    label?: string
    /** 根元素 id */
    id?: string
}

export interface ToolbarButtonProps {
    /** 是否禁用 */
    disabled?: boolean
    /** 无可见文本时的可访问名，映射 aria-label */
    label?: string
}

export interface ToolbarLinkProps {
    /** 无可见文本时的可访问名，映射 aria-label */
    label?: string
}

/** 开关条目值 */
export type ToolbarToggleValue = string | number

/** 单选为单值、多选为值数组 */
export type ToolbarToggleGroupModelValue = ToolbarToggleValue | ToolbarToggleValue[]

export interface ToolbarToggleGroupProps {
    /** 单选（single）或多选（multiple），默认 single */
    type?: 'single' | 'multiple'
    /** 是否禁用整组 */
    disabled?: boolean
    /** 方向；缺省时由工具条方向决定 */
    orientation?: ToolbarOrientation
    /** 表单字段名；提供后选中值随表单提交 */
    name?: string
    /** 是否必填（原生表单校验） */
    required?: boolean
    /** 分组可访问名，映射 aria-label */
    label?: string
}

export interface ToolbarToggleItemProps {
    /** 该条目唯一值 */
    value: ToolbarToggleValue
    /** 是否禁用该条目 */
    disabled?: boolean
    /** 无可见文本时的可访问名，映射 aria-label */
    label?: string
}
