/** 选择模式：`none` 只展示、`single` 单选、`multiple` 多选 */
export type TagGroupSelectionMode = 'none' | 'single' | 'multiple'

/**
 * 根组件 props。受控值由 `defineModel` 声明（`v-model`），不在此重复 `modelValue`，
 * 否则 `defineProps` 与 `defineModel` 会在模板作用域里撞同一个键。
 */
export interface TagGroupProps {
    /**
     * 选择模式；`none` 只渲染标签、不参与选择
     * @default 'none'
     * @en Selection mode; `none` renders tags without selection
     */
    selectionMode?: TagGroupSelectionMode
    /**
     * 禁止取消到空选择（至少保留一项）
     * @default false
     * @en Disallow clearing the last selected tag
     */
    disallowEmptySelection?: boolean
    /**
     * 禁用整个标签组（所有标签不可选、不可移除）
     * @default false
     * @en Disable the whole group (no selection, no removal)
     */
    disabled?: boolean
    /**
     * 方向键是否循环
     * @default true
     * @en Whether arrow keys wrap around
     */
    loop?: boolean
}

export interface TagGroupItemDeleteProps {
    /**
     * 删除按钮的可访问名（如「移除 前端」）；缺省时由 Reka 指向标签文本
     * @en Accessible name of the delete button (for example "Remove Frontend");
     * defaults to Reka's reference to the tag text
     */
    label?: string
}

export interface TagGroupItemProps {
    /**
     * 标签值（选择与移除的回调标识）
     * @en Tag value (identity for selection and removal)
     */
    value: string
    /**
     * 禁用该标签
     * @default false
     * @en Disable this tag
     */
    disabled?: boolean
    /**
     * 标签的文本值；缺省时取内部文本（用于可访问名与方向键查找）
     * @en Text value of the tag; defaults to its inner text (accessible name and typeahead)
     */
    textValue?: string
}
