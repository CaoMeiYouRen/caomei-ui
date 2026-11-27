import { expect, test } from '@playwright/test'

/**
 * 吸顶的真实浏览器回归（常驻）。
 *
 * 覆盖：滚动前不吸顶、滚过偏移后吸住（含 `offset` 生效）、容器边界到达后被推走
 * （`data-constrained`）、状态经 `change` 反映到夹具输出。
 *
 * 判定落在几何与状态：吸住时吸顶条 `top` 应等于滚动容器顶 + `offset`（容差 1px）；
 * 到容器底后 `top` 应小于该值（被推着走）。
 */

const SCROLLER = '#sticky-scroller'
const BAR = '#sticky-bar'
const STATE_OUT = '#sticky-state'

const OFFSET = 8
const TOLERANCE = 1.5

test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator(BAR)).toBeVisible()
})

/** 取吸顶条相对滚动容器**内容区顶部**的偏移（扣掉容器的 padding 与 border） */
async function barOffsetInScroller(page: import('@playwright/test').Page): Promise<number> {
    return page.evaluate(({ scroller, bar }) => {
        const scrollerEl = document.querySelector(scroller) as HTMLElement
        const barEl = document.querySelector(bar) as HTMLElement
        const paddingTop = Number.parseFloat(getComputedStyle(scrollerEl).paddingTop) || 0
        const contentTop = scrollerEl.getBoundingClientRect().top + scrollerEl.clientTop + paddingTop
        return barEl.getBoundingClientRect().top - contentTop
    }, { scroller: SCROLLER, bar: BAR })
}

test('滚动前未吸顶，滚过偏移后吸住并把 offset 生效', async ({ page }) => {
    await expect(page.locator(STATE_OUT)).toHaveText('idle')
    expect(await barOffsetInScroller(page)).toBeGreaterThan(OFFSET + TOLERANCE)

    await page.locator(SCROLLER).evaluate((element) => {
        element.scrollTop = 120
    })

    await expect(page.locator(STATE_OUT)).toHaveText('stuck')
    const offset = await barOffsetInScroller(page)
    expect(Math.abs(offset - OFFSET), '吸住时距容器顶等于 offset').toBeLessThanOrEqual(TOLERANCE)
})

test('滚到底部时被容器推走并标记 constrained', async ({ page }) => {
    // 先滚到中段确认已吸住，再滚到底部
    await page.locator(SCROLLER).evaluate((element) => {
        element.scrollTop = 120
    })
    await expect(page.locator(STATE_OUT)).toHaveText('stuck')
    const stuckOffset = await barOffsetInScroller(page)

    await page.locator(SCROLLER).evaluate((element) => {
        element.scrollTop = element.scrollHeight
    })

    await expect(page.locator(STATE_OUT)).toHaveText('constrained')
    expect(await barOffsetInScroller(page), '到容器底后不再固定在 offset 位置').toBeLessThan(stuckOffset - TOLERANCE)
})

test('回到顶部后恢复未吸顶', async ({ page }) => {
    await page.locator(SCROLLER).evaluate((element) => {
        element.scrollTop = 120
    })
    await expect(page.locator(STATE_OUT)).toHaveText('stuck')

    await page.locator(SCROLLER).evaluate((element) => {
        element.scrollTop = 0
    })
    await expect(page.locator(STATE_OUT)).toHaveText('idle')
})

test('吸顶条层级取自基础档位且不大于浮层档位', async ({ page }) => {
    const levels = await page.evaluate((bar) => {
        const element = document.querySelector(bar)
        if (!(element instanceof HTMLElement)) {
            throw new Error('吸顶条不存在')
        }
        const root = document.documentElement
        return {
            bar: Number(getComputedStyle(element).zIndex),
            sticky: Number(getComputedStyle(root).getPropertyValue('--caomei-z-sticky')),
            dropdown: Number(getComputedStyle(root).getPropertyValue('--caomei-z-dropdown')),
        }
    }, BAR)

    expect(levels.bar).toBe(levels.sticky)
    expect(levels.bar).toBeLessThan(levels.dropdown)
})
