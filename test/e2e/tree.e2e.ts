import { expect, test } from '@playwright/test'

/**
 * 树形控件的真实渲染复验（Reka `TreeRoot` / `TreeItem` 为 Alpha primitive）。
 *
 * 受检面 = 夹具 `#tree` 段（受控 selection + expanded）。三条判据：
 *
 * 1. **角色与层级**：根为 `role="tree"`、节点为 `role="treeitem"`，折叠态只渲染根级节点；
 * 2. **交互**：点击父节点同时展开与选中（`aria-expanded` / `aria-selected`），再点一次收起；
 * 3. **键盘**：`ArrowRight` 展开、`ArrowLeft` 收起、`ArrowDown` 把焦点移到下一个可见节点。
 */

const ITEM = '#tree [role="treeitem"]'

test('展开 / 选中 / 键盘导航在真实浏览器中生效', async ({ page }) => {
    await page.goto('/')

    const root = page.locator('#tree [role="tree"]')
    await expect(root).toHaveAttribute('aria-label', '组件目录')

    const items = page.locator(ITEM)
    await expect(items).toHaveCount(2)

    const parent = items.filter({ hasText: '基础' })
    await expect(parent).toHaveAttribute('aria-expanded', 'false')
    await expect(parent).toHaveAttribute('aria-level', '1')

    // 点击父节点：展开并选中
    await parent.click()
    await expect(parent).toHaveAttribute('aria-expanded', 'true')
    await expect(parent).toHaveAttribute('aria-selected', 'true')
    await expect(items).toHaveCount(4)
    await expect(items.nth(1)).toHaveAttribute('aria-level', '2')

    // 键盘：右方向键已展开时移到首个子节点；左方向键收起
    await parent.focus()
    await page.keyboard.press('ArrowRight')
    await expect(items.filter({ hasText: '按钮' })).toBeFocused()

    await parent.focus()
    await page.keyboard.press('ArrowLeft')
    await expect(parent).toHaveAttribute('aria-expanded', 'false')

    // 上下方向键在可见节点间移动焦点
    await parent.focus()
    await page.keyboard.press('ArrowDown')
    await expect(items.filter({ hasText: '数据展示' })).toBeFocused()
    await page.keyboard.press('ArrowUp')
    await expect(parent).toBeFocused()

    // Home / End 跳到首 / 末个可见节点（由 primitive 的垂直 roving focus 提供）
    await page.keyboard.press('End')
    await expect(items.filter({ hasText: '数据展示' })).toBeFocused()
    await page.keyboard.press('Home')
    await expect(parent).toBeFocused()
})
