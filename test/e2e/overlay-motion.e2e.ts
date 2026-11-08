import { expect, test as base, type Page } from '@playwright/test'

/**
 * 动效优先模式（`data-motion="expressive"`）下的浮层 / 反馈进出场回归。
 *
 * 断言方式：
 * - 入场读 `getComputedStyle(...).animationName`（动画结束后仍保留声明名）；
 * - 退场在 `data-state` 变为 `closed` 的同一帧用 `MutationObserver` 记录
 *   `getAnimations()`，避免依赖 sleep 或动画时长。
 *
 * 缺省 `minimal` 的既有行为由 `focus-and-motion.e2e.ts` / 组件单测覆盖，本文件只验证新增的
 * expressive 分支；`prefers-reduced-motion` 的压平由基础层的全局 token 与 `focus-and-motion` 覆盖。
 */

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
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-motion', 'expressive')
        })
        await use(errors)
    }, { auto: true }],
})

test.use({ reducedMotion: 'no-preference' })

test.afterEach(({ pageErrors }) => {
    expect(pageErrors, '页面不得产生 console error').toEqual([])
})

/** 标记当前处于 open 状态的目标，供后续读取动画名。 */
async function markOpen(page: Page, selector: string): Promise<void> {
    const marked = await page.evaluate((sel) => {
        const element = [...document.querySelectorAll(sel)].find((node) => {
            const state = node.getAttribute('data-state')
            return state !== null && state !== 'closed'
        })
        if (!element) {
            return false
        }
        element.setAttribute('data-test-motion', 'open')
        return true
    }, selector)
    expect(marked, `${selector} 应存在 data-state="open" 的元素`).toBe(true)
}

async function animationNameOf(page: Page, selector: string): Promise<string> {
    return page.locator(selector).evaluate((element) => getComputedStyle(element).animationName)
}

/**
 * 监听 `data-state` 变为 `closed` 的瞬间并记录动画名，然后执行关闭动作。
 *
 * @param page 页面
 * @param selector 已标记的目标
 * @param action 触发关闭
 * @returns 退场动画名列表
 */
async function captureExitAnimations(page: Page, selector: string, action: () => Promise<void>): Promise<string[]> {
    await page.evaluate((sel) => {
        const scope = window as unknown as { __exitAnimations?: string[] | null }
        scope.__exitAnimations = null
        const element = document.querySelector(sel)
        if (!element) {
            return
        }
        const observer = new MutationObserver(() => {
            if (element.getAttribute('data-state') === 'closed') {
                scope.__exitAnimations = element.getAnimations().map((animation) => (animation as CSSAnimation).animationName)
                observer.disconnect()
            }
        })
        observer.observe(element, { attributes: true, attributeFilter: ['data-state'] })
    }, selector)

    await action()
    await expect.poll(() => page.evaluate(() => (window as unknown as { __exitAnimations?: string[] | null }).__exitAnimations)).not.toBeNull()
    return page.evaluate(() => (window as unknown as { __exitAnimations?: string[] }).__exitAnimations ?? [])
}

async function openOverlayDialog(page: Page): Promise<void> {
    await page.getByRole('button', { name: '打开浮层对话框' }).click()
    await expect(page.locator('.caomei-dialog__content')).toBeVisible()
}

test.describe('Dialog / ConfirmDialog 进出场', () => {
    test('Dialog 入场与退场动画', async ({ page }) => {
        await page.locator('#dialog-open').click()
        await markOpen(page, '.caomei-dialog__content')
        expect(await animationNameOf(page, '[data-test-motion="open"]')).toContain('caomei-dialog-content-in')

        const exit = await captureExitAnimations(page, '[data-test-motion="open"]', async () => {
            await page.locator('[data-test-motion="open"] .caomei-dialog__close').click()
        })
        expect(exit.join(',')).toContain('caomei-dialog-content-out')
        await expect(page.locator('[data-test-motion="open"]')).toHaveCount(0)
    })

    test('ConfirmDialog 入场与退场动画', async ({ page }) => {
        await page.locator('#confirm-open').click()
        await markOpen(page, '.caomei-confirm-dialog__content')
        expect(await animationNameOf(page, '[data-test-motion="open"]')).toContain('caomei-confirm-dialog-content-in')

        const exit = await captureExitAnimations(page, '[data-test-motion="open"]', async () => {
            await page.locator('[data-test-motion="open"] button').first().click()
        })
        expect(exit.join(',')).toContain('caomei-confirm-dialog-content-out')
    })
})

