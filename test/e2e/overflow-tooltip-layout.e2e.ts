import { expect, test } from '@playwright/test'

/**
 * 截断配方 × 提示的**布局级持久守卫**（常驻，三视口矩阵）。
 *
 * 背景：单测里的溢出判定由 ResizeObserver 桩驱动（happy-dom 无布局引擎），只能证明
 * 「读到溢出时会挂提示」；真实浏览器里「文本是否真的被裁掉」取决于消费方的截断配方
 * 与可测量盒的形态。本用例在真实布局下成对取证：截断必然成立的那份必须出提示，
 * 装得下的那份必须静默——两侧互为对照，避免「永远出提示」或「永远静默」被单侧断言放过。
 *
 * 判别力：夹具只声明 `overflow` / `nowrap` / `ellipsis`，盒形态交给组件默认值（`inline-block`）。
 * 把默认盒改回 `inline` 时宽高读数恒为 0、长文本不再溢出；删掉配方任一属性同样会让
 * `scrollWidth` 与 `clientWidth` 相等，第一步的布局前提即失败。
 */

/** 夹具的提示 Provider 已把 `delay-duration` 归零；此处只留一个短观察窗，防同步断言抢在状态更新前 */
const TOOLTIP_OPEN_GRACE = 300

test('截断文本悬停出提示，未截断文本保持静默', async ({ page }) => {
    await page.goto('/')

    const truncated = page.locator('#truncation-overflow .caomei-tooltip-text')
    const fit = page.locator('#truncation-fit .caomei-tooltip-text')

    /** 真实布局读数：`scrollWidth > clientWidth` 才是真截断 */
    const measure = (locator: typeof truncated) => locator.evaluate((element) => {
        const styles = getComputedStyle(element)
        return {
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
            whiteSpace: styles.whiteSpace,
            textOverflow: styles.textOverflow,
            display: styles.display,
        }
    })

    const truncatedMetrics = await measure(truncated)
    expect(truncatedMetrics.whiteSpace, '截断配方需生效（nowrap）').toBe('nowrap')
    expect(truncatedMetrics.textOverflow, '截断配方需生效（ellipsis）').toBe('ellipsis')
    expect(truncatedMetrics.display, '可测量盒不得是 inline（宽高读数恒为 0）').not.toBe('inline')
    expect(truncatedMetrics.scrollWidth, '长文本必须真的被裁掉').toBeGreaterThan(truncatedMetrics.clientWidth)

    const fitMetrics = await measure(fit)
    expect(fitMetrics.scrollWidth, '短文本不得溢出').toBeLessThanOrEqual(fitMetrics.clientWidth)

    // 截断侧：悬停后提示进入打开态，内容取自可见文本
    await truncated.hover()
    await expect(truncated).toHaveAttribute('data-state', /open/)
    const panel = page.locator('.caomei-tooltip__content')
    await expect(panel).toBeVisible()
    await expect(panel).toContainText('超长文本用于验证截断配方下的悬停提示是否生效')

    // 移开指针后回到关闭态
    await page.mouse.move(0, 0)
    await expect(truncated).toHaveAttribute('data-state', /closed/)
    await expect(panel).toBeHidden()

    // 未截断侧：同一容器、同一配方，只是文本装得下——悬停后仍为关闭态，且提示面板未被挂载
    // （`toHaveCount(0)` 证的是「未挂载」：将来若引入 `forceMount` 需改为按打开态判定）
    await fit.hover()
    await page.waitForTimeout(TOOLTIP_OPEN_GRACE)
    await expect(fit).toHaveAttribute('data-state', /closed/)
    await expect(page.locator('.caomei-tooltip__content')).toHaveCount(0)
    await expect(fit).not.toHaveAttribute('aria-describedby', /.+/)
})
