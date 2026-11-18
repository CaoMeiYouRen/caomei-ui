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
    /**
     * 去掉内建触发器外观类，仅保留开合与无障碍接线。
     *
     * 配合 `as-child` 复用自定义按钮（如 `CaomeiButton`）时使用：外观类合并到子元素会与子元素自身
     * 样式竞争（padding / border / background 等），`unstyled` 让复合层只借用行为、不继承默认皮肤。
     * @default false
     * @en Drop the built-in trigger appearance class, keeping only the open/close and a11y wiring. Use it with `as-child` when reusing a custom button so the default skin does not merge onto the child and compete with its own padding / border / background.
     */
    unstyled?: boolean
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
     * 锁定背景：面板外的点击 / 聚焦不再关闭浮层，`Escape`、触发器切换与面板内关闭按钮不受影响。
     * 关闭该配置后恢复既有行为（外部点击 / 聚焦照旧关闭）。打开态的背景隔离不依赖本开关。
     * 非模态 Popover 上游会忽略该配置，本组件补齐语义
     * @default false
     * @en Lock the background: pointer clicks and focus moves outside the panel no longer close it,
     * while `Escape`, toggling the trigger and the in-panel close button are unaffected. Turning the
     * flag off restores the existing behavior (outside clicks and focus close it again). Background
     * isolation while open does not depend on this flag. Upstream ignores the flag on non-modal
     * popovers; this component fills the semantics in
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
