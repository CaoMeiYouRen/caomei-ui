import { expect, test as base } from '@playwright/test'

/**
 * Menubar 菜单栏的真实浏览器回归。
 *
 * 判别口径：
 * 1. 点击触发器打开菜单、点击外部关闭；
 * 2. 打开态可切换到另一组菜单；
 * 3. 方向键 / Home / End 在触发器之间移动焦点，Esc 关闭并把焦点还给触发器；
 * 4. 禁用条目不可激活、点击后菜单仍打开；
 * 5. 页面无 console error。
 */

const BAR = '#menubar'
const TRIGGER = `${BAR} .caomei-menubar__trigger`
const PANEL = '.caomei-menubar__content'

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

test('点击打开、点击外部关闭', async ({ page }) => {
    await page.locator(BAR).scrollIntoViewIfNeeded()
    await page.locator(TRIGGER).first().click()
    await expect(page.locator(PANEL)).toBeVisible()

    await page.locator('body').click({ position: { x: 4, y: 4 } })
    await expect(page.locator(PANEL)).toBeHidden()
})

test('打开态可切换到另一组菜单', async ({ page }) => {
    await page.locator(BAR).scrollIntoViewIfNeeded()
    await page.locator(TRIGGER).first().click()
    await expect(page.locator(PANEL)).toContainText('新建')

    await page.locator(TRIGGER).nth(1).click()
    await expect(page.locator(PANEL)).toContainText('撤销')
    await expect(page.locator(PANEL)).not.toContainText('新建')
})

test('方向键 / Home / End 移动焦点，Esc 关闭并归还焦点', async ({ page }) => {
    await page.locator(BAR).scrollIntoViewIfNeeded()
    const first = page.locator(TRIGGER).first()
    const second = page.locator(TRIGGER).nth(1)

    await first.focus()
    await page.keyboard.press('ArrowRight')
    await expect(second).toBeFocused()
    await page.keyboard.press('Home')
    await expect(first).toBeFocused()
    await page.keyboard.press('End')
    await expect(second).toBeFocused()

    await page.keyboard.press('Enter')
    await expect(page.locator(PANEL)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator(PANEL)).toBeHidden()
    await expect(second).toBeFocused()
})

test('禁用条目不可激活且点击后菜单保持打开', async ({ page }) => {
    await page.locator(BAR).scrollIntoViewIfNeeded()
    await page.locator(TRIGGER).first().click()
    const disabled = page.locator(`${PANEL} .caomei-menubar__item[data-disabled]`).first()
    await expect(disabled).toBeVisible()
    await expect(disabled).toHaveAttribute('aria-disabled', 'true')

    await disabled.click({ force: true })
    await expect(page.locator(PANEL)).toBeVisible()
})
