/** 标签与面板的排布方向 */
export type TabsOrientation = 'horizontal' | 'vertical'

/** 激活方式：automatic 聚焦即激活，manual 需点击或回车 */
export type TabsActivationMode = 'automatic' | 'manual'

/** 阅读方向 */
export type TabsDirection = 'ltr' | 'rtl'

export interface TabsProps {
    /** 非受控模式下的初始激活项；受控时改用 `v-model` */
    defaultValue?: string | number
    /** 排布方向 */
    orientation?: TabsOrientation
    /** 激活方式 */
    activationMode?: TabsActivationMode
    /** 面板隐藏时是否卸载内容；关闭后隐藏内容仍保留在 DOM（带 `hidden`） */
    unmountOnHide?: boolean
    /** 阅读方向 */
    dir?: TabsDirection
}

export interface TabListProps {
    /** 键盘导航是否从末项循环回首项 */
    loop?: boolean
}

export interface TabTriggerProps {
    /** 关联面板的唯一值，需与 `CaomeiTabContent` 的 `value` 对应 */
    value: string | number
    /** 是否禁用 */
    disabled?: boolean
}

export interface TabContentProps {
    /** 关联触发器的唯一值，需与 `CaomeiTabTrigger` 的 `value` 对应 */
    value: string | number
    /** 强制挂载（供外部控制动画） */
    forceMount?: boolean
}
