import { expect, test, type Locator, type Page } from '@playwright/test'

/**
 * 触摸密度轴（`data-density="touch"`）的常驻断言。
 *
 * 口径：主题与样式 §5.2 —— 该属性只覆盖尺寸类 token（控件高度 / 字号 / 内容型宽度上限），
 * 与预设、明暗正交，且可挂在任意祖先元素；未设置时逐值等同默认。
 *
 * 断言面（真实 Chromium 计算样式）：
 * 1. 默认态：按钮 `md` 高 36px、字号 14px；InputNumber 上限 12rem（192px）、Select 上限 20rem（320px）；
 * 2. touch 态：44px / 16px / `none` / `none`；
 * 3. 作用域：同一属性未落在 `#density-axis` 子树的按钮保持默认值；
 * 4. 正交性：颜色不随密度轴变化；
 * 5. 移除属性后逐值回到默认（可逆）。
 */

const INSIDE_BUTTON = '#density-inside > .caomei-button--md'
const INSIDE_BUTTON_SM = '#density-inside > .caomei-button--sm'
const INSIDE_BUTTON_LG = '#density-inside > .caomei-button--lg'
const OUTSIDE_BUTTON = '#density-outside .caomei-button'
const INPUT_NUMBER = '#density-inside > .caomei-input-number'
const SELECT_FIELD = '#density-inside > .caomei-select__field'

/** 默认档的期望值（与 `src/styles/theme.css` 的 `:root` 同源） */
const DEFAULT_METRICS = {
    buttonSmHeight: '28px',
    buttonSmFontSize: '12px',
    buttonHeight: '36px',
    buttonFontSize: '14px',
    buttonLgHeight: '44px',
    buttonLgFontSize: '16px',
    inputNumberMaxWidth: '192px',
    selectMaxWidth: '320px',
}
/** touch 档的期望值（与 `[data-density='touch']` 同源） */
const TOUCH_METRICS = {
    buttonSmHeight: '36px',
    buttonSmFontSize: '14px',
    buttonHeight: '44px',
    buttonFontSize: '16px',
    buttonLgHeight: '52px',
    buttonLgFontSize: '18px',
    inputNumberMaxWidth: 'none',
    selectMaxWidth: 'none',
}

async function styleOf(locator: Locator, property: string): Promise<string> {
    return locator.evaluate((element, name) => getComputedStyle(element).getPropertyValue(name), property)
}

/** 读取一次完整读数（几何 / 字号 / 宽度上限 / 颜色） */
async function metricsOf(page: Page) {
    const button = page.locator(INSIDE_BUTTON)
    const buttonSm = page.locator(INSIDE_BUTTON_SM)
    const buttonLg = page.locator(INSIDE_BUTTON_LG)
    return {
        buttonSmHeight: await styleOf(buttonSm, 'height'),
        buttonSmFontSize: await styleOf(buttonSm, 'font-size'),
        buttonHeight: await styleOf(button, 'height'),
        buttonFontSize: await styleOf(button, 'font-size'),
        buttonLgHeight: await styleOf(buttonLg, 'height'),
        buttonLgFontSize: await styleOf(buttonLg, 'font-size'),
        buttonColor: await styleOf(button, 'color'),
        inputNumberMaxWidth: await styleOf(page.locator(INPUT_NUMBER), 'max-width'),
        selectMaxWidth: await styleOf(page.locator(SELECT_FIELD), 'max-width'),
    }
}

test.describe('触摸密度轴', () => {
    test('data-density="touch" 只放大尺寸并放开宽度上限，作用域限于子树且可逆', async ({ page }) => {
        await page.goto('/')

        const axis = page.locator('#density-axis')

        // 1. 默认态
        await expect.poll(async () => (await metricsOf(page)).buttonHeight).toBe(DEFAULT_METRICS.buttonHeight)
        const defaults = await metricsOf(page)
        expect(defaults.buttonSmHeight).toBe(DEFAULT_METRICS.buttonSmHeight)
        expect(defaults.buttonSmFontSize).toBe(DEFAULT_METRICS.buttonSmFontSize)
        expect(defaults.buttonFontSize).toBe(DEFAULT_METRICS.buttonFontSize)
        expect(defaults.buttonLgHeight).toBe(DEFAULT_METRICS.buttonLgHeight)
        expect(defaults.buttonLgFontSize).toBe(DEFAULT_METRICS.buttonLgFontSize)
        expect(defaults.inputNumberMaxWidth).toBe(DEFAULT_METRICS.inputNumberMaxWidth)
        expect(defaults.selectMaxWidth).toBe(DEFAULT_METRICS.selectMaxWidth)

        // 2. touch 态
        await axis.evaluate((element) => {
            element.setAttribute('data-density', 'touch')
        })
        await expect.poll(async () => (await metricsOf(page)).buttonHeight).toBe(TOUCH_METRICS.buttonHeight)
        const touch = await metricsOf(page)
        expect(touch.buttonSmHeight).toBe(TOUCH_METRICS.buttonSmHeight)
        expect(touch.buttonSmFontSize).toBe(TOUCH_METRICS.buttonSmFontSize)
        expect(touch.buttonFontSize).toBe(TOUCH_METRICS.buttonFontSize)
        expect(touch.buttonLgHeight).toBe(TOUCH_METRICS.buttonLgHeight)
        expect(touch.buttonLgFontSize).toBe(TOUCH_METRICS.buttonLgFontSize)
        expect(touch.inputNumberMaxWidth).toBe(TOUCH_METRICS.inputNumberMaxWidth)
        expect(touch.selectMaxWidth).toBe(TOUCH_METRICS.selectMaxWidth)

        // 3. 正交性：颜色不随密度轴变化
        expect(touch.buttonColor).toBe(defaults.buttonColor)

        // 4. 作用域：属性未覆盖的按钮保持默认
        const outside = page.locator(OUTSIDE_BUTTON)
        expect(await styleOf(outside, 'height')).toBe(DEFAULT_METRICS.buttonHeight)
        expect(await styleOf(outside, 'font-size')).toBe(DEFAULT_METRICS.buttonFontSize)

        // 5. 可逆：移除属性后回到默认
        await axis.evaluate((element) => {
            element.removeAttribute('data-density')
        })
        await expect.poll(async () => (await metricsOf(page)).buttonHeight).toBe(DEFAULT_METRICS.buttonHeight)
        const restored = await metricsOf(page)
        expect(restored.buttonSmHeight).toBe(DEFAULT_METRICS.buttonSmHeight)
        expect(restored.buttonSmFontSize).toBe(DEFAULT_METRICS.buttonSmFontSize)
        expect(restored.buttonFontSize).toBe(DEFAULT_METRICS.buttonFontSize)
        expect(restored.buttonLgHeight).toBe(DEFAULT_METRICS.buttonLgHeight)
        expect(restored.buttonLgFontSize).toBe(DEFAULT_METRICS.buttonLgFontSize)
        expect(restored.inputNumberMaxWidth).toBe(DEFAULT_METRICS.inputNumberMaxWidth)
        expect(restored.selectMaxWidth).toBe(DEFAULT_METRICS.selectMaxWidth)
    })
})
