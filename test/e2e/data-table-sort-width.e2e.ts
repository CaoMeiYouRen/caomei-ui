import { expect, test as base } from '@playwright/test'
import { TOLERANCE } from './helpers/layout'

/**
 * DataTable 排序指示条的列宽稳定性回归。
 *
 * 背景：用户 2026-10-02 报告「点击排序后，排序图标会明显导致排序列的宽度发生变化」。根因：表头排序
 * 指示条（图标 + 多列排序序号）原先**只在排序态渲染**，而表格是 `table-layout: auto`、列宽由内容
 * 决定——未排序时表头内容宽 = 标题，排序后 = 标题 + 图标 + 序号，于是排序列变宽、其余列被压缩。
 * 修复：指示条在所有可排序表头都渲染，未排序时以 `visibility: hidden` 占位（图标 14px + 序号 `1ch`
 * + 两处 `gap`），使三态的表头内容宽逐值一致。
 *
 * 断言分两层：
 * 1. **几何**：`未排序 / 升序 / 降序` 三态下每个 `th` 的宽度一致（容差 1px，吸收子像素取整）；
 * 2. **成因**：排序按钮（表头内容盒）的宽度同样三态一致——即使将来列宽由其它因素固定，这一层
 *    仍能拦住「占位被删掉」的回归。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#data-table-sort-width`；每个用例在 mobile / tablet /
 * desktop 三个 project 下各跑一遍。真实页面的对照取证见 `test-results/data-table-sort-width/`（本地态）。
 */

const TABLE = '#data-table-sort-width .caomei-data-table'

/** 每个用例独立收集 console error / page error，并统一导航（与既有 e2e 同构）。 */
const test = base.extend<{ pageErrors: string[] }>({
    pageErrors: [async ({ page }, use) => {
        const errors: string[] = []
        page.on('console', (message) => {
            if (message.type() === 'error') {
                errors.push(`console.error: ${message.text()}`)
            }
        })
        page.on('pageerror', (error) => {
            errors.push(`pageerror: ${error.message}`)
        })

        await page.goto('/')
        await use(errors)
    }, { auto: true }],
})

test.afterEach(({ pageErrors }) => {
    expect(pageErrors, '页面不得产生 console error').toEqual([])
})

/** 读取各表头列宽与排序按钮内容宽（表头文本含未排序时的空序号占位，故只取可见文本） */
async function measure(page: import('@playwright/test').Page) {
    return page.locator(TABLE).evaluate((table) =>
        Array.from(table.querySelectorAll('thead th')).map((th) => {
            const button = th.querySelector('button')
            const text = button ? button.textContent : th.textContent
            return {
                header: text.trim(),
                ariaSort: th.getAttribute('aria-sort'),
                columnWidth: th.getBoundingClientRect().width,
                buttonWidth: button ? button.getBoundingClientRect().width : 0,
            }
        }),
    )
}

test('排序指示条不改变任何列的宽度（未排序 / 升序 / 降序三态一致）', async ({ page }) => {
    const table = page.locator(TABLE)
    await table.scrollIntoViewIfNeeded()
    await expect(table).toBeVisible()

    const headerButtons = table.locator('thead th button')
    const firstColumn = headerButtons.first()

    const unsorted = await measure(page)
    expect(unsorted.length, '夹具须含可排序列').toBeGreaterThan(0)
    expect(
        unsorted.every((column) => column.ariaSort === 'none'),
        '初始态须为未排序（否则三态对照无判别力）',
    ).toBe(true)
    // 前置条件：未排序态必须已有占位（图标 / 序号盒在位），否则本用例退化为「与自身比较」
    expect(
        await table.locator('.caomei-data-table__sort-icon--reserved').count(),
        '未排序态须渲染占位图标（缺占位即回归）',
    ).toBeGreaterThan(0)

    await firstColumn.click()
    await expect(table.locator('thead th').first(), '第一次点击应为升序').toHaveAttribute('aria-sort', 'ascending')
    const ascending = await measure(page)

    await firstColumn.click()
    await expect(table.locator('thead th').first(), '第二次点击应为降序').toHaveAttribute('aria-sort', 'descending')
    const descending = await measure(page)

    for (const [label, state] of [['升序', ascending], ['降序', descending]] as const) {
        for (let i = 0; i < unsorted.length; i += 1) {
            const before = unsorted[i]
            const after = state[i]
            expect(
                Math.abs(after.columnWidth - before.columnWidth),
                `${label}态下「${before.header}」列宽不得变化（未排序 ${before.columnWidth.toFixed(2)}px → ${label} ${after.columnWidth.toFixed(2)}px）`,
            ).toBeLessThanOrEqual(TOLERANCE)
            expect(
                Math.abs(after.buttonWidth - before.buttonWidth),
                `${label}态下「${before.header}」表头内容宽不得变化（占位被删会在此失败）`,
            ).toBeLessThanOrEqual(TOLERANCE)
        }
    }
})
