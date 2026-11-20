import { expect, test as base, type Locator, type Page } from '@playwright/test'
import { boxOf, clientRectOf, expectBoxWithin, TOLERANCE, viewportOf } from './helpers/layout'

/**
 * 固定定位件（Drawer / Dialog / ConfirmDialog / Toast / BackTop / Image preview）的安全区接入。
 *
 * 契约：
 * 1. **贴边侧让开安全区**——把四个 token 覆盖为 34px 后，贴边侧的内边距 / 停靠偏移必须逐件增加 34px；
 * 2. **上下向高度跟随 `dvh`**——静态视口下 `dvh` 与 `vh` 等值，故以「90% 视口高与尺寸档取小」断言；
 * 3. **安全区内边距不吞内容**——底部抽屉的长内容仍能滚到末段，且末段完整落在滚动区可视区。
 *
 * 桌面 token 为 `0px` 时的几何等价由 `pnpm capture:styles` 的冻结基线承担；本套用例只证明覆盖生效。
 */

/** 安全区覆盖值：iOS 底部 home indicator 的常见取值，便于逐件读出 34px 增量 */
const SAFE_AREA = 34
/** 组件内边距基准（`--caomei-space-4`） */
const SPACE_4 = 16
/** 图片预览关闭按钮偏移基准（`--caomei-space-2`） */
const SPACE_2 = 8
/** 高度收敛比例（90dvh） */
const VIEWPORT_RATIO = 0.9

/** 四向抽屉：开合按钮、面板选择器、贴边侧内边距属性与贴边方向 */
const DRAWERS = [
    { opener: '#drawer-open-right', panel: '.caomei-drawer__content--right', padding: 'padding-right', edge: 'right' },
    { opener: '#sa-drawer-open-left', panel: '.caomei-drawer__content--left', padding: 'padding-left', edge: 'left' },
    { opener: '#sa-drawer-open-top', panel: '.caomei-drawer__content--top', padding: 'padding-top', edge: 'top' },
    { opener: '#drawer-open-bottom', panel: '.caomei-drawer__content--bottom', padding: 'padding-bottom', edge: 'bottom' },
] as const

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

/** 把四个安全区 token 覆盖为固定值（写入 `:root` 内联样式，Portal 到 body 的浮层同样继承） */
async function applySafeArea(page: Page): Promise<void> {
    await page.evaluate((value) => {
        const root = document.documentElement
        for (const side of ['top', 'right', 'bottom', 'left']) {
            root.style.setProperty(`--caomei-safe-area-${side}`, `${value}px`)
        }
    }, SAFE_AREA)
}

async function computedStyle(locator: Locator, property: string): Promise<string> {
    return locator.evaluate((element, name) => getComputedStyle(element).getPropertyValue(name), property)
}

async function computedPx(locator: Locator, property: string): Promise<number> {
    return Number.parseFloat(await computedStyle(locator, property))
}

test.beforeEach(async ({ page }) => {
    await applySafeArea(page)
})

