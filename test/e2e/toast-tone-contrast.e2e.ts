import { expect, test, type Page } from '@playwright/test'
import { measureContrast } from './helpers/contrast'

/**
 * Toast 逐语气样式的对比度复核（真实 Chromium，常驻）。
 *
 * 判据：5 种语气（`neutral` / `primary` / `success` / `warning` / `danger`）× 亮 / 暗两档，
 * 标题文本相对**实际合成背景**的 WCAG 2.x 对比度 ≥ 4.5:1。默认值回退到既有全局 token，
 * 本用例锁定「新增逐语气钩子未改变默认外观」的可读性下限。
 *
 * 暗色档经 `data-theme="dark"` 切换（与 `theme.css` 的暗色选择器一致）。
 */

const TONES = ['neutral', 'primary', 'success', 'warning', 'danger'] as const
const MIN_RATIO = 4.5
const MIN_MARGIN = 0.04

async function showToasts(page: Page): Promise<void> {
    await page.goto('/')
    await page.click('#toast-show')
    await expect(page.locator('.caomei-toast')).toHaveCount(TONES.length)
}

test('5 语气提示在亮 / 暗两档文本对比度 ≥ 4.5:1', async ({ page }) => {
    await showToasts(page)
    const backgrounds: Record<string, string> = {}

    for (const theme of ['light', 'dark'] as const) {
        await page.evaluate((nextTheme) => {
            document.documentElement.dataset.theme = nextTheme
            document.documentElement.classList.toggle('dark', nextTheme === 'dark')
        }, theme)
        await page.waitForTimeout(200)

        const cells = await measureContrast(page, '.caomei-toast')
        expect(cells.length, `${theme}：5 语气受检面不得被静默收窄`).toBe(TONES.length)
        backgrounds[theme] = cells[0].background

        const failures = cells
            .filter((cell) => cell.ratio < MIN_RATIO + MIN_MARGIN)
            .map((cell) => `${cell.key || cell.color}:${cell.ratio.toFixed(3)}`)
            .join(' ')
        expect(
            Math.min(...cells.map((cell) => cell.ratio)),
            `${theme}：提示文本低于阈值（${failures}）`,
        ).toBeGreaterThanOrEqual(MIN_RATIO + MIN_MARGIN)
    }

    // 判别力：暗色档必须真的换了底色，否则两轮断言同源、扩面空转
    expect(backgrounds.dark, '暗色档未改变提示背景（主题切换未生效）').not.toBe(backgrounds.light)
})

test('逐语气钩子默认值与既有全局 token 一致（亮 / 暗）', async ({ page }) => {
    await showToasts(page)

    for (const theme of ['light', 'dark'] as const) {
        await page.evaluate((nextTheme) => {
            document.documentElement.dataset.theme = nextTheme
            document.documentElement.classList.toggle('dark', nextTheme === 'dark')
        }, theme)
        await page.waitForTimeout(200)

        const mismatches = await page.evaluate((tones) => {
            const root = getComputedStyle(document.documentElement)
            const globalBg = root.getPropertyValue('--caomei-color-bg-elevated').trim()
            const globalBorder = root.getPropertyValue('--caomei-color-border').trim()
            const globalText = root.getPropertyValue('--caomei-color-text').trim()
            const globalShadow = root.getPropertyValue('--caomei-shadow-md').trim()
            const resolveColor = (value: string): string => {
                const probe = document.createElement('div')
                probe.style.color = value
                document.body.append(probe)
                const resolved = getComputedStyle(probe).color
                probe.remove()
                return resolved
            }
            const resolveShadow = (value: string): string => {
                const probe = document.createElement('div')
                probe.style.boxShadow = value
                document.body.append(probe)
                const resolved = getComputedStyle(probe).boxShadow
                probe.remove()
                return resolved
            }
            return tones.flatMap((tone) => {
                const element = document.querySelector<HTMLElement>(`.caomei-toast--${tone}`)
                if (!element) {
                    return [`${tone}:missing`]
                }
                const style = getComputedStyle(element)
                const expected = {
                    background: resolveColor(globalBg),
                    border: resolveColor(globalBorder),
                    text: resolveColor(globalText),
                    shadow: resolveShadow(globalShadow),
                }
                const actual = {
                    background: style.backgroundColor,
                    border: style.borderTopColor,
                    text: style.color,
                    shadow: style.boxShadow,
                }
                return Object.entries(expected)
                    .filter(([key, value]) => actual[key as keyof typeof actual] !== value)
                    .map(([key]) => `${tone}/${key}: ${actual[key as keyof typeof actual]} != ${expected[key as keyof typeof expected]}`)
            })
        }, TONES)

        expect(mismatches, `${theme}：逐语气默认值必须等于全局 token（零视觉变化）`).toEqual([])
    }
})
