import { expect, test } from '@playwright/test'

/**
 * 视觉回归基线首批（代表组件抽样 × 亮 / 暗 × 单视口）。
 *
 * 依据 docs/design/governance/2026-10-08-m7-1-visual-regression-baseline-evaluation.md §7（MVP 形态）。
 * 事实源 = 本文件的**受检面登记表**（`SAMPLE_SECTIONS`）——新增 / 移除组件须同批更新基线与登记表；
 * 下界守卫（`MIN_SECTIONS`）保证登记表被静默收窄时失败。
 *
 * 抽样原则：取**静态、确定性**的默认态（不含日期 / 时间 / 随机内容），避免时间漂移造成假阳性；
 * 日期类组件（Calendar / DatePicker）不在首批（见记录 §「未纳入面」）。
 *
 * 负向对照：`VISUAL_NEGATIVE_CONTROL=1 pnpm test:visual` 注入结构性覆盖，应使全部用例报差异，
 * 用于自证比对具判别力（不留常驻）。
 */

/** 受检面登记（首批 8 个核心静态组件默认态）。 */
const SAMPLE_SECTIONS = [
    { id: 'ds-button-default', name: 'button' },
    { id: 'ds-tag-default', name: 'tag' },
    { id: 'ds-checkbox-default', name: 'checkbox' },
    { id: 'ds-switch-default', name: 'switch' },
    { id: 'ds-radio-button-default', name: 'radio-button' },
    { id: 'ds-input-default', name: 'input' },
    { id: 'ds-select-default', name: 'select' },
    { id: 'ds-slider-default', name: 'slider' },
] as const

/** 受检面下界守卫：登记表被静默收窄即失败。 */
const MIN_SECTIONS = 8

const THEMES = ['light', 'dark'] as const

/** 负向对照开关（仅用于判别力自证，非常驻）。 */
const NEGATIVE_CONTROL = process.env.VISUAL_NEGATIVE_CONTROL === '1'

test.describe('视觉回归基线（代表组件 × 亮暗）', () => {
    test('受检面登记未收窄', () => {
        expect(SAMPLE_SECTIONS.length).toBeGreaterThanOrEqual(MIN_SECTIONS)
    })

    for (const theme of THEMES) {
        for (const { id, name } of SAMPLE_SECTIONS) {
            test(`${name}（${theme}）`, async ({ page }) => {
                await page.goto('/')
                await page.waitForSelector(`#${id}`)
                if (theme === 'dark') {
                    await page.evaluate(() => {
                        document.documentElement.setAttribute('data-theme', 'dark')
                    })
                }
                if (NEGATIVE_CONTROL) {
                    await page.addStyleTag({ content: '#app .fixture__state { padding: 24px !important; }' })
                }
                await expect(page.locator(`#${id}`)).toHaveScreenshot(`${name}-${theme}.png`)
            })
        }
    }
})
