/**
 * 受控语义：根节点 `v-model` 写入某个触发器的 `value` 即展开该菜单，
 * 关闭后 Reka 回写为空字符串（不是 `undefined`）；未绑定 `v-model` 时为非受控。
 * 触发器 `value` 缺省由 Reka 生成，之后无法用受控值寻址，受控场景请显式传值。
 */

/** 导航菜单排列方向 */
export type NavigationMenuOrientation = 'horizontal' | 'vertical'

export interface NavigationMenuProps {
    /**
     * 悬停后展开的延迟（ms）
     * @default 200
     * @en Delay before opening on hover (ms)
     */
    delayDuration?: number
    /**
     * 相邻菜单之间跳过延迟的窗口（ms）
     * @default 300
     * @en Window to skip the delay when moving between menus (ms)
     */
    skipDelayDuration?: number
    /**
     * 排列方向
     * @default 'horizontal'
     * @en Layout orientation
     */
    orientation?: NavigationMenuOrientation
    /**
     * 文本方向
     * @en Text direction
     */
    dir?: 'ltr' | 'rtl'
}

export interface NavigationMenuTriggerProps {
    /**
     * 菜单标识；与根的 `v-model` 配合实现受控开合
     * @en Menu identifier; pairs with the root's `v-model` for controlled open state
     */
    value?: string
    /**
     * 是否禁用
     * @default false
     * @en Whether the trigger is disabled
     */
    disabled?: boolean
}

export interface NavigationMenuContentProps {
    /**
     * 关闭时是否仍挂载内容
     * @default false
     * @en Whether the content stays mounted while closed
     */
    forceMount?: boolean
}

export interface NavigationMenuLinkProps {
    /**
     * 是否为当前页面（映射 `aria-current="page"`）
     * @default false
     * @en Whether this link points at the current page (maps to `aria-current="page"`)
     */
    active?: boolean
}
