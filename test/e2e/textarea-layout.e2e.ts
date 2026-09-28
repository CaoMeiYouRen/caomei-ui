import { expect, test as base } from '@playwright/test'
import { boxOf, expectBoxWithin, TOLERANCE } from './helpers/layout'

/**
 * Textarea 字段几何的常驻回归（依据见 `docs/standards/testing.md` §5：几何断言只由 Playwright 承担）。
 *
 * 覆盖两类回归：
 * 1. **字段高度随 `rows` 撑开**：共享外壳基类（`.caomei-field`）的 `height` 是单行控件高度，
 *    多行控件若沿用会与内部 `<textarea>` 的行数高度脱节 —— 控件跑到边框外，文本与滚动条溢出圆角。
 *    断言「内部控件完整落在字段边框内」即可拦住该回归，且不依赖具体像素值。
 * 2. **折行时滚动发生在框内**：内容超过 `rows` 时控件自身滚动（`scrollHeight > clientHeight`），
 *    控件几何保持不变、仍在边框内。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#textarea-layout`；每个用例在
 * mobile / tablet / desktop 三个 project 下各跑一遍（见 `playwright.config.ts`）。
 */

const ROWS_2 = '#textarea-rows-2 .caomei-textarea'
const ROWS_4 = '#textarea-rows-4 .caomei-textarea'
const OVERFLOW = '#textarea-overflow .caomei-textarea'

/** 每个用例独立收集 console error / page error，并统一导航（与 `responsive.e2e.ts` 同构）。 */
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

for (const [label, selector] of [['两行', ROWS_2], ['四行', ROWS_4], ['折行溢出', OVERFLOW]] as const) {
    test(`${label}文本域的控件完整落在字段边框内`, async ({ page }) => {
        const wrapper = page.locator(selector)
        const control = wrapper.locator('textarea')

        await expect(control).toBeVisible()

        expectBoxWithin(await boxOf(control), await boxOf(wrapper), `${label}文本域控件`)
    })
}

test('字段高度随 rows 撑开（四行高于两行）', async ({ page }) => {
    const rows2 = await boxOf(page.locator(ROWS_2))
    const rows4 = await boxOf(page.locator(ROWS_4))

    // 高度若固定为单行控件高度，rows 增加不会改变字段高度
    expect(rows4.height, '四行文本域应高于两行文本域').toBeGreaterThan(rows2.height + TOLERANCE)
})

test('折行超出 rows 时在框内滚动，控件几何不越界', async ({ page }) => {
    const wrapper = page.locator(OVERFLOW)
    const control = wrapper.locator('textarea')
    const [wrapperBox, controlBox] = await Promise.all([boxOf(wrapper), boxOf(control)])

    // 内容确已超出可见行数：滚动发生在控件内部，而非把控件撑出边框
    const overflow = await control.evaluate((element) => {
        const textarea = element as HTMLTextAreaElement
        return { scrollHeight: textarea.scrollHeight, clientHeight: textarea.clientHeight }
    })
    expect(overflow.scrollHeight, '折行内容应超出可见行数').toBeGreaterThan(overflow.clientHeight + TOLERANCE)

    expectBoxWithin(controlBox, wrapperBox, '折行溢出的文本域控件')

    // 滚动不改变控件几何：仍与同档 rows=2 的控件等高
    const rows2Control = await boxOf(page.locator(`${ROWS_2} textarea`))
    expect(Math.abs(controlBox.height - rows2Control.height), '溢出滚动不应改变控件高度').toBeLessThanOrEqual(TOLERANCE)
})
