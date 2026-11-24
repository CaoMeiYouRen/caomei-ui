import type { TreeNode } from '../tree/types'

/**
 * 透传属性（`class` / `style` / `id` / `data-*`）落在**字段按钮**上（组件整体即一个表单控件，
 * 无额外根包裹元素），故 `inheritAttrs` 关闭后由字段承接。
 */
export interface TreeSelectProps {
    /**
     * 树数据（与 `CaomeiTree` 同形）
     * @en Tree data (same shape as `CaomeiTree`)
     */
    items: TreeNode[]
    /**
     * 已选节点键（`v-model`）
     * @en Selected node keys (`v-model`)
     */
    modelValue?: string[]
    /**
     * 是否多选；多选时面板不因选中而关闭
     * @default false
     * @en Multiple selection; with multiple the panel stays open after selecting
     */
    multiple?: boolean
    /**
     * 字段为空时的占位文案
     * @en Placeholder shown when nothing is selected
     */
    placeholder?: string
    /**
     * 是否显示清空按钮（有值时生效）
     * @default false
     * @en Whether to show a clear button when there is a value
     */
    clearable?: boolean
    /**
     * 是否禁用
     * @default false
     * @en Whether the control is disabled
     */
    disabled?: boolean
    /**
     * 节点键的取值方式（字段名或取值函数）
     * @default 'id'
     * @en How to read a node key: a field name or an accessor
     */
    itemKey?: string | ((item: TreeNode) => string)
    /**
     * 可见文案的字段名
     * @default 'label'
     * @en Field name of the visible label
     */
    labelKey?: string
    /**
     * 子节点的字段名
     * @default 'children'
     * @en Field name of the children
     */
    childrenKey?: string
    /**
     * 无数据时的空态文案
     * @en Empty text shown when there is no node
     */
    emptyText?: string
    /**
     * 可访问名（映射 `aria-label`）
     * @en Accessible name (maps to `aria-label`)
     */
    label?: string
    /**
     * 面板最大高度
     * @default '16rem'
     * @en Max height of the panel
     */
    panelMaxHeight?: string
    /**
     * 清空按钮的可访问名；缺省取语言包 `select.clear`
     * @en Accessible name of the clear button; falls back to the locale's `select.clear`
     */
    clearLabel?: string
}
