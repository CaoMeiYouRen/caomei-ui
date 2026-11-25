import { expect, test as base } from '@playwright/test'

/**
 * Anchor 锚点导航的真实浏览器回归。
 *
 * 判别口径：
 * 1. 容器滚动时按判定线（容器顶 + offset）切换当前项，边界可判定；
 * 2. 点击条目只滚动容器、不滚动页面，并写入 hash；
 * 3. 当前项带 `aria-current="location"`，全导航唯一。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#anchor`。
 */

const NAV = '#anchor-nav'
const SCROLLER = '#anchor-scroller'

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

/** 把某个标题滚到「距容器顶 `delta` px」的位置 */
async function scrollHeadingTo(page: import('@playwright/test').Page, id: string, delta: number): Promise<void> {
    await page.evaluate(({ scrollerSelector, headingId, offset }) => {
        const scroller = document.querySelector<HTMLElement>(scrollerSelector)
        const heading = document.getElementById(headingId)
        if (!scroller || !heading) {
            throw new Error('滚动容器或标题不存在')
        }
        const containerTop = scroller.getBoundingClientRect().top
        const headingTop = heading.getBoundingClientRect().top
        scroller.scrollTop += headingTop - containerTop - offset
    }, { scrollerSelector: SCROLLER, headingId: id, offset: delta })
    await page.waitForTimeout(120)
}

async function currentHref(page: import('@playwright/test').Page): Promise<string | null> {
    return page.evaluate((selector) => {
        const current = document.querySelector(`${selector} .caomei-anchor__link[aria-current="location"]`)
        return current?.getAttribute('href') ?? null
    }, NAV)
}

test('容器滚动按判定线切换当前项（含边界）', async ({ page }) => {
    await page.locator(NAV).scrollIntoViewIfNeeded()

    await scrollHeadingTo(page, 'anchor-b', 8)
    expect(await currentHref(page)).toBe('#anchor-b')

    // 边界：判定线 = 容器顶 + 12；标题在判定线下方时仍为上一项
    await scrollHeadingTo(page, 'anchor-c', 18)
    expect(await currentHref(page)).toBe('#anchor-b')

    await scrollHeadingTo(page, 'anchor-c', 6)
    expect(await currentHref(page)).toBe('#anchor-c')

    const count = await page.locator(`${NAV} .caomei-anchor__link[aria-current="location"]`).count()
    expect(count, 'aria-current 应唯一').toBe(1)
})

test('点击条目只滚容器并写入 hash', async ({ page }) => {
    await page.locator(NAV).scrollIntoViewIfNeeded()
    const before = await page.evaluate((selector) => ({
        scrollTop: document.querySelector<HTMLElement>(selector)?.scrollTop ?? 0,
        pageY: window.scrollY,
    }), SCROLLER)

    await page.locator(`${NAV} .caomei-anchor__link[href="#anchor-b"]`).click()
    await page.waitForTimeout(300)
    await page.locator(`${NAV} .caomei-anchor__link[href="#anchor-c"]`).click()
    await page.waitForTimeout(300)

    const after = await page.evaluate((selector) => ({
        scrollTop: document.querySelector<HTMLElement>(selector)?.scrollTop ?? 0,
        pageY: window.scrollY,
    }), SCROLLER)
    expect(after.scrollTop, '容器应滚动到目标').toBeGreaterThan(before.scrollTop)
    expect(after.pageY, '不得连带滚动页面').toBe(before.pageY)
    expect(await page.evaluate(() => window.location.hash)).toBe('#anchor-c')
    expect(await currentHref(page)).toBe('#anchor-c')

    // 落点必须对齐判定线（双侧）：标题顶 - 容器顶 ≈ offset（12px），不得过冲或未到位
    const readLanding = () => page.evaluate(({ scrollerSelector }) => {
        const scroller = document.querySelector<HTMLElement>(scrollerSelector)
        const heading = document.getElementById('anchor-c')
        if (!scroller || !heading) {
            return Number.NaN
        }
        return heading.getBoundingClientRect().top - scroller.getBoundingClientRect().top
    }, { scrollerSelector: SCROLLER })
    await expect.poll(async () => {
        const delta = await readLanding()
        return delta >= 10 && delta <= 14
    }, { message: '点击后标题顶应对齐判定线（10–14px 容差）', timeout: 3000 }).toBe(true)
    const landing = await readLanding()
    expect(landing, '点击落点不得过冲').toBeGreaterThanOrEqual(10)
    expect(landing, '点击落点不得未到位').toBeLessThanOrEqual(14)

    // 后退可回到上一节（本用例不单独验证 pushState 机制）
    await page.goBack()
    await page.waitForTimeout(300)
    expect(await page.evaluate(() => window.location.hash)).toBe('#anchor-b')
    expect(await currentHref(page)).toBe('#anchor-b')
})
