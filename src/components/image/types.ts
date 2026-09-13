/** 图片填充方式 */
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'

/** 图片加载状态 */
export type ImageStatus = 'loading' | 'loaded' | 'error'

/**
 * 说明：原生图片属性（`loading` / `decoding` / `width` / `height` / `srcset` 等）不透传到
 * 内层 `<img>`，加载行为由组件统一决策；需要这些属性时请在业务层自行包裹 `<img>`。
 */
export interface ImageProps {
    /** 图片地址 */
    src: string
    /** 替代文本；装饰性图片传空字符串 */
    alt?: string
    /** 宽高比，如 `16 / 9`；提供后容器按比例占位，避免加载时布局跳动 */
    ratio?: number | string
    /**
     * 填充方式
     * @default 'cover'
     */
    fit?: ImageFit
    /**
     * 是否懒加载：进入视口后才请求 `src`（需搭配 `ratio` 使用以占位）
     * @default false
     */
    lazy?: boolean
}
