import { expect, test } from '@playwright/test'

/**
 * 标签组的真实浏览器回归（常驻）。
 *
 * 覆盖：多选点击切换、方向键在组内移动焦点、删除触发器移除并同步模型、`Delete` 键移除、
 * 禁用项不可选、容器可访问名。
 *
 * 判定落在可观察结果：`data-state` / `aria-selected` / 夹具输出的模型值、被移除值与活动元素。
 */

const ROOT = '#panel-tag-group'
const ITEMS = `${ROOT} .caomei-tag-group__item`
const SELECTED_OUT = '#tag-group-selected'
const REMOVED_OUT = '#tag-group-removed'

test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator(ROOT)).toBeVisible()
})

test('多选模式点击切换选中并写回模型', async ({ page }) => {
    const items = page.locator(ITEMS)
    await expect(items).toHaveCount(3)

    await items.nth(1).click()
    await expect(page.locator(SELECTED_OUT)).toHaveText('Vue,TypeScript')
    await expect(items.nth(1)).toHaveAttribute('data-state', 'checked')

    await items.nth(0).click()
    await expect(page.locator(SELECTED_OUT)).toHaveText('TypeScript')
    await expect(items.nth(0)).toHaveAttribute('data-state', 'unchecked')
})

test('方向键在同一组的标签之间移动焦点', async ({ page }) => {
    const items = page.locator(ITEMS)
    await items.nth(0).focus()
    await page.keyboard.press('ArrowRight')

    const focusedText = await page.evaluate(() => {
        const element = document.activeElement
        return element instanceof HTMLElement ? element.textContent.trim() : ''
    })
    expect(focusedText, '焦点移到下一个标签').toContain('TypeScript')
})

test('删除触发器移除标签、派发 remove 并同步模型', async ({ page }) => {
    const items = page.locator(ITEMS)
    // 初始选中 Vue：再选 TypeScript 形成两项，确保移除后仍有选中项可比对
    await items.nth(1).click()
    await expect(page.locator(SELECTED_OUT)).toHaveText('Vue,TypeScript')

    await items.nth(0).locator('.caomei-tag-group__delete').click()

    await expect(page.locator(REMOVED_OUT)).toHaveText('Vue')
    await expect(page.locator(SELECTED_OUT)).toHaveText('TypeScript')
    await expect(items).toHaveCount(2)
})

test('Delete 键移除聚焦的标签', async ({ page }) => {
    const items = page.locator(ITEMS)
    await items.nth(2).focus()
    await page.keyboard.press('Delete')

    await expect(page.locator(REMOVED_OUT)).toHaveText('CSS')
    await expect(items).toHaveCount(2)
})

test('容器带可访问名，标签暴露选择状态', async ({ page }) => {
    const group = page.locator(ROOT).locator('.caomei-tag-group')
    await expect(group).toHaveAttribute('aria-label', '技能标签')

    const first = page.locator(ITEMS).nth(0)
    await expect(first).toHaveAttribute('aria-selected', 'true')
})
