import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { expect, test as base } from '@playwright/test'

const require = createRequire(import.meta.url)
const AXE_SOURCE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')

interface AxeRunner {
    axe: {
        run: (context: string, options: { runOnly: string[] }) => Promise<{
            violations: { id: string, nodes: { target: string[], html: string }[] }[]
        }>
    }
}

/**
 * 月 / 年粒度的真实浏览器回归（夹具见 `#date-picker-granular`）：
 * 320 视口不横向溢出、打开态 axe、选中项对比度、禁用项不可选。
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

/** 相对亮度对比度：读取计算样式后按 WCAG 公式计算 */
const CONTRAST_SCRIPT = `(() => {
    const el = document.querySelector('.caomei-month-year-panel__item--selected');
    if (!el) return null;
    const style = getComputedStyle(el);
    const parse = (value) => value.match(/[\\d.]+/g).slice(0, 3).map(Number);
    const channel = (c) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    const luminance = (rgb) => 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
    const fg = luminance(parse(style.color));
    const bg = luminance(parse(style.backgroundColor));
    const [light, dark] = fg > bg ? [fg, bg] : [bg, fg];
    return { ratio: (light + 0.05) / (dark + 0.05), color: style.color, background: style.backgroundColor };
})()`

test.describe('DatePicker 月 / 年粒度', () => {
    for (const [id, expectPanelClass] of [['#dp-month', '--month'], ['#dp-year', '--year']] as const) {
        test(`${id} 在 320 视口打开时面板不横向溢出`, async ({ page }) => {
            await page.setViewportSize({ width: 320, height: 720 })
            await page.goto('/')

            await page.locator(id).click()
            const panel = page.locator(`.caomei-date-picker__content .caomei-month-year-panel${expectPanelClass}`)
            await expect(panel).toBeVisible()

            const box = await panel.boundingBox()
            expect(box).not.toBeNull()
            if (!box) {
                throw new Error('面板未渲染包围盒')
            }
            expect(box.x).toBeGreaterThanOrEqual(0)
            expect(box.x + box.width).toBeLessThanOrEqual(320)

            const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
            expect(overflow).toBeLessThanOrEqual(0)

            await page.keyboard.press('Escape')
        })
    }

    test('打开态通过 axe，选中项对比度达标（亮 / 暗）', async ({ page, pageErrors }) => {
        for (const scheme of ['light', 'dark'] as const) {
            await page.goto('/')
            await page.evaluate((theme) => {
                document.documentElement.dataset.theme = theme
            }, scheme)
            await page.locator('#dp-month').click()
            await expect(page.locator('.caomei-month-year-panel--month')).toBeVisible()

            const contrast = await page.evaluate<{ ratio: number, color: string, background: string } | null>(CONTRAST_SCRIPT)
            expect(contrast).not.toBeNull()
            if (!contrast) {
                throw new Error(`未取到选中项（${scheme}）`)
            }
            expect(contrast.ratio, `${scheme} 选中项对比度 ${contrast.color} on ${contrast.background}`).toBeGreaterThanOrEqual(4.5)

            await page.addScriptTag({ content: AXE_SOURCE })
            const results = await page.evaluate<{ violations: { id: string, nodes: { target: string[], html: string }[] }[] }>(
                () => (window as unknown as AxeRunner).axe.run('.caomei-month-year-panel', { runOnly: ['wcag2a', 'wcag2aa'] }),
            )
            expect(results.violations, JSON.stringify(results.violations)).toEqual([])

            await page.keyboard.press('Escape')
        }

        expect(pageErrors).toEqual([])
    })

    test('minValue 之外的月份为禁用态且不可选择', async ({ page }) => {
        await page.goto('/')
        await page.locator('#dp-month').click()

        const panel = page.locator('.caomei-month-year-panel--month')
        await expect(panel).toBeVisible()
        const disabled = panel.locator('.caomei-month-year-panel__item[disabled]')
        await expect(disabled.first()).toBeDisabled()
        expect(await disabled.count()).toBeGreaterThan(0)

        const triggerText = await page.locator('#dp-month').innerText()
        // 原生 disabled 不派发 click，用 dispatchEvent 直测面板守卫
        await disabled.first().dispatchEvent('click')
        await expect(page.locator('#dp-month')).toHaveText(triggerText.trim())
    })
})
