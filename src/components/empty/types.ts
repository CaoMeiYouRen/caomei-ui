import type { Component } from 'vue'

/**
 * 空态尺寸档
 * @en Empty-state size step
 */
export type EmptySize = 'sm' | 'md' | 'lg'

/**
 * 空态根元素标签
 * @en Root element tag of the empty state
 */
export type EmptyAs = 'div' | 'section' | 'article'

export interface EmptyProps {
    /**
     * 图标组件；与 `image` 同时提供时以 `image` 优先
     * @en Icon component; `image` wins when both are provided
     */
    icon?: Component
    /**
     * 图片地址；优先于 `icon`
     * @en Image URL; takes precedence over `icon`
     */
    image?: string
    /**
     * 图片替代文本；`image` 装饰性时可传空串
     * @en Image alt text; pass an empty string when the image is decorative
     */
    imageAlt?: string
    /**
     * 标题；缺省取当前语言的「暂无数据」文案
     * @en Title; defaults to the current locale's "No data" text
     */
    title?: string
    /**
     * 说明文案
     * @en Description text
     */
    description?: string
    /**
     * 尺寸档；默认 `md`
     * @en Size step; `md` by default
     */
    size?: EmptySize
    /**
     * 根元素标签，默认 `div`
     * @en Root element tag, `div` by default
     */
    as?: EmptyAs
}
