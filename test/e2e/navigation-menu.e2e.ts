import { expect, test as base } from '@playwright/test'

/**
 * NavigationMenu 导航菜单的真实浏览器回归。
 *
 * 判别口径：
 * 1. 点击与悬停都能展开，点击外部关闭；
 * 2. 打开态可切换到另一组菜单；
 * 3. `ArrowDown` 进入首个链接，`Esc` 关闭并把焦点还给触发器；
 * 4. 面板完整落在视口内（不被 overflow 裁切）；
 * 5. 页面无 console error。
 */

const NAV = '#navigation-menu'
const TRIGGER = `${NAV} .caomei-navigation-menu__trigger`
const PANEL = `${NAV} .caomei-navigation-menu__content`

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

test('点击展开、点击外部关闭', async ({ page }) => {
    await page.locator(NAV).scrollIntoViewIfNeeded()
    await page.locator(TRIGGER).first().click()
    await expect(page.locator(PANEL)).toBeVisible()
    await expect(page.locator(PANEL)).toContainText('快速上手')

    await page.locator('body').click({ position: { x: 4, y: 4 } })
    await expect(page.locator(PANEL)).toBeHidden()
})

test('悬停展开', async ({ page }) => {
    await page.locator(NAV).scrollIntoViewIfNeeded()
    await page.locator(TRIGGER).first().hover()
    await expect(page.locator(PANEL)).toBeVisible({ timeout: 3000 })
})

test('打开态切换到另一组菜单', async ({ page }) => {
    await page.locator(NAV).scrollIntoViewIfNeeded()
    await page.locator(TRIGGER).first().click()
    await expect(page.locator(PANEL)).toContainText('快速上手')

    await page.locator(TRIGGER).nth(1).click()
    await expect(page.locator(PANEL)).toContainText('最新文章')
})

test('ArrowDown 进入首个链接，Esc 关闭并归还焦点', async ({ page }) => {
    await page.locator(NAV).scrollIntoViewIfNeeded()
    const first = page.locator(TRIGGER).first()
    await first.click()
    await expect(page.locator(PANEL)).toBeVisible()

    await page.keyboard.press('ArrowDown')
    await expect(page.locator(`${PANEL} .caomei-navigation-menu__link`).first()).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(page.locator(PANEL)).toBeHidden()
    await expect(first).toBeFocused()
})

test('面板完整落在视口内', async ({ page }) => {
    await page.locator(NAV).scrollIntoViewIfNeeded()
    await page.locator(TRIGGER).first().click()
    const panel = page.locator(PANEL)
    await expect(panel).toBeVisible()

    const geometry = await panel.evaluate((node) => {
        const rect = node.getBoundingClientRect()
        const viewport = node.closest('.caomei-navigation-menu__viewport')
        const viewportRect = viewport?.getBoundingClientRect()
        const viewportStyle = viewport ? getComputedStyle(viewport) : null
        return {
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            inside: viewportRect
                ? rect.left >= viewportRect.left - 1 && rect.right <= viewportRect.right + 1 && rect.top >= viewportRect.top - 1 && rect.bottom <= viewportRect.bottom + 1
                : false,
            viewportShadow: viewportStyle?.boxShadow ?? 'none',
            viewportBorder: viewportStyle?.borderTopWidth ?? '0px',
        }
    })
    expect(geometry.width).toBeGreaterThan(0)
    expect(geometry.height).toBeGreaterThan(0)
    expect(geometry.inside).toBe(true)
    // 描边与阴影落在 viewport，且不因自身 overflow 被裁掉
    expect(geometry.viewportShadow).not.toBe('none')
    expect(geometry.viewportBorder).toBe('1px')
})
