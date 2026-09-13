/** 菜单相对触发器的弹出方向 */
export type DropdownMenuSide = 'top' | 'right' | 'bottom' | 'left'

/** 菜单与触发器的对齐方式 */
export type DropdownMenuAlign = 'start' | 'center' | 'end'

/** 阅读方向 */
export type DropdownMenuDirection = 'ltr' | 'rtl'

export interface DropdownMenuProps {
    /**
     * 模态模式：开启后禁用外部交互、锁定页面滚动并将菜单内容暴露给屏幕阅读器。
     *
     * 默认 `false`（非模态下拉），避免滚动条消失引起布局跳动，与主题与样式设计 §5.1 对齐；
     * 需要模态行为时显式开启。
     * @default false
     */
    modal?: boolean
    /** 阅读方向 */
    dir?: DropdownMenuDirection
}

export interface DropdownMenuTriggerProps {
    /**
     * 是否禁用触发器
     * @default false
     */
    disabled?: boolean
}

export interface DropdownMenuContentProps {
    /**
     * 弹出方向
     * @default 'bottom'
     */
    side?: DropdownMenuSide
    /**
     * 与触发器的偏移距离（px）
     * @default 4
     */
    sideOffset?: number
    /**
     * 对齐方式
     * @default 'start'
     */
    align?: DropdownMenuAlign
    /**
     * 对齐方向的偏移距离（px）
     * @default 0
     */
    alignOffset?: number
    /**
     * 键盘导航是否从末项循环到首项
     * @default true
     */
    loop?: boolean
    /** 强制挂载（供外部控制动画） */
    forceMount?: boolean
}
