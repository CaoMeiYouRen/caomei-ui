/** 水印间距 / 偏移：单个数字为两轴同值，元组为 [水平, 垂直] */
export type WatermarkSpacing = number | [number, number]

export interface WatermarkProps {
    /**
     * 文本水印内容；与 `image` 同时提供时以图片为准
     * @en Text watermark content; `image` wins when both are provided
     */
    content?: string
    /**
     * 图片水印地址（同源或允许跨域）；加载失败时回退到文本
     * @en Image watermark URL (same-origin or CORS-enabled); falls back to text when loading fails
     */
    image?: string
    /**
     * 旋转角度（度）
     * @default -22
     * @en Rotation angle in degrees
     */
    rotate?: number
    /**
     * 不透明度（0–1）
     * @default 0.15
     * @en Opacity (0–1)
     */
    opacity?: number
    /**
     * 水印间距：数字或 [水平, 垂直]（px）
     * @default 100
     * @en Spacing: a number or [horizontal, vertical] in px
     */
    gap?: WatermarkSpacing
    /**
     * 相对容器左上角的偏移：数字或 [水平, 垂直]（px）
     * @default 0
     * @en Offset from the container's top-left corner: a number or [horizontal, vertical] in px
     */
    offset?: WatermarkSpacing
    /**
     * 图片水印的宽度（px）
     * @default 120
     * @en Image watermark width in px
     */
    imageWidth?: number
    /**
     * 图片水印的高度（px）
     * @default 64
     * @en Image watermark height in px
     */
    imageHeight?: number
    /**
     * 文本字号（px）
     * @default 16
     * @en Text font size in px
     */
    fontSize?: number
    /**
     * 文本颜色；缺省取根元素计算后的文字色
     * @en Text colour; defaults to the root element's computed text colour
     */
    color?: string
    /**
     * 水印遮罩层级；缺省落到 `--caomei-z-raise`（低于浮层与弹层）
     * @en Z-index of the watermark overlay; defaults to `--caomei-z-raise` (below overlays and modals)
     */
    zIndex?: number
}
