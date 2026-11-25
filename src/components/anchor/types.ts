/** 锚点条目（可嵌套） */
export interface AnchorItem {
    /**
     * 稳定标识，同时作为 `v-model:active` 的取值
     * @en Stable key, also the value used by `v-model:active`
     */
    key: string
    /**
     * 目标标题 id（不带 `#`）；缺省时用 `key`
     * @en Target heading id without `#`; defaults to `key`
     */
    id?: string
    /**
     * 显示文本
     * @en Visible text
     */
    title: string
    /**
     * 子条目（渲染为缩进层级）
     * @en Child items (rendered as an indented level)
     */
    children?: AnchorItem[]
}

/** 滚动容器：缺省为窗口；字符串按选择器解析 */
export type AnchorContainer = string | HTMLElement

export interface AnchorProps {
    /** 锚点条目 */
    items: AnchorItem[]
    /**
     * 滚动容器：缺省为窗口；字符串按 CSS 选择器解析，找不到时回退窗口
     * @en Scroll container: the window by default; a string is resolved as a CSS selector and falls back to the window
     */
    container?: AnchorContainer
    /**
     * 判定线距容器顶部的偏移（px）：标题越过该线才算进入
     * @default 12
     * @en Activation line offset from the container top in px: a heading becomes active once it crosses it
     */
    offset?: number
    /**
     * 点击时是否平滑滚动（尊重 `prefers-reduced-motion`）
     * @default true
     * @en Whether clicks smooth-scroll (honoring `prefers-reduced-motion`)
     */
    smooth?: boolean
    /**
     * 是否与地址栏 hash 同步（点击写入、`hashchange` 与首屏读取）
     * @default true
     * @en Whether to sync with the URL hash (write on click, read on `hashchange` and first paint)
     */
    hashSync?: boolean
    /**
     * 导航的可访问名；缺省取当前语言的「锚点导航」
     * @en Accessible name of the navigation; defaults to the locale's "Anchor navigation"
     */
    label?: string
}

export interface AnchorSlotProps {
    /** 当前激活条目的 key */
    active: string
    /** 条目 */
    item: AnchorItem
    /** 嵌套深度（0 起） */
    depth: number
}
