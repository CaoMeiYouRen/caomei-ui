import { expect, test, type Page } from '@playwright/test'
import { HIT_BOX, minHitTargetDistance } from './helpers/hit-target'
import { boxOf, expectLocatorNoHorizontalOverflow, expectPageNoHorizontalOverflow, viewportOf } from './helpers/layout'

/**
 * 移动壳（Cell / CellGroup / Tabbar）与操作 / 空态（ActionSheet / Empty）的常驻断言。
 *
 * 断层面：
 * 1. 行语义与分组：CellGroup 的 `role="group"` + `aria-labelledby`，可点击 Cell 的宿主元素语义；
 * 2. Tabbar：`aria-current` 单值、点击切换、角标、条目高度与相邻目标轴距；
 * 3. ActionSheet：底部面板开合、选择后关闭、取消项、焦点回到触发器、内容可滚动；
 * 4. Empty：标题 / 说明 / 操作在三档验收视口可见且不裁切（320 档由响应式矩阵用例承担）；
 * 5. 相邻目标间距的**负向对照**：注入两组 20px 按钮，直接调用生产判据 `minHitTargetDistance`
 *    验证「零间距 → 中心距 20 < 24（不通过）」与「4px 间距 → 中心距 24（恰好通过）」。
 */

test.beforeEach(async ({ page }) => {
    await page.goto('/')
})

async function openActionSheet(page: Page): Promise<void> {
    await page.locator('#action-sheet-open').click()
    await expect(page.locator('.caomei-action-sheet')).toBeVisible()
}

test.describe('Cell 与 CellGroup', () => {
    test('分组语义、宿主元素与容器不裁切', async ({ page }) => {
        const section = page.locator('#cell-group')
        await expect(section).toBeVisible()

        const group = section.locator('.caomei-cell-group')
        const title = group.locator('.caomei-cell-group__title')
        expect(await group.getAttribute('role')).toBe('group')
        const labelledby = await group.getAttribute('aria-labelledby')
        expect(labelledby).toBeTruthy()
        expect(await title.getAttribute('id')).toBe(labelledby)

        const cells = group.locator('.caomei-cell')
        await expect(cells).toHaveCount(3)
        expect(await cells.nth(1).evaluate((element) => element.tagName)).toBe('BUTTON')
        expect(await cells.nth(2).evaluate((element) => element.tagName)).toBe('A')

        for (const cell of [cells.nth(0), cells.nth(1), cells.nth(2)]) {
            const box = await boxOf(cell)
            expect(box.height, '整行即命中区，行高不低于 44px').toBeGreaterThanOrEqual(44)
        }

        await expectLocatorNoHorizontalOverflow(group, 'CellGroup')
        await expectLocatorNoHorizontalOverflow(section, 'Cell 用例容器')
        await expectPageNoHorizontalOverflow(page)
    })
})

test.describe('Tabbar', () => {
    test('aria-current 单值、点击切换与角标', async ({ page }) => {
        const tabbar = page.locator('#tabbar .caomei-tabbar')
        await expect(tabbar).toBeVisible()

        expect(await tabbar.getAttribute('aria-label')).toBe('主导航')
        const items = tabbar.locator('.caomei-tabbar-item')
        await expect(items).toHaveCount(3)

        await expect(items.nth(0)).toHaveAttribute('aria-current', 'page')
        await expect(items.nth(1)).not.toHaveAttribute('aria-current', 'page')
        await expect(tabbar.locator('[aria-current="page"]')).toHaveCount(1)

        await items.nth(2).click()
        await expect(items.nth(2)).toHaveAttribute('aria-current', 'page')
        await expect(tabbar.locator('[aria-current="page"]')).toHaveCount(1)
        await expect(items.nth(1).locator('.caomei-badge')).toHaveText('5')

        await expectLocatorNoHorizontalOverflow(tabbar, 'Tabbar')
    })

    test('条目高度与相邻目标轴距满足触摸下限', async ({ page }) => {
        const items = page.locator('#tabbar .caomei-tabbar-item')
        await expect(items, '受检条目不得为 0（否则几何断言会空转）').toHaveCount(3)

        const heights = await items.evaluateAll((nodes) =>
            nodes.map((node) => node.getBoundingClientRect().height))
        expect(heights).toHaveLength(3)
        for (const height of heights) {
            expect(height, '标签栏条目高度不低于 44px').toBeGreaterThanOrEqual(44)
        }

        // 该断言在满宽三列下判别力有限（中心距约 130px），主要兜底极窄档与条目不换行
        const distance = await minHitTargetDistance(page, '#tabbar .caomei-tabbar-item')
        expect(distance, `相邻标签栏条目的 Chebyshev 中心距应 ≥ ${HIT_BOX}`).toBeGreaterThanOrEqual(HIT_BOX)
    })
})

