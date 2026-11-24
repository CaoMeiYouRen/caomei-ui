/**
 * 节点键类型。
 *
 * primitive 内部以字符串键比较（`aria-posinset` 等也按 `data-indent` 处理），故数字键会被
 * 规范化为字符串；`items` 中的业务字段仍可保持原始类型。
 */
export type TreeItemKey = string

/**
 * 树节点。
 *
 * 键取 `itemKey` 指定字段（默认 `id`），子节点取 `childrenKey` 指定字段（默认 `children`）；
 * `label` 为可见文案（`labelKey` 可改名），`disabled` 只禁用该节点的选择与展开。
 */
export interface TreeNode {
    /** 节点键（字段名可由 `itemKey` 改名） */
    id?: TreeItemKey
    /** 可见文案（字段名可由 `labelKey` 改名） */
    label?: string
    /** 子节点（字段名可由 `childrenKey` 改名） */
    children?: TreeNode[]
    /** 是否禁用该节点 */
    disabled?: boolean
    /** 业务自定义字段随节点携带 */
    [key: string]: unknown
}

export interface TreeProps {
    /**
     * 树数据（递归结构）
     * @en Tree data (recursive structure)
     */
    items: TreeNode[]
    /**
     * 节点键的取值方式：字段名或取值函数
     * @default 'id'
     * @en How to read a node key: a field name or an accessor
     */
    itemKey?: string | ((item: TreeNode) => TreeItemKey)
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
     * 是否多选；单选时模型为空数组表示未选中
     * @default false
     * @en Whether multiple selection is allowed; in single mode an empty array means nothing is selected
     */
    multiple?: boolean
    /**
     * 已选节点键（`v-model`）
     * @en Selected node keys (`v-model`)
     */
    modelValue?: TreeItemKey[]
    /**
     * 展开的节点键（`v-model:expanded`）
     * @en Expanded node keys (`v-model:expanded`)
     */
    expanded?: TreeItemKey[]
    /**
     * 非受控时的初始展开节点键
     * @en Initially expanded keys in uncontrolled mode
     */
    defaultExpanded?: TreeItemKey[]
    /**
     * 是否整体禁用
     * @en Whether the whole tree is disabled
     */
    disabled?: boolean
    /**
     * 选中父节点时是否连带选中全部后代（仅多选生效）
     * @default false
     * @en Whether selecting a parent also selects all descendants (multiple mode only)
     */
    propagateSelect?: boolean
    /**
     * 后代全部选中时是否把父节点标记为选中 / 半选（仅多选生效）
     * @default false
     * @en Whether a parent is marked selected / indeterminate when all descendants are selected (multiple mode only)
     */
    bubbleSelect?: boolean
    /**
     * 树的可访问名
     * @en Accessible name of the tree
     */
    label?: string
}
