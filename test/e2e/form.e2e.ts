import { expect, test } from '@playwright/test'

/**
 * 表单组合层的提交与错误态（见 docs/design/governance/2026-11-04-phase27-m2-2-form-docs-and-counts.md）。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#form` section；`CaomeiForm` 恒 `preventDefault()`，
 * 由 `onSubmitForm` 记录提交结果，因此断言落在 `#form-submitted` 与错误的 `aria-*` 上。
 */

test.describe('表单编排', () => {
    test('空名称提交展示错误态并标记 aria-invalid', async ({ page }) => {
        await page.goto('/')

        const input = page.locator('#form .caomei-input input')
        await expect(page.locator('#form-submitted')).toHaveText('未提交')

        await page.locator('#form button[type="submit"]').click()

        const error = page.locator('#form .caomei-form-item__error')
        await expect(error).toBeVisible()
        await expect(error).toHaveAttribute('role', 'alert')
        await expect(error).toHaveText('名称不能为空')
        await expect(input).toHaveAttribute('aria-invalid', 'true')

        const describedBy = await input.getAttribute('aria-describedby')
        const describedIds = describedBy?.split(' ') ?? []
        expect(describedIds).toHaveLength(2)
        await expect(page.locator(`#${describedIds[0]}`)).toHaveText('请输入名称')
        await expect(page.locator(`#${describedIds[1]}`)).toHaveText('名称不能为空')
        await expect(page.locator('#form-submitted')).toHaveText('已提交：（空）')
    })

    test('补全名称后提交无错误态，提交结果包含名称', async ({ page }) => {
        await page.goto('/')

        const input = page.locator('#form .caomei-input input')
        await input.fill('草梅')
        await page.locator('#form button[type="submit"]').click()

        await expect(page.locator('#form .caomei-form-item__error')).toHaveCount(0)
        await expect(input).not.toHaveAttribute('aria-invalid')
        await expect(page.locator('#form-submitted')).toHaveText('已提交：草梅')
    })

    test('组型字段与 Switch 的可访问名、描述引用接线', async ({ page }) => {
        await page.goto('/')

        const group = page.locator('#form .caomei-checkbox-group')
        const groupLabelledBy = await group.getAttribute('aria-labelledby')
        const groupDescribedBy = await group.getAttribute('aria-describedby')
        await expect(page.locator(`#${groupLabelledBy}`)).toHaveText('角色')
        await expect(page.locator(`#${groupDescribedBy}`)).toHaveText('组型控件用 aria-labelledby')

        const switchControl = page.locator('#form [role="switch"]')
        const switchLabelledBy = await switchControl.getAttribute('aria-labelledby')
        const switchDescribedBy = await switchControl.getAttribute('aria-describedby')
        await expect(page.locator(`#${switchLabelledBy}`)).toHaveText('通知')
        await expect(page.locator(`#${switchDescribedBy}`)).toHaveText('Switch 没有校验状态通道')
        await expect(switchControl).not.toHaveAttribute('aria-invalid')

        const select = page.locator('#form .caomei-select')
        const selectLabelledBy = await select.getAttribute('aria-labelledby')
        await expect(page.locator(`#${selectLabelledBy}`)).toHaveText('水果')
    })
})

/**
 * 内建校验（`validate` / `errors`）的真实浏览器路径，夹具见 `#form-builtin`。
 *
 * 覆盖单测无法取证的浏览器行为：提交被拦下时焦点落到首个无效字段、
 * 服务端错误回填后再次输入即让位。
 */
test.describe('内建校验', () => {
    test('必填未通过时阻止提交并聚焦首个无效字段', async ({ page }) => {
        await page.goto('/')

        await expect(page.locator('#form-builtin-log')).toHaveText('未提交')
        await page.locator('#form-builtin button[type="submit"]').click()

        await expect(page.locator('#form-builtin-log')).toHaveText('未提交')

        const error = page.locator('#form-builtin .caomei-form-item__error')
        await expect(error).toHaveCount(1)
        await expect(error).toHaveAttribute('role', 'alert')
        await expect(error).toHaveText('名称不能为空')

        const input = page.locator('#form-builtin .caomei-input input').first()
        await expect(input).toBeFocused()
        await expect(input).toHaveAttribute('aria-invalid', 'true')

        // hint 与 error 都在 aria-describedby 内，且各自可解析
        const describedBy = await input.getAttribute('aria-describedby')
        const describedIds = describedBy?.split(' ') ?? []
        expect(describedIds).toHaveLength(2)
        await expect(page.locator(`#${describedIds[0]}`)).toHaveText('必填；提交时校验')
        await expect(page.locator(`#${describedIds[1]}`)).toHaveText('名称不能为空')
    })

    test('校验通过后提交，服务端错误在再次输入时让位', async ({ page }) => {
        await page.goto('/')

        await page.locator('#form-builtin .caomei-input input').first().fill('草梅')
        await page.locator('#form-builtin button[type="submit"]').click()

        await expect(page.locator('#form-builtin-log')).toHaveText('已提交：草梅')

        const emailError = page.locator('#form-builtin .caomei-form-item__error')
        await expect(emailError).toHaveCount(1)
        await expect(emailError).toHaveText('邮箱已被占用')

        const emailInput = page.locator('#form-builtin .caomei-input input').nth(1)
        await emailInput.fill('a@b.c')
        await expect(page.locator('#form-builtin .caomei-form-item__error')).toHaveCount(0)
    })
})
