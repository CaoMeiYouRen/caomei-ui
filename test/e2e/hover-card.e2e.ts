import { expect, test as base } from '@playwright/test'

/**
 * HoverCard 悬停卡片的真实浏览器回归。
 *
 * 判别口径：
 * 1. 悬停展开、移出关闭；聚焦展开、Esc 关闭；
 * 2. 关闭延迟按配置生效（悬停到「延迟卡片」时先不出现、后出现）；
 * 3. 禁用触发器悬停不展开；
 * 4. 卡片层级取浮层档位（高于普通内容）；
 * 5. 页面无 console error。
 */

const SECTION = '#hover-card'
const TRIGGER = `${SECTION} .caomei-hover-card__trigger`
const PANEL = '.caomei-hover-card__content'

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

test('悬停展开，移出后关闭', async ({ page }) => {
    await page.locator(SECTION).scrollIntoViewIfNeeded()
    await page.locator(TRIGGER).first().hover()
    await expect(page.locator(PANEL)).toBeVisible()
    await expect(page.locator(PANEL)).toContainText('无障碍名称的解释')

    await page.mouse.move(0, 0)
    await expect(page.locator(PANEL)).toBeHidden()
})

test('聚焦展开，Esc 关闭', async ({ page }) => {
    await page.locator(SECTION).scrollIntoViewIfNeeded()
    const trigger = page.locator(TRIGGER).first()
    await trigger.focus()
    await expect(page.locator(PANEL)).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.locator(PANEL)).toBeHidden()
    await expect(trigger).toBeFocused()
})

test('延迟卡片先不出现，延迟后出现', async ({ page }) => {
    await page.locator(SECTION).scrollIntoViewIfNeeded()
    const delayed = page.locator(TRIGGER).nth(2)
    await delayed.hover()

    // 观察窗取 250ms：既证明非瞬时，也排除「透传失效后按默认 200ms 提前展开」
    await page.waitForTimeout(250)
    await expect(page.locator(PANEL)).toBeHidden()
    await expect(page.locator(PANEL)).toBeVisible({ timeout: 3000 })
    await expect(page.locator(PANEL)).toContainText('延迟后出现的内容')
})

test('禁用触发器悬停不展开', async ({ page }) => {
    await page.locator(SECTION).scrollIntoViewIfNeeded()
    const disabled = page.locator(TRIGGER).nth(1)
    await expect(disabled).toBeDisabled()
    await disabled.hover({ force: true })

    await page.waitForTimeout(400)
    await expect(page.locator(PANEL)).toBeHidden()
})

test('卡片层级取浮层档位', async ({ page }) => {
    await page.locator(SECTION).scrollIntoViewIfNeeded()
    await page.locator(TRIGGER).first().hover()
    const panel = page.locator(PANEL)
    await expect(panel).toBeVisible()

    const zIndex = await panel.evaluate((node) => Number(getComputedStyle(node).zIndex))
    expect(zIndex).toBeGreaterThanOrEqual(1050)
})
