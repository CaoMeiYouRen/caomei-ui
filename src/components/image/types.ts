/**
 * 图片填充方式
 * @en Image object-fit
 */
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'

/**
 * 图片加载状态
 * @en Image loading status
 */
export type ImageStatus = 'loading' | 'loaded' | 'error'

/**
 * 说明：原生图片属性（`loading` / `decoding` / `width` / `height` / `srcset` 等）不透传到
 * 内层 `<img>`，加载行为由组件统一决策；需要这些属性时请在业务层自行包裹 `<img>`。
 * @en Note: native image attributes (`loading` / `decoding` / `width` / `height` / `srcset` and so on) are not forwarded to the inner `<img>`; loading behavior is decided centrally by the component. Wrap the image yourself in the application layer when these attributes are needed.
 */
export interface ImageProps {
    /**
     * 图片地址
     * @en Image URL
     */
    src: string
    /**
     * 替代文本；装饰性图片传空字符串
     * @en Alternative text; pass an empty string for decorative images
     */
    alt?: string
    /**
     * 宽高比，如 `16 / 9`；提供后容器按比例占位，避免加载时布局跳动
     * @en Aspect ratio, such as `16 / 9`; when provided the container reserves space by ratio, avoiding layout shift while loading
     */
    ratio?: number | string
    /**
     * 填充方式
     * @default 'cover'
     * @en Fill mode
     */
    fit?: ImageFit
    /**
     * 是否懒加载：进入视口后才请求 `src`（需搭配 `ratio` 使用以占位）
     * @default false
     * @en Whether to lazy-load: request `src` only after entering the viewport (pair with `ratio` to reserve space)
     */
    lazy?: boolean
}