test.describe('Popover / DropdownMenu 进出场', () => {
    test('Popover 入场与退场动画', async ({ page }) => {
        await openOverlayDialog(page)
        await page.locator('#overlay-popover button').click()
        await markOpen(page, '.caomei-popover__content')
        expect(await animationNameOf(page, '[data-test-motion="open"]')).toContain('caomei-popover-in')

        const exit = await captureExitAnimations(page, '[data-test-motion="open"]', async () => {
            await page.locator('#overlay-popover button').click()
        })
        expect(exit.join(',')).toContain('caomei-popover-out')
    })

    test('DropdownMenu 入场与退场动画', async ({ page }) => {
        await openOverlayDialog(page)
        await page.locator('#overlay-dropdown-menu button').click()
        await markOpen(page, '.caomei-dropdown-menu__content')
        expect(await animationNameOf(page, '[data-test-motion="open"]')).toContain('caomei-dropdown-menu-in')

        const exit = await captureExitAnimations(page, '[data-test-motion="open"]', async () => {
            await page.keyboard.press('Escape')
        })
        expect(exit.join(',')).toContain('caomei-dropdown-menu-out')
    })

    test('Tooltip 入场与退场动画', async ({ page }) => {
        await openOverlayDialog(page)
        await page.locator('#overlay-tooltip button').hover()
        await expect(page.locator('.caomei-tooltip__content')).toBeVisible()
        await markOpen(page, '.caomei-tooltip__content')
        expect(await animationNameOf(page, '[data-test-motion="open"]')).toContain('caomei-tooltip-in')

        const exit = await captureExitAnimations(page, '[data-test-motion="open"]', async () => {
            await page.mouse.move(0, 0)
        })
        expect(exit.join(',')).toContain('caomei-tooltip-out')
    })
})

test.describe('minimal 保持既有行为', () => {
    test('Dialog 在 minimal 下不挂载动画', async ({ page }) => {
        await page.evaluate(() => {
            document.documentElement.removeAttribute('data-motion')
        })
        await page.locator('#dialog-open').click()
        await markOpen(page, '.caomei-dialog__content')
        expect(await animationNameOf(page, '[data-test-motion="open"]')).toBe('none')
    })

    test('Popover 在 minimal 下保留既有入场动画', async ({ page }) => {
        await page.evaluate(() => {
            document.documentElement.removeAttribute('data-motion')
        })
        await openOverlayDialog(page)
        await page.locator('#overlay-popover button').click()
        await markOpen(page, '.caomei-popover__content')
        const style = await page.locator('[data-test-motion="open"]').evaluate((element) => {
            const computed = getComputedStyle(element)
            return {
                name: computed.animationName,
                enterY: computed.getPropertyValue('--caomei-popover-enter-y').trim(),
            }
        })
        expect(style.name).toContain('caomei-popover-in')
        expect(style.enterY, 'minimal 下不应声明 expressive 位移变量').toBe('')
    })
})

test.describe('reduce 压平 expressive 浮层', () => {
    test.use({ reducedMotion: 'reduce' })

    test('Dialog 入场动画时长为 0s', async ({ page }) => {
        await page.locator('#dialog-open').click()
        const content = page.locator('.caomei-dialog__content')
        await expect(content).toBeVisible()
        const durations = await content.evaluate((element) =>
            getComputedStyle(element).animationDuration.split(',').map((value) => Number.parseFloat(value.trim())),
        )
        expect(durations.every((value) => value === 0), `reduce 下动画时长应为 0：${durations.join(', ')}`).toBe(true)
    })

    test('Toast 关闭不因退场延后而滞留', async ({ page }) => {
        await page.locator('#toast-show').click()
        const toasts = page.locator('.caomei-toast')
        await expect(toasts).toHaveCount(5)
        await toasts.first().locator('.caomei-toast__close').click()
        await expect(toasts).toHaveCount(4)
    })
})

test.describe('Toast / Message / Alert / Drawer', () => {
    test('Toast 入场与关闭退场动画', async ({ page }) => {
        await page.locator('#toast-show').click()
        await markOpen(page, '.caomei-toast')
        expect(await animationNameOf(page, '[data-test-motion="open"]')).toContain('caomei-toast-in')

        const exit = await captureExitAnimations(page, '[data-test-motion="open"]', async () => {
            await page.locator('[data-test-motion="open"] .caomei-toast__close').click()
        })
        expect(exit.join(',')).toContain('caomei-toast-out')
        await expect(page.locator('.caomei-toast')).toHaveCount(4)
    })

    test('关闭中间一条只移除该条', async ({ page }) => {
        await page.locator('#toast-show').click()
        const toasts = page.locator('.caomei-toast')
        await expect(toasts).toHaveCount(5)
        const middle = toasts.nth(2)
        const title = await middle.locator('.caomei-toast__title').textContent()
        expect(title).toBeTruthy()
        await middle.locator('.caomei-toast__close').click()
        await expect(toasts).toHaveCount(4)
        await expect(page.locator('.caomei-toast__title', { hasText: title ?? '' })).toHaveCount(0)
    })

    test('Message / Alert 出现动画', async ({ page }) => {
        expect(await animationNameOf(page, '#fv-message .caomei-message')).toContain('caomei-message-in')
        expect(await animationNameOf(page, '#alert-contrast .caomei-alert >> nth=0')).toContain('caomei-message-in')
    })

    test('Drawer 沿用 expressive 时长', async ({ page }) => {
        await page.locator('#drawer-open-right').click()
        const content = page.locator('.caomei-drawer__content--right')
        await expect(content).toBeVisible()
        const style = await content.evaluate((element) => {
            const computed = getComputedStyle(element)
            return { name: computed.animationName, duration: computed.animationDuration }
        })
        expect(style.name).toContain('caomei-drawer-in-right')
        expect(style.duration, 'expressive 下 drawer 时长应升到 300ms').toBe('0.3s')
    })
})
