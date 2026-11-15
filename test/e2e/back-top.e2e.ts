import { expect, test as base } from '@playwright/test'

/**
 * BackTop 显隐与回顶的真实浏览器回归。
 *
 * 判别口径：
 * 1. 初始隐藏；目标容器滚动超过阈值后显示，且完整落在视口内（固定定位生效）；
 * 2. 点击后目标容器回到顶部并重新隐藏；
 * 3. 可访问名取 `label`。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#back-top`（元素目标、阈值 50）。
 */

const BUTTON = '#back-top-button'
const SCROLLER = '#back-top-scroller'

/** 每个用例独立收集 console error / page error，并统一导航。 */
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

test('滚动超过阈值显示、点击回顶并隐藏', async ({ page }) => {
    const button = page.locator(BUTTON)
    await page.locator(SCROLLER).scrollIntoViewIfNeeded()
    await expect(button).toBeHidden()

    await page.locator(SCROLLER).evaluate((element) => {
        element.scrollTop = 120
        element.dispatchEvent(new Event('scroll'))
    })
    await expect(button, '超过阈值后应显示').toBeVisible()

    const geometry = await button.evaluate((element) => {
        const rect = element.getBoundingClientRect()
        const style = getComputedStyle(element)
        return {
            position: style.position,
            right: Math.round(window.innerWidth - rect.right),
            bottom: Math.round(window.innerHeight - rect.bottom),
            inViewport: rect.right <= window.innerWidth && rect.bottom <= window.innerHeight,
        }
    })
    expect(geometry.position, '固定定位').toBe('fixed')
    expect(geometry.inViewport, '按钮必须完整落在视口内').toBe(true)
    expect(geometry.right, '默认距右 16px').toBe(16)
    expect(geometry.bottom, '默认距底 16px').toBe(16)
    await expect(button).toHaveAttribute('aria-label', '回到顶部')

    await button.click()
    await expect.poll(
        () => page.locator(SCROLLER).evaluate((element) => element.scrollTop),
        { message: '点击后目标容器应回到顶部' },
    ).toBe(0)
    await expect(button, '回到顶部后应重新隐藏').toBeHidden()
})

test('未超过阈值时保持隐藏', async ({ page }) => {
    const button = page.locator(BUTTON)
    await page.locator(SCROLLER).scrollIntoViewIfNeeded()
    await page.locator(SCROLLER).evaluate((element) => {
        element.scrollTop = 20
        element.dispatchEvent(new Event('scroll'))
    })
    await expect(button).toBeHidden()
})
