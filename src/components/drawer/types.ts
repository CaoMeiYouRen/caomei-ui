export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom'

export type DrawerSize = 'sm' | 'md' | 'lg'

export interface DrawerProps {
    /**
     * 抽屉标题，同时作为无障碍名称；使用 `#header` 插槽自定义头部时仍建议提供
     * @en Drawer title, also used as the accessible name; recommended even when customizing the header via the `#header` slot
     */
    title?: string
    /**
     * 描述文本，用于无障碍
     * @en Description text for accessibility
     */
    description?: string
    /**
     * 滑出方向；默认 `left`（对齐 PrimeVue）
     * @en Slide-in position; defaults to `left` (aligned with PrimeVue)
     */
    position?: DrawerPosition
    /**
     * 尺寸：`left` / `right` 控制宽度，`top` / `bottom` 控制高度；默认 `md`
     * @en Size: `left` / `right` control width, `top` / `bottom` control height; defaults to `md`
     */
    size?: DrawerSize
    /**
     * 是否显示关闭按钮；默认 true
     * @en Whether to show the close button; defaults to true
     */
    closable?: boolean
    /**
     * 关闭按钮的可访问标签；默认取当前语言的「关闭」文案
     * @en Accessible label of the close button; defaults to the current locale's "Close" text
     */
    closeLabel?: string
    /**
     * 点击遮罩是否关闭；默认 true
     * @en Whether clicking the overlay closes the drawer; defaults to true
     */
    closeOnOverlay?: boolean
    /**
     * 按下 Esc 是否关闭；默认 true
     * @en Whether pressing Esc closes the drawer; defaults to true
     */
    closeOnEsc?: boolean
    /**
     * 是否为模态抽屉（模态会锁定页面滚动并阻止背景交互）；默认 true
     * @en Whether the drawer is modal (modal locks page scroll and blocks background interaction); defaults to true
     */
    modal?: boolean
}
