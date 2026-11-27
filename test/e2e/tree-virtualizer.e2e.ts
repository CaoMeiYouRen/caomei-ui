import { expect, test } from '@playwright/test'

/**
 * 虚拟树的真实浏览器回归（常驻）。
 *
 * 覆盖：只渲染可视区附近的行（渲染数上界）、虚拟层总高度 = 展开节点数 × 行高、滚动后窗口更新
 * （首行文本变化）、点击节点写回选中、方向键在渲染窗口内移动焦点。
 *
 * 判定口径：夹具为 200 个分组 × 5 个子节点（折叠态 200 行），可视高 12rem / 行高 28px，
 * `overscan=4`，故渲染行数上界 ≈ ceil(192/28) + 8 + 2；远小于 200 才能证明虚拟化生效。
 */

const ROOT = '#panel-tree-virtualizer'
const SCROLLER = `${ROOT} .caomei-tree-virtualizer`
const ITEM = `${ROOT} .caomei-tree-virtualizer__item`
const LAYER = `${ROOT} [data-reka-virtualizer]`
const SELECTED_OUT = '#virtual-tree-selected'

const ITEM_HEIGHT = 28
const VISIBLE_UPPER_BOUND = 40

test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator(ROOT)).toBeVisible()
})

test('只渲染可视区附近的行，且虚拟层高度按展开节点数计算', async ({ page }) => {
    const rendered = await page.locator(ITEM).count()
    expect(rendered, '必须渲染出可视行').toBeGreaterThan(0)
    expect(rendered, '渲染行数不得超过可视区上界').toBeLessThanOrEqual(VISIBLE_UPPER_BOUND)

    // 初始展开 vg-0 / vg-1：200 个分组 + 10 个子节点 = 210 行
    const layerHeight = await page.locator(LAYER).evaluate((element) => (element as HTMLElement).style.height)
    expect(layerHeight).toBe(`${210 * ITEM_HEIGHT}px`)
})

test('滚动后渲染窗口更新（首行文本变化且行数仍受限）', async ({ page }) => {
    await expect(page.locator(ITEM).first()).toBeVisible()
    const firstTextBefore = (await page.locator(ITEM).first().innerText()).trim()

    await page.locator(SCROLLER).evaluate((element) => {
        element.scrollTop = 1200
    })
    await expect
        .poll(async () => (await page.locator(ITEM).first().innerText()).trim())
        .not.toBe(firstTextBefore)

    const rendered = await page.locator(ITEM).count()
    expect(rendered, '滚动后渲染行数仍受限').toBeLessThanOrEqual(VISIBLE_UPPER_BOUND)
})

test('点击节点写回选中并暴露 aria-selected', async ({ page }) => {
    // 初始展开 vg-0 / vg-1：第 2 行是 vg-0 的第一个子节点
    const second = page.locator(ITEM).nth(1)
    await second.click()

    await expect(page.locator(SELECTED_OUT)).toHaveText('vg-0-0')
    await expect(second).toHaveAttribute('aria-selected', 'true')
})

test('方向键在当前渲染窗口内移动焦点', async ({ page }) => {
    const first = page.locator(ITEM).first()
    await first.focus()
    await page.keyboard.press('ArrowDown')

    const focusedIndex = await page.evaluate(() => {
        const element = document.activeElement
        return element instanceof HTMLElement ? element.dataset.index : null
    })
    expect(focusedIndex, '焦点移到下一行的 data-index').toBe('1')
})

test('容器带可访问名与 tree 角色', async ({ page }) => {
    const scroller = page.locator(SCROLLER)
    await expect(scroller).toHaveAttribute('role', 'tree')
    await expect(scroller).toHaveAttribute('aria-label', '虚拟树')
})
