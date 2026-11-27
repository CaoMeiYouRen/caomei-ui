import { expect, test } from '@playwright/test'

/**
 * 滚轮选择器的真实浏览器回归（常驻）。
 *
 * 覆盖：单列 / 多列渲染、点击与方向键写回、`loop` 首尾回绕、滚动停止后吸附到最近项
 * （动量收敛）、`role="group"` / `listbox` 语义与列可访问名。
 *
 * 吸附断言的判别力：先把列滚到「两项之间」的偏移（行高 × 1.5），等吸附判定窗口过去后，
 * 模型必须给出四舍五入后的最近项——若落点判定失效（不吸附 / 取整错误），该断言会失败。
 */

const ROOT = '#panel-picker'
const COLUMNS = `${ROOT} .caomei-picker__column`
const VALUE_OUT = '#picker-value'

const ROW_HEIGHT = 36
/** 吸附判定窗口（140ms）+ 余量 */
const SETTLE_WAIT_MS = 500

test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator(ROOT)).toBeVisible()
})

test('渲染两列并带 group / listbox 语义与列名', async ({ page }) => {
    const group = page.locator(`${ROOT} .caomei-picker`)
    await expect(group).toHaveAttribute('role', 'group')
    await expect(group).toHaveAttribute('aria-label', '选择地区')

    const columns = page.locator(COLUMNS)
    await expect(columns).toHaveCount(2)
    await expect(columns.nth(0)).toHaveAttribute('role', 'listbox')
    await expect(columns.nth(0)).toHaveAttribute('aria-label', '省份')
    await expect(columns.nth(1)).toHaveAttribute('aria-label', '城市')
})

test('点击选项写回对应列，其余列保持', async ({ page }) => {
    await page.locator(COLUMNS).nth(1).locator('.caomei-picker__option').nth(1).click()
    await expect(page.locator(VALUE_OUT)).toHaveText('zj,nj')
})

test('方向键逐项移动，loop 开启时首项上移回绕到末项', async ({ page }) => {
    const first = page.locator(COLUMNS).nth(0)
    await first.focus()

    await page.keyboard.press('ArrowDown')
    await expect(page.locator(VALUE_OUT)).toHaveText('js,hz')

    await page.keyboard.press('Home')
    await expect(page.locator(VALUE_OUT)).toHaveText('zj,hz')

    await page.keyboard.press('ArrowUp')
    await expect(page.locator(VALUE_OUT), 'loop 下首项上移回绕到末项').toHaveText('gd,hz')
})

test('滚动停止后吸附到最近项（动量收敛）', async ({ page }) => {
    const first = page.locator(COLUMNS).nth(0)

    // 滚到第 1 项与第 2 项之间：四舍五入后的最近项是第 2 项（下标 1）
    await first.evaluate((element, rowHeight) => {
        element.scrollTo({ top: rowHeight * 1.5 })
    }, ROW_HEIGHT)

    await page.waitForTimeout(SETTLE_WAIT_MS)
    await expect(page.locator(VALUE_OUT), '落点取最近项').toHaveText('js,hz')

    // 继续滚到接近末项：吸附到末项（下标 2）
    await first.evaluate((element, rowHeight) => {
        element.scrollTo({ top: rowHeight * 2 })
    }, ROW_HEIGHT)
    await page.waitForTimeout(SETTLE_WAIT_MS)
    await expect(page.locator(VALUE_OUT)).toHaveText('gd,hz')
})

test('选中项在列内以 aria-selected 暴露', async ({ page }) => {
    const first = page.locator(COLUMNS).nth(0)
    await first.focus()
    await page.keyboard.press('ArrowDown')

    await expect(first.locator('.caomei-picker__option').nth(1)).toHaveAttribute('aria-selected', 'true')
    await expect(first.locator('.caomei-picker__option').nth(0)).toHaveAttribute('aria-selected', 'false')
})
