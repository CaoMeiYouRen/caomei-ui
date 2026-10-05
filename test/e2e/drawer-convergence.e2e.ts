import { expect, test as base } from '@playwright/test'
import { boxOf, viewportOf, TOLERANCE } from './helpers/layout'

/**
 * Drawer 尺寸收敛与动效的常驻回归（设计规范 §6 Drawer 行）。
 *
 * 契约：
 * 1. **尺寸档位按 90vw / 90vh 收敛**——左右向宽度 = `min(档位, 90vw)`，上下向高度 = `min(档位, 90vh)`；
 * 2. **reduced-motion 关闭动画**——`prefers-reduced-motion: reduce` 下抽屉面板 `animation: none`；
 *    默认路径保留 `200ms` 入场动画（以 `no-preference` 描述块补回常驻覆盖）。
 *
 * 本套 E2E 全局以 `reducedMotion: 'reduce'` 运行（见 `playwright.config.ts`）；收敛期望值逐视口计算，
 * 每个用例在 mobile / tablet / desktop 三 project 下各跑一遍。
 */

/** `lg` 档抽屉尺寸（`--caomei-drawer-size`，见 drawer.vue） */
const DRAWER_SIZE_LG = 560
/** 收敛比例（90vw / 90vh） */
const VIEWPORT_RATIO = 0.9

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

test.describe('Drawer 尺寸收敛（lg = 560 与 90vw / 90vh 取小）', () => {
    test('右侧抽屉宽度 = min(560, 90vw)', async ({ page }) => {
        const viewport = await viewportOf(page)
        await page.click('#drawer-open-right')
        const content = page.locator('.caomei-drawer__content--right')
        await expect(content).toBeVisible()

        const box = await boxOf(content)
        const expected = Math.min(DRAWER_SIZE_LG, VIEWPORT_RATIO * viewport.width)
        expect(
            Math.abs(box.width - expected),
            `右侧抽屉宽度 ${box.width} 应为 min(560, 90vw)=${expected}`,
        ).toBeLessThanOrEqual(TOLERANCE)

        await page.keyboard.press('Escape')
        await expect(content).toBeHidden()
    })

    test('底部抽屉高度 = min(560, 90vh)', async ({ page }) => {
        const viewport = await viewportOf(page)
        await page.click('#drawer-open-bottom')
        const content = page.locator('.caomei-drawer__content--bottom')
        await expect(content).toBeVisible()

        const box = await boxOf(content)
        const expected = Math.min(DRAWER_SIZE_LG, VIEWPORT_RATIO * viewport.height)
        expect(
            Math.abs(box.height - expected),
            `底部抽屉高度 ${box.height} 应为 min(560, 90vh)=${expected}`,
        ).toBeLessThanOrEqual(TOLERANCE)

        await page.keyboard.press('Escape')
        await expect(content).toBeHidden()
    })
})

test.describe('Drawer 动效（reduced-motion：关闭动画）', () => {
    test('reduce 下抽屉面板 animation-name 为 none', async ({ page }) => {
        await page.click('#drawer-open-right')
        const content = page.locator('.caomei-drawer__content--right')
        await expect(content).toBeVisible()

        const animationName = await content.evaluate((element) => getComputedStyle(element).animationName)
        expect(animationName, 'reduced-motion 下应关闭抽屉动画').toBe('none')
    })
})

test.describe('Drawer 动效（默认路径：保留 200ms 入场动画）', () => {
    test.use({ reducedMotion: 'no-preference' })

    test('默认动效下抽屉有非空动画且时长 0.2s', async ({ page }) => {
        await page.click('#drawer-open-right')
        const content = page.locator('.caomei-drawer__content--right')
        await expect(content).toBeVisible()

        const style = await content.evaluate((element) => {
            const computed = getComputedStyle(element)
            return { animationName: computed.animationName, animationDuration: computed.animationDuration }
        })
        expect(style.animationName, '默认路径下应有入场动画').not.toBe('none')
        expect(style.animationDuration).toBe('0.2s')
    })
})
