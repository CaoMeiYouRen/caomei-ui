import type { TourCardPosition, TourPlacement, TourRect, TourSize } from './types'

/**
 * 卡片测量失败时的兜底尺寸（与默认宽度 `20rem` 对齐）。
 *
 * 只用于定位计算：`offsetWidth` / `offsetHeight` 在未挂载或测试环境下为 0，
 * 直接用 0 会把卡片贴到目标边线上。
 */
export const TOUR_FALLBACK_CARD_SIZE: TourSize = { width: 320, height: 160 }

/** 卡片与视口边缘的最小留白（px） */
export const TOUR_VIEWPORT_GAP = 8

/** 取方位对侧：空间不足时以此翻转，保证卡片仍贴着目标 */
export function oppositePlacement(placement: TourPlacement): TourPlacement {
    switch (placement) {
        case 'top':
            return 'bottom'
        case 'bottom':
            return 'top'
        case 'left':
            return 'right'
        case 'right':
            return 'left'
    }
}

/** 目标某一侧可用的视口空间（px） */
function availableSpace(rect: TourRect, viewport: TourSize, placement: TourPlacement): number {
    switch (placement) {
        case 'top':
            return rect.top
        case 'bottom':
            return viewport.height - (rect.top + rect.height)
        case 'left':
            return rect.left
        case 'right':
            return viewport.width - (rect.left + rect.width)
    }
}

/** 该方位容纳卡片所需的视口空间：卡片自身尺寸 + 偏移 */
function requiredSpace(card: TourSize, placement: TourPlacement, offset: number): number {
    const extent = placement === 'top' || placement === 'bottom' ? card.height : card.width
    return extent + offset
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), Math.max(min, max))
}

/**
 * 计算卡片左上角坐标。
 *
 * 先按首选方位摆放；该侧空间不足时翻转到对侧，再整体钳位到视口内（留 `gap` 边距），
 * 使窄屏 / 靠边目标不会把卡片顶出可视区。
 */
export function computeTourPosition(
    rect: TourRect,
    viewport: TourSize,
    card: TourSize,
    preferred: TourPlacement,
    offset: number,
): TourCardPosition {
    const gap = TOUR_VIEWPORT_GAP
    const opposite = oppositePlacement(preferred)
    const preferredSpace = availableSpace(rect, viewport, preferred)
    const oppositeSpace = availableSpace(rect, viewport, opposite)
    // 首选侧不足时翻到对侧；两侧都不足则选空间更大的一侧，避免卡片压住目标
    let placement = preferred
    if (preferredSpace < requiredSpace(card, preferred, offset) && oppositeSpace > preferredSpace) {
        placement = opposite
    }

    let top = 0
    let left = 0
    switch (placement) {
        case 'bottom':
            top = rect.top + rect.height + offset
            left = rect.left + rect.width / 2 - card.width / 2
            break
        case 'top':
            top = rect.top - offset - card.height
            left = rect.left + rect.width / 2 - card.width / 2
            break
        case 'right':
            top = rect.top + rect.height / 2 - card.height / 2
            left = rect.left + rect.width + offset
            break
        case 'left':
            top = rect.top + rect.height / 2 - card.height / 2
            left = rect.left - offset - card.width
            break
    }

    return {
        top: clamp(top, gap, viewport.height - card.height - gap),
        left: clamp(left, gap, viewport.width - card.width - gap),
        placement,
    }
}

/** 目标缺失时的居中坐标（不含方位，调用方沿用首选方位作为展示标记） */
export function centerTourCard(viewport: TourSize, card: TourSize): { top: number, left: number } {
    const gap = TOUR_VIEWPORT_GAP
    return {
        top: clamp((viewport.height - card.height) / 2, gap, viewport.height - card.height - gap),
        left: clamp((viewport.width - card.width) / 2, gap, viewport.width - card.width - gap),
    }
}

/** 高亮挖空区：目标矩形四周外扩 `padding` */
export function computeTourSpotlight(rect: TourRect, padding: number): TourRect {
    return {
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
    }
}
