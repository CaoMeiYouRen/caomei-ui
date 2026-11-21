import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { expect, test as base } from '@playwright/test'

const require = createRequire(import.meta.url)
const AXE_SOURCE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')

interface AxeRunner {
    axe: {
        run: (context: string, options: { runOnly: string[] }) => Promise<{
            violations: { id: string, nodes: { target: string[], html: string }[] }[]
        }>
    }
}

/**
 * InputOtp 的真实浏览器回归：逐格输入 / 退格 / 粘贴 / 完成态 / 数字与字母过滤 / 状态属性。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#input-otp`。
 */

const BASIC = '#otp-basic'
const VALUE = '#otp-value'
const COMPLETE = '#otp-complete'
const CELL = '.caomei-input-otp__cell'

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

test('逐格输入、完成事件与退格清除', async ({ page }) => {
    await page.locator(BASIC).scrollIntoViewIfNeeded()
    const cells = page.locator(`${BASIC} ${CELL}`)
    await expect(cells).toHaveCount(4)

    await cells.nth(0).focus()
    await page.keyboard.type('12')
    await expect(page.locator(VALUE)).toHaveText('12')

    await page.keyboard.type('34')
    await expect(page.locator(VALUE)).toHaveText('1234')
    await expect(page.locator(COMPLETE)).toHaveText('1234')

    await page.keyboard.press('Backspace')
    await expect(page.locator(VALUE)).toHaveText('123')
    await expect(cells.nth(2)).toHaveValue('3')
    await expect(cells.nth(3)).toHaveValue('')
})

test('粘贴整串验证码分发到各格', async ({ page }) => {
    await page.locator(BASIC).scrollIntoViewIfNeeded()
    const cells = page.locator(`${BASIC} ${CELL}`)
    await cells.nth(0).focus()

    await page.evaluate((selector) => {
        const input = document.querySelector(selector) as HTMLInputElement | null
        if (!input) {
            throw new Error('未找到验证码输入格')
        }
        const event = new Event('paste', { bubbles: true, cancelable: true }) as Event & {
            clipboardData?: { getData: (type: string) => string }
        }
        Object.defineProperty(event, 'clipboardData', {
            value: { getData: () => '5678' },
        })
        input.dispatchEvent(event)
    }, `${BASIC} ${CELL}`)

    await expect(page.locator(VALUE)).toHaveText('5678')
    await expect(cells.nth(0)).toHaveValue('5')
    await expect(cells.nth(3)).toHaveValue('8')
})

test('numeric 过滤非数字，alphanumeric 保留字母', async ({ page }) => {
    await page.locator(BASIC).scrollIntoViewIfNeeded()
    const basicCell = page.locator(`${BASIC} ${CELL}`).nth(0)
    await basicCell.focus()
    await page.keyboard.type('a')
    await expect(basicCell).toHaveValue('')

    await page.locator('#otp-alpha').scrollIntoViewIfNeeded()
    const alphaCells = page.locator('#otp-alpha .caomei-input-otp__cell')
    await expect(alphaCells.nth(0)).toHaveValue('A')
    await expect(alphaCells.nth(3)).toHaveValue('2')
    await expect(alphaCells.nth(0)).toHaveAttribute('autocomplete', 'one-time-code')
})

test('disabled / readonly / invalid 状态与可访问语义', async ({ page }) => {
    await page.locator('#otp-disabled').scrollIntoViewIfNeeded()
    const disabledCells = page.locator('#otp-disabled .caomei-input-otp__cell')
    await expect(disabledCells.nth(0)).toBeDisabled()
    await expect(disabledCells.nth(0)).toHaveAttribute('aria-label', '验证码第 1 位，共 6 位')

    const readonlyCell = page.locator('#otp-readonly .caomei-input-otp__cell').nth(0)
    await expect(readonlyCell).toHaveAttribute('readonly', '')
    await readonlyCell.focus()
    await page.keyboard.type('9')
    await expect(readonlyCell).toHaveValue('1')
})

test('axe：分组与逐格可访问名不产生违规', async ({ page }) => {
    await page.locator('#input-otp').scrollIntoViewIfNeeded()
    await page.addScriptTag({ content: AXE_SOURCE })
    const result = await page.evaluate((selector) => {
        const { axe } = window as unknown as AxeRunner
        return axe.run(selector, { runOnly: ['button-name', 'aria-allowed-attr', 'aria-required-attr'] })
    }, '#input-otp')

    expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([])
})
