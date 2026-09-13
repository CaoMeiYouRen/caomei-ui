/**
 * 面板相对触发器的弹出方向
 * @en Placement direction of the panel relative to the trigger
 */
export type PopoverSide = 'top' | 'right' | 'bottom' | 'left'

/**
 * 面板与触发器的对齐方式
 * @en Alignment of the panel with the trigger
 */
export type PopoverAlign = 'start' | 'center' | 'end'

export interface PopoverProps {
    /**
     * 模态模式：开启后禁用外部交互、锁定页面滚动并将面板内容暴露给屏幕阅读器。
     *
     * 默认 `false`（非模态浮层），避免滚动条消失引起布局跳动；需要模态行为时显式开启。
     * @default false
     * @en Modal mode: when enabled, disables outside interaction, locks page scroll and exposes the panel content to screen readers. Defaults to `false` (a non-modal popover) to avoid layout shift from the disappearing scrollbar; enable it explicitly when modal behavior is needed.
     */
    modal?: boolean
}

export interface PopoverTriggerProps {
    /**
     * 是否禁用触发器
     * @default false
     * @en Whether to disable the trigger
     */
    disabled?: boolean
}

export interface PopoverContentProps {
    /**
     * 弹出方向
     * @default 'bottom'
     * @en Placement direction
     */
    side?: PopoverSide
    /**
     * 与触发器的偏移距离（px）
     * @default 8
     * @en Offset distance from the trigger (px)
     */
    sideOffset?: number
    /**
     * 对齐方式
     * @default 'center'
     * @en Alignment
     */
    align?: PopoverAlign
    /**
     * 对齐方向的偏移距离（px）
     * @default 0
     * @en Offset distance along the alignment axis (px)
     */
    alignOffset?: number
    /**
     * 强制挂载（供外部控制动画）
     * @en Force mount (for external animation control)
     */
    forceMount?: boolean
    /**
     * 是否启用碰撞检测自动翻转，默认开启
     * @default true
     * @en Whether to enable collision-aware auto flipping, on by default
     */
    avoidCollisions?: boolean
    /**
     * 禁用外部指针事件（模态交互）
     * @default false
     * @en Disable outside pointer events (modal interaction)
     */
    disableOutsidePointerEvents?: boolean
}

export interface PopoverArrowProps {
    /**
     * 箭头宽度（px）
     * @default 10
     * @en Arrow width (px)
     */
    width?: number
    /**
     * 箭头高度（px）
     * @default 5
     * @en Arrow height (px)
     */
    height?: number
}

export interface PopoverCloseProps {
    /**
     * 无可见文本时的可访问名，映射 aria-label
     * @en Accessible name when there is no visible text, maps to aria-label
     */
    label?: string
}