test.describe('安全区接入：固定定位件', () => {
    test('Drawer 四向贴边侧内边距叠加安全区', async ({ page }) => {
        const viewport = await viewportOf(page)

        for (const drawer of DRAWERS) {
            await page.click(drawer.opener)
            const panel = page.locator(drawer.panel)
            await expect(panel, `${drawer.edge} 向抽屉应打开`).toBeVisible()

            expect(
                await computedStyle(panel, drawer.padding),
                `${drawer.edge} 向抽屉的 ${drawer.padding} 应为 space-4 + 安全区`,
            ).toBe(`${SPACE_4 + SAFE_AREA}px`)

            const box = await boxOf(panel)
            if (drawer.edge === 'right') {
                expect(Math.abs(box.x + box.width - viewport.width)).toBeLessThanOrEqual(TOLERANCE)
            } else if (drawer.edge === 'left') {
                expect(Math.abs(box.x)).toBeLessThanOrEqual(TOLERANCE)
            } else if (drawer.edge === 'top') {
                expect(Math.abs(box.y)).toBeLessThanOrEqual(TOLERANCE)
            } else {
                expect(Math.abs(box.y + box.height - viewport.height)).toBeLessThanOrEqual(TOLERANCE)
            }

            // 左右向面板满高贴视口，纵向两端同样避让状态栏 / home indicator
            if (drawer.edge === 'left' || drawer.edge === 'right') {
                expect(await computedStyle(panel, 'padding-top')).toBe(`${SPACE_4 + SAFE_AREA}px`)
                expect(await computedStyle(panel, 'padding-bottom')).toBe(`${SPACE_4 + SAFE_AREA}px`)
            }

            await page.keyboard.press('Escape')
            await expect(panel).toBeHidden()
        }
    })

    test('Drawer 上下向高度按 90dvh 与尺寸档取小', async ({ page }) => {
        const viewport = await viewportOf(page)

        await page.click('#sa-drawer-open-top')
        const top = page.locator('.caomei-drawer__content--top')
        await expect(top).toBeVisible()
        expect(
            Math.abs((await boxOf(top)).height - Math.min(VIEWPORT_RATIO * viewport.height, 420)),
            '顶部抽屉高度应为 min(90dvh, 420)',
        ).toBeLessThanOrEqual(TOLERANCE)
        await page.keyboard.press('Escape')
        await expect(top).toBeHidden()

        await page.click('#drawer-open-bottom')
        const bottom = page.locator('.caomei-drawer__content--bottom')
        await expect(bottom).toBeVisible()
        expect(
            Math.abs((await boxOf(bottom)).height - Math.min(VIEWPORT_RATIO * viewport.height, 560)),
            '底部抽屉高度应为 min(90dvh, 560)',
        ).toBeLessThanOrEqual(TOLERANCE)
    })

    test('Drawer 长内容在底部安全区内边距下仍可滚到底', async ({ page }) => {
        await page.click('#sa-drawer-open-long')

        const panel = page.locator('.caomei-drawer__content--bottom')
        await expect(panel).toBeVisible()
        expect(await computedStyle(panel, 'padding-bottom')).toBe(`${SPACE_4 + SAFE_AREA}px`)

        const body = page.locator('.caomei-drawer__content--bottom .caomei-drawer__body')
        const tail = page.locator('#sa-drawer-long-tail')

        const scrolled = await body.evaluate((element) => {
            element.scrollTop = element.scrollHeight
            return { scrollTop: element.scrollTop, max: element.scrollHeight - element.clientHeight }
        })
        expect(scrolled.max, '长内容抽屉应确实产生纵向滚动量').toBeGreaterThan(0)
        expect(
            Math.abs(scrolled.scrollTop - scrolled.max),
            `抽屉未滚到末端（scrollTop=${scrolled.scrollTop} / max=${scrolled.max}）`,
        ).toBeLessThanOrEqual(TOLERANCE)

        expectBoxWithin(await boxOf(tail), await clientRectOf(body), '抽屉末段内容（滚到底后）')
    })

    test('Dialog / ConfirmDialog 高度上限跟随视口', async ({ page }) => {
        const viewport = await viewportOf(page)

        await page.click('#dialog-open')
        const dialog = page.locator('.caomei-dialog__content')
        await expect(dialog).toBeVisible()
        expect(
            await computedPx(dialog, 'max-height'),
            'Dialog 高度上限应为 85dvh',
        ).toBeCloseTo(viewport.height * 0.85, 0)
        await page.keyboard.press('Escape')
        await expect(dialog).toBeHidden()

        await page.click('#confirm-open')
        const confirm = page.locator('.caomei-confirm-dialog__content')
        await expect(confirm).toBeVisible()
        expect(
            await computedPx(confirm, 'max-height'),
            'ConfirmDialog 高度上限应为 85dvh',
        ).toBeCloseTo(viewport.height * 0.85, 0)
    })

    test('BackTop 右下偏移叠加安全区', async ({ page }) => {
        const backTop = page.locator('#ds-back-top-button')
        await expect(backTop).toBeVisible()

        expect(await computedStyle(backTop, 'right')).toBe(`${SPACE_4 + SAFE_AREA}px`)
        expect(await computedStyle(backTop, 'bottom')).toBe(`${SPACE_4 + SAFE_AREA}px`)
    })

    test('Image preview 四周尺寸避让安全区', async ({ page }) => {
        await page.click('#basic-layout-image-toggle')
        const trigger = page.locator('#basic-layout-image .caomei-image__preview-trigger')
        await expect(trigger).toBeVisible()
        await trigger.click()

        const content = page.locator('.caomei-image__preview-content')
        await expect(content).toBeVisible()

        const viewport = await viewportOf(page)
        expect(
            await computedPx(content, 'max-width'),
            '预览内容宽度上限应扣除左右安全区',
        ).toBeCloseTo(0.9 * viewport.width - 2 * SAFE_AREA, 0)
        expect(
            await computedPx(content, 'max-height'),
            '预览内容高度上限应扣除上下安全区并跟随 dvh',
        ).toBeCloseTo(0.9 * viewport.height - 2 * SAFE_AREA, 0)

        const close = page.locator('.caomei-image__preview-close')
        // 面板已按安全区收缩并居中，关闭按钮相对面板固定贴角，不再叠加 token
        expect(await computedStyle(close, 'top')).toBe(`${SPACE_2}px`)
        expect(await computedStyle(close, 'right')).toBe(`${SPACE_2}px`)
    })

    test('dvh 回退以 @supports 声明，基础规则保留 vh', async ({ page }) => {
        const snapshot = await page.evaluate(() => {
            const supports: { condition: string, text: string }[] = []
            const outside: string[] = []
            for (const sheet of Array.from(document.styleSheets)) {
                let rules: CSSRuleList
                try {
                    rules = sheet.cssRules
                } catch {
                    // 跨源样式表不可读，跳过
                    continue
                }
                for (const rule of Array.from(rules)) {
                    if (rule instanceof CSSSupportsRule) {
                        supports.push({ condition: rule.conditionText, text: rule.cssText })
                    } else {
                        outside.push(rule.cssText)
                    }
                }
            }
            return { supports, outside }
        })

        for (const [selector, value] of [
            ['.caomei-dialog__content', '85dvh'],
            ['.caomei-confirm-dialog__content', '85dvh'],
            ['.caomei-drawer__content--top', '90dvh'],
            ['.caomei-toast-viewport', '100dvh'],
            ['.caomei-image__preview-content', '90dvh'],
            ['.caomei-image__preview-img', '90dvh'],
        ]) {
            expect(
                snapshot.supports.some((rule) => rule.text.includes(selector) && rule.text.includes(value)),
                `${selector} 的 ${value} 应声明在 @supports 内`,
            ).toBe(true)
        }

        const outsideText = snapshot.outside.join('\n')
        for (const value of ['85vh', '90vh', '100vh']) {
            expect(outsideText, `基础规则应保留 ${value} 回退`).toContain(value)
        }
        expect(
            snapshot.outside.filter((text) => text.includes('dvh')),
            'dvh 声明必须包在 @supports 内',
        ).toEqual([])
    })

    test('Toast 上偏移叠加安全区', async ({ page }) => {
        await page.click('#toast-show')

        const viewport = page.locator('.caomei-toast-viewport--top-right').first()
        await expect(viewport).toBeVisible()

        expect(await computedStyle(viewport, 'top')).toBe(`${SPACE_4 + SAFE_AREA}px`)
        expect(await computedStyle(viewport, 'right')).toBe(`${SPACE_4}px`)
        expect(
            await computedPx(viewport, 'max-height'),
            '提示视口高度上限应扣除上下安全区',
        ).toBeCloseTo((await viewportOf(page)).height - 2 * SPACE_4 - 2 * SAFE_AREA, 0)
    })
})
