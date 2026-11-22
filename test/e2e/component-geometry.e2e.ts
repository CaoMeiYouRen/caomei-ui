import { expect, test, type Page } from '@playwright/test'

/**
 * 组件尺寸门禁（真实浏览器几何）。
 *
 * 定位：`check:design` 守住静态声明，本套件守住**渲染后的几何结果**，覆盖设计规范中
 * 「对齐 / 对称 / 布局 / 边距 / 内容型默认宽度」这些无法由 CSS 文本可靠推断的约束。
 *
 * 测量对象（夹具 `#component-geometry`）：
 * - TimePicker 三种模式（input / wheel / both）与含秒 / 分钟 / 不补 0 档位；
 * - DatePicker（日期 / 日期时间）；
 * - Select / Input 作为宽度对照。
 *
 * 断言口径：
 * - 同一组件的所有模式字段宽 / 高 / 内边距 / 圆角 / 字号 / 段位宽度与起点一致；
 * - 滚轮入口贴字段右缘（按字段 padding 计算内容盒右缘）；
 * - 弹层以整条字段为锚点，两种滚轮模式的相对位置一致；
 * - 时间 / 日期默认宽度按内容封顶，不继承选择器家族的 20rem；
 * - 禁用态不改变布局尺寸；
 * - 标签与字段间距、左右内边距对称。
 */

const ROOT = '#component-geometry'
const TIME_MODES = {
    input: `${ROOT} #geometry-time-input`,
    wheel: `${ROOT} #geometry-time-wheel`,
    both: `${ROOT} #geometry-time-both`,
} as const

interface BoxMetric {
    x: number
    y: number
    width: number
    height: number
}

interface FieldMetric extends BoxMetric {
    paddingLeft: number
    paddingRight: number
    borderRadius: string
    fontSize: string
    segmentCount: number
    segmentWidths: number[]
    segmentOffsets: number[]
    /** 每个分隔符中心相对字段左缘的偏移 */
    separatorCenters: number[]
    /** 相邻段位盒边界（左段右缘 + 右段左缘的中点） */
    segmentBoundaries: number[]
    labelGap: number | null
}

interface TriggerMetric extends BoxMetric {
    rightInset: number
}

async function measureTimeField(page: Page, rootSelector: string): Promise<FieldMetric> {
    return page.locator(rootSelector).evaluate((root) => {
        const field = root.querySelector<HTMLElement>('.caomei-time-picker__field')
        const label = root.querySelector<HTMLElement>('.caomei-time-picker__label')
        if (!field) {
            throw new Error('缺少 .caomei-time-picker__field')
        }
        const rect = field.getBoundingClientRect()
        const style = getComputedStyle(field)
        const segments = [...field.querySelectorAll<HTMLElement>('.caomei-time-picker__segment')]
        const segmentRects = segments.map((element) => element.getBoundingClientRect())
        const separators = [...field.querySelectorAll<HTMLElement>('.caomei-time-picker__separator')]
        return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            paddingLeft: Number.parseFloat(style.paddingLeft),
            paddingRight: Number.parseFloat(style.paddingRight),
            borderRadius: style.borderRadius,
            fontSize: style.fontSize,
            segmentCount: segments.length,
            segmentWidths: segmentRects.map((segmentRect) => segmentRect.width),
            segmentOffsets: segmentRects.map((segmentRect) => segmentRect.x - rect.x),
            separatorCenters: separators.map((element) => {
                const separatorRect = element.getBoundingClientRect()
                return separatorRect.x + separatorRect.width / 2 - rect.x
            }),
            segmentBoundaries: segmentRects.slice(0, -1).map((segmentRect, index) => {
                const next = segmentRects[index + 1]
                return (segmentRect.right + next.left) / 2 - rect.x
            }),
            labelGap: label ? rect.top - label.getBoundingClientRect().bottom : null,
        }
    })
}

async function measureDateField(page: Page, selector: string): Promise<BoxMetric> {
    return page.locator(selector).evaluate((element) => {
        const rect = element.getBoundingClientRect()
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    })
}

