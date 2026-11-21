import { expect, test } from '@playwright/test'

/**
 * Popconfirm 的真实浏览器回归：键盘确认 / 取消、外部点击、焦点归还、加载与禁用态。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#popconfirm`。
 */

const BASIC = '#popconfirm-basic'
const DANGER = '#popconfirm-danger'
const LOADING = '#popconfirm-loading'
const DISABLED = '#popconfirm-disabled'
const LOG = '#popconfirm-log'
const PANEL = '.caomei-popover__content'

test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('#popconfirm').scrollIntoViewIfNeeded()
})

test('点击触发按钮展开面板，Enter 确认并归还焦点', async ({ page }) => {
    const trigger = page.locator(`${BASIC} button`).first()
    await trigger.click()

    const panel = page.locator(PANEL)
    await expect(panel).toBeVisible()
    await expect(panel).toContainText('删除该项目？')
    await expect(panel).toContainText('删除后无法恢复，请确认。')

    const confirm = panel.getByRole('button', { name: '确定' })
    await expect(confirm).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator(LOG)).toHaveText('confirmed')
    await expect(panel).toBeHidden()
    await expect(trigger).toBeFocused()
})

test('取消按钮与 Esc 都回写取消状态', async ({ page }) => {
    const trigger = page.locator(`${BASIC} button`).first()
    await trigger.click()
    await page.getByRole('button', { name: '取消' }).click()
    await expect(page.locator(LOG)).toHaveText('cancelled')

    await trigger.click()
    await page.keyboard.press('Escape')
    await expect(page.locator(LOG)).toHaveText('cancelled')
    await expect(trigger).toBeFocused()
})

test('点击面板外部关闭并抛出取消', async ({ page }) => {
    await page.locator(`${BASIC} button`).first().click()
    await expect(page.locator(PANEL)).toBeVisible()

    await page.mouse.click(5, 5)
    await expect(page.locator(PANEL)).toBeHidden()
    await expect(page.locator(LOG)).toHaveText('cancelled')
})

test('危险语气使用危险确认按钮与自定义文案', async ({ page }) => {
    await page.locator(`${DANGER} button`).first().click()
    const panel = page.locator(PANEL)
    await expect(panel).toBeVisible()

    const confirm = panel.getByRole('button', { name: '清除' })
    await expect(confirm).toHaveClass(/caomei-button--tone-danger/)
    await expect(panel.getByRole('button', { name: '返回' })).toBeVisible()
})

test('loading 与 disabled 状态阻止操作', async ({ page }) => {
    await page.locator(`${LOADING} button`).first().click()
    const panel = page.locator(PANEL)
    await expect(panel).toBeVisible()
    await expect(panel.locator('.caomei-button').last()).toBeDisabled()
    await expect(panel.locator('.caomei-button').first()).toBeDisabled()

    await page.keyboard.press('Escape')
    const disabledTrigger = page.locator(`${DISABLED} button`).first()
    await expect(disabledTrigger).toBeDisabled()
})
