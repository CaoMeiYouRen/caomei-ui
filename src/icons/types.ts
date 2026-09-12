import type { Component } from 'vue'

export interface IconProps {
    /** 图标组件（如 `@lucide/vue` 导出的图标） */
    icon: Component
    /** 尺寸，默认 `1em` */
    size?: number | string
}
