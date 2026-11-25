import { expect, test as base } from '@playwright/test'

/**
 * Tour 引导浮层的真实浏览器回归。
 *
 * 判别口径：
 * 1. 模态形态遮罩完整覆盖视口、`body` padding 按滚动条宽度补偿、页面无横向溢出、CLS 为 0；
 * 2. 挖空高亮与目标四边差恒为 `padding`（默认 6px），卡片完全落在视口内；
 * 3. 步骤切换把目标滚动到可视区，滚动后高亮跟随；
 * 4. `Escape` 关闭并把焦点归还打开前的触发元素；
 * 5. 目标缺失时降级为居中卡片 + 整屏遮罩。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#tour`。
 */

interface Geometry {
    clientWidth: number
    clientHeight: number
    innerWidth: number
    innerHeight: number
    scrollWidth: number
    overflow: string
    bodyPadding: string
    overlay: { top: number, left: number, right: number, bottom: number }
}

interface TourGeometry extends Geometry {
    card: { top: number, left: number, right: number, bottom: number, width: number, height: number }
    target: { top: number, left: number, right: number, bottom: number }
    spotlight: { top: number, left: number, right: number, bottom: number } | null
    spotlightShadow: string
    maskBackground: string
    centered: boolean
    step: string
    placement: string
}

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

/** 以 root 运行（容器内常见）时 Chromium 必须关闭沙箱，与 `playwright.config.ts` 口径一致 */
const IS_ROOT = typeof process.getuid === 'function' && process.getuid() === 0

/**
 * 用**真实经典滚动条**运行本规格：Playwright 默认下发 `--hide-scrollbars`，滚动条不占位，
 * 滚动锁的 `body` padding 补偿分支恒不触发（断言退化为「没有滚动条时也没有补偿」）。
 * 移除该默认参数后补偿才有对照对象；无滚动条档（移动端 overlay 滚动条）由 `scrollbarBefore > 0`
 * 分支自动覆盖。
 *
 * `args` 与 `playwright.config.ts` 的 `CHROMIUM_ARGS` 手工同步：覆盖 `launchOptions` 会整对象替换。
 */
test.use({
    launchOptions: {
        ignoreDefaultArgs: ['--hide-scrollbars'],
        args: [
            '--disable-dev-shm-usage',
            ...(process.env.CI || IS_ROOT ? ['--no-sandbox'] : []),
            ...(IS_ROOT ? ['--no-zygote'] : []),
        ],
    },
})

/** 打开浮层后的几何快照：覆盖判定、补偿与定位都以这份数据为准 */
async function readGeometry(page: import('@playwright/test').Page, targetSelector: string): Promise<TourGeometry> {
    return page.evaluate((selector) => {
        const overlay = document.querySelector<HTMLElement>('.caomei-tour')
        const card = document.querySelector<HTMLElement>('.caomei-tour__card')
        const target = document.querySelector<HTMLElement>(selector)
        const spotlight = document.querySelector<HTMLElement>('.caomei-tour__spotlight')
        if (!overlay || !card || !target) {
            throw new Error('Tour 浮层或目标未渲染')
        }
        const box = (element: Element) => {
            const rect = element.getBoundingClientRect()
            return { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom }
        }
        const cardRect = card.getBoundingClientRect()
        const mask = document.querySelector<HTMLElement>('.caomei-tour__mask')
        return {
            clientWidth: document.documentElement.clientWidth,
            clientHeight: document.documentElement.clientHeight,
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            scrollWidth: document.documentElement.scrollWidth,
            overflow: document.documentElement.style.overflow,
            bodyPadding: document.body.style.paddingRight,
            overlay: box(overlay),
            card: { ...box(card), width: cardRect.width, height: cardRect.height },
            target: box(target),
            spotlight: spotlight ? box(spotlight) : null,
            spotlightShadow: spotlight ? getComputedStyle(spotlight).boxShadow : '',
            maskBackground: mask ? getComputedStyle(mask).backgroundColor : '',
            centered: overlay.dataset.centered === 'true',
            step: overlay.dataset.step ?? '',
            placement: overlay.dataset.placement ?? '',
        }
    }, targetSelector)
}

function expectSpotlightAligned(geometry: TourGeometry, padding = 6): void {
    const { spotlight, target } = geometry
    if (!spotlight) {
        throw new Error('应绘制挖空高亮')
    }
    expect(Math.abs(spotlight.top - (target.top - padding))).toBeLessThanOrEqual(1)
    expect(Math.abs(spotlight.left - (target.left - padding))).toBeLessThanOrEqual(1)
    expect(Math.abs(spotlight.bottom - (target.bottom + padding))).toBeLessThanOrEqual(1)
    expect(Math.abs(spotlight.right - (target.right + padding))).toBeLessThanOrEqual(1)
}

