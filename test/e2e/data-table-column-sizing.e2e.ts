import { expect, test } from '@playwright/test'

/**
 * DataTable 受控列宽（常驻）：`columnSizing` 改变时列宽与文本截断上限同步。
 *
 * 只做预设切换（组件不内置拖拽手柄），断言表头实际宽度与文本盒 `max-width` 同源——
 * 只改 `<th>` 而不改截断上限会让文本留在旧上限。
 */
test('受控列宽切换后表头宽度与截断上限同步', async ({ page }) => {
    await page.goto('/')

    const table = page.locator('#data-table-column-sizing-table')
    await expect(table).toBeVisible()
    const headers = table.locator('thead th')
    /** 内联 `width`（受控列宽下发的值）——布局宽会按 100% 表格宽拉伸，不能直接比对 */
    const declared = () => headers.evaluateAll((elements) => elements.map((element) => (element as HTMLElement).style.width))
    /** 文本盒的截断上限：列宽减去单元格左右内边距（与实现同一算式） */
    const caps = () => headers.evaluateAll((elements) => elements.map((element) => {
        const box = element.querySelector('.caomei-tooltip-text')
        return box ? Number.parseFloat(getComputedStyle(box).maxWidth) : null
    }))

    const padding = await page.evaluate(() => {
        const value = getComputedStyle(document.documentElement).getPropertyValue('--caomei-space-3').trim()
        return Number.parseFloat(value) || 12
    })

    await expect.poll(declared).toEqual(['200px', '260px'])
    await expect.poll(caps).toEqual([200 - padding * 2, 260 - padding * 2])

    await page.locator('#sizing-compact').click()
    await expect.poll(declared).toEqual(['120px', '180px'])
    await expect.poll(caps).toEqual([120 - padding * 2, 180 - padding * 2])

    // 表体单元格的文本盒同样按新列宽收窄
    const bodyCaps = () => table.locator('tbody tr:first-child td .caomei-tooltip-text').evaluateAll((elements) => elements.map((element) => Number.parseFloat(getComputedStyle(element).maxWidth)))
    await expect.poll(bodyCaps).toEqual([120 - padding * 2, 180 - padding * 2])

    await page.locator('#sizing-default').click()
    await expect.poll(declared).toEqual(['200px', '260px'])
})
