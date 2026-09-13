/**
 * 标签与面板的排布方向
 * @en Layout orientation of tabs and panels
 */
export type TabsOrientation = 'horizontal' | 'vertical'

/**
 * 激活方式：automatic 聚焦即激活，manual 需点击或回车
 * @en Activation mode: automatic activates on focus, manual requires a click or Enter
 */
export type TabsActivationMode = 'automatic' | 'manual'

/**
 * 阅读方向
 * @en Reading direction
 */
export type TabsDirection = 'ltr' | 'rtl'

export interface TabsProps {
    /**
     * 非受控模式下的初始激活项；受控时改用 `v-model`
     * @en Initial active item in uncontrolled mode; use `v-model` instead when controlled
     */
    defaultValue?: string | number
    /**
     * 排布方向
     * @en Layout orientation
     */
    orientation?: TabsOrientation
    /**
     * 激活方式
     * @en Activation mode
     */
    activationMode?: TabsActivationMode
    /**
     * 面板隐藏时是否卸载内容；关闭后隐藏内容仍保留在 DOM（带 `hidden`）
     * @en Whether to unmount content when a panel is hidden; when off, the hidden content stays in the DOM (with `hidden`)
     */
    unmountOnHide?: boolean
    /**
     * 阅读方向
     * @en Reading direction
     */
    dir?: TabsDirection
}

export interface TabListProps {
    /**
     * 键盘导航是否从末项循环回首项
     * @en Whether keyboard navigation loops from the last item back to the first
     */
    loop?: boolean
}

export interface TabTriggerProps {
    /**
     * 关联面板的唯一值，需与 `CaomeiTabContent` 的 `value` 对应
     * @en Unique value of the associated panel; must match `CaomeiTabContent`'s `value`
     */
    value: string | number
    /**
     * 是否禁用
     * @en Whether the trigger is disabled
     */
    disabled?: boolean
}

export interface TabContentProps {
    /**
     * 关联触发器的唯一值，需与 `CaomeiTabTrigger` 的 `value` 对应
     * @en Unique value of the associated trigger; must match `CaomeiTabTrigger`'s `value`
     */
    value: string | number
    /**
     * 强制挂载（供外部控制动画）
     * @en Force mount (for external animation control)
     */
    forceMount?: boolean
}
