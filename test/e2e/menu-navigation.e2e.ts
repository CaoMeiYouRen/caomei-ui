import { expect, test as base, type Page } from '@playwright/test'

/**
 * 导航骨架（`CaomeiMenu` / `CaomeiSubMenu` / `CaomeiMenuItem`）的浏览器回归（常驻）。
 *
 * 为什么需要真实浏览器：子菜单面板的挂载 / 卸载由 `Presence` + rAF 驱动，happy-dom 下不可稳定
 * 驱动（面板内容不渲染），故「展开后焦点移入首项」「收起后焦点交回触发器」「折叠态下子项不进入
 * 键盘序列」三条契约只能在真实 Chromium 中判定。单测覆盖可稳定驱动的部分（`aria-expanded` /
 * `aria-controls` / `aria-current` / 禁用项排除 / 顶层方向键导航）。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#menu-navigation` 段：纵向菜单 = 概览（当前项）+
 * 设置（子菜单：账户 / 通知）+ 退出。
 */

const SECTION = '#menu-navigation'
const TARGETS = `${SECTION} [data-caomei-menu-target]`
const TRIGGER = `${SECTION} [data-caomei-submenu-trigger]`
const PANEL = `${SECTION} [data-caomei-submenu-panel]`
const CURRENT = `${SECTION} .caomei-menu [aria-current="page"]`

/** 每个用例独立收集 console / page error，并统一导航。 */
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

/** 当前聚焦元素的可见文本（去空白）；无焦点返回空串。 */
async function focusedText(page: Page): Promise<string> {
    return page.evaluate(() => (document.activeElement as HTMLElement | null)?.textContent.trim() ?? '')
}

async function targetCount(page: Page): Promise<number> {
    return page.locator(TARGETS).count()
}

async function focusNth(page: Page, index: number): Promise<void> {
    await page.locator(TARGETS).nth(index).focus()
}

/** 等焦点落到指定文本（焦点搬移依赖面板挂载的下一帧，单次读数会有竞态）。 */
async function expectFocused(page: Page, text: string): Promise<void> {
    await expect.poll(() => focusedText(page), { message: `焦点应落在「${text}」` }).toBe(text)
}

test.describe('导航骨架', () => {
    test('列表语义与当前项标记', async ({ page }) => {
        await expect(page.locator(SECTION)).toBeVisible()

        // nav[aria-label] + ol/ul 列表（role=list 显式声明，避免 list-style 去除后语义丢失）
        expect(await page.locator(`${SECTION} nav, ${SECTION}.caomei-menu`).first().getAttribute('aria-label')).toBe('主导航')
        await expect(page.locator(`${SECTION} .caomei-menu__list`)).toHaveAttribute('role', 'list')
        await expect(page.locator(`${SECTION} .caomei-menu > ul > li`)).toHaveCount(3)

        await expect(page.locator(CURRENT)).toHaveCount(1)
        await expect(page.locator(CURRENT)).toHaveText('概览')
    })

    test('ArrowDown / ArrowUp / Home / End 在项之间移动焦点', async ({ page }) => {
        await focusNth(page, 0)
        expect(await focusedText(page)).toBe('概览')

        await page.keyboard.press('ArrowDown')
        await expectFocused(page, '设置')

        await page.keyboard.press('ArrowDown')
        expect(await focusedText(page)).toBe('退出')

        // 已到末项：不越界（不循环）
        await page.keyboard.press('ArrowDown')
        expect(await focusedText(page)).toBe('退出')

        await page.keyboard.press('ArrowUp')
        await expectFocused(page, '设置')

        await page.keyboard.press('Home')
        expect(await focusedText(page)).toBe('概览')

        await page.keyboard.press('End')
        expect(await focusedText(page)).toBe('退出')
    })

    test('折叠态：子项不进入键盘序列', async ({ page }) => {
        await expect(page.locator(PANEL)).toHaveCount(0)
        expect(await targetCount(page)).toBe(3)

        await focusNth(page, 1)
        await page.keyboard.press('ArrowDown')

        // 收起时「设置 → 退出」直达（账户 / 通知不在序列内）
        expect(await focusedText(page)).toBe('退出')
    })

    test('ArrowRight 展开子菜单并把焦点移入首项', async ({ page }) => {
        const trigger = page.locator(TRIGGER)
        await trigger.focus()
        await page.keyboard.press('ArrowRight')

        await expect(trigger).toHaveAttribute('aria-expanded', 'true')
        await expect(page.locator(PANEL)).toBeVisible()
        await expectFocused(page, '账户')
        expect(await targetCount(page)).toBe(5)
    })

    test('ArrowLeft 收起子菜单并把焦点交回触发器', async ({ page }) => {
        const trigger = page.locator(TRIGGER)
        await trigger.focus()
        await page.keyboard.press('ArrowRight')
        await expect(page.locator(PANEL)).toBeVisible()

        await page.keyboard.press('ArrowLeft')

        await expect(trigger).toHaveAttribute('aria-expanded', 'false')
        await expect(page.locator(PANEL)).toHaveCount(0)
        await expectFocused(page, '设置')
    })

    test('Escape 收起子菜单并把焦点交回触发器', async ({ page }) => {
        const trigger = page.locator(TRIGGER)
        await trigger.focus()
        await page.keyboard.press('ArrowRight')
        await expect(page.locator(PANEL)).toBeVisible()

        await page.keyboard.press('Escape')

        await expect(trigger).toHaveAttribute('aria-expanded', 'false')
        await expect(page.locator(PANEL)).toHaveCount(0)
        await expectFocused(page, '设置')
    })

    test('面包屑：首项分隔符隐藏、其余可见、末级标记当前页', async ({ page }) => {
        const separators = page.locator(`${SECTION} .caomei-breadcrumb__separator`)
        await expect(separators).toHaveCount(3)

        // 位置判定由容器 CSS（`:first-child`）承担：首项隐藏、其余可见
        await expect(separators.nth(0)).toBeHidden()
        await expect(separators.nth(1)).toBeVisible()
        await expect(separators.nth(2)).toBeVisible()

        await expect(page.locator(`${SECTION} .caomei-breadcrumb [aria-current="page"]`)).toHaveText('当前页')
    })

    test('展开后子项可继续用方向键遍历', async ({ page }) => {
        await page.locator(TRIGGER).focus()
        await page.keyboard.press('ArrowRight')
        await expectFocused(page, '账户')

        await page.keyboard.press('ArrowDown')
        await expectFocused(page, '通知')

        await page.keyboard.press('ArrowDown')
        expect(await focusedText(page)).toBe('退出')
    })
})