test('遮罩覆盖视口、滚动锁补偿、定位正确且滚动跟随', async ({ page }) => {
    const trigger = page.locator('#tour-start')
    await trigger.focus()
    const scrollbarBefore = await page.evaluate(() => window.innerWidth - document.documentElement.clientWidth)
    test.info().annotations.push({ type: 'scrollbar', description: `${scrollbarBefore}px` })
    await page.evaluate(() => {
        const shifts: number[] = []
        Object.assign(window, { __tourShifts: shifts })
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                const shift = entry as PerformanceEntry & { value: number, hadRecentInput: boolean }
                if (!shift.hadRecentInput) {
                    shifts.push(shift.value)
                }
            }
            // 只统计打开引导之后的增量：加载期的布局偏移不属于本组件
            shifts.splice(0, shifts.length - 20)
        }).observe({ type: 'layout-shift', buffered: true })
    })
    await page.evaluate(() => {
        (window as unknown as { __tourShifts: number[] }).__tourShifts.length = 0
    })

    await trigger.click()
    const overlay = page.locator('.caomei-tour')
    await expect(overlay).toBeVisible()

    const geometry = await readGeometry(page, '#tour-target-a')
    // §5.1：遮罩完整覆盖、滚动锁生效、无横向溢出
    expect(geometry.overlay.right, '遮罩右缘应覆盖 clientWidth').toBeGreaterThanOrEqual(geometry.clientWidth)
    expect(geometry.overlay.bottom, '遮罩下缘应覆盖 clientHeight').toBeGreaterThanOrEqual(geometry.clientHeight)
    expect(geometry.overflow, '模态形态应隐藏根滚动').toBe('hidden')
    // 期望值必须取「加锁前」的滚动条宽：加锁后差值为 0，取加锁后读数会让补偿断言恒真
    expect(geometry.bodyPadding, 'body padding 应等于加锁前的滚动条宽度').toBe(
        scrollbarBefore > 0 ? `${scrollbarBefore}px` : '',
    )
    expect(geometry.scrollWidth, '锁滚动后不得产生横向溢出').toBeLessThanOrEqual(geometry.clientWidth)

    // 挖空与卡片定位
    expectSpotlightAligned(geometry)
    expect(geometry.spotlightShadow, '挖空块应涂出实色遮罩').toMatch(/rgba?\(/)
    expect(geometry.spotlightShadow, '遮罩颜色不得为全透明').not.toMatch(/rgba\(0, 0, 0, 0\)/)
    expect(geometry.placement).toBe('bottom')
    expect(geometry.centered, '有目标时不应居中').toBe(false)
    expect(geometry.card.left).toBeGreaterThanOrEqual(0)
    expect(geometry.card.right).toBeLessThanOrEqual(geometry.clientWidth)
    expect(geometry.card.top).toBeGreaterThanOrEqual(0)
    expect(geometry.card.bottom).toBeLessThanOrEqual(geometry.clientHeight)

    const shifts = await page.evaluate(() => (window as unknown as { __tourShifts: number[] }).__tourShifts)
    const cls = shifts.reduce((sum, value) => sum + value, 0)
    expect(cls, '打开引导不应产生布局偏移').toBeLessThan(0.01)

    // 滚动跟随：滚动 200px 后高亮仍在下一帧对齐目标
    await page.evaluate(() => {
        window.scrollBy(0, 200)
    })
    await expect.poll(async () => {
        const current = await readGeometry(page, '#tour-target-a')
        if (!current.spotlight) {
            return false
        }
        return Math.abs(current.spotlight.top - (current.target.top - 6)) <= 1
    }, { message: '滚动后高亮应跟随目标' }).toBe(true)
    const scrolled = await readGeometry(page, '#tour-target-a')
    expectSpotlightAligned(scrolled)
    expect(scrolled.card.top).toBeGreaterThanOrEqual(0)
    expect(scrolled.card.bottom).toBeLessThanOrEqual(scrolled.clientHeight + 1)
})

test('步骤切换滚动到目标，Escape 关闭并归还焦点', async ({ page }) => {
    const trigger = page.locator('#tour-start')
    await trigger.focus()
    await trigger.click()
    await expect(page.locator('.caomei-tour')).toBeVisible()

    await page.getByRole('button', { name: '下一步', exact: true }).click()
    await expect(page.locator('.caomei-tour')).toHaveAttribute('data-step', '1')

    await expect.poll(async () => {
        const current = await readGeometry(page, '#tour-target-b')
        return current.target.top >= -1 && current.target.bottom <= current.clientHeight + 1
    }, { message: '步骤切换后目标应滚动到视口内' }).toBe(true)

    const second = await readGeometry(page, '#tour-target-b')
    expect(second.step).toBe('1')
    expectSpotlightAligned(second)
    expect(second.target.top).toBeGreaterThanOrEqual(-1)
    expect(second.target.bottom).toBeLessThanOrEqual(second.clientHeight + 1)

    await page.keyboard.press('Escape')
    await expect(page.locator('.caomei-tour')).toHaveCount(0)
    const focusId = await page.evaluate(() => document.activeElement?.id ?? '')
    expect(focusId, '关闭后焦点应回到触发元素').toBe('tour-start')
    expect(await page.evaluate(() => document.documentElement.style.overflow), '关闭后应解除滚动锁').toBe('')
    expect(await page.evaluate(() => document.body.style.paddingRight)).toBe('')
})

test('目标缺失时降级为居中卡片与整屏遮罩', async ({ page }) => {
    await page.locator('#tour-missing-start').click()
    await expect(page.locator('.caomei-tour')).toBeVisible()

    const geometry = await readGeometry(page, '#tour-target-a')
    expect(geometry.centered).toBe(true)
    expect(geometry.spotlight, '目标缺失时不应挖空').toBeNull()
    await expect(page.locator('.caomei-tour__mask')).toBeVisible()
    expect(geometry.maskBackground, '整屏遮罩应为实色').toMatch(/rgba?\(/)
    expect(geometry.maskBackground, '整屏遮罩不得全透明').not.toMatch(/rgba\(0, 0, 0, 0\)/)
    expect(geometry.overlay.right).toBeGreaterThanOrEqual(geometry.clientWidth)
    expect(geometry.overlay.bottom).toBeGreaterThanOrEqual(geometry.clientHeight)

    const cardCenterX = (geometry.card.left + geometry.card.right) / 2
    const cardCenterY = (geometry.card.top + geometry.card.bottom) / 2
    expect(Math.abs(cardCenterX - geometry.clientWidth / 2)).toBeLessThanOrEqual(2)
    expect(Math.abs(cardCenterY - geometry.clientHeight / 2)).toBeLessThanOrEqual(2)
})
