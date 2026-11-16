import { expect, test } from '@playwright/test'

/**
 * DataTable 逐格提示开关（常驻）：默认单元格逐格接线，`cellTooltips=false` 时只渲染纯文本。
 *
 * 夹具用同一份 60 × 8 数据成对挂载（默认列 / 默认列 + `cellTooltips=false`），断言开关在真实 DOM 下的
 * 效果——单测只覆盖渲染结构，规模由夹具固定，避免用「提示实例数」做与实现无关的硬编码策略。
 * 对照侧必须用**同一份列定义**：改用 `cell` 渲染函数会绕过默认分支，无法证明开关生效。
 */
test('关闭逐格提示后单元格不再挂提示接线', async ({ page }) => {
    await page.goto('/')

    await page.locator('#cell-tooltip-perf-mount-default').click()
    const table = page.locator('#cell-tooltip-perf-table')
    await expect(table).toBeVisible()

    const cellCount = await table.locator('tbody td').count()
    expect(cellCount).toBeGreaterThan(0)
    expect(await table.locator('tbody td:has(.caomei-tooltip-text)').count()).toBe(cellCount)

    // 首列定宽 80px + 长文本：默认态真的被截断
    const truncation = await table.locator('tbody td').first().evaluate((cell) => {
        const box = cell.firstElementChild
        return box ? { display: getComputedStyle(box).display, scrollWidth: box.scrollWidth, clientWidth: box.clientWidth } : null
    })
    expect(truncation?.display).not.toBe('inline')
    expect(truncation?.scrollWidth).toBeGreaterThan(truncation?.clientWidth ?? 0)

    // 关闭：先卸载再挂「默认列 + cellTooltips=false」对照（同一份列定义与数据）
    await page.locator('#cell-tooltip-perf-clear').click()
    await page.locator('#cell-tooltip-perf-mount-off').click()
    await expect(table).toBeVisible()

    expect(await table.locator('tbody td').count()).toBe(cellCount)
    expect(await table.locator('tbody td:has(.caomei-tooltip-text)').count()).toBe(0)

    // 关闭提示不改变截断：可测量盒仍成立，长文本仍被裁掉
    const offTruncation = await table.locator('tbody td').first().evaluate((cell) => {
        const box = cell.firstElementChild
        return box ? { display: getComputedStyle(box).display, scrollWidth: box.scrollWidth, clientWidth: box.clientWidth } : null
    })
    expect(offTruncation?.display).not.toBe('inline')
    expect(offTruncation?.scrollWidth).toBeGreaterThan(offTruncation?.clientWidth ?? 0)
})
