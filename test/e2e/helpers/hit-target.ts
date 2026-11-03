import { expect, type Page } from '@playwright/test'

/**
 * P0 不可见命中区的公共断言基座。
 *
 * 口径来源：[响应式设计 §4 断言 7](../../../docs/design/responsive.md) / 触摸目标审计 §4 的 P0 行。
 * 常驻用例（`hit-target.e2e.ts`）与矩阵扩面用例（`responsive.e2e.ts`）共用本助手，
 * 避免同一探针在两处各写一份后逐渐漂移。
 */

/** WCAG 2.5.8 最小命中区（与 `--caomei-hit-target-min` 默认值同源） */
export const HIT_BOX = 24

/** 方框内采样半径：留 0.5px 余量，避免 DPR 取整把边界点判到框外 */
export const INSIDE_OFFSET = HIT_BOX / 2 - 0.5

/** 方框外采样半径：超过 24×24 */
export const OUTSIDE_OFFSET = HIT_BOX / 2 + 1

/**
 * P0 受检目标下界：11 个标签删除 + 1 个标签清空 + 9 个多选删除 + 1 个多选清空
 * + 10 个自动完成删除（多选不渲染清空）+ 3 个密码清除 + 1 个 Tag 关闭 + 1 条 Message 关闭 = 37。
 */
export const MIN_HIT_TARGETS = 37

/** 方框内采样偏移（中心 + 四边中点 + 四角） */
export const INSIDE_POINTS: [number, number][] = [
    [0, 0],
    [INSIDE_OFFSET, 0],
    [-INSIDE_OFFSET, 0],
    [0, INSIDE_OFFSET],
    [0, -INSIDE_OFFSET],
    [INSIDE_OFFSET, INSIDE_OFFSET],
    [INSIDE_OFFSET, -INSIDE_OFFSET],
    [-INSIDE_OFFSET, INSIDE_OFFSET],
    [-INSIDE_OFFSET, -INSIDE_OFFSET],
]

/** 方框外采样偏移（四边 + 四角） */
export const OUTSIDE_POINTS: [number, number][] = [
    [OUTSIDE_OFFSET, 0],
    [-OUTSIDE_OFFSET, 0],
    [0, OUTSIDE_OFFSET],
    [0, -OUTSIDE_OFFSET],
    [OUTSIDE_OFFSET, OUTSIDE_OFFSET],
    [OUTSIDE_OFFSET, -OUTSIDE_OFFSET],
    [-OUTSIDE_OFFSET, OUTSIDE_OFFSET],
    [-OUTSIDE_OFFSET, -OUTSIDE_OFFSET],
]

/**
 * 逐个目标采样真实命中结果，返回问题清单（不抛错，便于一次看到全部失败）。
 *
 * @param page 页面
 * @param selector 目标选择器（命中区宿主，通常是 `.caomei-hit-target`）
 * @param maxVisualBox 视觉盒上限：命中区是**不可见**扩展，视觉盒超过该值即失败（默认 18px）
 */
export async function collectHitTargetProblems(
    page: Page,
    selector: string,
    maxVisualBox = 18,
): Promise<string[]> {
    return page.evaluate(
        ({ targetSelector, insidePoints, outsidePoints, visualBoxLimit }) => {
            const problems: string[] = []
            const elements = [...document.querySelectorAll<HTMLElement>(targetSelector)]

            for (const [index, element] of elements.entries()) {
                const label = `${element.className} #${index}`
                element.scrollIntoView({ block: 'center', inline: 'center' })
                const rect = element.getBoundingClientRect()

                if (rect.width === 0 || rect.height === 0) {
                    problems.push(`${label}：目标不可测量`)
                    continue
                }
                if (Math.min(rect.width, rect.height) > visualBoxLimit) {
                    problems.push(`${label}：视觉盒 ${rect.width}×${rect.height} 超过 ${visualBoxLimit}px（命中区应不可见）`)
                }

                const centerX = rect.left + rect.width / 2
                const centerY = rect.top + rect.height / 2
                const hitsSelf = (offsetX: number, offsetY: number): boolean => {
                    const hit = document.elementFromPoint(centerX + offsetX, centerY + offsetY)
                    return Boolean(hit && (hit === element || element.contains(hit)))
                }

                for (const [offsetX, offsetY] of insidePoints) {
                    if (!hitsSelf(offsetX, offsetY)) {
                        problems.push(`${label}：24px 方框内 (${offsetX}, ${offsetY}) 未命中`)
                    }
                }
                for (const [offsetX, offsetY] of outsidePoints) {
                    if (hitsSelf(offsetX, offsetY)) {
                        problems.push(`${label}：24px 方框外 (${offsetX}, ${offsetY}) 仍命中`)
                    }
                }
            }

            return problems
        },
        { targetSelector: selector, insidePoints: INSIDE_POINTS, outsidePoints: OUTSIDE_POINTS, visualBoxLimit: maxVisualBox },
    )
}

/**
 * 相邻目标的 Chebyshev 中心距（文档坐标，避免滚动影响）。
 *
 * 两个 24×24 **方**命中区不相交的判据是 `max(|dx|, |dy|) >= 24`
 * （多行值片的行距由 `row-gap: calc(var(--caomei-space-1) + 2px)` 保证）。
 * 目标少于 2 个时返回 `Infinity`（由调用方另行断言受检面下界）。
 */
export async function minHitTargetDistance(page: Page, selector: string): Promise<number> {
    return page.evaluate((targetSelector) => {
        const centers = [...document.querySelectorAll<HTMLElement>(targetSelector)].map((element) => {
            const rect = element.getBoundingClientRect()
            return [rect.left + window.scrollX + rect.width / 2, rect.top + window.scrollY + rect.height / 2]
        })
        let min = Number.POSITIVE_INFINITY
        for (let i = 0; i < centers.length; i += 1) {
            for (let j = i + 1; j < centers.length; j += 1) {
                const distance = Math.max(
                    Math.abs(centers[i][0] - centers[j][0]),
                    Math.abs(centers[i][1] - centers[j][1]),
                )
                if (distance < min) {
                    min = distance
                }
            }
        }
        return min
    }, selector)
}

/**
 * 组合断言：视觉盒不变 + 24×24 内命中 + 方框外不命中 + 相邻目标不重叠。
 *
 * @returns 受检目标数（调用方可据此断言下界）
 */
export async function expectHitTargetGeometry(
    page: Page,
    selector: string,
    label: string,
): Promise<number> {
    const targetCount = await page.locator(selector).count()
    const failures = await collectHitTargetProblems(page, selector)
    expect(failures, `${label}：命中区探针失败`).toEqual([])

    if (targetCount >= 2) {
        const distance = await minHitTargetDistance(page, selector)
        expect(
            distance,
            `${label}：相邻 P0 目标的 Chebyshev 中心距 ${distance.toFixed(2)}px 应 ≥ ${HIT_BOX}px（否则方命中区重叠）`,
        ).toBeGreaterThanOrEqual(HIT_BOX)
    }

    return targetCount
}
