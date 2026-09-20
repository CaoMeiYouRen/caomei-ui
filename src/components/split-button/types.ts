import type { ComponentSize, ComponentTone, ComponentVariant } from '../../types'
import type {
    DropdownMenuAlign,
    DropdownMenuCommandEvent,
    DropdownMenuModelItem,
    DropdownMenuSide,
} from '../dropdown-menu'

/**
 * 触发菜单项 `command` 时传入的事件对象（与 `DropdownMenuCommandEvent` 同形，为 SplitButton 保留具名导出）
 * @en Event object passed when a menu item's `command` is triggered (same shape as `DropdownMenuCommandEvent`, kept as a named export for SplitButton)
 */
export type SplitButtonCommandEvent = DropdownMenuCommandEvent

/**
 * 菜单项（与 `DropdownMenuModelItem` 同形，为 SplitButton 保留具名导出）
 * @en Menu item (same shape as `DropdownMenuModelItem`, kept as a named export for SplitButton)
 */
export type SplitButtonMenuItem = DropdownMenuModelItem

export interface SplitButtonProps {
    /**
     * 主按钮的不可见可访问名（映射 `aria-label`），用于图标按钮等无可见文本的场景；
     * 主按钮的可见文本请使用默认插槽；可访问名优先级为「本 prop > 透传 `aria-label`」（无内建兜底文案）
     * @en Invisible accessible name of the main button (maps to `aria-label`), for icon-only usage; use the default slot for the visible text. Priority is "this prop > forwarded `aria-label`" (no built-in fallback)
     */
    label?: string
    /**
     * 分组可访问名（映射到根元素 `aria-label`）；默认不设置，由使用方根据上下文提供
     * @en Group accessible name (mapped to root element's `aria-label`); not set by default, provided by the consumer based on context
     */
    groupLabel?: string
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
