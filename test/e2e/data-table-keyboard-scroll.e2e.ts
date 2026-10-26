import { expect, test as base } from '@playwright/test'

/**
 * DataTable 横向滚动容器键盘可达回归（WCAG 2.1.1；口径见
 * `docs/design/governance/2026-10-26-phase26-ui-gate-planning.md` §2.2）。
 *
 * 背景：`.caomei-data-table` 根容器 `overflow-x: auto`，此前无 `tabindex`——键盘用户无法进入滚动区，
 * 溢出列既读不到也滚不到（axe `scrollable-region-focusable`）。修复：根容器常驻 `tabindex="0"`，
 * 有 `caption` 时补 `role="group"` 且以 `caption` 作可访问名。
 *
 * 判别口径（375px 窄屏）：
 * 1. 夹具表格 `min-width: 720px`，前置断言 `scrollWidth > clientWidth`——否则本用例无判别力；
 * 2. `Tab` 从紧邻容器之前的焦点锚点进入，焦点落在滚动容器上（不是内部按钮）；
 * 3. `ArrowRight` 后 `scrollLeft > 0`；
 * 4. 容器内无嵌套 `tabindex`（滚动区只保留一个 tab 停靠点）。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#data-table-keyboard-scroll`。
 */

const SECTION = '#data-table-keyboard-scroll'
const CONTAINER = `${SECTION} .caomei-data-table`
const FOCUS_ANCHOR = '#data-table-keyboard-scroll-before'

/** 每个用例独立收集 console error / page error，并统一导航（与既有 e2e 同构）。 */
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

/** 验收口径为 375px 窄屏，与常驻矩阵档（390 / 768 / 1280）互补 */
test.use({ viewport: { width: 375, height: 812 } })

test.afterEach(({ pageErrors }) => {
    expect(pageErrors, '页面不得产生 console error').toEqual([])
})

test('横向滚动容器可 Tab 进入并以方向键横向滚动', async ({ page }) => {
    const container = page.locator(CONTAINER)
    await container.scrollIntoViewIfNeeded()
    await expect(container).toBeVisible()

    const metrics = await container.evaluate((element) => ({
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        scrollLeft: element.scrollLeft,
        tabIndex: element.getAttribute('tabindex'),
        role: element.getAttribute('role'),
        ariaLabel: element.getAttribute('aria-label'),
    }))

    expect(metrics.tabIndex, '根滚动容器须常驻 tabindex="0"').toBe('0')
    expect(metrics.role, '有 caption 时容器为命名分组').toBe('group')
    expect(metrics.ariaLabel, 'caption 同时作为容器的可访问名').toBe('键盘横向滚动')
    expect(
        metrics.scrollWidth,
        '375px 下表格必须横向溢出（否则本用例无判别力）',
    ).toBeGreaterThan(metrics.clientWidth)
    expect(metrics.scrollLeft, '初始态应停在最左端').toBe(0)

    // 滚动容器自身已是 tab 停靠点，内部不得再出现重复 tabindex
    await expect(container.locator('[tabindex]')).toHaveCount(0)

    // Tab 进入：焦点锚点紧邻容器之前，下一站必须是滚动容器本身
    const outlineBeforeFocus = await container.evaluate((element) => getComputedStyle(element).outlineStyle)
    expect(outlineBeforeFocus, '聚焦前不应有焦点环（判别力前置）').toBe('none')

    await page.locator(FOCUS_ANCHOR).focus()
    await page.keyboard.press('Tab')
    await expect(container, 'Tab 应进入横向滚动容器').toBeFocused()

    // 键盘聚焦须有可见焦点指示（WCAG 2.4.7）：`:focus-visible` 焦点环已生效。
    // 同时锁定宽度与品牌色，避免 UI 默认环让断言在规则失效时仍通过。
    const focusRing = await container.evaluate((element) => {
        const style = getComputedStyle(element)
        const probe = document.createElement('div')
        probe.style.outlineColor = 'var(--caomei-color-primary)'
        document.body.append(probe)
        const expectedColor = getComputedStyle(probe).outlineColor
        probe.remove()
        return {
            outlineStyle: style.outlineStyle,
            outlineWidth: style.outlineWidth,
            outlineColor: style.outlineColor,
            expectedColor,
        }
    })
    expect(focusRing.outlineStyle, '键盘聚焦时须渲染焦点环').toBe('solid')
    expect(focusRing.outlineWidth, '焦点环宽度须为设计规范口径').toBe('2px')
    expect(focusRing.outlineColor, '焦点环须使用品牌主色').toBe(focusRing.expectedColor)

    await page.keyboard.press('ArrowRight')
    await expect
        .poll(() => container.evaluate((element) => element.scrollLeft), {
            message: 'ArrowRight 后滚动容器应横向滚动',
        })
        .toBeGreaterThan(0)
})
