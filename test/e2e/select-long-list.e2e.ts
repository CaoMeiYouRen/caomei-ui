import { expect, test } from '@playwright/test'

/**
 * Select 长列表可滚动（常驻）。
 *
 * 背景（下游 caomei-auth「修改手机号」国家码，2026-11-14）：选项很多时面板被内容撑高、
 * 越出视口；模态已锁页面滚动，超出部分不可达。根因 = 视口只有 `overflow-y: auto` 而没有
 * 高度上限（clientHeight 等于 scrollHeight，永远不产生滚动）。
 *
 * 判定：
 * - 视口必须有内部滚动（`scrollHeight > clientHeight`）；
 * - 面板底边不得越出视口（含 1px 容差）；
 * - 滚轮必须真实改变 `scrollTop`（只断言可滚性会被「无上限」场景假通过）。
 */
test('对话框内长列表在面板内可滚动且不越出视口', async ({ page }) => {
    await page.goto('/')
    await page.locator('#select-long-list-trigger').click()
    const trigger = page.locator('.caomei-dialog__content .caomei-select')
    await expect(trigger).toBeVisible()
    await trigger.click()

    const viewport = page.locator('.caomei-select__viewport')
    await expect(viewport).toBeVisible()

    await expect.poll(async () => viewport.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true)

    const panel = await page.locator('.caomei-select__content').evaluate((element) => {
        const rect = element.getBoundingClientRect()
        return { top: rect.top, bottom: rect.bottom }
    })
    const viewportHeight = await page.evaluate(() => window.innerHeight)
    expect(panel.top, '面板不得越出视口顶边').toBeGreaterThanOrEqual(-1)
    expect(panel.bottom, '面板不得越出视口底边').toBeLessThanOrEqual(viewportHeight + 1)

    await viewport.hover()
    await page.mouse.wheel(0, 400)
    await expect.poll(async () => viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)

    // 键盘导航：End 应把末项滚入视野（内部滚动容器随 active item 移动）
    const lastItem = page.locator('.caomei-select__item').last()
    await page.keyboard.press('End')
    await expect(lastItem).toBeInViewport()
})
