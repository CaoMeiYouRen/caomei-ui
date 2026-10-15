import { expect, test as base, type Page } from '@playwright/test'

/**
 * 图表主题 / 语言联动的常驻回归（真实 Chromium）。
 *
 * 判据均为**相对**口径（与宿主 token 的计算值比对），不写死色值——这样预设 / 暗色配色调整后
 * 用例仍然有效，只有「联动失效」才会失败：
 *
 * 1. **暗色联动**：切 `data-theme="dark"` 后，图中系列色须等于暗色下 `--caomei-color-primary` 的
 *    计算值，且**亮色取值不再出现**（后者证明是重新派生而非两色恰好并存）；
 * 2. **预设联动**：切 `data-preset="caomei"` 后同理比对品牌预设的取值；
 * 3. **语言联动**：轴标签由 `useChartFormat()` 按宿主语言格式化（夹具用 SVG 渲染器，文本在 DOM 中
 *    可读）；切换语言后标签文本须变为目标语言的日期写法且与切换前不同。
 *
 * 夹具：独立入口 `/chart-theme.html`（见 `fixtures/chart-theme-app.vue`）——该用例需要 SVG 渲染器与
 * 可切换语言的 provider，属用例专属形态，独立入口可避免改动通用夹具的渲染器注册。
 */

const CHART = '#chart-themed'
const TOGGLE = '#chart-locale-toggle'

/** 每个用例独立收集 console error / page error，并统一导航（与其他图表用例同构）。 */
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

        await page.goto('/chart-theme.html')
        await use(errors)
    }, { auto: true }],
})

test.afterEach(({ pageErrors }) => {
    expect(pageErrors, '主题 / 语言联动用例不应产生 console error / page error').toEqual([])
})

/** 读宿主 token 的计算值（归一化为 `rgb(...)` 便于与图元计算色比较）。 */
async function readToken(page: Page, name: string): Promise<string> {
    return page.evaluate((token) => {
        const probe = document.createElement('span')
        document.body.appendChild(probe)
        probe.style.color = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
        const normalized = getComputedStyle(probe).color
        probe.remove()
        return normalized
    }, name)
}

/** 读图中全部图元（路径 / 矩形）的计算填色集合。 */
async function readFills(page: Page): Promise<string[]> {
    return page.evaluate((selector) => {
        const nodes = Array.from(document.querySelectorAll<SVGElement>(`${selector} path, ${selector} rect`))
        return nodes
            .map((node) => getComputedStyle(node).fill)
            .filter((fill) => fill && fill !== 'none')
    }, CHART)
}

/** 读图中全部文本（轴标签 / 图例）。 */
async function readTexts(page: Page): Promise<string[]> {
    return page.evaluate((selector) => Array.from(document.querySelectorAll<SVGElement>(`${selector} text`))
        .map((node) => node.textContent.trim())
        .filter(Boolean), CHART)
}

/** 等待 SVG 渲染完成（轴标签出现即视为完成）。 */
async function waitRendered(page: Page): Promise<void> {
    await expect.poll(async () => (await readTexts(page)).length).toBeGreaterThan(0)
}

test.describe('图表主题与语言联动', () => {
    test('暗色切换后系列色跟随宿主 token，且亮色取值不再出现', async ({ page }) => {
        await waitRendered(page)

        const lightPrimary = await readToken(page, '--caomei-color-primary')
        expect(await readFills(page)).toContain(lightPrimary)

        await page.evaluate(() => {
            document.documentElement.dataset.theme = 'dark'
        })

        const darkPrimary = await readToken(page, '--caomei-color-primary')
        expect(darkPrimary, '暗色下的主色须与亮色不同（否则用例无判别力）').not.toBe(lightPrimary)

        await expect.poll(async () => (await readFills(page)).includes(darkPrimary)).toBe(true)

        const fills = await readFills(page)
        expect(fills, '亮色系列色应已从图中消失').not.toContain(lightPrimary)

        await page.evaluate(() => {
            delete document.documentElement.dataset.theme
        })
        await expect.poll(async () => (await readFills(page)).includes(lightPrimary)).toBe(true)
    })

    test('预设切换后系列色跟随该预设的 token', async ({ page }) => {
        await waitRendered(page)

        const minimalPrimary = await readToken(page, '--caomei-color-primary')
        expect(await readFills(page)).toContain(minimalPrimary)

        await page.evaluate(() => {
            document.documentElement.dataset.preset = 'caomei'
        })

        const brandPrimary = await readToken(page, '--caomei-color-primary')
        expect(brandPrimary, '品牌预设的主色须与极简预设不同（否则用例无判别力）').not.toBe(minimalPrimary)

        await expect.poll(async () => (await readFills(page)).includes(brandPrimary)).toBe(true)
        expect(await readFills(page), '极简预设的系列色应已从图中消失').not.toContain(minimalPrimary)

        await page.evaluate(() => {
            document.documentElement.dataset.preset = 'minimal'
        })
    })

    test('语言切换后轴标签文本跟随宿主语言', async ({ page }) => {
        await waitRendered(page)

        const zhTexts = await readTexts(page)
        expect(zhTexts.some((text) => text.includes('年')), '中文档日期应为「年月日」写法').toBe(true)

        await page.locator(TOGGLE).click()

        await expect.poll(async () => {
            const texts = await readTexts(page)
            return texts.some((text) => /[A-Za-z]{3}\s\d/.test(text))
        }, { message: '切换语言后轴标签应变为英文日期写法' }).toBe(true)

        const enTexts = await readTexts(page)
        expect(enTexts).not.toEqual(zhTexts)
        expect(enTexts.some((text) => text.includes('年')), '英文档不应残留中文写法').toBe(false)

        await page.locator(TOGGLE).click()
        await expect.poll(async () => (await readTexts(page)).some((text) => text.includes('年'))).toBe(true)
    })
})

