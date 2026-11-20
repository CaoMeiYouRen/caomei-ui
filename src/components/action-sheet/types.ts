/**
 * 操作面板条目值
 * @en Action sheet item value
 */
export type ActionSheetValue = string | number

export interface ActionSheetItem {
    /**
     * 条目文案
     * @en Item label
     */
    label: string
    /**
     * 条目值；选择时随 `select` 事件抛出
     * @en Item value; emitted with the `select` event
     */
    value?: ActionSheetValue
    /**
     * 条目说明（显示在文案下方）
     * @en Item description (shown below the label)
     */
    description?: string
    /**
     * 是否为危险操作（如删除），以危险色呈现
     * @en Whether this is a destructive action (e.g. delete), rendered in the danger colour
     */
    danger?: boolean
    /**
     * 是否禁用
     * @en Whether the item is disabled
     */
    disabled?: boolean
}

export interface ActionSheetGroup {
    /**
     * 分组标题
     * @en Group label
     */
    label?: string
    /**
     * 分组内条目
     * @en Items in the group
     */
    items: ActionSheetItem[]
}

export interface ActionSheetProps {
    /**
     * 标题
     * @en Title
     */
    title?: string
    /**
     * 说明文本
     * @en Description text
     */
    description?: string
    /**
     * 分组条目；未提供且无默认插槽时不渲染内容区
     * @en Grouped items; no content is rendered when neither this nor the default slot is provided
     */
    groups?: ActionSheetGroup[]
    /**
     * 取消项文案；缺省取当前语言的「取消」
     * @en Cancel item label; defaults to the current locale's "Cancel"
     */
    cancelLabel?: string
    /**
     * 选择条目后是否自动关闭；默认 true
     * @en Whether selecting an item closes the sheet automatically; true by default
     */
    closeOnSelect?: boolean
}
