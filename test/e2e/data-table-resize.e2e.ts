import { expect, test } from '@playwright/test'

/**
 * DataTable 列宽拖拽手柄（常驻，三视口矩阵）。
 *
 * 判定：① 手柄可键盘调整（方向键 ±8px）并回写 `columnSizing`；② 双击复位到列定义宽度；
 * ③ 指针拖拽改变列宽；④ 选择列 / 展开列不渲染手柄。
 */
const SECTION = '#panel-data-table-resize'

test('列宽手柄支持键盘、双击与指针拖拽，选择列无手柄', async ({ page }) => {
    await page.goto('/')

    const table = page.locator(SECTION)
    await expect(table).toBeVisible()

    const handles = table.locator('.caomei-data-table__resizer')
    // 三列数据列各一个手柄；选择列由组件自动插入且不渲染手柄
    await expect(handles).toHaveCount(3)
    await expect(table.locator('.caomei-data-table__select-cell .caomei-data-table__resizer')).toHaveCount(0)

    const first = handles.first()
    const headerCell = table.locator('th', { has: page.locator('.caomei-data-table__resizer') }).first()

    expect(await first.getAttribute('aria-valuenow')).toBe('160')
    const initialWidth = await headerCell.evaluate((element) => element.getBoundingClientRect().width)

    // 键盘：+8px
    await first.focus()
    await page.keyboard.press('ArrowRight')
    await expect(first).toHaveAttribute('aria-valuenow', '168')
    // `table-layout: auto` 下渲染宽由内容与容器共同决定，这里只断言「变宽」而不是精确像素
    const keyboardWidth = await headerCell.evaluate((element) => element.getBoundingClientRect().width)
    expect(keyboardWidth).toBeGreaterThan(initialWidth)

    // 双击复位到列定义宽度（120px）
    await first.dispatchEvent('dblclick')
    await expect(first).toHaveAttribute('aria-valuenow', '120')

    // 指针拖拽：向右 60px（手柄仅 8px 宽且贴着相邻表头，这里直接派发指针事件验证处理链）
    await first.dispatchEvent('pointerdown', { button: 0, clientX: 100 })
    await page.evaluate(() => {
        window.dispatchEvent(new PointerEvent('pointermove', { clientX: 160 }))
        window.dispatchEvent(new PointerEvent('pointerup', { clientX: 160 }))
    })
    await expect(first).toHaveAttribute('aria-valuenow', '180')
})
