import { expect, test as base } from '@playwright/test'

/**
 * Watermark 水印的真实浏览器回归。
 *
 * 判别口径：
 * 1. 遮罩带 `aria-hidden`，根与插槽正文保持可访问；
 * 2. 删除遮罩节点后由观察者重建；
 * 3. 卸载后组件与遮罩离开 DOM（`disconnect` 由单测 spy 承担）；
 * 4. 主题切换触发重绘（切换前后 data URL 必须不同）；
 * 5. 页面无 console error。
 */

const HOST = '#watermark-host'
const OVERLAY = `${HOST} .caomei-watermark__overlay`

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

test('遮罩对辅助技术隐藏，插槽正文可读', async ({ page }) => {
    await page.locator(HOST).scrollIntoViewIfNeeded()

    await expect(page.locator(OVERLAY)).toHaveAttribute('aria-hidden', 'true')
    await expect(page.locator(`${HOST} .caomei-watermark`)).not.toHaveAttribute('aria-hidden', /.+/)
    await expect(page.locator(`${HOST} .watermark-fixture__content`)).toBeVisible()
    await expect(page.locator(`${HOST} .watermark-fixture__content`)).toHaveText('可读正文内容')

    const background = await page.locator(OVERLAY).evaluate((node) => getComputedStyle(node).backgroundImage)
    expect(background).toContain('data:image/png')
})

test('删除遮罩节点后自动重建', async ({ page }) => {
    await page.locator(HOST).scrollIntoViewIfNeeded()
    await page.locator(OVERLAY).evaluate((node) => {
        node.remove()
    })

    await expect(page.locator(OVERLAY)).toHaveCount(1)
    const background = await page.locator(OVERLAY).evaluate((node) => getComputedStyle(node).backgroundImage)
    expect(background).toContain('data:image/png')
})

test('卸载后组件与遮罩离开 DOM', async ({ page }) => {
    await page.locator(HOST).scrollIntoViewIfNeeded()
    await page.locator('#watermark-unmount').click()
    await expect(page.locator(`${HOST} .caomei-watermark`)).toHaveCount(0)
    await expect(page.locator(OVERLAY)).toHaveCount(0)
    await expect(page.locator(`${HOST} .watermark-fixture__content`)).toHaveCount(0)
})

test('暗色主题下仍正常绘制', async ({ page }) => {
    await page.locator(HOST).scrollIntoViewIfNeeded()
    const before = await page.locator(OVERLAY).evaluate((node) => (node as HTMLElement).style.backgroundImage)

    await page.locator('#watermark-theme').click()
    await expect(page.locator('#watermark-state')).toHaveText('dark')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    // 主题切换必须触发重绘：默认色在绘制时采样，重绘前后的 data URL 应不同
    await expect.poll(async () => page.locator(OVERLAY).evaluate((node) => (node as HTMLElement).style.backgroundImage), { timeout: 4000 }).not.toBe(before)
    const after = await page.locator(OVERLAY).evaluate((node) => (node as HTMLElement).style.backgroundImage)
    expect(after).toContain('data:image/png')
    await expect(page.locator(`${HOST} .watermark-fixture__content`)).toBeVisible()
})
