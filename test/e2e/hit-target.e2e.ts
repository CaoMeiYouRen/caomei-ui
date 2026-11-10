import { expect, test } from '@playwright/test'
import {
    collectHitTargetProblems,
    expectHitTargetGeometry,
    HIT_BOX,
    INSIDE_OFFSET,
    MIN_HIT_TARGETS,
    MIN_HIT_TARGETS_FORM,
    minHitTargetDistance,
    P1_VISUAL_BOX,
} from './helpers/hit-target'

/**
 * P0 不可见命中区的常驻断言（响应式设计 §4 断言 7 / 触摸目标审计 §4 的 P0 行）。
 *
 * 覆盖 `#hit-target` 内全部 `.caomei-hit-target`：TagsInput / MultiSelect / AutoComplete 的
 * 值片删除按钮与「清空全部」、Password（Input 清除）、Tag 关闭、Message 关闭。判定方式为真实
 * 命中测试：以按钮中心为原点，在 24×24 方框内取 9 个点调用 `elementFromPoint`，命中元素必须是
 * 该按钮本身或其后代（伪元素命中会返回宿主元素）。探针本体与矩阵扩面用例共用
 * `helpers/hit-target.ts`。
 *
 * 判别力（负向对照）：
 * - 24px 方框**外**（四边与四角，±13px）不得命中该按钮；
 * - 夹具自建的 20px 普通按钮（不属于任何待演进目标）在同一探针下必须失败。
 *
 * 同时断言每个目标的视觉盒至少一边 < 24px（命中区是不可见扩展，不改变布局与视觉基线），
 * 并对受检目标数设**下界**：类被整体移除或夹具被删项时用例失败，而不是静默变绿。
 */

test.describe('P0 不可见命中区', () => {
    test('全部清除 / 关闭按钮的命中区 ≥24×24，且视觉盒不变', async ({ page }) => {
        await page.goto('/')

        const targets = page.locator('#hit-target .caomei-hit-target')
        const targetCount = await targets.count()
        expect(
            targetCount,
            '受检目标数不得低于下界（类被移除或夹具被删项时应失败，而非静默变绿）',
        ).toBeGreaterThanOrEqual(MIN_HIT_TARGETS)

        const failures = await collectHitTargetProblems(page, '#hit-target .caomei-hit-target')
        expect(failures).toEqual([])

        const minDistance = await minHitTargetDistance(page, '#hit-target .caomei-hit-target')
        expect(
            minDistance,
            `相邻 P0 目标的 Chebyshev 中心距 ${minDistance.toFixed(2)}px 应 ≥ ${HIT_BOX}px（否则方命中区重叠）`,
        ).toBeGreaterThanOrEqual(HIT_BOX)
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

/**
 * P1 目标族（表单控件盒，见[触摸目标实测复核记录 §4](../../../docs/design/governance/2026-10-16-phase25-m2-2-touch-target-audit.md) 的 P1 行）。
 *
 * `visualBox` 是**该族宿主的视觉盒上限**：命中区是不可见扩展，宿主必须保持原尺寸。
 * Chebyshev 配对只在族内进行（跨组件配对会把不同交互族的正常间距当成违规）。
 */
const P1_FAMILIES = [
    {
        key: 'checkbox',
        label: 'Checkbox 控制盒',
        selector: '#hit-form-checkbox .caomei-checkbox__control.caomei-hit-target',
        min: 2,
        visualBox: P1_VISUAL_BOX.checkbox,
    },
    {
        key: 'radio',
        label: 'RadioButton 根',
        selector: '#hit-form-radio .caomei-radio-button.caomei-hit-target',
        min: 6,
        visualBox: P1_VISUAL_BOX.radio,
    },
    {
        key: 'switch',
        label: 'Switch 轨道',
        selector: '#hit-form-switch .caomei-switch.caomei-hit-target',
        min: 2,
        visualBox: P1_VISUAL_BOX.switch,
    },
    {
        key: 'slider',
        label: 'Slider 滑柄',
        selector: '#hit-form-slider .caomei-slider__thumb.caomei-hit-target',
        min: 3,
        visualBox: P1_VISUAL_BOX.slider,
    },
    {
        key: 'color-area',
        label: 'ColorPicker 区域滑柄',
        selector: '#hit-form-color .caomei-color-picker__area-thumb.caomei-hit-target',
        min: 2,
        visualBox: P1_VISUAL_BOX.colorThumb,
    },
    {
        key: 'color-hue',
        label: 'ColorPicker 色相滑柄',
        selector: '#hit-form-color .caomei-color-picker__hue-thumb.caomei-hit-target',
        min: 2,
        visualBox: P1_VISUAL_BOX.colorThumb,
    },
] as const

test.describe('P1 表单控件盒不可见命中区', () => {
    test('17 个表单控件盒目标的命中区 ≥24×24，且视觉盒不变', async ({ page }) => {
        await page.goto('/')

        const total = await page.locator('#hit-target-form .caomei-hit-target').count()
        expect(
            total,
            '受检目标总数不得低于下界（类被整体移除或夹具被删项时应失败，而非静默变绿）',
        ).toBeGreaterThanOrEqual(MIN_HIT_TARGETS_FORM)

        let counted = 0
        for (const family of P1_FAMILIES) {
            const count = await expectHitTargetGeometry(page, family.selector, family.label, family.visualBox)
            expect(
                count,
                `${family.label} 受检目标数 ${count} 不得低于下界 ${family.min}`,
            ).toBeGreaterThanOrEqual(family.min)
            counted += count
        }
        expect(counted, '分族计数须覆盖全部 P1 目标（防漏检 / 重复计数）').toBe(total)
    })

    test('P1 目标是「不可见扩展」：宿主短边仍 < 24px', async ({ page }) => {
        await page.goto('/')

        for (const family of P1_FAMILIES) {
            const shortSides = await page.locator(family.selector).evaluateAll((elements) =>
                elements.map((element) => {
                    const rect = element.getBoundingClientRect()
                    return Math.min(rect.width, rect.height)
                }))
            expect(shortSides.length, `${family.label} 未受检`).toBeGreaterThanOrEqual(family.min)
            for (const side of shortSides) {
                expect(
                    side,
                    `${family.label}：宿主短边 ${side.toFixed(2)}px 应 < ${HIT_BOX}px（命中区应是不可见扩展，而不是放大视觉盒）`,
                ).toBeLessThan(HIT_BOX)
            }
        }
    })
})
