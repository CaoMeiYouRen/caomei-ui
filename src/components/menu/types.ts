/**
 * 菜单排布方向
 * @en Menu layout orientation
 */
export type MenuOrientation = 'vertical' | 'horizontal'

/**
 * `aria-current` 的取值（`true` 等价于 `'page'`）
 * @en Value of `aria-current` (`true` is equivalent to `'page'`)
 */
export type MenuItemCurrent = boolean | 'page' | 'step' | 'location' | 'date' | 'time'

export interface MenuProps {
    /**
     * 排布方向（纵向为侧栏导航、横向为顶栏导航）
     * @default 'vertical'
     * @en Layout orientation (vertical for side navigation, horizontal for top bars)
     */
    orientation?: MenuOrientation
    /**
     * 导航区的可访问名（映射 `aria-label`）。
     *
     * 组件**不内建文案**：未传时不渲染 `aria-label`；同一页面存在多个导航区时应逐区提供。
     * @en Accessible name for the navigation region (maps to `aria-label`). The component ships **no built-in text**: nothing is rendered when omitted; provide one per region when a page has several navigations.
     */
    label?: string
    /**
     * 根元素标签，默认 nav
     * @en Root element tag, defaults to nav
     */
    as?: string
}

export interface MenuItemProps {
    /**
     * 链接地址。提供时渲染 `<a>`，否则渲染 `<button type="button">`
     * @en Link target. Renders an `<a>` when provided, otherwise a `<button type="button">`
     */
    href?: string
    /**
     * 是否禁用（不可聚焦、不响应激活）
     * @default false
     * @en Whether it is disabled (not focusable, does not activate)
     */
    disabled?: boolean
    /**
     * 是否为当前项，映射 `aria-current`（`true` 渲染为 `page`）
     * @default false
     * @en Whether this is the current item, mapped to `aria-current` (`true` renders as `page`)
     */
    current?: MenuItemCurrent
}

export interface SubMenuProps {
    /**
     * 触发器的可见文本（亦可用默认插槽自定义内容）
     * @en Visible trigger text (the default slot can customise the content instead)
     */
    label?: string
    /**
     * 是否禁用（不可展开、不进入键盘序列）
     * @default false
     * @en Whether it is disabled (cannot expand, excluded from the keyboard sequence)
     */
    disabled?: boolean
    /**
     * 初始是否展开（`open` 未接管时生效）
     * @default false
     * @en Whether it is expanded initially (applies when `open` is not controlling it)
     */
    defaultOpen?: boolean
    /**
     * 受控展开态（`v-model:open`）
     * @en Controlled expansion state (`v-model:open`)
     */
    open?: boolean
}
