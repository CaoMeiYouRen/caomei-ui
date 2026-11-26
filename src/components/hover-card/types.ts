/** 卡片相对触发器的方位 */
export type HoverCardSide = 'top' | 'right' | 'bottom' | 'left'

/** 卡片相对触发器的对齐方式 */
export type HoverCardAlign = 'start' | 'center' | 'end'

export interface HoverCardProps {
    /**
     * 悬停后延迟打开的时间（ms）
     * @default 200
     * @en Delay before opening on hover (ms)
     */
    openDelay?: number
    /**
     * 离开后延迟关闭的时间（ms）
     * @default 100
     * @en Delay before closing after leaving (ms)
     */
    closeDelay?: number
}

export interface HoverCardTriggerProps {
    /**
     * 禁用触发器：不渲染浮层、不响应悬停与聚焦（该信息源对键盘与鼠标同时移除）
     * @default false
     * @en Disables the trigger: no popup and no hover / focus response
     * (the information source is removed for keyboard and pointer alike)
     */
    disabled?: boolean
}

export interface HoverCardContentProps {
    /**
     * 相对触发器的方位
     * @default 'bottom'
     * @en Side relative to the trigger
     */
    side?: HoverCardSide
    /**
     * 相对触发器的对齐方式
     * @default 'start'
     * @en Alignment relative to the trigger
     */
    align?: HoverCardAlign
    /**
     * 与触发器的间距（px）
     * @default 6
     * @en Distance from the trigger in px
     */
    sideOffset?: number
    /**
     * 对齐方向上的偏移（px）
     * @default 0
     * @en Alignment offset in px
     */
    alignOffset?: number
    /**
     * 关闭时是否仍挂载内容
     * @default false
     * @en Whether the content stays mounted while closed
     */
    forceMount?: boolean
}