async function measureTrigger(page: Page, selector: string, triggerSelector: string): Promise<TriggerMetric> {
    return page.locator(selector).evaluate((root, innerSelector) => {
        const field = root.querySelector<HTMLElement>('.caomei-time-picker__field')
        const trigger = root.querySelector<HTMLElement>(innerSelector)
        if (!field || !trigger) {
            throw new Error('缺少字段或滚轮入口')
        }
        const fieldRect = field.getBoundingClientRect()
        const triggerRect = trigger.getBoundingClientRect()
        const style = getComputedStyle(field)
        return {
            x: triggerRect.x,
            y: triggerRect.y,
            width: triggerRect.width,
            height: triggerRect.height,
            rightInset: fieldRect.right - Number.parseFloat(style.paddingRight) - triggerRect.right,
        }
    }, triggerSelector)
}

async function openPanel(page: Page, rootSelector: string): Promise<void> {
    const trigger = rootSelector === TIME_MODES.wheel
        ? `${rootSelector} .caomei-time-picker__trigger--fill`
        : `${rootSelector} .caomei-time-picker__wheel-trigger`
    await page.locator(trigger).click()
    await expect(page.locator('.caomei-time-picker__content')).toBeVisible()
}

async function panelDelta(page: Page, rootSelector: string): Promise<{ x: number, y: number }> {
    await openPanel(page, rootSelector)
    const panel = page.locator('.caomei-time-picker__content')
    const metrics = await panel.evaluate((element, root) => {
        const field = document.querySelector<HTMLElement>(`${root} .caomei-time-picker__field`)
        if (!field) {
            throw new Error('缺少字段')
        }
        const panelRect = element.getBoundingClientRect()
        const fieldRect = field.getBoundingClientRect()
        return {
            x: panelRect.x - fieldRect.x,
            y: panelRect.y - fieldRect.bottom,
        }
    }, rootSelector)
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
    return metrics
}

test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator(ROOT).scrollIntoViewIfNeeded()
})

