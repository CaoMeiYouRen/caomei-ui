import { expect, type Page } from '@playwright/test'

/**
 * P0 / P1 不可见命中区的公共断言基座。
 *
 * 口径来源：[响应式设计 §4 断言 7](../../../docs/design/responsive.md) / 触摸目标审计 §4 的 P0 / P1 行。
 * 常驻用例（`hit-target.e2e.ts`）与矩阵扩面用例（`responsive.e2e.ts`）共用本助手，
 * 避免同一探针在两处各写一份后逐渐漂移。
 */

/** WCAG 2.5.8 最小命中区（与 `--caomei-hit-target-min` 默认值同源） */
export const HIT_BOX = 24

/** 方框内采样半径（仅供负向对照用例横向取点）：留 0.5px 余量，避免 DPR 取整把边界点判到框外 */
export const INSIDE_OFFSET = HIT_BOX / 2 - 0.5

/**
 * P0 受检目标下界：11 个标签删除 + 1 个标签清空 + 9 个多选删除 + 1 个多选清空
 * + 10 个自动完成删除（多选不渲染清空）+ 3 个密码清除 + 1 个 Tag 关闭 + 1 条 Message 关闭 = 37。
 */
export const MIN_HIT_TARGETS = 37

/**
 * P1 受检目标下界：Checkbox 2 + RadioButton 6 + Switch 2 + Slider 3（单值 1 + 区间 2）
 * + ColorPicker 滑柄 4（两块内联面板各 2）= 17（[触摸目标实测复核记录 §4](../../../docs/design/governance/2026-10-16-phase25-m2-2-touch-target-audit.md) 的 P1 行）。
 */
export const MIN_HIT_TARGETS_FORM = 17

/**
 * P2 受检目标下界（`#hit-target-p2`）：Breadcrumb 链接 2 + DataTable 排序 3 + Select 清除 1 = 6。
 * 字段族内联行（普通 Input）走「宿主真实放大到 ≥24」路径，由独立用例断言，不计入 `caomei-hit-target` 计数。
 */
export const MIN_HIT_TARGETS_P2 = 6

/**
 * P1 目标族的视觉盒上限：命中区是**不可见**扩展，视觉盒必须保持原尺寸。
 *
 * Switch 轨道 40×22（短边 22）与 Checkbox / RadioButton / Slider 滑柄 18 不同；
 * ColorPicker 滑柄是 14px 内容盒 + 2px 边框 = 18px 边框盒（`box-sizing` 为默认 `content-box`）。
 * 逐族给上限；跨族用同一上限会把 Switch 的既有轨道尺寸当成违规。
 */
export const P1_VISUAL_BOX = {
    checkbox: 18,
    radio: 18,
    switch: 22,
    slider: 18,
    colorThumb: 18,
} as const

/**
 * 采样判据（逐轴）：
 *
 * - 某轴已经 ≥24 时，该轴不再要求扩展，也不存在「方框外」采样点；
 *   只有短于 24 的轴才由不可见 `::after` 补足。
 * - 两轴都短于 24（P0 的 13.33 / 17.33 / 20 与 P1 的 Checkbox / Slider / ColorPicker 滑柄）：
 *   两轴采样点均取 24，并额外取四角 → 与既有 9 点方框采样完全一致。
 * - 某轴已 ≥24（P1 的 RadioButton 根含标签并集、Switch 轨道 40×22）：只在该轴取边界内侧 /
 *   外侧点，取消四角（宽宿主的四角由「另一轴的 `::after`」覆盖不到，取角会产生假失败）。
 *
 * 该判据只存在于浏览器侧回调一处：`page.evaluate` 无法接收 Node 侧函数，若再导出一份同义
 * 计算会形成「同一探针两份实现」，故不提供 Node 侧镜像（行为由 `hit-target.e2e.ts` 的三视口
 * 用例与 P1「宿主短边 <24」用例共同锁定）。
 *
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
        ({ targetSelector, visualBoxLimit, hitBox }) => {
            const problems: string[] = []
            const elements = [...document.querySelectorAll<HTMLElement>(targetSelector)]

            /** 逐轴推导的采样点（判据见本函数 JSDoc；此处内联以适配 `page.evaluate` 的序列化边界） */
            const offsetsFor = (width: number, height: number) => {
                const insideX = Math.max(width, hitBox) / 2 - 0.5
                const insideY = Math.max(height, hitBox) / 2 - 0.5
                const outsideX = Math.max(width, hitBox) / 2 + 1
                const outsideY = Math.max(height, hitBox) / 2 + 1
                const inside: [number, number][] = [[0, 0], [insideX, 0], [-insideX, 0], [0, insideY], [0, -insideY]]
                const outside: [number, number][] = [[outsideX, 0], [-outsideX, 0], [0, outsideY], [0, -outsideY]]
                if (width <= hitBox && height <= hitBox) {
                    inside.push([insideX, insideY], [insideX, -insideY], [-insideX, insideY], [-insideX, -insideY])
                    outside.push([outsideX, outsideY], [outsideX, -outsideY], [-outsideX, outsideY], [-outsideX, -outsideY])
                }
                return { inside, outside }
            }

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

                const { inside, outside } = offsetsFor(rect.width, rect.height)
                const centerX = rect.left + rect.width / 2
                const centerY = rect.top + rect.height / 2
                const hitsSelf = (offsetX: number, offsetY: number): boolean => {
                    const hit = document.elementFromPoint(centerX + offsetX, centerY + offsetY)
                    return Boolean(hit && (hit === element || element.contains(hit)))
                }

                for (const [offsetX, offsetY] of inside) {
                    if (!hitsSelf(offsetX, offsetY)) {
                        problems.push(`${label}：${hitBox}px 命中区内 (${offsetX}, ${offsetY}) 未命中`)
                    }
                }
                for (const [offsetX, offsetY] of outside) {
                    if (hitsSelf(offsetX, offsetY)) {
                        problems.push(`${label}：${hitBox}px 命中区外 (${offsetX}, ${offsetY}) 仍命中`)
                    }
                }
            }

            return problems
        },
        { targetSelector: selector, visualBoxLimit: maxVisualBox, hitBox: HIT_BOX },
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
 * @param maxVisualBox 该目标族的视觉盒上限（P1 的 Switch 轨道短边 22，不能套用 P0 的 18）
 * @returns 受检目标数（调用方可据此断言下界）
 */
export async function expectHitTargetGeometry(
    page: Page,
    selector: string,
    label: string,
    maxVisualBox = 18,
): Promise<number> {
    const targetCount = await page.locator(selector).count()
    const failures = await collectHitTargetProblems(page, selector, maxVisualBox)
    expect(failures, `${label}：命中区探针失败`).toEqual([])

    if (targetCount >= 2) {
        const distance = await minHitTargetDistance(page, selector)
        expect(
            distance,
            `${label}：相邻目标的 Chebyshev 中心距 ${distance.toFixed(2)}px 应 ≥ ${HIT_BOX}px（否则方命中区重叠）`,
        ).toBeGreaterThanOrEqual(HIT_BOX)
    }

    return targetCount
}
