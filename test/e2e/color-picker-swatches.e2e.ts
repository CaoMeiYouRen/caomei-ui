import { expect, test as base, type Locator } from '@playwright/test'

/**
 * ColorPicker 色板键盘与选中态（常驻）。
 *
 * 背景：色板由 `role="group"` + `aria-pressed` 的按钮组改为 `radiogroup` + `role="radio"` +
 * `aria-checked` + roving tabindex。单测（happy-dom）只能证明属性与 emit，无法证明真实浏览器中的
 * Tab 唯一停靠点、焦点转移与选中态计算样式；`capture:styles` 的色板采样面也未包含色块，故本规格
 * 以真实 Chromium 补足：
 * - Tab 从十六进制输入框进入组时落在选中项（唯一 `tabindex=0`）；
 * - 方向键 / Home / End 移动并选中，焦点随目标项，首尾循环；
 * - 选中态计算样式：选中项 `outline-width: 2px`，未选中项 `0px`。
 */

const test = base.extend<{ pageErrors: string[] }>({
    pageErrors: [async ({ page }, use) => {
        const errors: string[] = []
        page.on('console', (message) => {
            if (message.type() === 'error') {
                errors.push(`console.error: ${message.text()}`)
            }
        })
        page.on('pageerror', (error) => {
            errors.push(`pageerror: ${error.message}`)
        })

        await page.goto('/')
        await use(errors)
    }, { auto: true }],
})

test.afterEach(({ pageErrors }) => {
    expect(pageErrors, '页面不得产生 console error').toEqual([])
})

const SWATCHES = '.caomei-color-picker__swatches'
const SWATCH = '.caomei-color-picker__swatch'

/** 当前焦点在给定色板组内的索引（不落在组内时为 -1）。 */
async function activeSwatchIndex(group: Locator): Promise<number> {
    return group.evaluate((element) => {
        const items = Array.from(element.querySelectorAll('.caomei-color-picker__swatch'))
        return items.findIndex((item) => item === document.activeElement)
    })
}

/** 取色块的计算边框色：选中态规则独立于焦点环，可用于判别 `[aria-checked]` 规则是否生效。 */
async function borderColor(radio: Locator): Promise<string> {
    return radio.evaluate((element) => getComputedStyle(element).borderTopColor)
}

test('色板 radiogroup：Tab 单停靠点、键盘导航与选中态样式', async ({ page }) => {
    const section = page.locator('#color-picker-swatches')
    await section.locator('.caomei-color-picker__trigger').click()

    const dialog = page.getByRole('dialog', { name: '色板颜色' })
    const group = dialog.locator(SWATCHES)
    await expect(group).toBeVisible()
    await expect(group).toHaveAttribute('role', 'radiogroup')

    const radios = group.getByRole('radio')
    await expect(radios).toHaveCount(3)
    await expect(radios.nth(0)).toHaveAttribute('aria-checked', 'true')
    // roving tabindex：组内恒只有一个 Tab 停靠点，且停靠点就是选中项
    await expect(group.locator(`${SWATCH}[tabindex="0"]`)).toHaveCount(1)
    const checkedTab = group.locator(`${SWATCH}[tabindex="0"]`)
    await expect(checkedTab).toHaveAttribute('aria-checked', 'true')
    await expect(checkedTab).toHaveAttribute('aria-label', '#e63946')

    // 选中态计算样式（真实浏览器）：选中项 2px 实线描边，未选中项无描边（outline-style: none）
    expect(await radios.nth(0).evaluate((element) => {
        const style = getComputedStyle(element)
        return `${style.outlineStyle} ${style.outlineWidth}`
    })).toBe('solid 2px')
    expect(await radios.nth(1).evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('none')

    // Tab 从十六进制输入框进入组 → 落在选中项
    await dialog.locator('.caomei-color-picker__input').focus()
    await page.keyboard.press('Tab')
    await expect.poll(() => activeSwatchIndex(group), { message: 'Tab 应进入色板并落在选中项' }).toBe(0)

    // 方向键前进：选中并聚焦第二项，选中态样式随属性迁移
    await page.keyboard.press('ArrowRight')
    await expect.poll(() => activeSwatchIndex(group), { message: 'ArrowRight 应把焦点移到第二项' }).toBe(1)
    await expect(radios.nth(1)).toHaveAttribute('aria-checked', 'true')
    await expect(radios.nth(0)).toHaveAttribute('aria-checked', 'false')
    await expect(group.locator(`${SWATCH}[tabindex="0"]`)).toHaveCount(1)
    await expect(group.locator(`${SWATCH}[tabindex="0"]`)).toHaveAttribute('aria-label', '#22c55e')
    // 边框色由 `[aria-checked]` 规则决定，不依赖焦点环
    expect(await borderColor(radios.nth(1))).not.toBe(await borderColor(radios.nth(0)))
    expect(await radios.nth(1).evaluate((element) => {
        const style = getComputedStyle(element)
        return `${style.outlineStyle} ${style.outlineWidth}`
    })).toBe('solid 2px')
    expect(await radios.nth(0).evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('none')

    // Home / End
    await page.keyboard.press('Home')
    await expect.poll(() => activeSwatchIndex(group)).toBe(0)
    await page.keyboard.press('End')
    await expect.poll(() => activeSwatchIndex(group)).toBe(2)
    await expect(radios.nth(2)).toHaveAttribute('aria-checked', 'true')

    // 首项 ArrowLeft 回绕到末项
    await page.keyboard.press('Home')
    await expect.poll(() => activeSwatchIndex(group)).toBe(0)
    await page.keyboard.press('ArrowLeft')
    await expect.poll(() => activeSwatchIndex(group), { message: '首项 ArrowLeft 应回绕到末项' }).toBe(2)
    await expect(radios.nth(2)).toHaveAttribute('aria-checked', 'true')
})
