import type { IconTooltipProp } from './types'

export interface IconTooltipSources {
    /** 透传的原生 `title`（接管后不再落到 DOM）；非字符串按缺省处理 */
    title?: unknown
    /** 组件已有的可访问名；非字符串按缺省处理 */
    name?: unknown
}

function text(value: unknown): string {
    return typeof value === 'string' && value ? value : ''
}

/**
 * 解析 icon-only 触发器的提示内容。
 *
 * 优先级：显式字符串 / `{ content }` > 透传原生 `title` > 组件可访问名（`label` / `aria-label`）。
 * `tooltip` 为 `false` / 缺省时返回空串——调用方据此不挂载任何提示接线。
 */
export function resolveIconTooltipContent(
    tooltip: IconTooltipProp | undefined,
    sources: IconTooltipSources = {},
): string {
    if (!tooltip) {
        return ''
    }
    const fallback = text(sources.title) || text(sources.name)
    if (typeof tooltip === 'string') {
        return tooltip
    }
    if (tooltip === true) {
        return fallback
    }
    return text(tooltip.content) || fallback
}
