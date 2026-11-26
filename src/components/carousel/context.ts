import type { InjectionKey } from 'vue'

/**
 * 轮播与子页之间的上下文：父级维护子页登记表，子页据此得到序号与可访问名。
 * 登记表随挂载 / 卸载更新，序号按挂载顺序（首屏等价渲染顺序）；中间插入或重排需整组重新挂载。
 */
export interface CarouselContext {
    /** 登记一页 */
    registerSlide: (id: symbol) => void
    /** 注销一页 */
    unregisterSlide: (id: symbol) => void
    /** 该页的序号（0 起）；未登记时返回 -1 */
    slideIndex: (id: symbol) => number
    /** 第 index 页（0 起）的可访问名；序号未就绪时返回 undefined（首帧 / 未登记） */
    slideLabel: (index: number) => string | undefined
}

export const carouselContextKey: InjectionKey<CarouselContext> = Symbol('caomei-carousel')

/**
 * 解析受控索引：非有限数 / 小数先归一到整数，再按是否循环钳位或取模。
 * 页数为 0 时返回 0，避免出现负索引或空的 `scrollTo` 目标。
 *
 * @param value 期望索引（可越界）
 * @param count 页数
 * @param loop 是否循环
 * @returns 落在有效区间内的索引
 */
export function resolveCarouselIndex(value: number, count: number, loop: boolean): number {
    if (count <= 0) {
        return 0
    }
    const raw = Number.isFinite(value) ? Math.trunc(value) : 0
    if (loop) {
        return ((raw % count) + count) % count
    }
    return Math.min(Math.max(raw, 0), count - 1)
}
