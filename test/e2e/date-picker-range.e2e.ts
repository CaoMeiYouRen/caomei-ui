import { expect, test as base, type Page } from '@playwright/test'

/**
 * DatePicker `selectionMode="range"` 常驻回归（真实浏览器）。
 *
 * 覆盖 E2E 验收：区间选择、清空、键盘两端确定、可访问名与面板端点属性。
 * 夹具 `#panel-date-picker-range` 以 2026-09 初始区间固定面板月份，避免系统时钟漂移。
 */

const SECTION = '#panel-date-picker-range'
const TRIGGER = `${SECTION} .caomei-date-picker`
const PANEL = '.caomei-date-picker__content'
const START = '2026-09-10'
const END = '2026-09-20'

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

async function open(page: Page): Promise<void> {
    await page.locator(TRIGGER).click()
    await expect(page.locator(PANEL)).toBeVisible()
}

function day(page: Page, value: string) {
    return page.locator(`${PANEL} [data-value='${value}']`)
}

test('区间选择：起点 + 终点后收起并显示区间文本', async ({ page }) => {
    await open(page)

    await day(page, START).hover()
    await day(page, START).click()
    await expect(page.locator(TRIGGER)).toHaveAttribute('aria-expanded', 'true')

    await day(page, END).hover()
    await day(page, END).click()

    await expect(page.locator(TRIGGER)).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator(TRIGGER)).toContainText('26-09-10 – 26-09-20')

    // 再次展开：端点属性与区间带仍在（受控模型 → 面板回读）
    await open(page)
    await expect(day(page, START)).toHaveAttribute('data-selection-start', 'true')
    await expect(day(page, END)).toHaveAttribute('data-selection-end', 'true')
    await expect(day(page, '2026-09-15')).toHaveAttribute('data-selected', 'true')
})

test('清空：同一天作为两端时再次点击取消区间', async ({ page }) => {
    await open(page)

    // 完整区间下点击起点 → 重新以该点为起点；再点同一天 → 单日区间（收起）
    await day(page, START).click()
    await day(page, START).hover()
    await day(page, START).click()
    await expect(page.locator(TRIGGER)).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator(TRIGGER)).toContainText('26-09-10 – 26-09-10')

    // 已选单日区间时再次点击该日 → 清空
    await open(page)
    await day(page, START).click()
    await expect(page.locator(TRIGGER)).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator(TRIGGER)).not.toContainText('–')

    await open(page)
    await expect(page.locator(`${PANEL} [data-selection-start]`)).toHaveCount(0)
})

test('键盘：方向键移动焦点并用 Enter 确定两端', async ({ page }) => {
    await open(page)

    // 10 聚焦 → 右移到 11 并定为起点 → 右移到 12 并定为终点
    await day(page, START).focus()
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')

    await expect(page.locator(TRIGGER)).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator(TRIGGER)).toContainText('26-09-11 – 26-09-12')
})

test('可访问名：可见区间文本 + 开始 / 结束语义，且不被 aria-label 覆盖', async ({ page }) => {
    const trigger = page.locator(TRIGGER)
    await expect(trigger).not.toHaveAttribute('aria-label', /.+/u)
    // 真实 accname：可见区间文本 + 触发器内隐藏的开始 / 结束语义
    await expect(trigger).toHaveAccessibleName(/26-09-01 – 26-09-07.*开始.*结束/u)

    // 面板（role=dialog）的名字来自 aria-labelledby 指向的触发器（默认路径不悬空）
    await open(page)
    await expect(page.locator(PANEL)).toHaveRole('dialog')
    await expect(page.locator(PANEL)).toHaveAccessibleName(/26-09-01 – 26-09-07/u)
    await expect(page.locator(`${PANEL} .caomei-calendar`)).toHaveAttribute('aria-label', /日历/u)
})
