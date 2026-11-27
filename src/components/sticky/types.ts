export interface StickyProps {
    /**
     * 吸顶偏移（px）：滚动到距视口 / 滚动容器顶部该距离时吸住
     * @default 0
     * @en Stick offset in px from the top of the viewport or scroll container
     */
    offset?: number
    /**
     * 层级；设置后写入组件私有的 `--caomei-sticky-z-index`，缺省沿用基础层档位
     * @en Stacking level; written to the component's own `--caomei-sticky-z-index`, defaults to the base tier
     */
    zIndex?: number
    /**
     * 关闭吸顶（退回普通文档流），用于响应式降级
     * @default false
     * @en Turns sticking off (back to normal flow) for responsive downgrades
     */
    disabled?: boolean
}
