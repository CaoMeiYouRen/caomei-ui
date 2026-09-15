import type { Component } from 'vue'
import type { ComponentSize, ComponentTone, ComponentVariant } from '../../types'
import type { DropdownMenuAlign, DropdownMenuSide } from '../dropdown-menu'

/**
 * 触发菜单项 `command` 时传入的事件对象
 * @en Event object passed when a menu item's `command` is triggered
 */
export interface SplitButtonCommandEvent {
    /**
     * 对应的菜单项
     * @en The menu item that was selected
     */
    item: SplitButtonMenuItem
    /**
     * 原始 DOM 事件
     * @en The original DOM event
     */
    originalEvent: Event
}

export interface SplitButtonMenuItem {
    /**
     * 菜单项文本
     * @en Menu item label
     */
    label?: string
    /**
     * 菜单项图标，传 `@lucide/vue` 图标组件（非 PrimeVue 的字符串类名）
     * @en Menu item icon; pass a `@lucide/vue` icon component (not a PrimeVue class-name string)
     */
    icon?: Component
    /**
     * 选中菜单项时的回调
     * @en Callback invoked when the item is selected
     */
    command?: (event: SplitButtonCommandEvent) => void
    /**
     * 是否禁用
     * @en Whether the item is disabled
     */
    disabled?: boolean
    /**
     * 是否渲染为分隔线（此时忽略其余字段）
     * @en Whether to render a separator (other fields are ignored)
     */
    separator?: boolean
}

export interface SplitButtonProps {
    /**
     * 主按钮的不可见可访问名（映射 `aria-label`），用于图标按钮等无可见文本的场景；
     * 主按钮的可见文本请使用默认插槽
     * @en Invisible accessible name of the main button (maps to `aria-label`), for icon-only usage; use the default slot for the visible text
     */
    label?: string
    /**
     * 下拉菜单项
     * @en Dropdown menu items
     */
    model?: SplitButtonMenuItem[]
    /**
     * 主按钮与下拉按钮共用的视觉变体
     * @default 'primary'
     * @en Visual variant shared by the main and menu buttons
     */
    variant?: ComponentVariant
    /**
     * 语义色调
     * @en Semantic tone
     */
    tone?: ComponentTone
    /**
     * 尺寸
     * @default 'md'
     * @en Size
     */
    size?: ComponentSize
    /**
     * 是否为胶囊圆角（两端外侧圆角）
     * @default false
     * @en Whether to use pill radius (outer corners only)
     */
    rounded?: boolean
    /**
     * 是否禁用
     * @default false
     * @en Whether the split button is disabled
     */
    disabled?: boolean
    /**
     * 主按钮是否处于加载态
     * @default false
     * @en Whether the main button is loading
     */
    loading?: boolean
    /**
     * 下拉按钮的可访问标签；默认取当前语言的「更多操作」文案
     * @en Accessible label of the menu button; defaults to the current locale's "More actions" text
     */
    menuLabel?: string
    /**
     * 菜单弹出方向
     * @default 'bottom'
     * @en Menu side
     */
    menuSide?: DropdownMenuSide
    /**
     * 菜单与触发器的对齐方式
     * @default 'end'
     * @en Menu alignment relative to the trigger
     */
    menuAlign?: DropdownMenuAlign
}
