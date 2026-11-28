import { expect, test } from '@playwright/test'

/**
 * 行内编辑的真实浏览器回归（常驻）。
 *
 * 覆盖：聚焦进入编辑并接管焦点、回车提交回写、`Esc` 回退、失焦提交（单测受 happy-dom 限制
 * 无法覆盖 `focusout` + `relatedTarget` 路径）、只读与禁用。
 *
 * 判定一律落在可观察结果：输入框可见性与值、预览文本、夹具输出的模型值 / 提交值。
 */

const ROOT = '#panel-editable'
const PREVIEW = `${ROOT} .caomei-editable__preview`
const INPUT = `${ROOT} .caomei-editable__input`
const VALUE_OUT = '#editable-value'
const SUBMITTED_OUT = '#editable-submitted'

test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator(PREVIEW)).toBeVisible()
})

test('聚焦预览进入编辑并把焦点交给输入框', async ({ page }) => {
    await page.locator(PREVIEW).focus()

    const input = page.locator(INPUT)
    await expect(input).toBeVisible()
    await expect(input).toBeFocused()
    await expect(input).toHaveValue('季度经营分析')
})

test('回车提交回写模型并派发 submit', async ({ page }) => {
    await page.locator(PREVIEW).focus()
    const input = page.locator(INPUT)
    await expect(input).toBeVisible()

    await input.fill('改后的标题')
    await input.press('Enter')

    await expect(input).toBeHidden()
    await expect(page.locator(PREVIEW)).toHaveText('改后的标题')
    await expect(page.locator(VALUE_OUT)).toHaveText('改后的标题')
    await expect(page.locator(SUBMITTED_OUT)).toHaveText('改后的标题')
})

test('Esc 回退，不写回中间输入也不派发 submit', async ({ page }) => {
    await page.locator(PREVIEW).focus()
    const input = page.locator(INPUT)
    await expect(input).toBeVisible()

    await input.fill('不该保存的输入')
    await input.press('Escape')

    await expect(input).toBeHidden()
    await expect(page.locator(PREVIEW)).toHaveText('季度经营分析')
    await expect(page.locator(SUBMITTED_OUT)).toBeEmpty()
})

test('失焦提交（submitMode=enter 时不提交）', async ({ page }) => {
    await page.locator(PREVIEW).focus()
    const input = page.locator(INPUT)
    await expect(input).toBeVisible()

    await input.fill('失焦不提交')
    // 焦点离开编辑区：submitMode 为 enter，失焦只退出编辑、不写回
    await page.locator('#panel-multi-select').click()

    await expect(input).toBeHidden()
    await expect(page.locator(VALUE_OUT)).toHaveText('季度经营分析')
    await expect(page.locator(SUBMITTED_OUT)).toBeEmpty()
})

test('只读：可进入编辑查看，但不接受输入、不写回', async ({ page }) => {
    const root = '#panel-editable-readonly'
    await page.locator(`${root} .caomei-editable__preview`).focus()

    const input = page.locator(`${root} .caomei-editable__input`)
    await expect(input).toBeVisible()
    await expect(input).toHaveAttribute('readonly', '')
    await expect(input).toHaveValue('只读标题')

    await input.press('Enter')
    await expect(page.locator(`${root} .caomei-editable__preview`)).toHaveText('只读标题')
    await expect(page.locator('#editable-readonly-value')).toHaveText('只读标题')
})

test('禁用：输入框 disabled，值不可改', async ({ page }) => {
    const root = '#panel-editable-disabled'
    const preview = page.locator(`${root} .caomei-editable__preview`)
    await expect(preview).toBeVisible()

    const disabledState = await page.evaluate((selector) => {
        const element = document.querySelector(selector)?.querySelector('.caomei-editable')
        return element?.hasAttribute('data-disabled') ?? null
    }, root)
    expect(disabledState, '禁用根节点带 data-disabled').toBe(true)

    await preview.focus()
    const input = page.locator(`${root} .caomei-editable__input`)
    if (await input.isVisible()) {
        await expect(input).toBeDisabled()
    }
    await expect(page.locator('#editable-disabled-value')).toHaveText('禁用标题')
})
