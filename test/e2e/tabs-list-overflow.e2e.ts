import { expect, test as base } from '@playwright/test'

/**
 * TabList 滚动轴对的常驻回归（依据见 `docs/standards/testing.md` §5：几何 / 滚动断言只由 Playwright 承担）。
 *
 * 守护对象：`.caomei-tabs__list` 只声明 `overflow-x: auto` 时，另一轴的 `visible` 会被 CSS overflow
 * 计算规则改成 `auto`；而触发器 `.caomei-tabs__trigger` 的 `margin-bottom: -1px` 让它的边框盒比列表
 * 内容盒向下多出 1px（用于让激活下划线压住列表下边框），这 1px 纵向溢出会被渲染成**一条多余的纵向
 * 滚动条**，滚轮在列表上滚动还会把内容顶起 1px（`scrollTop` 由 0 变 1）。
 *
 * 断言分两层：
 * 1. **声明在渲染层生效**：横向列表的 `overflow-x` 为 `auto`（保留横向滚动）、`overflow-y` 不得是可滚动值；
 *    纵向列表必须保持 `overflow: visible`（纵向指示条同样靠 `-1px` 越界压住右边框）。
 * 2. **行为侧**：容器确实可横向滚动（`scrollLeft` 赋值后可读回），而纵向不是可滚动值——滚轮层的一次性
 *    取证（修复前注入 `overflow-y: auto` → 三档视口 `scrollTop` 由 0 变 1）落在 `test-results/`（本地态），
 *    常驻断言不用滚轮：列表不可纵向滚动时滚轮会链式交给祖先，Chromium 的滚动锁存会让后续滚轮继续命中
 *    祖先，滚轮断言在本仓夹具上不稳定（实测）。
 *
 * 前置条件由断言显式守卫：夹具必须真的构造出「纵向 1px 可滚动溢出」与「横向溢出」两个压力形态
 * （见 `test/e2e/fixtures/app.vue` 的 `#tabs-list-overflow`），否则本用例无判别力。
 */

const HORIZONTAL = '#tabs-horizontal .caomei-tabs__list'
const VERTICAL = '#tabs-vertical .caomei-tabs__list'

/** 每个用例独立收集 console error / page error，并统一导航（与 `textarea-layout.e2e.ts` 同构）。 */
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

test('横向 TabList 无纵向滚动条（纵向不可滚动，横向滚动保留）', async ({ page }) => {
    const list = page.locator(HORIZONTAL)
    await list.scrollIntoViewIfNeeded()
    await expect(list).toBeVisible()

    const state = await list.evaluate((element) => {
        const style = getComputedStyle(element)
        return {
            overflowX: style.overflowX,
            overflowY: style.overflowY,
            scrollHeight: element.scrollHeight,
            clientHeight: element.clientHeight,
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
        }
    })

    // 前置条件：夹具确已构造出触发条件（纵向 1px 可滚动溢出）与横向溢出，否则断言无判别力
    expect(
        state.scrollHeight,
        '夹具须构造出纵向 1px 溢出（触发器 margin-bottom: -1px 的越界），否则本用例无判别力',
    ).toBeGreaterThan(state.clientHeight)
    expect(
        state.scrollWidth,
        '夹具须构造出横向溢出，否则横向滚动断言无判别力',
    ).toBeGreaterThan(state.clientWidth)

    expect(state.overflowX, '列表必须保留横向滚动能力').toBe('auto')
    expect(
        state.overflowY,
        '纵向不得为可滚动值：overflow-y 为 auto 时 1px 越界会被渲染成多余的纵向滚动条',
    ).toBe('hidden')

    // 横向能力的行为侧：容器确实可横向滚动（不是被误禁用为静态的容器）
    const scrolledLeft = await list.evaluate((element) => {
        element.scrollLeft = 30
        return element.scrollLeft
    })
    expect(scrolledLeft, '列表须可横向滚动（否则横向长列表无法查看）').toBeGreaterThan(0)
})

test('纵向 TabList 保持 overflow: visible（指示条越界不被裁剪）', async ({ page }) => {
    const list = page.locator(VERTICAL)
    await list.scrollIntoViewIfNeeded()
    await expect(list).toBeVisible()

    const state = await list.evaluate((element) => {
        const style = getComputedStyle(element)
        return { overflow: style.overflow, overflowX: style.overflowX, overflowY: style.overflowY }
    })

    expect(state.overflowX, '纵向列表不得被横向裁剪').toBe('visible')
    expect(state.overflowY, '纵向列表不得被纵向裁剪（指示条依赖 1px 越界压住右边框）').toBe('visible')
    expect(state.overflow, '纵向列表须保持两轴 visible').toBe('visible')
})
