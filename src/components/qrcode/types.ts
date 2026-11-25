/** 二维码容错级别：L 7% / M 15% / Q 25% / H 30%（越高越耐遮挡，容量越小） */
export type QRCodeLevel = 'L' | 'M' | 'Q' | 'H'

export interface QRCodeProps {
    /** 编码内容（文本 / 链接等） */
    value: string
    /**
     * 渲染边长（px）
     * @default 160
     * @en Rendered edge length in px
     */
    size?: number
    /**
     * 容错级别：越高越耐遮挡，可编码容量越小
     * @default 'M'
     * @en Error correction level: higher tolerates more occlusion with less capacity
     */
    level?: QRCodeLevel
    /**
     * 静区宽度（模块数），按规范建议至少 4；为视觉紧凑默认 2
     * @default 2
     * @en Quiet zone width in modules; the spec recommends at least 4, defaults to 2 for compactness
     */
    margin?: number
    /**
     * 前景色（模块颜色）；需与背景保持足够对比
     * @default '#000000'
     * @en Foreground (module) color; keep enough contrast with the background
     */
    color?: string
    /**
     * 背景色（含静区）
     * @default '#ffffff'
     * @en Background color (including the quiet zone)
     */
    background?: string
    /**
     * 居中图标图片地址；图标会压住部分模块，建议配合 `level="H"`
     * @en Centered icon image URL; it covers some modules, so pair it with `level="H"`
     */
    icon?: string
    /**
     * 图标占边长的比例（0–0.3）
     * @default 0.2
     * @en Icon size as a ratio of the edge length (0–0.3)
     */
    iconSize?: number
    /**
     * 图片的可访问名；缺省取当前语言的「二维码」
     * @en Accessible name of the image; defaults to the locale's "QR code"
     */
    label?: string
}

export interface QRCodeSlotProps {
    /** 当前状态 */
    status: 'loading' | 'ready' | 'failed'
    /** 编码内容 */
    value: string
}
