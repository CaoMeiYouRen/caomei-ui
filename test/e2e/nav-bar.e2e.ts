import { expect, test } from '@playwright/test'

/**
 * 页头（NavBar）的真实浏览器回归（夹具见 `#nav-bar`）：
 * 320 / 390 / 768 无横向溢出、标题单行省略、返回按钮命中区 ≥24、吸顶层级、键盘与暗色。
 */

const ROOT = '#nav-bar'

for (const width of [320, 390, 768]) {
    test(`${width} 视口下页头不横向溢出且标题单行省略`, async ({ page }) => {
        await page.setViewportSize({ width, height: 720 })
        await page.goto('/')

        const basic = page.locator(`${ROOT} #navbar-basic`)
        const long = page.locator(`${ROOT} #navbar-long`)
        await expect(basic).toBeVisible()

        const boxes = await Promise.all([basic.boundingBox(), long.boundingBox()])
        for (const box of boxes) {
            expect(box).not.toBeNull()
            if (!box) {
                throw new Error('页头未渲染包围盒')
            }
            expect(box.x).toBeGreaterThanOrEqual(0)
            expect(box.x + box.width).toBeLessThanOrEqual(width)
        }

        const title = long.locator('.caomei-nav-bar__title')
        const titleMetrics = await title.evaluate((element) => {
            const style = getComputedStyle(element)
            return {
                whiteSpace: style.whiteSpace,
                overflow: style.textOverflow,
                fontSize: Number.parseFloat(style.fontSize),
                height: element.getBoundingClientRect().height,
                scrollWidth: element.scrollWidth,
                clientWidth: element.clientWidth,
            }
        })
        expect(titleMetrics.whiteSpace).toBe('nowrap')
        expect(titleMetrics.overflow).toBe('ellipsis')
        expect(titleMetrics.height).toBeLessThan(titleMetrics.fontSize * 2)
        expect(titleMetrics.scrollWidth).toBeGreaterThan(titleMetrics.clientWidth)

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        expect(overflow).toBeLessThanOrEqual(0)
    })
}

test('返回按钮命中区 ≥24、键盘可触发、吸顶层级与暗色背景', async ({ page }) => {
    await page.goto('/')

    const back = page.locator(`${ROOT} #navbar-basic .caomei-nav-bar__back`)
    const hitBox = await back.evaluate((element) => {
        const rect = element.getBoundingClientRect()
        const after = getComputedStyle(element, '::after')
        return {
            width: rect.width,
            height: rect.height,
            afterInset: after.inset,
        }
    })
    expect(hitBox.width).toBeGreaterThanOrEqual(24)
    expect(hitBox.height).toBeGreaterThanOrEqual(24)
    expect(hitBox.afterInset).not.toBe('')

    await expect(page.locator('#nav-bar-log')).toHaveText('0')
    await back.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#nav-bar-log')).toHaveText('1')

    const sticky = page.locator(`${ROOT} #navbar-long`)
    const stickyStyle = await sticky.evaluate((element) => ({
        position: getComputedStyle(element).position,
        zIndex: getComputedStyle(element).zIndex,
        paddingTop: getComputedStyle(element).paddingTop,
    }))
    expect(stickyStyle.position).toBe('sticky')
    expect(Number(stickyStyle.zIndex)).toBeGreaterThan(0)
    expect(Number.parseFloat(stickyStyle.paddingTop)).toBeGreaterThanOrEqual(0)

    // 安全区：视口级 token 注入后应反映为 padding-top；关闭时保持 0
    await page.evaluate(() => {
        document.documentElement.style.setProperty('--caomei-safe-area-top', '20px')
    })
    const padded = await sticky.evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingTop))
    expect(padded).toBeCloseTo(20, 0)
    const plain = page.locator(`${ROOT} #navbar-plain`)
    const plainPadding = await plain.evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingTop))
    expect(plainPadding).toBe(0)
    await page.evaluate(() => {
        document.documentElement.style.removeProperty('--caomei-safe-area-top')
    })

    const lightBg = await sticky.evaluate((element) => getComputedStyle(element).backgroundColor)
    await page.evaluate(() => {
        document.documentElement.dataset.theme = 'dark'
    })
    const darkBg = await sticky.evaluate((element) => getComputedStyle(element).backgroundColor)
    expect(darkBg).not.toBe(lightBg)
})
