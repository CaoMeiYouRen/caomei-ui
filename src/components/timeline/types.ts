import type { Component } from 'vue'

/** 时间轴节点语气；只影响节点颜色，不承载业务语义 */
export type TimelineTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

export interface TimelineProps {
    /**
     * 布局方向：`left` 单侧、`right` 单侧、`alternate` 左右交替
     * @default 'left'
     * @en Layout direction: `left`, `right`, or `alternate`
     */
    mode?: 'left' | 'right' | 'alternate'
    /**
     * 是否反转节点顺序（最新在前）
     * @default false
     * @en Whether to reverse the item order (newest first)
     */
    reverse?: boolean
    /**
     * 时间轴的可访问名
     * @en Accessible name of the timeline
     */
    label?: string
}

export interface TimelineItemProps {
    /** 节点标题 */
    title?: string
    /** 节点正文 */
    content?: string
    /** 时间戳文本（原样展示，不参与本地化） */
    timestamp?: string
    /**
     * 节点语气
     * @default 'primary'
     * @en Tone of the dot
     */
    tone?: TimelineTone
    /** 自定义节点图标；提供时替代默认圆点 */
    icon?: Component
}
