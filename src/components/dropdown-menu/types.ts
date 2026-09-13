/**
 * 菜单相对触发器的弹出方向
 * @en Dropdown direction relative to the trigger
 */
export type DropdownMenuSide = 'top' | 'right' | 'bottom' | 'left'

/**
 * 菜单与触发器的对齐方式
 * @en Alignment of the menu with the trigger
 */
export type DropdownMenuAlign = 'start' | 'center' | 'end'

/**
 * 阅读方向
 * @en Reading direction
 */
export type DropdownMenuDirection = 'ltr' | 'rtl'

export interface DropdownMenuProps {
    /**
     * 模态模式：开启后禁用外部交互、锁定页面滚动并将菜单内容暴露给屏幕阅读器。
     *
     * 默认 `false`（非模态下拉），避免滚动条消失引起布局跳动，与主题与样式设计 §5.1 对齐；
     * 需要模态行为时显式开启。
     * @default false
     * @en Modal mode: when enabled, disables outside interaction, locks page scroll and exposes the menu content to screen readers. Defaults to `false` (non-modal dropdown) to avoid layout shift from the disappearing scrollbar, aligned with Theming and styles §5.1; enable it explicitly when modal behavior is needed.
     */
    modal?: boolean
    /**
     * 阅读方向
     * @en Reading direction
     */
    dir?: DropdownMenuDirection
}

export interface DropdownMenuTriggerProps {
    /**
     * 是否禁用触发器
     * @default false
     * @en Whether to disable the trigger
     */
    disabled?: boolean
}

export interface DropdownMenuContentProps {
    /**
     * 弹出方向
     * @default 'bottom'
     * @en Dropdown direction
     */
    side?: DropdownMenuSide
    /**
     * 与触发器的偏移距离（px）
     * @default 4
     * @en Offset distance from the trigger (px)
     */
    sideOffset?: number
    /**
     * 对齐方式
     * @default 'start'
     * @en Alignment
     */
    align?: DropdownMenuAlign
    /**
     * 对齐方向的偏移距离（px）
     * @default 0
     * @en Offset distance along the alignment axis (px)
     */
    alignOffset?: number
    /**
     * 键盘导航是否从末项循环到首项
     * @default true
     * @en Whether keyboard navigation loops from the last item to the first
     */
    loop?: boolean
    /**
     * 强制挂载（供外部控制动画）
     * @en Force mount (for external animation control)
     */
    forceMount?: boolean
}

export interface DropdownMenuItemProps {
    /**
     * 是否禁用
     * @default false
     * @en Whether it is disabled
     */
    disabled?: boolean
    /**
     * 复杂内容时用于 typeahead 的文本
     * @en Text used for typeahead with complex content
     */
    textValue?: string
    /**
     * 右侧快捷键提示文本
     * @en Shortcut hint text on the right
     */
    shortcut?: string
}

export interface DropdownMenuCheckboxItemProps {
    /**
     * 是否禁用
     * @default false
     * @en Whether it is disabled
     */
    disabled?: boolean
    /**
     * 复杂内容时用于 typeahead 的文本
     * @en Text used for typeahead with complex content
     */
    textValue?: string
    /**
     * 右侧快捷键提示文本
     * @en Shortcut hint text on the right
     */
    shortcut?: string
}

export interface DropdownMenuRadioItemProps {
    /**
     * 选项值，需在同一个 RadioGroup 内唯一
     * @en Option value; must be unique within a single RadioGroup
     */
    value: string | number
    /**
     * 是否禁用
     * @default false
     * @en Whether it is disabled
     */
    disabled?: boolean
    /**
     * 复杂内容时用于 typeahead 的文本
     * @en Text used for typeahead with complex content
     */
    textValue?: string
    /**
     * 右侧快捷键提示文本
     * @en Shortcut hint text on the right
     */
    shortcut?: string
}
