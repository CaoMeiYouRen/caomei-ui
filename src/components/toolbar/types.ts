/**
 * 工具条方向
 * @en Toolbar orientation
 */
export type ToolbarOrientation = 'horizontal' | 'vertical'

/**
 * 阅读方向
 * @en Reading direction
 */
export type ToolbarDirection = 'ltr' | 'rtl'

export interface ToolbarProps {
    /**
     * 方向，默认水平
     * @en Orientation, horizontal by default
     */
    orientation?: ToolbarOrientation
    /**
     * 阅读方向
     * @en Reading direction
     */
    dir?: ToolbarDirection
    /**
     * 键盘导航是否首尾循环
     * @en Whether keyboard navigation wraps around
     */
    loop?: boolean
    /**
     * 无可见标题时的可访问名，映射 aria-label
     * @en Accessible name when there is no visible title, maps to aria-label
     */
    label?: string
    /**
     * 根元素 id
     * @en Root element id
     */
    id?: string
}

export interface ToolbarButtonProps {
    /**
     * 是否禁用
     * @en Whether the button is disabled
     */
    disabled?: boolean
    /**
     * 无可见文本时的可访问名，映射 aria-label
     * @en Accessible name when there is no visible text, maps to aria-label
     */
    label?: string
}

export interface ToolbarLinkProps {
    /**
     * 无可见文本时的可访问名，映射 aria-label
     * @en Accessible name when there is no visible text, maps to aria-label
     */
    label?: string
}

/**
 * 开关条目值
 * @en Toggle item value
 */
export type ToolbarToggleValue = string | number

/**
 * 单选为单值、多选为值数组
 * @en A single value for single-select, an array of values for multi-select
 */
export type ToolbarToggleGroupModelValue = ToolbarToggleValue | ToolbarToggleValue[]

export interface ToolbarToggleGroupProps {
    /**
     * 单选（single）或多选（multiple），默认 single
     * @en Single-select (single) or multi-select (multiple), single by default
     */
    type?: 'single' | 'multiple'
    /**
     * 是否禁用整组
     * @en Whether the whole group is disabled
     */
    disabled?: boolean
    /**
     * 方向；缺省时由工具条方向决定
     * @en Orientation; falls back to the toolbar orientation when omitted
     */
    orientation?: ToolbarOrientation
    /**
     * 表单字段名；提供后选中值随表单提交
     * @en Form field name; when provided the selected value is submitted with the form
     */
    name?: string
    /**
     * 是否必填（原生表单校验）
     * @en Whether it is required (native form validation)
     */
    required?: boolean
    /**
     * 分组可访问名，映射 aria-label
     * @en Accessible name of the group, maps to aria-label
     */
    label?: string
}

export interface ToolbarToggleItemProps {
    /**
     * 该条目唯一值
     * @en Unique value of the item
     */
    value: ToolbarToggleValue
    /**
     * 是否禁用该条目
     * @en Whether to disable the item
     */
    disabled?: boolean
    /**
     * 无可见文本时的可访问名，映射 aria-label
     * @en Accessible name when there is no visible text, maps to aria-label
     */
    label?: string
}
