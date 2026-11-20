import { expect, test as base } from '@playwright/test'

/**
 * TimePicker 的真实浏览器回归：键盘编辑、12 小时制日序切换与 v-model 回显。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#time-picker`：24 小时制含秒 + 12 小时制 + 受控回显。
 */

const DEFAULT = '#time-picker-default'
const TWELVE = '#time-picker-12'
const HOUR = 'input[aria-label="时"]'
const MINUTE = 'input[aria-label="分"]'
const VALUE = '#time-picker-value'
const VALUE_12 = '#time-picker-12-value'

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

test('方向键调整时间并回写 v-model', async ({ page }) => {
    await page.locator(DEFAULT).scrollIntoViewIfNeeded()
    await expect(page.locator(`${DEFAULT} ${HOUR}`)).toHaveValue('9')
    await expect(page.locator(`${DEFAULT} ${MINUTE}`)).toHaveValue('30')

    await page.locator(`${DEFAULT} ${HOUR}`).focus()
    await page.keyboard.press('ArrowUp')
    await expect(page.locator(`${DEFAULT} ${HOUR}`)).toHaveValue('10')
    await expect(page.locator(VALUE), '受控值应随编辑回写').toContainText('10:30:00')
})

test('12 小时制：显示 1–12 并提供本地化日序切换', async ({ page }) => {
    await page.locator(TWELVE).scrollIntoViewIfNeeded()
    const hour = page.locator(`${TWELVE} ${HOUR}`)
    await expect(hour).toHaveValue('9')
    const options = await page.locator(`${TWELVE} select option`).allTextContents()
    expect(options).toEqual(['上午', '下午'])

    await page.locator(`${TWELVE} select`).selectOption('pm')
    await expect(page.locator(VALUE_12), '切换下午应加 12 小时').toContainText('21:30:00')
    await expect(hour).toHaveValue('9')
})

test('输入分钟并回写受控值', async ({ page }) => {
    await page.locator(DEFAULT).scrollIntoViewIfNeeded()
    const minute = page.locator(`${DEFAULT} ${MINUTE}`)
    await minute.fill('45')
    await minute.blur()
    await expect(page.locator(VALUE)).toContainText('09:45:00')
})

test('宽容器内宽度封顶 20rem，可用 token 放开', async ({ page }) => {
    await page.locator(DEFAULT).scrollIntoViewIfNeeded()
    const capped = await page.locator(DEFAULT).evaluate((host) => {
        host.style.width = '800px'
        const fieldElement = host.querySelector<HTMLElement>('.caomei-time-picker__field')
        return {
            fieldWidth: fieldElement?.getBoundingClientRect().width ?? 0,
            maxWidth: fieldElement ? getComputedStyle(fieldElement).maxWidth : '',
        }
    })
    // 320px = 20rem × 根字号 16px（夹具未覆盖根字号）；若根字号调整，换算值需同步。
    expect(capped.maxWidth, '默认上限应与选择器家族同源（20rem = 320px）').toBe('320px')
    expect(capped.fieldWidth).toBeLessThanOrEqual(321)

    const released = await page.locator(DEFAULT).evaluate((host) => {
        host.style.setProperty('--caomei-time-picker-max-width', 'none')
        return host.querySelector<HTMLElement>('.caomei-time-picker__field')?.getBoundingClientRect().width ?? 0
    })
    expect(released, '覆盖 token 为 none 后应撑满所在列').toBeGreaterThan(700)
})