test.describe('ActionSheet', () => {
    test('底部打开、选择后关闭并把焦点还给触发器', async ({ page }) => {
        const trigger = page.locator('#action-sheet-open')
        await openActionSheet(page)

        const panel = page.locator('.caomei-action-sheet')
        expect(await panel.getAttribute('data-position')).toBe('bottom')
        await expect(panel).toContainText('更多操作')
        await expect(panel).toContainText('不可撤销')

        await panel.locator('.caomei-action-sheet__item').first().click()
        await expect(page.locator('#action-sheet-log')).toHaveText('share')
        await expect(panel).toBeHidden()
        await expect(trigger).toBeFocused()
    })

    test('取消项关闭面板并把焦点还给触发器', async ({ page }) => {
        const trigger = page.locator('#action-sheet-open')
        await openActionSheet(page)

        const panel = page.locator('.caomei-action-sheet')
        await panel.locator('.caomei-action-sheet__cancel').click()
        await expect(panel).toBeHidden()
        await expect(trigger).toBeFocused()
    })

    test('内容超出面板高度时正文可滚动到底', async ({ page }) => {
        await openActionSheet(page)

        const body = page.locator('.caomei-action-sheet .caomei-drawer__body')
        const metrics = await body.evaluate((element) => ({
            scrollHeight: element.scrollHeight,
            clientHeight: element.clientHeight,
            overflowY: getComputedStyle(element).overflowY,
        }))

        expect(['auto', 'scroll'], '正文需要纵向滚动降级通道').toContain(metrics.overflowY)
        expect(metrics.scrollHeight, '条目较多时正文应可滚动').toBeGreaterThan(metrics.clientHeight)

        await body.evaluate((element) => {
            element.scrollTop = element.scrollHeight
        })
        const lastItem = page.locator('.caomei-action-sheet__item').last()
        const bodyBox = await boxOf(body)
        const lastBox = await boxOf(lastItem)
        expect(
            lastBox.y + lastBox.height,
            '滚到底后末位条目应完整落在正文可视区内',
        ).toBeLessThanOrEqual(bodyBox.y + bodyBox.height + 1)
        expect(lastBox.y).toBeGreaterThanOrEqual(bodyBox.y - 1)
    })

    test('面板落在视口内且不产生横向溢出', async ({ page }) => {
        await openActionSheet(page)

        const panel = page.locator('.caomei-action-sheet')
        const viewport = await viewportOf(page)
        const box = await boxOf(panel)
        expect(box.x).toBeGreaterThanOrEqual(-1)
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1)
        expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1)
        await expectLocatorNoHorizontalOverflow(panel, 'ActionSheet 面板')
    })
})

test.describe('Empty', () => {
    test('标题、说明与操作可见且无裁切', async ({ page }) => {
        const empty = page.locator('#empty .caomei-empty')
        await expect(empty).toBeVisible()
        await expect(empty.locator('.caomei-empty__title')).toHaveText('还没有任何项目')
        await expect(empty.locator('.caomei-empty__description')).toBeVisible()
        await expect(empty.locator('.caomei-empty__action .caomei-button')).toHaveText('新建项目')

        const noClip = await empty.evaluate((element) => ({
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
            scrollHeight: element.scrollHeight,
            clientHeight: element.clientHeight,
        }))
        expect(noClip.scrollWidth).toBeLessThanOrEqual(noClip.clientWidth + 1)
        expect(noClip.scrollHeight).toBeLessThanOrEqual(noClip.clientHeight + 1)

        await expectLocatorNoHorizontalOverflow(empty, 'Empty')
    })
})

test.describe('相邻目标间距判定', () => {
    test('负向对照：20px 按钮在 0 / 4px 间距下的中心距分别小于 / 等于 24px 判据', async ({ page }) => {
        await page.evaluate(() => {
            const host = document.createElement('div')
            host.id = 'compact-pair-probe'
            host.style.cssText = 'position: fixed; top: 0; left: 0; z-index: 1;'
            for (const gap of [0, 4]) {
                const row = document.createElement('div')
                row.dataset.gap = String(gap)
                row.style.cssText = `display: flex; margin-bottom: 8px;`
                for (let index = 0; index < 2; index += 1) {
                    const button = document.createElement('button')
                    button.type = 'button'
                    button.style.cssText = `width: 20px; height: 20px; padding: 0; border: 0; margin-right: ${index === 0 ? gap : 0}px;`
                    row.append(button)
                }
                host.append(row)
            }
            document.body.append(host)
        })

        const tight = await minHitTargetDistance(page, '#compact-pair-probe [data-gap="0"] button')
        const boundary = await minHitTargetDistance(page, '#compact-pair-probe [data-gap="4"] button')

        expect(tight, '零间距的 20px 按钮中心距为 20px，应被判定为不满足 24px 判据').toBeLessThan(HIT_BOX)
        expect(boundary, '4px 间距的 20px 按钮中心距恰为 24px，应恰好满足判据').toBeGreaterThanOrEqual(HIT_BOX - 0.5)

        await page.evaluate(() => document.querySelector('#compact-pair-probe')?.remove())
    })
})
