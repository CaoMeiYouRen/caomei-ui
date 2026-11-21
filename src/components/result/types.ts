import type { Component } from 'vue'

/**
 * 结果状态：语义态 `success` / `info` / `warning` / `danger`，以及 HTTP 错误码 `403` / `404` / `500`
 * @en Result status: the semantic `success` / `info` / `warning` / `danger` plus the HTTP codes
 * `403` / `404` / `500`
 */
export type ResultStatus = 'success' | 'info' | 'warning' | 'danger' | '403' | '404' | '500'

/**
 * 尺寸档
 * @en Size step
 */
export type ResultSize = 'sm' | 'md' | 'lg'

/**
 * 根元素标签
 * @en Root element tag
 */
export type ResultAs = 'div' | 'section' | 'article'

export interface ResultProps {
    /**
     * 状态；决定默认图标与色调，默认 `info`
     * @en Status; drives the default icon and tone. Defaults to `info`
     */
    status?: ResultStatus
    /**
     * 标题；也可经 `#title` 插槽提供
     * @en Title; the `#title` slot can supply it instead
     */
    title?: string
    /**
     * 描述；也可经 `#description` 插槽提供
     * @en Description; the `#description` slot can supply it instead
     */
    description?: string
    /**
     * 图标；缺省按 `status` 回退，传 `null` 可隐藏
     * @en Icon; defaults by `status`. Pass `null` to hide it
     */
    icon?: Component | null
    /**
     * 尺寸档，默认 `md`
     * @en Size step; `md` by default
     */
    size?: ResultSize
    /**
     * 根元素标签，默认 `div`
     * @en Root element tag; `div` by default
     */
    as?: ResultAs
    /**
     * 是否把结果区域标记为 `role="status"`（默认 `true`）；已有外层 live region 时可关闭
     * @en Whether the result is marked `role="status"` (default `true`); turn it off when an
     * outer live region already exists
     */
    live?: boolean
}
