import { expect, test } from '@playwright/test'

/**
 * Result 的真实浏览器回归：状态渲染、操作区、role=status 与窄屏不裁切。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#result`。
 */

test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('#result').scrollIntoViewIfNeeded()
})

test('语义态与 HTTP 码状态渲染图标和标题', async ({ page }) => {
    const success = page.locator('#result-success .caomei-result')
    await expect(success).toHaveAttribute('role', 'status')
    await expect(success).toHaveClass(/caomei-result--success/)
    await expect(success.locator('.caomei-result__title')).toHaveText('操作成功')
    await expect(success.locator('.caomei-result__icon')).toBeVisible()
    await expect(success.getByRole('button', { name: '继续' })).toBeVisible()

    const notFound = page.locator('#result-404 .caomei-result')
    await expect(notFound).toHaveClass(/caomei-result--404/)
    await expect(notFound.locator('.caomei-result__title')).toHaveText('页面不存在')

    const danger = page.locator('#result-danger .caomei-result')
    await expect(danger).toHaveClass(/caomei-result--danger/)
    await expect(danger).toHaveClass(/caomei-result--lg/)
})

test('窄视口下内容不产生横向溢出', async ({ page }) => {
    const result = page.locator('#result-success .caomei-result')
    const overflow = await result.evaluate((element) => ({
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
    }))

    expect(overflow.scrollWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.clientWidth + 1)
})
