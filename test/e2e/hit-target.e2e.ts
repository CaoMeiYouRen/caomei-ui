import { expect, test } from '@playwright/test'

/**
 * P0 不可见命中区的常驻断言（响应式设计 §4 断言 7 / 触摸目标审计 §4 的 P0 行）。
 *
 * 覆盖 `#hit-target` 内全部 `.caomei-hit-target`：TagsInput / MultiSelect / AutoComplete 的
 * 值片删除按钮与「清空全部」、Password（Input 清除）、Tag 关闭、Message 关闭。判定方式为真实
 * 命中测试：以按钮中心为原点，在 24×24 方框内取 9 个点调用 `elementFromPoint`，命中元素必须是
 * 该按钮本身或其后代（伪元素命中会返回宿主元素）。
 *
 * 判别力（负向对照）：
 * - 24px 方框**外**（四边与四角，±13px）不得命中该按钮；
 * - 夹具自建的 20px 普通按钮（不属于任何待演进目标）在同一探针下必须失败。
 *
 * 同时断言每个目标的视觉盒至少一边 < 24px（命中区是不可见扩展，不改变布局与视觉基线），
 * 并对受检目标数设**下界**：类被整体移除或夹具被删项时用例失败，而不是静默变绿。
 */

const HIT_BOX = 24
/** 方框内采样半径：留 0.5px 余量，避免 DPR 取整把边界点判到框外 */
const INSIDE_OFFSET = HIT_BOX / 2 - 0.5
/** 方框外采样半径：超过 24×24 */
const OUTSIDE_OFFSET = HIT_BOX / 2 + 1
/** 受检面下界：11 个标签 + 9 个多选值 + 10 个自动完成值 = 30 个值片删除，+2 个清空全部（AutoComplete 多选不渲染清空），+3 个密码，+1 个 Tag，+1 条 Message = 37 */
const MIN_TARGETS = 37

/** 方框内采样偏移（中心 + 四边中点 + 四角） */
const INSIDE_POINTS: [number, number][] = [
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
const OUTSIDE_POINTS: [number, number][] = [
    [OUTSIDE_OFFSET, 0],
    [-OUTSIDE_OFFSET, 0],
    [0, OUTSIDE_OFFSET],
    [0, -OUTSIDE_OFFSET],
    [OUTSIDE_OFFSET, OUTSIDE_OFFSET],
    [OUTSIDE_OFFSET, -OUTSIDE_OFFSET],
    [-OUTSIDE_OFFSET, OUTSIDE_OFFSET],
    [-OUTSIDE_OFFSET, -OUTSIDE_OFFSET],
]

test.describe('P0 不可见命中区', () => {
    test('全部清除 / 关闭按钮的命中区 ≥24×24，且视觉盒不变', async ({ page }) => {
        await page.goto('/')

        const targets = page.locator('#hit-target .caomei-hit-target')
        const targetCount = await targets.count()
        expect(
            targetCount,
            '受检目标数不得低于下界（类被移除或夹具被删项时应失败，而非静默变绿）',
        ).toBeGreaterThanOrEqual(MIN_TARGETS)

        const failures = await page.evaluate(
            ({ selector, insidePoints, outsidePoints }) => {
                const problems: string[] = []
                const elements = [...document.querySelectorAll<HTMLElement>(selector)]

                for (const [index, element] of elements.entries()) {
                    const label = `${element.className} #${index}`
                    element.scrollIntoView({ block: 'center', inline: 'center' })
                    const rect = element.getBoundingClientRect()

                    if (rect.width === 0 || rect.height === 0) {
                        problems.push(`${label}：目标不可测量`)
                        continue
                    }
                    if (Math.min(rect.width, rect.height) > 18) {
                        problems.push(`${label}：视觉盒 ${rect.width}×${rect.height} 超过 18px（应保持 13.33–17.33px 的原有视觉盒）`)
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
            { selector: '#hit-target .caomei-hit-target', insidePoints: INSIDE_POINTS, outsidePoints: OUTSIDE_POINTS },
        )

        expect(failures).toEqual([])

        /*
         * WCAG 2.5.8 间距轴：两个 24×24 **方**命中区不相交的判据是 Chebyshev 距离
         * `max(|dx|, |dy|) >= 24`（多行值片的行距由 `row-gap: calc(var(--caomei-space-1) + 2px)` 保证）。
         * 用文档坐标计算，避免滚动影响。
         */
        const minDistance = await page.evaluate(({ selector, minimum }) => {
            const centers = [...document.querySelectorAll<HTMLElement>(selector)].map((element) => {
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
            return { min, minimum }
        }, { selector: '#hit-target .caomei-hit-target', minimum: HIT_BOX })

        expect(
            minDistance.min,
            `相邻 P0 目标的 Chebyshev 中心距 ${minDistance.min.toFixed(2)}px 应 ≥ ${minDistance.minimum}px（否则方命中区重叠）`,
        ).toBeGreaterThanOrEqual(minDistance.minimum)
    })

    test('负向对照：20px 普通按钮不应通过同一探针', async ({ page }) => {
        await page.goto('/')

        const control = page.locator('#hit-negative')
        await control.scrollIntoViewIfNeeded()
        const box = await control.boundingBox()
        expect(box, '负向对照应有可测量的几何').not.toBeNull()
        expect(await control.evaluate((element) => element.classList.contains('caomei-hit-target'))).toBe(false)

        const result = await page.evaluate(
            ({ selector, offsets }) => {
                const element = document.querySelector<HTMLElement>(selector)
                if (!element) {
                    return { hits: 0 }
                }
                const rect = element.getBoundingClientRect()
                const centerX = rect.left + rect.width / 2
                const centerY = rect.top + rect.height / 2
                let hits = 0
                for (const [offsetX, offsetY] of offsets) {
                    const hit = document.elementFromPoint(centerX + offsetX, centerY + offsetY)
                    if (hit && (hit === element || element.contains(hit))) {
                        hits += 1
                    }
                }
                return { hits }
            },
            { selector: '#hit-negative', offsets: [[INSIDE_OFFSET, 0], [-INSIDE_OFFSET, 0]] },
        )

        expect(result.hits, '20px 按钮在横向 24px 采样点不应命中（否则探针无判别力）').toBe(0)
    })
})
