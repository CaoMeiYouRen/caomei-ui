import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { expect, test as base } from '@playwright/test'
import { WHEEL_SCROLL_IGNORE_MS } from '../../src/components/time-picker/utils'

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
const WHEEL = '#time-picker-wheel'
const WHEEL_VALUE = '#time-picker-wheel-value'
const BOTH = '#time-picker-both'
const BOTH_VALUE = '#time-picker-both-value'
const PANEL = '.caomei-time-picker__content'

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

test('wheel 模式：打开弹层点击分钟并回写，Esc 关闭', async ({ page }) => {
    await page.locator(WHEEL).scrollIntoViewIfNeeded()
    await expect(page.locator(`${WHEEL} .caomei-time-picker__wheel-text`)).toHaveText('09:30:00')

    await page.locator(`${WHEEL} .caomei-time-picker__field--wheel`).click()
    const panel = page.locator(PANEL)
    await expect(panel).toBeVisible()
    await expect(panel.locator('[role="listbox"]')).toHaveCount(3)

    // 窄屏收敛：面板不得横向越出视口（Reka 的 available-width 上限在这里生效）。
    const panelBox = await panel.boundingBox()
    const viewport = page.viewportSize()
    if (!panelBox || !viewport) {
        throw new Error('面板或视口缺少几何信息，无法验证窄屏收敛')
    }
    expect(panelBox.x, '面板左边界不得越出视口').toBeGreaterThanOrEqual(0)
    expect(panelBox.x + panelBox.width, '面板右边界不得越出视口').toBeLessThanOrEqual(viewport.width + 1)

    const minute = panel.locator('[role="listbox"][aria-label="分"]')
    await minute.getByRole('option', { name: '45', exact: true }).click()
    await expect(page.locator(WHEEL_VALUE)).toContainText('09:45:00')

    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
    await expect(page.locator(`${WHEEL} .caomei-time-picker__field--wheel`), '关闭后焦点应回到触发器').toBeFocused()
})

test('wheel 模式：键盘按列表方向调整并回写', async ({ page }) => {
    await page.locator(WHEEL).scrollIntoViewIfNeeded()
    await page.locator(`${WHEEL} .caomei-time-picker__field--wheel`).click()
    const hour = page.locator(`${PANEL} [role="listbox"][aria-label="时"]`)
    await hour.focus()
    await page.keyboard.press('ArrowUp')
    await expect(page.locator(WHEEL_VALUE), '↑ 应移动到上一条（09 → 08）').toContainText('08:30:00')
    await page.keyboard.press('ArrowDown')
    await expect(page.locator(WHEEL_VALUE), '↓ 应回到下一条').toContainText('09:30:00')
})

test('wheel 模式：滚动停止后回写最近选项', async ({ page }) => {
    await page.locator(WHEEL).scrollIntoViewIfNeeded()
    await page.locator(`${WHEEL} .caomei-time-picker__field--wheel`).click()
    const minute = page.locator(`${PANEL} [role="listbox"][aria-label="分"]`)
    const optionHeight = await minute.locator('[role="option"]').first()
        .evaluate((element) => element.getBoundingClientRect().height)
    // 等初始程序化对齐的忽略窗口结束，再模拟用户滚动（窗口常量与实现共用，避免魔数漂移）。
    await page.waitForTimeout(WHEEL_SCROLL_IGNORE_MS + 50)
    await minute.evaluate((element, top) => {
        element.scrollTop = top
    }, optionHeight * 50)
    await expect(page.locator(WHEEL_VALUE)).toContainText('09:50:00')
})

/**
 * 覆盖边界：仅扫 `wcag2a` / `wcag2aa`（不含 `best-practice`，如 `aria-allowed-role`）；
 * 只覆盖默认亮色主题（暗色由视觉基线承担）；本用例在 E2E 链，不在 `test/a11y` / `governance:check` 内。
 */
test('wheel 面板打开态无 WCAG A/AA axe 违规', async ({ page }) => {
    await page.locator(WHEEL).scrollIntoViewIfNeeded()
    await page.locator(`${WHEEL} .caomei-time-picker__field--wheel`).click()
    await expect(page.locator(PANEL)).toBeVisible()
    await page.addScriptTag({ content: AXE_SOURCE })

    const violations = await page.evaluate(async (panel) => {
        const runner = (window as unknown as AxeRunner).axe
        const result = await runner.run(panel, { runOnly: ['wcag2a', 'wcag2aa'] })
        return result.violations.flatMap((violation) =>
            violation.nodes.map((node) => `${violation.id}: ${node.target.join(' ')} ${node.html}`))
    }, PANEL)
    expect(violations).toEqual([])
})

test('both 模式：保留输入并可从滚轮入口打开', async ({ page }) => {
    await page.locator(BOTH).scrollIntoViewIfNeeded()
    await expect(page.locator(`${BOTH} input[aria-label="时"]`)).toHaveValue('9')
    await page.locator(`${BOTH} .caomei-time-picker__wheel-trigger`).click()
    await expect(page.locator(PANEL)).toBeVisible()

    const hour = page.locator(`${PANEL} [role="listbox"][aria-label="时"]`)
    await hour.getByRole('option', { name: '11', exact: true }).click()
    await expect(page.locator(BOTH_VALUE)).toContainText('11:30:00')
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
