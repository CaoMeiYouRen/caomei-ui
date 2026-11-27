import type { TreeItemKey, TreeNode } from '../tree/types'

export type { TreeItemKey, TreeNode }

export interface TreeVirtualizerProps {
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
     * 滚动容器高度（CSS 长度）；虚拟化必须有确定高度才能算出可视区间
     * @default '20rem'
     * @en Height of the scroll container (CSS length); virtualization needs a fixed height to compute the visible window
     */
    height?: string
    /**
     * 行高估算值（px）；用于计算可视区间与容器总高度
     * @default 28
     * @en Estimated row height in px, used for the visible window and the total height
     */
    itemHeight?: number
    /**
     * 可视区外额外渲染的行数
     * @default 12
     * @en Extra rows rendered outside the visible window
     */
    overscan?: number
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
     * 已选节点键（`v-model`）；单选时最多一项
     * @en Selected node keys (`v-model`); at most one in single mode
     */
    modelValue?: TreeItemKey[]
    /**
     * 是否多选
     * @default false
     * @en Whether multiple selection is allowed
     */
    multiple?: boolean
    /**
     * 树的可访问名
     * @en Accessible name of the tree
     */
    label?: string
}