test.describe('组件尺寸门禁', () => {
    test('时间 / 日期默认宽度按内容封顶，不跟随选择器家族 20rem', async ({ page }) => {
        const [input, wheel, both] = await Promise.all([
            measureTimeField(page, TIME_MODES.input),
            measureTimeField(page, TIME_MODES.wheel),
            measureTimeField(page, TIME_MODES.both),
        ])
        const widths = [input.width, wheel.width, both.width]
        expect(Math.max(...widths) - Math.min(...widths), `三模式字段宽度应一致，实测 ${widths.join(' / ')}`).toBeLessThanOrEqual(0.5)
        // 11.5rem = 184px（含秒档）；允许 1px 边框取整。
        expect(widths[0], '默认宽度应为含秒时间的内容宽度').toBeLessThanOrEqual(185)
        expect(widths[0], '默认宽度不应被压到无法展示时分秒').toBeGreaterThanOrEqual(150)

        const minuteOnly = await measureTimeField(page, `${ROOT} #geometry-time-minute`)
        // 8.5rem = 136px；关闭秒后应比含秒档更窄。
        expect(minuteOnly.width, '分钟精度应使用更窄的默认宽度').toBeLessThanOrEqual(137)
        expect(minuteOnly.width).toBeLessThan(widths[0] - 20)

        const twelveHour = await measureTimeField(page, `${ROOT} #geometry-time-12`)
        // 15.25rem = 244px（含秒 + 12 小时制日序）。
        expect(twelveHour.width, '12 小时制应使用含日序的默认宽度').toBeLessThanOrEqual(245)
        expect(twelveHour.width, '12 小时制宽度应大于 24 小时制').toBeGreaterThan(widths[0])

        const date = await measureDateField(page, `${ROOT} #geometry-date`)
        // 12rem = 192px。
        expect(date.width, '日期默认宽度应为日期内容宽度').toBeLessThanOrEqual(193)
        const dateTime = await measureDateField(page, `${ROOT} #geometry-date-time`)
        // 15rem = 240px。
        expect(dateTime.width, '含时间的日期宽度应为日期时间内容宽度').toBeLessThanOrEqual(241)
        expect(dateTime.width).toBeGreaterThan(date.width)

        const month = await measureDateField(page, `${ROOT} #geometry-date-month`)
        // 13rem = 208px（月 / 年粒度档位）。
        expect(month.width, '月份默认宽度应使用粒度档位').toBeLessThanOrEqual(209)
        expect(month.width, '月份宽度应大于日期档位，证明 13rem 档位生效').toBeGreaterThan(date.width)
        const year = await measureDateField(page, `${ROOT} #geometry-date-year`)
        expect(year.width, '年份默认宽度应使用粒度档位').toBeLessThanOrEqual(209)
        expect(year.width, '年份宽度应大于日期档位，证明 13rem 档位生效').toBeGreaterThan(date.width)

        const select = await measureDateField(page, `${ROOT} #geometry-select`)
        expect(select.width, '选择器仍保持 20rem 上限作为对照').toBeGreaterThanOrEqual(319)
        expect(widths[0], '时间选择器应明显窄于普通选择器').toBeLessThan(select.width - 100)
    })

    test('三种模式的字段高度 / 内边距 / 圆角 / 段位布局一致', async ({ page }) => {
        const metrics = await Promise.all(
            Object.values(TIME_MODES).map((selector) => measureTimeField(page, selector)),
        )
        const [base] = metrics

        for (const [index, metric] of metrics.entries()) {
            const label = Object.keys(TIME_MODES)[index]
            expect(metric.height, `${label}: 字段高度应与输入模式一致`).toBeCloseTo(base.height, 0)
            expect(metric.paddingLeft, `${label}: 左内边距应一致`).toBeCloseTo(base.paddingLeft, 0)
            expect(metric.paddingRight, `${label}: 右内边距应一致`).toBeCloseTo(base.paddingRight, 0)
            expect(metric.paddingLeft, `${label}: 左右内边距应对称`).toBeCloseTo(metric.paddingRight, 0)
            expect(metric.borderRadius, `${label}: 圆角应一致`).toBe(base.borderRadius)
            expect(metric.fontSize, `${label}: 字号应一致`).toBe(base.fontSize)
            expect(metric.segmentCount, `${label}: 段位数量应一致（时 / 分 / 秒）`).toBe(base.segmentCount)
            expect(metric.segmentWidths, `${label}: 段位宽度应一致`).toHaveLength(base.segmentWidths.length)
            for (const [segmentIndex, width] of metric.segmentWidths.entries()) {
                expect(width, `${label}: 第 ${segmentIndex + 1} 段宽度应一致`).toBeCloseTo(base.segmentWidths[segmentIndex], 0)
            }
            for (const [segmentIndex, offset] of metric.segmentOffsets.entries()) {
                expect(offset, `${label}: 第 ${segmentIndex + 1} 段起点应一致`).toBeCloseTo(base.segmentOffsets[segmentIndex], 0)
            }
            expect(metric.labelGap, `${label}: 标签与字段间距应一致`).toBeCloseTo(base.labelGap ?? 0, 0)
            expect(metric.labelGap, `${label}: 标签与字段间距应取 space-1（4px）`).toBeCloseTo(4, 0)
            expect(metric.separatorCenters, `${label}: 分隔符数量应与段位匹配`).toHaveLength(metric.segmentCount - 1)
            for (const [separatorIndex, center] of metric.separatorCenters.entries()) {
                expect(
                    Math.abs(center - metric.segmentBoundaries[separatorIndex]),
                    `${label}: 第 ${separatorIndex + 1} 个冒号应落在相邻数字正中间`,
                ).toBeLessThanOrEqual(0.5)
            }
        }
    })

    test('滚轮入口贴字段右缘，两种滚轮模式一致', async ({ page }) => {
        const wheelArrow = await measureTrigger(page, TIME_MODES.wheel, '.caomei-time-picker__wheel-icon')
        expect(wheelArrow.rightInset, '滚轮箭头右缘应贴字段内容盒右缘').toBeLessThanOrEqual(1)
        expect(wheelArrow.rightInset).toBeGreaterThanOrEqual(-1)

        const bothTrigger = await measureTrigger(page, TIME_MODES.both, '.caomei-time-picker__wheel-trigger')
        expect(bothTrigger.rightInset, '输入 + 滚轮入口右缘应贴字段内容盒右缘').toBeLessThanOrEqual(1)
        expect(bothTrigger.rightInset).toBeGreaterThanOrEqual(-1)
        expect(bothTrigger.width, '输入 + 滚轮入口应有可点击尺寸').toBeGreaterThanOrEqual(24)
    })

    test('弹层以整条字段为锚点，两种滚轮模式的相对位置一致', async ({ page }) => {
        const wheelDelta = await panelDelta(page, TIME_MODES.wheel)
        const bothDelta = await panelDelta(page, TIME_MODES.both)

        expect(Math.abs(wheelDelta.x), '滚轮模式弹层应与字段左缘对齐').toBeLessThanOrEqual(1)
        expect(Math.abs(bothDelta.x), '输入 + 滚轮模式弹层应与字段左缘对齐').toBeLessThanOrEqual(1)
        expect(wheelDelta.x, '两种模式的水平偏移应一致').toBeCloseTo(bothDelta.x, 0)
        expect(wheelDelta.y, '两种模式的垂直偏移应一致').toBeCloseTo(bothDelta.y, 0)
    })

    test('表单控件高度与圆角遵守字段外壳规范', async ({ page }) => {
        const selectors = [
            `${ROOT} .caomei-input`,
            `${ROOT} .caomei-input-number`,
            `${ROOT} #geometry-select`,
            `${ROOT} #geometry-date`,
            `${ROOT} #geometry-time-input .caomei-time-picker__field`,
            `${ROOT} .caomei-button`,
        ]
        const metrics = await Promise.all(selectors.map((selector) => page.locator(selector).evaluate((element) => {
            const rect = element.getBoundingClientRect()
            const style = getComputedStyle(element)
            return { height: rect.height, radius: style.borderRadius }
        })))
        for (const [index, metric] of metrics.entries()) {
            expect(metric.height, `${selectors[index]} 高度应取 control-height-md（36px）`).toBeCloseTo(36, 0)
            expect(metric.radius, `${selectors[index]} 圆角应取 radius-md，基准 ${metrics[0].radius}`).toBe(metrics[0].radius)
        }
    })

    test('禁用态不改变布局尺寸', async ({ page }) => {
        const enabled = await measureTimeField(page, TIME_MODES.input)
        const disabled = await measureTimeField(page, `${ROOT} #geometry-time-disabled`)

        expect(disabled.width).toBeCloseTo(enabled.width, 0)
        expect(disabled.height).toBeCloseTo(enabled.height, 0)
        expect(disabled.paddingLeft).toBeCloseTo(enabled.paddingLeft, 0)
        expect(disabled.segmentOffsets).toHaveLength(enabled.segmentOffsets.length)
        for (const [index, offset] of disabled.segmentOffsets.entries()) {
            expect(offset, `第 ${index + 1} 段起点不应因禁用变化`).toBeCloseTo(enabled.segmentOffsets[index], 0)
        }
    })

    test('窄屏下字段不超出宿主，标签与字段不横向溢出', async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 800 })
        await page.locator(ROOT).scrollIntoViewIfNeeded()
        const result = await page.locator(ROOT).evaluate((root) => {
            const fields = [...root.querySelectorAll<HTMLElement>('.caomei-time-picker__field, .caomei-date-picker')]
            return fields.map((field) => {
                const rect = field.getBoundingClientRect()
                return {
                    left: rect.left,
                    right: rect.right,
                    scrollWidth: field.scrollWidth,
                    clientWidth: field.clientWidth,
                }
            })
        })
        for (const field of result) {
            expect(field.left).toBeGreaterThanOrEqual(-1)
            expect(field.right).toBeLessThanOrEqual(321)
            expect(field.scrollWidth, '字段内容不得横向溢出').toBeLessThanOrEqual(field.clientWidth + 1)
        }
    })

    test('几何快照留档', async ({ page }, testInfo) => {
        const screenshot = await page.locator(ROOT).screenshot()
        await testInfo.attach('component-geometry.png', {
            body: screenshot,
            contentType: 'image/png',
        })
    })
})
