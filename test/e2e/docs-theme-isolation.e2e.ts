import { expect, test } from '@playwright/test'

/**
 * 文档站主题 CSS 隔离的常驻浏览器回归（跑在 `docs:build` 产物上，配置见
 * `playwright.gallery.config.ts`）。
 *
 * 守护对象：VitePress 正文列表排版 `.vp-doc ul { padding-left: 1.25rem }`（特异性 0-1-1）会命中
 * **未 teleport** 的 `md-editor-v3` 工具条下拉菜单子树（内核 `.md-editor-menu` 仅 0-1-0），
 * 使菜单出现额外左侧 / 纵向留白。`docs/.vitepress/theme/caomei-demo.css` 以 0-2-0 的
 * `.vp-doc .md-editor-menu` 隔离规则恢复内核自带形态。
 *
 * 声明层契约（`test/contracts/docs-theme-prose-isolation.test.ts`）只校验 CSS 文本，
 * **无法感知 VitePress 选择器 / 特异性漂移**；本规格在真实 Chromium 中断言菜单子树的**计算样式**，
 * 使升级 VitePress 或调整主题后被隔离规则压不住的泄漏立即失败。
 *
 * 判别力前置守卫：先断言菜单子树确实位于 `.vp-doc` 内（否则用例在没有泄漏面时静默通过）。
 */

const PAGE = '/components/rich-text-editor'
/** 打开下拉菜单的稳定入口：工具条的「标题」项（`md-editor-v3` 内建 dropdown） */
const DROPDOWN_TRIGGER = '.md-editor-toolbar-item[title="标题"]'
const MENU = '.md-editor-menu'

interface MenuStyles {
    inProse: boolean
    paddingLeft: string
    paddingRight: string
    paddingTop: string
    paddingBottom: string
    marginTop: string
    marginBottom: string
    listStyleType: string
    itemCount: number
    itemMarginTop: string | null
}

async function openHeadingMenu(page: import('@playwright/test').Page) {
    await page.goto(PAGE, { waitUntil: 'domcontentloaded' })
    const trigger = page.locator(DROPDOWN_TRIGGER).first()
    await expect(trigger, 'RichTextEditor 工具条应含「标题」下拉触发器').toBeVisible()
    await trigger.click()
    const menu = page.locator(`${MENU}:visible`).first()
    await expect(menu, '点击「标题」后应出现可见的下拉菜单').toBeVisible()
    return menu
}

test('RichTextEditor 工具条下拉菜单不受文档站正文列表排版影响', async ({ page }) => {
    const menu = await openHeadingMenu(page)

    const styles = await menu.evaluate((element) => {
        const s = getComputedStyle(element)
        const items = element.querySelectorAll('.md-editor-menu-item')
        // `.vp-doc li + li`（0-1-1）只命中第二个及之后的兄弟项，故取样第二项才能使该断言具判别力
        const second = items.length > 1 ? items[1] : null
        return {
            inProse: element.closest('.vp-doc') !== null,
            paddingLeft: s.paddingLeft,
            paddingRight: s.paddingRight,
            paddingTop: s.paddingTop,
            paddingBottom: s.paddingBottom,
            marginTop: s.marginTop,
            marginBottom: s.marginBottom,
            listStyleType: s.listStyleType,
            itemCount: items.length,
            itemMarginTop: second ? getComputedStyle(second).marginTop : null,
        } satisfies MenuStyles
    })

    // 前置守卫：菜单必须在 `.vp-doc` 内；若菜单被子树移出正文（teleport / 重构），本用例即失去判别力
    expect(styles.inProse, '菜单子树应位于 .vp-doc 内（否则本用例失去判别力）').toBe(true)

    // 内核形态（隔离规则生效）：菜单内边距 / 纵向外边距归零、列表样式复位
    expect(styles.paddingLeft, '菜单左侧不得出现文档站正文列表的 1.25rem 留白').toBe('0px')
    expect(styles.paddingRight, '菜单右侧内边距应归零').toBe('0px')
    expect(styles.paddingTop, '菜单纵向内边距应归零').toBe('0px')
    expect(styles.paddingBottom, '菜单纵向内边距应归零').toBe('0px')
    expect(styles.marginTop, '菜单纵向外边距应归零').toBe('0px')
    expect(styles.marginBottom, '菜单纵向外边距应归零').toBe('0px')
    expect(styles.listStyleType, '菜单项列表样式应复位为 none').toBe('none')
    // 第二项存在是「相邻项间距」断言的前提（`li + li` 只作用于第二个起）
    expect(styles.itemCount, '下拉菜单应至少有 2 个菜单项（否则相邻项间距断言失去判别力）').toBeGreaterThanOrEqual(2)
    expect(styles.itemMarginTop, '相邻菜单项不得出现文档站 `.vp-doc li + li` 的 8px 间距').toBe('0px')
})
