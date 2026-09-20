import type { Component } from 'vue'

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

/**
 * 触发数据驱动菜单项 `command` 时传入的事件对象
 * @en Event object passed when a data-driven item's `command` is triggered
 */
export interface DropdownMenuCommandEvent {
    /**
     * 对应的菜单项
     * @en The menu item that was selected
     */
    item: DropdownMenuModelItem
    /**
     * 原始 DOM 事件
     * @en The original DOM event
     */
    originalEvent: Event
}

/**
 * 数据驱动菜单项，对应 PrimeVue `MenuItem` 的常用子集
 * @en Data-driven menu item, the common subset of PrimeVue's `MenuItem`
 */
export interface DropdownMenuModelItem {
    /**
     * 条目文本
     * @en Item label
     */
    label?: string
    /**
     * 条目图标，传 `@lucide/vue` 图标组件（非 PrimeVue 的字符串类名）
     * @en Item icon; pass a `@lucide/vue` icon component (not a PrimeVue class-name string)
     */
    icon?: Component
    /**
     * 选中条目时的回调
     * @en Callback invoked when the item is selected
     */
    command?: (event: DropdownMenuCommandEvent) => void
    /**
     * 是否禁用
     * @default false
     * @en Whether the item is disabled
     */
    disabled?: boolean
    /**
     * 是否渲染为分隔线（此时忽略其余字段）
     * @default false
     * @en Whether to render a separator (other fields are ignored)
     */
    separator?: boolean
    /**
     * 嵌套子菜单项；设置后渲染为子菜单触发器，点击展开下一级菜单
     * @en Nested submenu items; when set, renders as a submenu trigger that expands the next level on click
     */
    items?: DropdownMenuModelItem[]
    /**
     * 自定义 CSS 类名（字符串或对象/数组形态，与 Vue `:class` 绑定一致）
     * @en Custom CSS class name (string or object/array shape, consistent with Vue `:class` binding)
     */
    class?: string | Record<string, boolean> | (string | Record<string, boolean>)[]
}

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
    /**
     * 数据驱动菜单项；渲染在默认插槽之前，可与插槽内容共存。
     *
     * `separator` 渲染为分隔线，其余条目渲染为普通条目并在选中时调用 `command`。
     * @en Data-driven menu items, rendered before the default slot and able to coexist with it. `separator` renders a separator; other entries render as regular items and call `command` when selected.
     */
    model?: DropdownMenuModelItem[]
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
