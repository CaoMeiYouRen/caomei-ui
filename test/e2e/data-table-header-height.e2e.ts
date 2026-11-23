import { expect, test, type Page } from '@playwright/test'

/**
 * DataTable 表头行高守卫：提示包装不得改变行盒高度。
 *
 * 背景：`cellTooltips` 开启时表头与默认单元格文本包在 `CaomeiTooltipText` 里，其根是可测量的
 * `inline-block`。截断配方（`overflow: hidden`）会把 `inline-block` 的基线改为底边，行盒因此
 * 多出降部空间（本仓夹具实测：截断表头 34.5 → 37.5px、截断单元格 35 → 38px；下游 momei 实测
 * 表头 32.59 → 35.69px）——即 1.4.0 的下游可见行高回归。
 *
 * 判据（同页三张结构相同的表，列宽同为 5rem）：
 * 1. **行高（判别力来源）**：默认路径（提示包装）与 `#header-*` 插槽路径（不包装，等价 1.3.0）
 *    的表头行高一致——移除修复后该用例实测失败（37.5 vs 34.5px）；
 * 2. **对齐契约（声明层兜底）**：包装与 `:cell-tooltips="false"` 降级盒（`.caomei-data-table__cell-box`）
 *    的 `vertical-align` 均为 `top`——判别力来自第 1 条的行高对照，本条只固定契约取值，
 *    防止「两条路径同时回归」时行高对照失效；
 *    单元格行高的数值一致性不再单列：两条路径未修复时会同步偏高，差值恒为 0，不具判别力。
 */

const SECTION = '#data-table-header-height'

async function rowHeight(page: Page, selector: string): Promise<number> {
    const cell = page.locator(selector).first()
    await expect(cell).toBeVisible()
    const box = await cell.boundingBox()
    expect(box, `${selector} 应有几何`).toBeTruthy()
    return box?.height ?? 0
}

test('截断表头行高与不包装路径一致（提示包装不撑高）', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator(SECTION)).toBeVisible()

    // 前置守卫：默认路径必须真的命中截断配方（未截断时该面无判别力）
    const overflow = await page
        .locator('#header-height-wrapped thead th .caomei-tooltip-text')
        .first()
        .evaluate((element) => getComputedStyle(element).overflow)
    expect(['hidden', 'clip'], '默认路径应命中截断配方').toContain(overflow)

    const wrapped = await rowHeight(page, '#header-height-wrapped thead th')
    const slot = await rowHeight(page, '#header-height-slot thead th')

    expect(Math.abs(wrapped - slot), `包装表头 ${wrapped}px 与插槽基线 ${slot}px 应等高`).toBeLessThanOrEqual(0.5)
})

test('表头与单元格文本盒按行盒顶部对齐', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator(SECTION)).toBeVisible()
    const header = page.locator('#header-height-wrapped thead th .caomei-tooltip-text').first()
    const cell = page.locator('#header-height-no-tip tbody td .caomei-data-table__cell-box').first()
    await expect(header).toBeVisible()
    await expect(cell).toBeVisible()

    expect(await header.evaluate((element) => getComputedStyle(element).verticalAlign)).toBe('top')
    expect(await cell.evaluate((element) => getComputedStyle(element).verticalAlign)).toBe('top')
})
