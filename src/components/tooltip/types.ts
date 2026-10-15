/**
 * 面板相对触发器的弹出方向
 * @en Placement direction of the panel relative to the trigger
 */
export type TooltipSide = 'top' | 'right' | 'bottom' | 'left'

/**
 * 面板与触发器的对齐方式
 * @en Alignment of the panel with the trigger
 */
export type TooltipAlign = 'start' | 'center' | 'end'

export interface TooltipProviderProps {
    /**
     * 指针进入触发器后到面板出现的等待时长（ms）。
     *
     * Provider 上的值对全部后代 tooltip 生效；单个 `CaomeiTooltip` 可用同名 prop 覆盖。
     * @default 700
     * @en Delay between the pointer entering the trigger and the panel appearing (ms). The provider value applies to all descendant tooltips; a single `CaomeiTooltip` can override it with the same prop.
     */
    delayDuration?: number
    /**
     * 从一个触发器移到另一个触发器时，免去延迟的宽限时长（ms）
     * @default 300
     * @en Grace period (ms) during which moving from one trigger to another skips the delay
     */
    skipDelayDuration?: number
    /**
     * 是否停用全部后代面板
     * @default false
     * @en Whether to disable all descendant panels
     */
    disabled?: boolean
    /**
     * 是否禁止指针移入面板（面板不可悬停）。
     *
     * 开启后指针离开触发器即关闭，面板内无法选中文本——**有可访问性代价**，仅在确有需要时开启。
     * @default false
     * @en Whether to prevent the pointer from entering the panel (non-hoverable). Once enabled the panel closes as soon as the pointer leaves the trigger and text inside cannot be selected — this has accessibility costs, so enable it only when needed.
     */
    disableHoverableContent?: boolean
    /**
     * 是否只在键盘触发（`:focus-visible`）时打开。
     *
     * 开启后可避免切换浏览器标签页、关闭对话框等「非键盘焦点」场景误弹面板。
     * @default false
     * @en Whether to open only for keyboard-initiated focus (`:focus-visible`). Enabling it avoids opening the panel on non-keyboard focus such as switching browser tabs or closing a dialog.
     */
    ignoreNonKeyboardFocus?: boolean
    /**
     * 点击触发器是否**不**关闭面板（对全部后代生效；单条可用同名 prop 覆盖）。
     * @default false
     * @en Whether clicking the trigger does **not** close the panel (applies to all descendants; a single tooltip can override it with the same prop).
     */
    disableClosingTrigger?: boolean
}

export interface TooltipProps {
    /**
     * 覆盖 Provider 的延迟时长（ms）。
     *
     * **缺省不传**——由 Provider 的值兜底（Provider 缺省 `700`）；本组件不设默认值，
     * 否则会静默压掉 Provider 级配置。
     * @en Overrides the provider delay duration (ms). **Omitted by default** — the provider value applies (provider default `700`); this component sets no default of its own, which would otherwise silently override the provider-level setting.
     */
    delayDuration?: number
    /**
     * 是否停用本面板。**缺省不传**，由 Provider 兜底（Provider 缺省不停用）。
     * @en Whether to disable this panel. **Omitted by default**, falling back to the provider (not disabled by default).
     */
    disabled?: boolean
    /**
     * 是否禁止指针移入面板（面板不可悬停）；**有可访问性代价**，仅在确有需要时开启。**缺省不传**，由 Provider 兜底。
     * @en Whether to prevent the pointer from entering the panel (non-hoverable); this has accessibility costs, so enable it only when needed. **Omitted by default**, falling back to the provider.
     */
    disableHoverableContent?: boolean
    /**
     * 点击触发器是否**不**关闭面板。
     *
     * Reka 契约默认为「展开时点击触发器会收起」；需要「点击保持展开」时开启。
     * **缺省不传**，由 Provider 兜底（Provider 缺省同为「点击收起」）。
     * @en Whether clicking the trigger does **not** close the panel. The Reka default is "clicking the trigger while open collapses it"; enable this to keep it open on click. **Omitted by default**, falling back to the provider (whose default is also "click collapses").
     */
    disableClosingTrigger?: boolean
    /**
     * 是否只在键盘触发（`:focus-visible`）时打开。**缺省不传**，由 Provider 兜底。
     * @en Whether to open only for keyboard-initiated focus (`:focus-visible`). **Omitted by default**, falling back to the provider.
     */
    ignoreNonKeyboardFocus?: boolean
}

export interface TooltipTriggerProps {
    /**
     * 去掉内建触发器外观类，仅保留开合与无障碍接线。
     *
     * 配合 `as-child` 复用自定义控件（如 `CaomeiButton`）时使用：外观类合并到子元素会与子元素自身
     * 样式竞争（padding / border / background 等），`unstyled` 让复合层只借用行为、不继承默认皮肤。
     * @default false
     * @en Drop the built-in trigger appearance class, keeping only the open/close and a11y wiring. Use it with `as-child` when reusing a custom control so the default skin does not merge onto the child and compete with its own padding / border / background.
     */
    unstyled?: boolean
}

export interface TooltipContentProps {
    /**
     * 弹出方向
     * @default 'top'
     * @en Placement direction
     */
    side?: TooltipSide
    /**
     * 与触发器的偏移距离（px）
     * @default 6
     * @en Offset distance from the trigger (px)
     */
    sideOffset?: number
    /**
     * 对齐方式
     * @default 'center'
     * @en Alignment
     */
    align?: TooltipAlign
    /**
     * 对齐方向的偏移距离（px）
     * @default 0
     * @en Offset distance along the alignment axis (px)
     */
    alignOffset?: number
    /**
     * 是否启用碰撞检测自动翻转，默认开启
     * @default true
     * @en Whether to enable collision-aware auto flipping, on by default
     */
    avoidCollisions?: boolean
    /**
     * 强制挂载（供外部控制动画）
     * @en Force mount (for external animation control)
     */
    forceMount?: boolean
    /**
     * 面板的可访问名。
     *
     * 缺省时读屏器朗读面板内容本身；内容不适合朗读（如图标 / 缩写）时用它提供更明确的说明。
     * @en Accessible name for the panel. By default screen readers announce the panel content itself; provide this when the content is not descriptive (e.g. an icon or an abbreviation).
     */
    ariaLabel?: string
}

export interface TooltipArrowProps {
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
