import { expect, test } from '@playwright/test'

/**
 * 树选择器的真实渲染复验。
 *
 * 受检面 = 夹具 `#tree-select` 段（宽容器 + 16rem 窄容器）。四条判据：
 *
 * 1. **键盘**：字段聚焦后 `Enter` 打开面板并把焦点交给首个树节点，`Enter` 选中后收起并回显；
 * 2. **回显与清空**：选中后字段显示标签、清空按钮出现且点击后回到占位；
 * 3. **浮层隔离**：打开态面板外兄弟节点被 `inert`，字段自身不被隔离（可再点关闭）；
 * 4. **窄屏几何**：320 / 390 档下字段不横向溢出、面板落在视口内（碰撞避让生效）。
 */

const FIELD = '#tree-select .caomei-tree-select__field'
const PANEL = '.caomei-tree-select__panel'

test('键盘打开、选中回显与清空', async ({ page }) => {
    await page.goto('/')

    const field = page.locator(FIELD).first()
    await field.focus()
    await page.keyboard.press('Enter')

    const panel = page.locator(PANEL)
    await expect(panel).toBeVisible()
    await expect(page.locator(`${PANEL} [role="treeitem"]`).first()).toBeFocused()

    await page.keyboard.press('Enter')
    await expect(panel).toBeHidden()
    await expect(field).toContainText('基础')

    // 有值时隐藏 chevron，清空按钮独占右侧（避免图标叠图标）
    const clear = page.locator('#tree-select .caomei-tree-select__clear').first()
    await expect(clear).toBeVisible()
    await expect(field.locator('.caomei-tree-select__chevron')).toHaveCount(0)

    // 字段右侧为清空按钮预留内边距：回显文本右端不得与按钮重叠
    const overlap = await page.evaluate(() => {
        const value = document.querySelector('#tree-select .caomei-tree-select__value')
        const clearButton = document.querySelector('#tree-select .caomei-tree-select__clear')
        if (!value || !clearButton) {
            return null
        }
        const valueBox = value.getBoundingClientRect()
        const clearBox = clearButton.getBoundingClientRect()
        return { valueRight: valueBox.right, clearLeft: clearBox.left }
    })
    if (!overlap) {
        throw new Error('回显或清空按钮缺失')
    }
    expect(overlap.valueRight).toBeLessThanOrEqual(overlap.clearLeft + 0.5)

    await clear.click()
    await expect(field).toContainText('请选择模块')
    await expect(clear).toBeHidden()
    await expect(field.locator('.caomei-tree-select__chevron')).toHaveCount(1)
})

test('面板几何由组件规则提供（padding / max-height 生效）', async ({ page }) => {
    await page.goto('/')
    await page.locator(FIELD).first().click()

    const geometry = await page.evaluate(() => {
        const panel = document.querySelector('.caomei-tree-select__panel')
        if (!panel) {
            return null
        }
        const style = getComputedStyle(panel)
        return { paddingLeft: style.paddingLeft, maxHeight: style.maxHeight }
    })

    expect(geometry).toEqual({ paddingLeft: '4px', maxHeight: '256px' })
})

test('打开态隔离背景但保留触发器', async ({ page }) => {
    await page.goto('/')
    const field = page.locator(FIELD).first()
    await field.click()
    await expect(page.locator(PANEL)).toBeVisible()

    const isolation = await page.evaluate(() => {
        const trigger = document.querySelector('.caomei-tree-select__field')
        const panel = document.querySelector('.caomei-tree-select__panel')
        return {
            triggerIsolated: Boolean(trigger?.closest('[inert]')),
            panelIsolated: Boolean(panel?.closest('[inert]')),
            anyIsolated: document.querySelectorAll('[inert]').length > 0,
        }
    })

    expect(isolation.panelIsolated).toBe(false)
    expect(isolation.triggerIsolated).toBe(false)
    expect(isolation.anyIsolated).toBe(true)
})

for (const width of [320, 390]) {
    test(`窄屏 ${width}：字段不溢出、面板落在视口内`, async ({ page }) => {
        await page.setViewportSize({ width, height: 720 })
        await page.goto('/')

        const narrowField = page.locator('#tree-select .fixture-tree-select__narrow .caomei-tree-select__field')
        const box = await narrowField.boundingBox()
        if (!box) {
            throw new Error('字段未渲染')
        }
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(width + 0.5)

        await narrowField.click()
        const panel = page.locator(PANEL).last()
        await expect(panel).toBeVisible()
        const panelBox = await panel.boundingBox()
        if (!panelBox) {
            throw new Error('面板未渲染')
        }
        expect(panelBox.x).toBeGreaterThanOrEqual(-0.5)
        expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(width + 0.5)
        // 纵向同样落在视口内（碰撞避让 + max-height）
        expect(panelBox.y).toBeGreaterThanOrEqual(0)
        expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(720 + 0.5)
        // 组件规则确实生效：最小宽度不小于声明的 12rem
        expect(panelBox.width).toBeGreaterThanOrEqual(12 * 16 - 0.5)
    })
}
