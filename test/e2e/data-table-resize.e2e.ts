import { expect, test } from '@playwright/test'

/**
 * DataTable 列宽拖拽手柄（常驻，三视口矩阵）。
 *
 * 判定：① 手柄可键盘调整（默认步进 ±8px）并回写 `columnSizing`；② 双击复位到列定义宽度；
 * ③ 指针拖拽改变列宽；④ 选择列 / 展开列不渲染手柄；
 * ⑤ 冻结列手柄的像素级吸边（表头贴容器左缘、手柄中心 = 表头右缘）；
 * ⑥ `columnResizeStep` / `columnResizeMinWidth` 可配置，`columnResizeEnd` 在键盘 / 拖拽 / 复位时带 `{ key, width }` 载荷触发。
 */
const SECTION = '#panel-data-table-resize'
const FROZEN_SECTION = '#panel-data-table-resize-frozen'

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

test('冻结列手柄随表头吸边：像素级几何与滚动后保持', async ({ page }) => {
    await page.goto('/')

    const table = page.locator(FROZEN_SECTION)
    await expect(table).toBeVisible()

    const container = table.locator('.caomei-data-table')

    // 声明 px 宽度的冻结列之和撑出横向滚动；否则后面的「滚动后」断言无意义
    const scrollState = await container.evaluate((element) => ({
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
    }))
    expect(scrollState.scrollWidth).toBeGreaterThan(scrollState.clientWidth)

    /** 表头左缘 / 右缘与手柄中心的像素坐标（相对容器可视区左缘） */
    const readGeometry = () => container.evaluate((element) => {
        const header = element.querySelector('th')
        const handle = element.querySelector('.caomei-data-table__resizer')
        if (!header || !handle) {
            throw new Error('冻结列表头或手柄缺失')
        }
        const box = element.getBoundingClientRect()
        const headerBox = header.getBoundingClientRect()
        const handleBox = handle.getBoundingClientRect()
        return {
            headerLeft: headerBox.left - box.left,
            headerRight: headerBox.right - box.left,
            headerHeight: headerBox.height,
            handleCenter: (handleBox.left + handleBox.right) / 2 - box.left,
            handleTop: handleBox.top - box.top,
            handleHeight: handleBox.height,
        }
    })

    const initial = await readGeometry()
    // 未滚动时首列表头本就贴容器左缘；手柄中心落在表头右缘（`right: -4px` + 8px 宽）
    expect(Math.abs(initial.headerLeft)).toBeLessThanOrEqual(1)
    expect(Math.abs(initial.handleCenter - initial.headerRight)).toBeLessThanOrEqual(1)

    // 横向滚动 120px 后冻结列表头仍贴容器左缘，手柄随表头一起吸边
    await container.evaluate((element) => {
        element.scrollLeft = 120
    })
    await expect.poll(async () => container.evaluate((element) => element.scrollLeft)).toBe(120)

    const scrolled = await readGeometry()
    expect(Math.abs(scrolled.headerLeft)).toBeLessThanOrEqual(1)
    expect(Math.abs(scrolled.handleCenter - scrolled.headerRight)).toBeLessThanOrEqual(1)
    // 手柄纵向覆盖表头全高（吸边不改变纵向几何）
    expect(Math.abs(scrolled.handleTop - initial.handleTop)).toBeLessThanOrEqual(1)
    expect(Math.abs(scrolled.handleHeight - scrolled.headerHeight)).toBeLessThanOrEqual(1)
})

test('步进与最小列宽可配置，结束事件按键盘 / 拖拽 / 复位触发', async ({ page }) => {
    await page.goto('/')

    const table = page.locator(FROZEN_SECTION)
    await expect(table).toBeVisible()

    const first = table.locator('.caomei-data-table__resizer').first()
    const log = page.locator('#data-table-resize-log')

    // 夹具声明 `column-resize-step=20` / `column-resize-min-width=120`
    await expect(first).toHaveAttribute('aria-valuemin', '120')
    await expect(first).toHaveAttribute('aria-valuenow', '140')

    // 键盘：+20 → 160，事件载荷为 { key, width }
    await first.focus()
    await page.keyboard.press('ArrowRight')
    await expect(first).toHaveAttribute('aria-valuenow', '160')
    await expect(log).toHaveText('dept:160')

    // 拖拽：向左 80px 会落到 80，被最小列宽 120 夹取
    await first.dispatchEvent('pointerdown', { button: 0, clientX: 200 })
    await page.evaluate(() => {
        window.dispatchEvent(new PointerEvent('pointermove', { clientX: 120 }))
        window.dispatchEvent(new PointerEvent('pointerup', { clientX: 120 }))
    })
    await expect(first).toHaveAttribute('aria-valuenow', '120')
    await expect(log).toHaveText('dept:120')

    // 双击复位到列定义宽度（140px）并触发结束事件
    await first.dispatchEvent('dblclick')
    await expect(first).toHaveAttribute('aria-valuenow', '140')
    await expect(log).toHaveText('dept:140')
})
