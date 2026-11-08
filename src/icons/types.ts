import type { Component } from 'vue'

/**
 * 图标注册表：名称 → 图标组件。
 *
 * 通过 `provideIconRegistry()` 按请求注入，不使用模块级可变单例，避免 SSR 跨请求泄漏。
 */
export type IconRegistry = Record<string, Component | undefined>

export interface IconProps {
    /** 图标组件（如 `@lucide/vue` 导出的图标）；与 `name` 同时提供时优先使用 */
    icon?: Component
    /** 注册表中的图标名称；`icon` 缺省时使用 */
    name?: string
    /** 尺寸，默认 `1em`；数字按 px，字符串原样使用 */
    size?: number | string
    /** 线宽；仅对 stroke 型图标生效（Lucide / Iconify stroke 集） */
    strokeWidth?: number | string
    /** 有语义时的可访问名；提供后输出 `role="img"` + `aria-label` */
    label?: string
}
