/** 滚轮选项 */
export interface PickerOption {
    /** 可见文案 */
    label: string
    /** 选项值（写入模型） */
    value: string | number
}

/** 一列滚轮 */
export interface PickerColumn {
    /** 该列的可访问名（如「省份」）；缺省时由根节点的 `label` 与列序承担 */
    label?: string
    /** 该列选项 */
    options: PickerOption[]
}

/**
 * 根组件 props。受控值由 `defineModel` 声明（`v-model`），不在此重复 `modelValue`，
 * 否则 `defineProps` 与 `defineModel` 会在模板作用域里撞同一个键。
 */
export interface PickerProps {
    /**
     * 列定义；一列即单列选择器，多列即多级联动数据（各列独立滚动，不做级联重置）
     * @en Column definitions; one column for a single picker, several for multi-column data
     * (columns scroll independently, no cascading reset)
     */
    columns: PickerColumn[]
    /**
     * 禁用整组：不可滚动、不可键盘选择，值为只读
     * @default false
     * @en Disables the whole picker: no scrolling or keyboard selection
     */
    disabled?: boolean
    /**
     * 只读：保留滚轮展示，不接受交互
     * @default false
     * @en Read-only: keeps the wheel display but rejects interaction
     */
    readonly?: boolean
    /**
     * 首尾相接：方向键与点击在首末项之间回绕（滚动不做无限循环，见组件页说明）
     * @default false
     * @en Wrap-around for arrow keys and clicks on the first/last option (scrolling is not infinite)
     */
    loop?: boolean
    /**
     * 行高（px），必须与样式行高一致
     * @default 36
     * @en Row height in px; must match the CSS row height
     */
    itemHeight?: number
    /**
     * 可视行数（建议奇数，选中项居中）
     * @default 5
     * @en Number of visible rows (odd numbers keep the selected row centered)
     */
    visibleCount?: number
    /**
     * 整组的可访问名
     * @en Accessible name of the whole picker
     */
    label?: string
}

export interface PickerColumnProps {
    /** 该列的可访问名 */
    label?: string
    /** 选项 */
    options: PickerOption[]
    /** 当前值 */
    modelValue: string | number
    disabled?: boolean
    readonly?: boolean
    loop?: boolean
    itemHeight: number
    visibleCount: number
}
