/** 级联选择的值：与 Select 一致，仅接受可稳定比较的字符串 / 数字 */
export type CascaderValue = string | number

export interface CascaderOption {
    label: string
    value: CascaderValue
    children?: CascaderOption[]
    disabled?: boolean
}

export interface CascaderProps {
    /**
     * 选中的完整路径（从根到叶）；空数组 / `null` 表示未选择
     * @default []
     * @en Selected path from root to leaf; an empty array or `null` means no selection
     */
    modelValue?: CascaderValue[] | null
    /**
     * 级联选项树
     * @default []
     * @en Cascading option tree
     */
    options?: CascaderOption[]
    /**
     * 未选择时的占位文案
     * @default ''
     * @en Placeholder shown when nothing is selected
     */
    placeholder?: string
    /**
     * 是否显示清除按钮
     * @default true
     * @en Whether to show the clear button
     */
    clearable?: boolean
    /**
     * 选中父级（仍有子级）时是否立即提交
     * @default false
     * @en Whether selecting a parent with children commits immediately
     */
    changeOnSelect?: boolean
    /**
     * 路径展示分隔符
     * @default ' / '
     * @en Separator used to join the path labels
     */
    separator?: string
    /**
     * 是否禁用
     * @default false
     * @en Whether the control is disabled
     */
    disabled?: boolean
    /**
     * 触发器的可访问名
     * @en Accessible name of the trigger
     */
    label?: string
}
