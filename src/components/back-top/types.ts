/** BackTop 的滚动目标：缺省为 `window`；字符串按 CSS 选择器解析为元素。 */
export type BackTopTarget = string | HTMLElement

export interface BackTopProps {
    /**
     * 按钮的可访问名；缺省取当前语言的「回到顶部」
     * @en Accessible name of the button; defaults to the current locale's "Back to top"
     */
    label?: string
    /**
     * 滚动目标：缺省为 `window`；字符串按 CSS 选择器解析为元素。无匹配或选择器非法时回退
     * `window`；目标元素须在组件挂载时已存在（条件渲染后出现的元素不会被再次解析）
     * @en Scroll target: `window` by default; a string is resolved as a CSS selector. Missing
     * matches and invalid selectors fall back to `window`; the target element must exist when the
     * component mounts (elements rendered later are not resolved again)
     */
    target?: BackTopTarget
    /**
     * 显示阈值（px）：滚动距离超过该值时显示按钮，默认 200
     * @en Show threshold in px: the button appears once the scroll offset exceeds it, defaults to 200
     */
    threshold?: number
}

/** 点击回顶时触发（滚动已发起） */
export type BackTopEmits = (event: 'click', originalEvent: MouseEvent) => void

export interface BackTopSlotProps {
    /** 当前是否可见 */
    visible: boolean
}
