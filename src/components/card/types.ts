export type CardVariant = 'outlined' | 'elevated' | 'filled'

export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps {
    /**
     * 视觉变体
     * @en Visual variant
     */
    variant?: CardVariant
    /**
     * 内边距档位
     * @en Padding step
     */
    padding?: CardPadding
    /**
     * 头部标题（可用 title 插槽自定义内容）。
     *
     * 注意：作为 prop 会拦截原生 HTML `title` 提示属性；需要原生 tooltip 时请改用
     * 其他属性或包裹元素，且该值渲染为普通 `div`，不具备标题层级语义。
     * @en Header title (customize the content with the title slot). Note: as a prop it intercepts the native HTML `title` tooltip attribute; for a native tooltip use another attribute or a wrapper element, and the value renders as a plain `div` without heading semantics.
     */
    title?: string
    /**
     * 头部副标题
     * @en Header subtitle
     */
    subtitle?: string
    /**
     * 是否启用悬浮反馈（适合可点击卡片）
     * @en Whether to enable hover feedback (suited to clickable cards)
     */
    hoverable?: boolean
    /**
     * 根元素标签，默认 div
     * @en Root element tag, defaults to div
     */
    as?: string
}
