import type { ComponentSize } from '../../types'

/** 轮播方向：水平（左右翻页）或垂直（上下翻页） */
export type CarouselOrientation = 'horizontal' | 'vertical'

export interface CarouselProps {
    /**
     * 轮播方向；垂直方向需由使用方为根元素指定高度
     * @default 'horizontal'
     * @en Carousel axis; a vertical carousel needs an explicit height on the root element
     */
    orientation?: CarouselOrientation
    /**
     * 是否循环：末页可继续翻到首页
     * @default false
     * @en Whether the carousel loops from the last page back to the first
     */
    loop?: boolean
    /**
     * 每页显示的页数；`'auto'` 按内容宽度决定
     * @default 1
     * @en Pages visible per view; `'auto'` sizes each page to its content
     */
    slidesPerView?: number | 'auto'
    /**
     * 页间距：数字按 px 处理，字符串按 CSS 长度原样使用
     * @default 0
     * @en Gap between pages: a number is px, a string is used as a CSS length
     */
    gap?: number | string
    /**
     * 是否渲染内置的上一页 / 下一页按钮与指示点
     * @default true
     * @en Whether to render the built-in previous / next buttons and dot indicators
     */
    controls?: boolean
    /**
     * 内置控件的尺寸
     * @default 'sm'
     * @en Size of the built-in controls
     */
    controlSize?: ComponentSize
    /**
     * 轮播区域的可访问名。提供时根节点为 `role="region"`，缺省时降级为 `role="group"`（不给无名地标）
     * @en Accessible name of the carousel. Provided → the root is `role="region"`; omitted → `role="group"`
     * (no unnamed landmark)
     */
    label?: string
}

/*
 * 补充约定：
 * - `v-model:index` 是**页（scroll snap）**索引，不是子页序号；`slidesPerView > 1` 时一页含多张子页。
 * - 根节点带 `tabindex="0"`：焦点在轮播上时方向键 / Home / End 生效，页内表单控件不拦截。
 * - 子页序号按挂载顺序生成（等价首屏渲染顺序）；中间插入或重排子页需让整组重新挂载。
 */

export interface CarouselSlideProps {
    /**
     * 该页的可访问名；缺省由父级按当前语言的「第 n 张 / 共 m 张」生成
     * @en Accessible name of this slide; defaults to the locale's "slide n of m" text
     */
    label?: string
}
