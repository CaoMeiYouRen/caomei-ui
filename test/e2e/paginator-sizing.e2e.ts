import { expect, test as base } from '@playwright/test'

/**
 * Paginator 每页条数选择器尺寸对齐回归。
 *
 * 契约：同一 Paginator 内页码控件与选择器高度相等（32px，默认与 `data-density="touch"` 一致）；
 * 默认宽度 5rem，3 位数选项不裁切；三档视口均成立。
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
        await use(errors)
    }, { auto: true }],
})

test.afterEach(({ pageErrors }) => {
    expect(pageErrors, '页面不得产生 console error').toEqual([])
})

const PAGE_CONTROL = '#fv-paginator .caomei-paginator__control'
const ROWS = '#fv-paginator .caomei-paginator__rows-per-page'
const SELECT = '#fv-paginator .caomei-paginator__rows-per-page .caomei-select'

async function heightOf(selector: string, page: import('@playwright/test').Page): Promise<number> {
    const box = await page.locator(selector).first().boundingBox()
    expect(box, `${selector} 应有可见盒`).not.toBeNull()
    return box?.height ?? 0
}

async function expectAligned(page: import('@playwright/test').Page): Promise<void> {
    const pageHeight = await heightOf(PAGE_CONTROL, page)
    const selectHeight = await heightOf(SELECT, page)
    expect(Math.abs(pageHeight - selectHeight), `页码 ${pageHeight}px / 选择器 ${selectHeight}px 应一致`).toBeLessThanOrEqual(0.5)
    expect(selectHeight).toBeCloseTo(32, 1)
}

test.describe('默认密度', () => {
    test('页码与选择器等高 32px，选择器宽 5rem', async ({ page }) => {
        await expectAligned(page)
        const box = await page.locator(ROWS).boundingBox()
        expect(box, '每页条数选择器应有可见盒').not.toBeNull()
        expect(box?.width ?? 0).toBeCloseTo(80, 0)

        const trigger = await page.locator(SELECT).boundingBox()
        expect(trigger?.width ?? 0, '选择器触发器不应撑出 5rem 容器').toBeLessThanOrEqual(80.5)
        const typography = await page.locator(SELECT).evaluate((element) => {
            const style = getComputedStyle(element)
            return { fontSize: style.fontSize, paddingInlineStart: style.paddingInlineStart }
        })
        expect(typography.fontSize, '字号应保持 sm 档').toBe('12px')
        expect(typography.paddingInlineStart, '内边距应保持 sm 档').toBe('8px')
    })

    test('3 位数选项不被裁切', async ({ page }) => {
        await page.locator(SELECT).click()
        const optionText = page.getByRole('option', { name: '100' }).locator('.caomei-select__item-text')
        const optionMetrics = await optionText.evaluate((element) => ({
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
        }))
        expect(optionMetrics.scrollWidth, '选项文本不应横向溢出').toBeLessThanOrEqual(optionMetrics.clientWidth + 1)
        await page.getByRole('option', { name: '100' }).click()
        const value = page.locator('#fv-paginator .caomei-select__value')
        const metrics = await value.evaluate((element) => ({
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
        }))
        expect(metrics.scrollWidth, '值区不应横向溢出').toBeLessThanOrEqual(metrics.clientWidth + 1)
        await expect(value).toContainText('100')
    })
})

test.describe('触摸密度轴', () => {
    test('data-density="touch" 下仍与页码控件等高 32px', async ({ page }) => {
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-density', 'touch')
        })
        await expectAligned(page)
        const box = await page.locator(ROWS).boundingBox()
        expect(box?.width ?? 0).toBeCloseTo(80, 0)
    })
})
