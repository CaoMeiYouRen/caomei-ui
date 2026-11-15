import { expect, test as base } from '@playwright/test'

/**
 * DataTable 全选作用域（`selectAllScope`）的真实浏览器回归。
 *
 * 判别口径：同一份 5 行数据、每页 2 行、两张表——
 * 1. 默认 `page`：表头全选只选中当前页；翻到第 2 页后表头回到未选、第 2 页行未选中；
 * 2. `all`：表头全选选中全部 5 行；翻到第 2 页后表头仍为选中、第 2 页行均为选中；
 * 3. 两表第 1 页行为一致（避免把「同页」差异误判成作用域差异）。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#data-table-select-all`。
 */

const PAGE_TABLE = '#data-table-select-page'
const ALL_TABLE = '#data-table-select-all-table'
const HEADER_CHECKBOX = 'thead .caomei-data-table__select-cell .caomei-checkbox__control'

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

/** 表头全选框的 aria-checked。 */
function headerChecked(page: import('@playwright/test').Page, selector: string) {
    return page.locator(`${selector} ${HEADER_CHECKBOX}`).getAttribute('aria-checked')
}

/** 当前页各行复选框的 aria-checked 列表。 */
async function rowChecked(page: import('@playwright/test').Page, selector: string): Promise<(string | null)[]> {
    return page.locator(`${selector} tbody .caomei-checkbox__control`).evaluateAll(
        (elements) => elements.map((element) => element.getAttribute('aria-checked')),
    )
}

test('默认 page：全选只作用于当前页，翻页后回到未选', async ({ page }) => {
    const table = page.locator(PAGE_TABLE)
    await table.scrollIntoViewIfNeeded()

    await table.locator(HEADER_CHECKBOX).click()
    expect(await headerChecked(page, PAGE_TABLE), '当前页全选后表头应为选中').toBe('true')
    expect(await rowChecked(page, PAGE_TABLE), '当前页两行应选中').toEqual(['true', 'true'])

    await table.getByRole('button', { name: '下一页' }).click()
    await expect.poll(
        () => headerChecked(page, PAGE_TABLE),
        { message: '翻页后表头应回到未选（作用域不含第 2 页）' },
    ).toBe('false')
    expect(await rowChecked(page, PAGE_TABLE), '第 2 页行不得被第 1 页的全选带选').toEqual(['false', 'false'])
})

test('scope=all：全选覆盖全部行，翻页后仍为选中', async ({ page }) => {
    const table = page.locator(ALL_TABLE)
    await table.scrollIntoViewIfNeeded()

    await table.locator(HEADER_CHECKBOX).click()
    expect(await headerChecked(page, ALL_TABLE), '整表全选后表头应为选中').toBe('true')

    await table.getByRole('button', { name: '下一页' }).click()
    await expect.poll(
        () => headerChecked(page, ALL_TABLE),
        { message: '整表全选后翻页表头仍应为选中' },
    ).toBe('true')
    expect(await rowChecked(page, ALL_TABLE), '第 2 页行应随整表全选而选中').toEqual(['true', 'true'])
})

test('两表第 1 页的全选结果一致（作用域差异只在跨页）', async ({ page }) => {
    await page.locator(PAGE_TABLE).scrollIntoViewIfNeeded()
    await page.locator(`${PAGE_TABLE} ${HEADER_CHECKBOX}`).click()
    await page.locator(`${ALL_TABLE} ${HEADER_CHECKBOX}`).click()
    expect(await rowChecked(page, PAGE_TABLE)).toEqual(await rowChecked(page, ALL_TABLE))
})
