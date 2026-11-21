import { expect, test } from '@playwright/test'

/**
 * Descriptions 的真实浏览器回归：320 / 768 / 1280 档列数、长内容不溢出、跨列边界与亮暗。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#descriptions`。
 */

const GRID = '#descriptions-grid'
const BORDERED = '#descriptions-bordered'

async function columnCount(page: import('@playwright/test').Page, width: number): Promise<number> {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/')
    await page.locator(GRID).scrollIntoViewIfNeeded()
    const template = await page.locator(GRID).evaluate((element) => getComputedStyle(element).gridTemplateColumns)
    return template.split(' ').filter(Boolean).length
}

test('320 / 768 / 1280 档列数按断点收敛', async ({ page }) => {
    expect(await columnCount(page, 1280)).toBe(3)
    expect(await columnCount(page, 768)).toBe(2)
    expect(await columnCount(page, 320)).toBe(1)
})

test('长内容与跨列条目不产生横向溢出', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto('/')
    const grid = page.locator(GRID)
    await grid.scrollIntoViewIfNeeded()

    const overflow = await grid.evaluate((element) => ({
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
    }))
    expect(overflow.scrollWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.clientWidth + 1)

    const longItem = grid.locator('.caomei-descriptions__value').nth(3)
    const itemOverflow = await longItem.evaluate((element) => ({
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
    }))
    expect(itemOverflow.scrollWidth, JSON.stringify(itemOverflow)).toBeLessThanOrEqual(itemOverflow.clientWidth + 1)

    // 跨 3 列的条目在窄屏按整行处理：宽度与容器一致
    const widths = await grid.evaluate((element) => {
        const item = element.querySelectorAll('.caomei-descriptions__item')[3] as HTMLElement
        return { item: item.getBoundingClientRect().width, grid: element.getBoundingClientRect().width }
    })
    expect(Math.abs(widths.item - widths.grid)).toBeLessThanOrEqual(1)
})

test('bordered + vertical 形态输出边框与纵向布局', async ({ page }) => {
    await page.goto('/')
    const item = page.locator(`${BORDERED} .caomei-descriptions__item`).first()
    await item.scrollIntoViewIfNeeded()

    await expect(item).toHaveClass(/caomei-descriptions__item--bordered/)
    await expect(item).toHaveClass(/caomei-descriptions__item--vertical/)
    const border = await item.evaluate((element) => getComputedStyle(element).borderBottomWidth)
    expect(border).not.toBe('0px')
})

test('暗色主题下标签颜色随 token 切换', async ({ page }) => {
    await page.goto('/')
    const label = page.locator(`${GRID} .caomei-descriptions__label`).first()
    await label.scrollIntoViewIfNeeded()
    const light = await label.evaluate((element) => getComputedStyle(element).color)

    await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark')
    })
    const dark = await label.evaluate((element) => getComputedStyle(element).color)

    expect(dark).not.toBe(light)
})
