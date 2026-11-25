import { expect, test as base } from '@playwright/test'

/**
 * Splitter 分栏的真实浏览器回归。
 *
 * 判别口径：
 * 1. 水平分栏按 defaultSize 分割、分隔线视觉 3px、面板与分隔线之和等于容器；
 * 2. 拖拽后一侧增宽、另一侧等量收窄（总和不变）；
 * 3. 键盘方向键按 10% 调整，`aria-orientation` 与方向相反；
 * 4. 禁用分隔条 `tabindex="-1"` 且拖拽无效；
 * 5. 页面无横向溢出、0 console error。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#splitter`。
 */

const HORIZONTAL = '#splitter-horizontal'
const VERTICAL = '#splitter-vertical'
const DISABLED = '#splitter-disabled'

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

interface PaneMetrics {
    panes: { width: number, height: number, flexGrow: number }[]
    handle: { width: number, height: number, tabindex: string | null, orientation: string | null, cursor: string }
    container: { width: number, height: number }
}

async function readMetrics(page: import('@playwright/test').Page, selector: string): Promise<PaneMetrics> {
    return page.evaluate((scope) => {
        const root = document.querySelector<HTMLElement>(scope)
        if (!root) {
            throw new Error(`未找到分栏 ${scope}`)
        }
        const handle = root.querySelector<HTMLElement>('.caomei-splitter__handle')
        const container = root.querySelector<HTMLElement>('.caomei-splitter')
        if (!handle || !container) {
            throw new Error('分栏未渲染分隔条或容器')
        }
        const panes = [...root.querySelectorAll<HTMLElement>('.caomei-splitter__panel')].map((pane) => {
            const rect = pane.getBoundingClientRect()
            return { width: rect.width, height: rect.height, flexGrow: Number.parseFloat(pane.style.flexGrow || '0') }
        })
        const handleRect = handle.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        return {
            panes,
            handle: {
                width: handleRect.width,
                height: handleRect.height,
                tabindex: handle.getAttribute('tabindex'),
                orientation: handle.getAttribute('aria-orientation'),
                cursor: getComputedStyle(handle).cursor,
            },
            container: { width: containerRect.width, height: containerRect.height },
        }
    }, selector)
}

test('水平分栏：默认比例、3px 分隔线、拖拽与键盘调整', async ({ page }) => {
    await page.locator(HORIZONTAL).scrollIntoViewIfNeeded()
    const before = await readMetrics(page, HORIZONTAL)
    expect(before.panes).toHaveLength(2)
    expect(before.panes[0]?.width / before.container.width).toBeCloseTo(0.3, 1)
    expect(before.handle.width).toBeCloseTo(3, 0)
    expect(before.handle.orientation).toBe('vertical')
    expect(before.handle.cursor).toBe('col-resize')
    expect(
        (before.panes[0]?.width ?? 0) + (before.panes[1]?.width ?? 0) + before.handle.width,
    ).toBeCloseTo(before.container.width, 0)

    // 拖拽 +80px
    const handleBox = await page.locator(`${HORIZONTAL} .caomei-splitter__handle`).boundingBox()
    if (!handleBox) {
        throw new Error('分隔条没有几何盒')
    }
    const startX = handleBox.x + handleBox.width / 2
    const startY = handleBox.y + handleBox.height / 2
    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.mouse.move(startX + 80, startY, { steps: 8 })
    await page.mouse.up()
    await page.waitForTimeout(100)

    const afterDrag = await readMetrics(page, HORIZONTAL)
    expect(afterDrag.panes[0]?.width - (before.panes[0]?.width ?? 0)).toBeGreaterThan(60)
    expect(
        (afterDrag.panes[0]?.width ?? 0) + (afterDrag.panes[1]?.width ?? 0) + afterDrag.handle.width,
    ).toBeCloseTo(afterDrag.container.width, 0)

    // 键盘 +10%
    const logBefore = await page.locator('#splitter-horizontal-log').textContent()
    await page.locator(`${HORIZONTAL} .caomei-splitter__handle`).focus()
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(100)
    const afterKey = await readMetrics(page, HORIZONTAL)
    const growth = (afterKey.panes[0]?.flexGrow ?? 0) - (afterDrag.panes[0]?.flexGrow ?? 0)
    expect(growth).toBeCloseTo(10, 0)
    const logAfter = await page.locator('#splitter-horizontal-log').textContent()
    expect(Number.parseFloat(logAfter ?? '0'), '布局事件应随键盘调整更新').toBeGreaterThan(
        Number.parseFloat(logBefore ?? '0'),
    )
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
})

test('可折叠面板 Enter 折叠后布局回写且渲染一致', async ({ page }) => {
    await page.locator('#splitter-collapsible').scrollIntoViewIfNeeded()
    const handle = page.locator('#splitter-collapsible .caomei-splitter__handle')
    await handle.focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)

    const state = await page.evaluate(() => {
        const root = document.querySelector('#splitter-collapsible')
        const panes = [...(root?.querySelectorAll<HTMLElement>('.caomei-splitter__panel') ?? [])]
        const handleElement = root?.querySelector<HTMLElement>('.caomei-splitter__handle')
        return {
            grows: panes.map((pane) => Number.parseFloat(pane.style.flexGrow || '0')),
            valuenow: handleElement?.getAttribute('aria-valuenow') ?? '',
            log: document.querySelector('#splitter-log')?.textContent.trim() ?? '',
        }
    })

    expect(state.grows[0], '折叠后首个面板应收缩').toBeCloseTo(0, 0)
    expect(state.grows[1], '折叠后第二个面板应占满').toBeCloseTo(100, 0)
    expect(state.log, '折叠后应收敛为实际布局').toBe('0,100')
})

test('垂直分栏与禁用分隔条', async ({ page }) => {
    await page.locator(DISABLED).scrollIntoViewIfNeeded()
    const vertical = await readMetrics(page, VERTICAL)
    expect(vertical.handle.height).toBeCloseTo(3, 0)
    expect(vertical.handle.orientation).toBe('horizontal')
    expect(vertical.handle.cursor).toBe('row-resize')

    const disabled = await readMetrics(page, DISABLED)
    expect(disabled.handle.tabindex).toBe('-1')
    expect(disabled.handle.cursor).toBe('default')

    const handleBox = await page.locator(`${DISABLED} .caomei-splitter__handle`).boundingBox()
    if (!handleBox) {
        throw new Error('禁用分隔条没有几何盒')
    }
    const x = handleBox.x + handleBox.width / 2
    const y = handleBox.y + handleBox.height / 2
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x + 50, y, { steps: 5 })
    await page.mouse.up()
    await page.waitForTimeout(100)

    const after = await readMetrics(page, DISABLED)
    expect(after.panes[0]?.width, '禁用的分隔条不得改变布局').toBeCloseTo(disabled.panes[0]?.width ?? 0, 0)
})
