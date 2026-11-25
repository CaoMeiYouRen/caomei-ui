import { expect, test as base } from '@playwright/test'

/**
 * ContextMenu 右键菜单的真实浏览器回归。
 *
 * 判别口径：
 * 1. 右键打开、左键不打开；
 * 2. 数据条目的快捷键与危险项渲染、禁用项不触发命令；
 * 3. 触屏长按（约 700ms）打开；
 * 4. Escape 关闭菜单并解除背景隔离。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#context-menu`。
 */

const TARGET = '#context-menu-target'
const PANEL = '.caomei-context-menu__content'
const LOG = '#context-menu-log'

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

test('右键打开菜单、左键不打开，Escape 关闭并解除隔离', async ({ page }) => {
    const panel = page.locator(PANEL)
    const target = page.locator(TARGET)

    await target.click()
    await expect(panel, '左键不应打开右键菜单').toHaveCount(0)

    await target.click({ button: 'right' })
    await expect(panel).toBeVisible()
    await expect(panel.getByText('查看详情', { exact: true })).toBeVisible()
    await expect(panel.getByText('⌘C', { exact: true })).toBeVisible()

    const danger = panel.locator('.caomei-context-menu__item--danger')
    await expect(danger).toHaveCount(1)
    const colors = await page.evaluate(() => {
        const normal = document.querySelector('.caomei-context-menu__item:not(.caomei-context-menu__item--danger)')
        const dangerItem = document.querySelector('.caomei-context-menu__item--danger')
        return {
            normal: normal === null ? '' : getComputedStyle(normal).color,
            danger: dangerItem === null ? '' : getComputedStyle(dangerItem).color,
        }
    })
    expect(colors.danger, '危险项应使用危险色文字').not.toBe(colors.normal)

    const disabled = panel.locator('.caomei-context-menu__item[data-disabled]')
    await expect(disabled).toHaveCount(1)

    // 打开时背景被隔离
    expect(await page.evaluate(() => document.querySelector('#context-menu-log')?.closest('[inert]') !== null)).toBe(true)

    // 先关闭当前菜单，再单独验证焦点归还
    await page.keyboard.press('Escape')
    await expect(panel).toHaveCount(0)

    // 焦点归还：先聚焦触发区外的按钮，打开后 Esc 应回到该元素而不是 body
    await page.locator('#context-menu-before').focus()
    await page.locator(TARGET).click({ button: 'right' })
    await expect(panel).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(panel).toHaveCount(0)
    await expect.poll(
        () => page.evaluate(() => document.activeElement?.id ?? ''),
        { message: '关闭后焦点应回到打开前的元素' },
    ).toBe('context-menu-before')
    expect(await page.evaluate(() => document.querySelector('#context-menu-log')?.closest('[inert]') === null)).toBe(true)
})

test('选中条目触发命令并关闭；禁用项不触发', async ({ page }) => {
    const panel = page.locator(PANEL)
    await page.locator(TARGET).click({ button: 'right' })
    await expect(panel).toBeVisible()

    await panel.getByText('无权限', { exact: true }).click()
    await expect(page.locator(LOG)).toHaveText('')
    await expect(panel, '点击禁用项后面板应保持打开').toBeVisible()

    await panel.getByText('查看详情', { exact: true }).click()
    await expect(page.locator(LOG)).toHaveText('查看详情')
    await expect(panel).toHaveCount(0)
})

test('触屏长按打开菜单', async ({ page }, testInfo) => {
    test.skip(testInfo.project.use.hasTouch !== true, '长按仅在带触摸的档位验证')

    const panel = page.locator(PANEL)
    const box = await page.locator(TARGET).boundingBox()
    if (!box) {
        throw new Error('目标区域没有几何盒')
    }
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2

    await page.evaluate(({ x: pointX, y: pointY }) => {
        const target = document.querySelector('#context-menu-target')
        if (!target) {
            throw new Error('目标区域未找到')
        }
        target.dispatchEvent(new PointerEvent('pointerdown', {
            bubbles: true,
            cancelable: true,
            pointerType: 'touch',
            clientX: pointX,
            clientY: pointY,
            isPrimary: true,
        }))
    }, { x, y })

    await expect(panel, '长按约 700ms 后应打开菜单').toBeVisible({ timeout: 3000 })

    await page.evaluate(({ x: pointX, y: pointY }) => {
        document.querySelector('#context-menu-target')?.dispatchEvent(new PointerEvent('pointerup', {
            bubbles: true,
            cancelable: true,
            pointerType: 'touch',
            clientX: pointX,
            clientY: pointY,
            isPrimary: true,
        }))
    }, { x, y })
    await page.keyboard.press('Escape')
    await expect(panel).toHaveCount(0)
})
