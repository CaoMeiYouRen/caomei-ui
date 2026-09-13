/** 面板相对触发器的弹出方向 */
export type PopoverSide = 'top' | 'right' | 'bottom' | 'left'

/** 面板与触发器的对齐方式 */
export type PopoverAlign = 'start' | 'center' | 'end'

export interface PopoverProps {
    /**
     * 模态模式：开启后禁用外部交互、锁定页面滚动并将面板内容暴露给屏幕阅读器。
     *
     * 默认 `false`（非模态浮层），避免滚动条消失引起布局跳动；需要模态行为时显式开启。
     * @default false
     */
    modal?: boolean
}

export interface PopoverTriggerProps {
    /**
     * 是否禁用触发器
     * @default false
     */
    disabled?: boolean
}

export interface PopoverContentProps {
    /**
     * 弹出方向
     * @default 'bottom'
     */
    side?: PopoverSide
    /**
     * 与触发器的偏移距离（px）
     * @default 8
     */
    sideOffset?: number
    /**
     * 对齐方式
     * @default 'center'
     */
    align?: PopoverAlign
    /**
     * 对齐方向的偏移距离（px）
     * @default 0
     */
    alignOffset?: number
    /** 强制挂载（供外部控制动画） */
    forceMount?: boolean
    /**
     * 是否启用碰撞检测自动翻转，默认开启
     * @default true
     */
    avoidCollisions?: boolean
    /**
     * 禁用外部指针事件（模态交互）
     * @default false
     */
    disableOutsidePointerEvents?: boolean
}

export interface PopoverArrowProps {
    /**
     * 箭头宽度（px）
     * @default 10
     */
    width?: number
    /**
     * 箭头高度（px）
     * @default 5
     */
    height?: number
}

export interface PopoverCloseProps {
    /** 无可见文本时的可访问名，映射 aria-label */
    label?: string
}
