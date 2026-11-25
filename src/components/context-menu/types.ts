import type { Component } from 'vue'

/**
 * 触发数据驱动菜单项 `command` 时传入的事件对象
 * @en Event object passed when a data-driven item's `command` is triggered
 */
export interface ContextMenuCommandEvent {
    /** 对应的菜单项 */
    item: ContextMenuModelItem
    /** 原始 DOM 事件 */
    originalEvent: Event
}

/** 数据驱动菜单项（与 DropdownMenu 的条目语义对齐） */
export interface ContextMenuModelItem {
    /** 条目文本 */
    label?: string
    /** 条目图标，传 `@lucide/vue` 图标组件 */
    icon?: Component
    /** 选中条目时的回调 */
    command?: (event: ContextMenuCommandEvent) => void
    /** 是否禁用 */
    disabled?: boolean
    /** 是否渲染为分隔线（忽略其余字段） */
    separator?: boolean
    /** 快捷键提示文本（仅展示，不绑定按键） */
    shortcut?: string
    /** 危险操作语气 */
    danger?: boolean
    /** 自定义类名 */
    class?: string | Record<string, boolean> | (string | Record<string, boolean>)[]
}

export interface ContextMenuProps {
    /**
     * 模态模式：开启后锁定页面滚动并屏蔽外部指针
     * @default false
     * @en Modal mode: locks page scroll and blocks outside pointers
     */
    modal?: boolean
}

export interface ContextMenuTriggerProps {
    /**
     * 去掉内建触发区外观类，仅保留右键 / 长按开合与无障碍接线。
     *
     * 触发区不生成盒（`display: contents`）、不带 `tabindex`：右键菜单由指针打开，键盘用户
     * 需要入口时由使用方提供（如在可聚焦元素上监听 Shift+F10 并绑定 `v-model:open`）。
     * 关闭后的焦点归还由根组件保证（记录打开前的焦点并重试写入，`forceMount` 下同样生效）；
     * 若关闭时焦点已被消费方（如 `command` 打开的对话框）接管，则不抢回。
     * @default false
     * @en Drop the built-in trigger area class, keeping only the context-menu wiring
     */
    unstyled?: boolean
}

export interface ContextMenuContentProps {
    /**
     * 数据驱动条目（与默认插槽二选一或混用）
     * @en Data-driven items (use alone or together with the default slot)
     */
    model?: ContextMenuModelItem[]
    /**
     * 是否循环键盘导航
     * @default true
     * @en Whether keyboard navigation loops
     */
    loop?: boolean
    /**
     * 强制挂载（供外部控制动画）
     * @default false
     * @en Force mount (for external animation control)
     */
    forceMount?: boolean
}

export interface ContextMenuItemProps {
    /** 是否禁用 */
    disabled?: boolean
    /** 快捷键提示文本（仅展示） */
    shortcut?: string
    /** 危险操作语气 */
    danger?: boolean
    /** 无障碍文本值，缺省取条目文本 */
    textValue?: string
}
