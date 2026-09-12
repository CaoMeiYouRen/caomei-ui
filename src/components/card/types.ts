export type CardVariant = 'outlined' | 'elevated' | 'filled'

export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps {
    /** 视觉变体 */
    variant?: CardVariant
    /** 内边距档位 */
    padding?: CardPadding
    /**
     * 头部标题（可用 title 插槽自定义内容）。
     *
     * 注意：作为 prop 会拦截原生 HTML `title` 提示属性；需要原生 tooltip 时请改用
     * 其他属性或包裹元素，且该值渲染为普通 `div`，不具备标题层级语义。
     */
    title?: string
    /** 头部副标题 */
    subtitle?: string
    /** 是否启用悬浮反馈（适合可点击卡片） */
    hoverable?: boolean
    /** 根元素标签，默认 div */
    as?: string
}
