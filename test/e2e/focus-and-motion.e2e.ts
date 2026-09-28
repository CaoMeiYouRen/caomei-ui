import { expect, test as base, type Page } from '@playwright/test'
import { boxOf, clientRectOf, expectBoxWithin } from './helpers/layout'

/**
 * 常驻 E2E 规格 follow-up（见 docs/design/governance/2026-09-28-m4-test-regression.md）。
 *
 * 补齐两处此前「一次性实测 / 无常驻覆盖」的面：
 * 1. **日历日格焦点环**：`:focus-visible` 的 `outline: 2px + offset: 1px`（外扩 3px）必须完整
 *    落在 DatePicker 面板可视区内，不得被面板的 `overflow: auto` 裁切（依据见
 *    `docs/design/governance/2026-09-17-m2-batch3-calendar-baseline.md` §未覆盖项）；
 * 2. **默认动效路径**：本套 E2E 全局以 `reducedMotion: 'reduce'` 运行（几何断言确定性），
 *    代价是默认动效路径失去常驻覆盖（见 `playwright.config.ts` 注释）。本文件以
 *    `no-preference` 描述块补回该路径，并与 `reduce` 分支做**双向**断言（过渡 / 入场动画
 *    在有动效时为非零、在 reduce 下被压平）。
 *
 * 滚动容器 / 键盘聚焦的常驻面已由 `responsive.e2e.ts` 覆盖（54 项），本文件不重复。
 * 每个用例在 mobile / tablet / desktop 三个 project 下各跑一遍（见 `playwright.config.ts`）。
 */

const DATE_PICKER_TRIGGER = '#panel-date-picker .caomei-date-picker'
const DATE_PICKER_PANEL = '.caomei-date-picker__content'
const CALENDAR_DAY = '.caomei-calendar__day'
const SELECT_BUTTON_ITEM = '#wrap-select-button .caomei-select-button__item'

/** 每个用例独立收集 console error / page error，并统一导航（与 responsive.e2e.ts 同构）。 */
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

async function openDatePickerPanel(page: Page) {
    await page.locator(DATE_PICKER_TRIGGER).click()
    const panel = page.locator(DATE_PICKER_PANEL)
    await expect(panel).toBeVisible()
    await expect(panel.locator(CALENDAR_DAY).first()).toBeVisible()
    return panel
}

/** 解析 `transitionDuration` / `animationDuration` 的逗号分隔时长（秒） */
function parseDurations(value: string): number[] {
    return value.split(',').map((part) => Number.parseFloat(part.trim())).filter((n) => !Number.isNaN(n))
}

/**
 * 动效是否已关闭：属性为 `none`（`transition-property` / `animation-name`）**或**所有时长为 0。
 * 兼容两种 reduce 实现通道（`none` 与时长归零），避免断言绑死单一写法。
 */
function isMotionDisabled(property: string, duration: string): boolean {
    return property.trim() === 'none' || parseDurations(duration).every((value) => value === 0)
}

test.describe('日历日格焦点环不被面板裁切', () => {
    test('日格焦点环（含外扩）完整落在面板可视区内', async ({ page }) => {
        const panel = await openDatePickerPanel(page)
        const days = panel.locator(CALENDAR_DAY)
        const count = await days.count()
        expect(count, '面板内应渲染日格').toBeGreaterThan(20)

        // 1) 真实聚焦：今日日格 `tabindex="0"`，可程序化聚焦；**再以键盘方向键交互**使
        //    `:focus-visible` 生效（纯程序化 `focus()` 不命中该伪类），由此读取组件声明的
        //    焦点环外扩量（避免在用例里硬编码 2px / 1px）。
        const today = panel.locator(`${CALENDAR_DAY}[data-today]`).first()
        await expect(today, '面板应渲染今日日格').toHaveCount(1)
        await today.focus()
        await page.keyboard.press('ArrowLeft')
        const ring = await page.evaluate(() => {
            const el = document.activeElement
            if (!el) {
                throw new Error('键盘方向键后应有活动元素')
            }
            const style = getComputedStyle(el)
            return {
                className: String(el.className),
                width: Number.parseFloat(style.outlineWidth) || 0,
                offset: Number.parseFloat(style.outlineOffset) || 0,
                focusVisible: el.matches(':focus-visible'),
            }
        })
        expect(ring.className, '键盘方向键后焦点应仍在日格上').toContain('caomei-calendar__day')
        expect(ring.focusVisible, '日格应以 :focus-visible 聚焦').toBe(true)
        expect(ring.width, '焦点环 outline 宽度应非零').toBeGreaterThan(0)
        expect(ring.offset, '焦点环 outline offset 应非零').toBeGreaterThan(0)

        // 2) 用声明的外扩量校验网格边缘日格的焦点环包络不越出面板可视区（静态几何，
        //    无需逐格聚焦；面板 `overflow: auto` 会裁掉越界部分，故包络必须完整落在 client rect 内）。
        const pad = ring.width + ring.offset
        const panelRect = await clientRectOf(panel)
        for (const index of [0, Math.floor(count / 2), count - 1]) {
            const box = await boxOf(days.nth(index))
            const envelope = {
                x: box.x - pad,
                y: box.y - pad,
                width: box.width + pad * 2,
                height: box.height + pad * 2,
            }
            expectBoxWithin(envelope, panelRect, `日格 #${index} 焦点环包络`)
        }
    })
})

test.describe('默认动效路径（no-preference）', () => {
    test.use({ reducedMotion: 'no-preference' })

    test('SelectButton 项保留非零过渡时长', async ({ page }) => {
        const item = page.locator(SELECT_BUTTON_ITEM).first()
        await expect(item).toBeVisible()
        const durations = parseDurations(await item.evaluate((el) => getComputedStyle(el).transitionDuration))
        expect(durations.length, '应至少解析到一条过渡时长').toBeGreaterThan(0)
        expect(
            durations.every((value) => value > 0),
            `默认动效路径下过渡时长应非零，实测 ${durations.join(', ')}`,
        ).toBe(true)
    })

    test('DatePicker 面板保留非零入场动画时长', async ({ page }) => {
        const panel = await openDatePickerPanel(page)
        const durations = parseDurations(await panel.evaluate((el) => getComputedStyle(el).animationDuration))
        expect(durations.length, '应至少解析到一条动画时长').toBeGreaterThan(0)
        expect(
            durations.every((value) => value > 0),
            `默认动效路径下面板入场动画时长应非零，实测 ${durations.join(', ')}`,
        ).toBe(true)
    })
})

test.describe('reduced-motion 分支（项目默认 reduce）', () => {
    test('SelectButton 项过渡被压平', async ({ page }) => {
        const item = page.locator(SELECT_BUTTON_ITEM).first()
        await expect(item).toBeVisible()
        const style = await item.evaluate((el) => {
            const computed = getComputedStyle(el)
            return { property: computed.transitionProperty, duration: computed.transitionDuration }
        })
        expect(
            isMotionDisabled(style.property, style.duration),
            `reduced-motion 下过渡应被关闭，实测 property=${style.property} duration=${style.duration}`,
        ).toBe(true)
    })

    test('DatePicker 面板入场动画被压平', async ({ page }) => {
        const panel = await openDatePickerPanel(page)
        const style = await panel.evaluate((el) => {
            const computed = getComputedStyle(el)
            return { property: computed.animationName, duration: computed.animationDuration }
        })
        expect(
            isMotionDisabled(style.property, style.duration),
            `reduced-motion 下面板入场动画应被关闭，实测 name=${style.property} duration=${style.duration}`,
        ).toBe(true)
    })
})
