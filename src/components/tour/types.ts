/** 引导步骤的定位目标：选择器、元素，或返回元素的函数（函数在每次重算时调用） */
export type TourTarget = string | HTMLElement | (() => HTMLElement | null | undefined)

/** 引导卡片相对目标的方位 */
export type TourPlacement = 'top' | 'bottom' | 'left' | 'right'

/** 单个引导步骤 */
export interface TourStep {
    /**
     * 高亮目标：选择器、元素或返回元素的函数；缺省或无法解析时不挖空、卡片居中显示
     * @en Highlight target: a selector, an element, or a function returning one. When absent or
     * unresolvable, nothing is highlighted and the card is centered
     */
    target?: TourTarget
    /**
     * 步骤标题
     * @en Step title
     */
    title?: string
    /**
     * 步骤正文（默认内容；需要富内容时通过默认插槽提供）
     * @en Step body text (the default content; use the default slot for rich content)
     */
    description?: string
    /**
     * 覆盖组件级方位
     * @en Overrides the component-level placement
     */
    placement?: TourPlacement
    /**
     * 覆盖组件级偏移（px）
     * @en Overrides the component-level offset (px)
     */
    offset?: number
}

export interface TourProps {
    /** 步骤列表；空列表时不渲染任何内容 */
    steps: TourStep[]
    /**
     * 浮层的可访问名；缺省取当前语言的「产品引导」
     * @en Accessible name of the floating layer; defaults to the current locale's "Product tour"
     */
    label?: string
    /**
     * 卡片默认方位（空间不足时自动翻转到对侧）
     * @default 'bottom'
     * @en Default card placement (flips to the opposite side when space is tight)
     */
    placement?: TourPlacement
    /**
     * 卡片与目标之间的间距（px）
     * @default 12
     * @en Gap between the card and the target (px)
     */
    offset?: number
    /**
     * 高亮挖空区在目标四周的外扩距离（px）
     * @default 6
     * @en How far the highlight cutout extends around the target (px)
     */
    padding?: number
    /**
     * 是否绘制模态遮罩。
     *
     * 开启时：绘制遮罩、挖空高亮目标、锁定页面滚动（`body` 补 `padding-right`，见主题设计 §5.1）、
     * 背景置 `inert`、键盘焦点在本层内循环，并以 `role="dialog"` + `aria-modal="true"` 暴露。
     * 关闭时：不绘制遮罩、页面保持可交互、键盘可正常离开卡片，以 `role="region"` 暴露。
     * 挖空区不放行点击（遮罩形态下页面整体不可交互）。
     * @default true
     * @en Whether to draw the modal mask. When on: the mask is drawn, the target is cut out,
     * page scroll is locked (`body` gets a `padding-right` compensation), the background is
     * `inert`, keyboard focus cycles inside the layer, and it exposes `role="dialog"` +
     * `aria-modal="true"`. When off: no mask, the page stays interactive, the keyboard can leave
     * the card and it exposes `role="region"`. Clicks never pass through the cutout area.
     */
    mask?: boolean
    /**
     * 是否允许跳过：关闭后不渲染「跳过」按钮，`Escape` 也不关闭
     * @default true
     * @en Whether skipping is allowed. When off, no skip button is rendered and `Escape` does
     * not close the tour
     */
    closable?: boolean
    /**
     * 切换步骤时是否把目标滚动到可视区
     * @default true
     * @en Whether to scroll the target into view when the step changes
     */
    scrollIntoView?: boolean
}

/** 步骤切换与结束事件；载荷均为「触发时的步骤 + 索引」 */
export interface TourEmits {
    /** 点击下一步（非末步） */
    next: [step: TourStep, index: number]
    /** 点击上一步（非首步） */
    prev: [step: TourStep, index: number]
    /** 点击跳过或按 Escape（`closable` 开启时） */
    skip: [step: TourStep, index: number]
    /** 末步点击完成 */
    finish: [step: TourStep, index: number]
}

export interface TourSlotProps {
    /** 当前步骤 */
    step: TourStep
    /** 当前索引（从 0 开始） */
    index: number
    /** 步骤总数 */
    total: number
}

/** 目标在视口中的位置与尺寸（`getBoundingClientRect()` 的可序列化子集） */
export interface TourRect {
    top: number
    left: number
    width: number
    height: number
}

/** 视口尺寸 */
export interface TourSize {
    width: number
    height: number
}

/** 卡片左上角坐标与最终采用的方位 */
export interface TourCardPosition {
    top: number
    left: number
    placement: TourPlacement
}
