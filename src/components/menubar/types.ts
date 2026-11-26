/**
 * 受控语义：根节点 `v-model:model-value` 写入某个菜单的 `value` 即展开该菜单，
 * 关闭后回落为空字符串；未绑定 `v-model` 时为非受控。
 * `CaomeiMenubarMenu` 的 `value` 缺省由 Reka 生成，之后无法用受控值寻址。
 */

/** 菜单内容相对触发器的方位 */
export type MenubarSide = 'top' | 'right' | 'bottom' | 'left'

/** 菜单内容相对触发器的对齐方式 */
export type MenubarAlign = 'start' | 'center' | 'end'

export interface MenubarProps {
    /**
     * 键盘方向键在菜单栏内是否循环
     * @default true
     * @en Whether arrow keys wrap inside the menubar
     */
    loop?: boolean
    /**
     * 文本方向
     * @en Text direction
     */
    dir?: 'ltr' | 'rtl'
}

export interface MenubarMenuProps {
    /**
     * 菜单标识；与根节点的 `v-model:modelValue` 配合实现受控开合
     * @en Menu identifier; pairs with the root's `v-model:modelValue` for controlled open state
     */
    value?: string
}

export interface MenubarTriggerProps {
    /**
     * 是否禁用该菜单
     * @default false
     * @en Whether the menu is disabled
     */
    disabled?: boolean
}

export interface MenubarContentProps {
    /**
     * 相对触发器的方位
     * @default 'bottom'
     * @en Side relative to the trigger
     */
    side?: MenubarSide
    /**
     * 与触发器的间距（px）
     * @default 4
     * @en Distance from the trigger in px
     */
    sideOffset?: number
    /**
     * 相对触发器的对齐方式
     * @default 'start'
     * @en Alignment relative to the trigger
     */
    align?: MenubarAlign
    /**
     * 对齐方向上的偏移（px）
     * @default 0
     * @en Alignment offset in px
     */
    alignOffset?: number
    /**
     * 内容内键盘导航是否循环
     * @default true
     * @en Whether keyboard navigation wraps inside the content
     */
    loop?: boolean
    /**
     * 关闭时是否仍挂载内容（用于动画或预渲染）
     * @default false
     * @en Whether the content stays mounted while closed (for animation or pre-rendering)
     */
    forceMount?: boolean
}

export interface MenubarItemProps {
    /**
     * 是否禁用
     * @default false
     * @en Whether the item is disabled
     */
    disabled?: boolean
    /**
     * 右侧快捷键提示（仅展示，不绑定按键）
     * @default ''
     * @en Shortcut hint on the right (display only)
     */
    shortcut?: string
    /**
     * 类型提示用的文本值
     * @en Text value used for typeahead
     */
    textValue?: string
}
