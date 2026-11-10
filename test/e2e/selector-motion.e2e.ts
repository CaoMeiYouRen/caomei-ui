import { expect, test as base, type Locator, type Page } from '@playwright/test'
import { sampleTriggeredTimeline, type TimelineResult } from './helpers/motion'

/**
 * 选择器动效（A6）的常驻回归。
 *
 * 覆盖：Select / MultiSelect / AutoComplete 面板入场与关闭、MultiSelect 选中指示器、
 * DatePicker 既有面板入场轴切换、Calendar 日期选中过渡、ColorPicker 手柄 / 色板、
 * SelectButton / ToggleButton 按下反馈；同时验证 `minimal` 不新增动效、`reduce` 压平。
 *
 * Portal 面板继承 `<html data-motion>`；局部容器不穿透（与 `data-density` 同一边界）。
 * 采样统一走 `helpers/motion.ts`（有界帧轮询 + `pause()` + `currentTime`，不使用 `sleep`）。
 */

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
        await page.waitForSelector('#form-motion')
        await use(errors)
    }, { auto: true }],
})

test.use({ reducedMotion: 'no-preference' })

test.afterEach(({ pageErrors }) => {
    expect(pageErrors, '页面不得产生 console error').toEqual([])
})

const SELECT_CONTENT = '.caomei-select__content'
const SELECT_TRIGGER = '#ds-select-default .caomei-select'
const MULTI_CONTENT = '.caomei-multi-select__content'
const MULTI_TRIGGER = '#ds-multi-select-default .caomei-multi-select__input'
const MULTI_ITEM = '.caomei-multi-select__item'
const AUTO_CONTENT = '.caomei-auto-complete__content'
const AUTO_TRIGGER = '#ds-auto-complete-default .caomei-auto-complete__input'
const DATE_CONTENT = '.caomei-date-picker__content'
const DATE_TRIGGER = '#panel-date-picker .caomei-date-picker'
const CALENDAR_DAY = '#calendar-inline .caomei-calendar__day'
const COLOR_TRIGGER = '#fv-color-picker .caomei-color-picker__trigger'
const COLOR_PANEL = '.caomei-color-picker__panel:not(.caomei-color-picker__panel--inline)'
const COLOR_THUMB = `${COLOR_PANEL} .caomei-color-picker__area-thumb`
const COLOR_SWATCH = `${COLOR_PANEL} .caomei-color-picker__swatch`
const SELECT_BUTTON_ITEM = '#ds-select-button-default .caomei-select-button__item'
const TOGGLE_BUTTON = '#ds-toggle-button-default .caomei-toggle-button'

async function useExpressive(page: Page): Promise<void> {
    await page.evaluate(() => {
        document.documentElement.setAttribute('data-motion', 'expressive')
    })
}

function requireTimeline(result: TimelineResult | null, message: string): TimelineResult {
    if (!result) {
        throw new Error(message)
    }
    return result
}

function parseDurations(value: string): number[] {
    return value.split(',').map((part) => Number.parseFloat(part.trim())).filter((n) => !Number.isNaN(n))
}

function computedScale(value: string): number {
    return value.trim() === 'none' ? 1 : Number.parseFloat(value)
}

async function readScale(locator: Locator): Promise<string> {
    return locator.evaluate((element) => getComputedStyle(element).scale)
}

async function openSelect(page: Page): Promise<void> {
    await page.locator(SELECT_TRIGGER).click()
    await expect(page.locator(SELECT_CONTENT)).toBeVisible()
}

async function openMulti(page: Page): Promise<void> {
    await page.locator(MULTI_TRIGGER).click()
    await expect(page.locator(MULTI_CONTENT)).toBeVisible()
}

async function openAuto(page: Page): Promise<void> {
    await page.locator(AUTO_TRIGGER).click()
    await expect(page.locator(AUTO_CONTENT)).toBeVisible()
}

async function openColorPicker(page: Page): Promise<void> {
    await page.locator(COLOR_TRIGGER).click()
    await expect(page.locator(COLOR_THUMB).first()).toBeVisible()
}

/** 按下鼠标并保持以命中 `:active`，读取计算 transform 后释放。 */
async function readActiveScale(page: Page, locator: Locator): Promise<number> {
    await locator.scrollIntoViewIfNeeded()
    await locator.hover()
    await page.mouse.down()
    await page.waitForTimeout(120)
    const transform = await locator.evaluate((element) => getComputedStyle(element).transform)
    await page.mouse.up()
    if (transform.trim() === 'none') {
        return 1
    }
    const match = /^matrix\(([^)]+)\)$/.exec(transform.trim())
    return match ? Number(match[1].split(',')[0]) : Number.NaN
}

test.describe('expressive 面板与选择状态', () => {
    test('Select 面板入场：淡入 + 位移缩放，关闭不滞留', async ({ page }) => {
        await useExpressive(page)
        const result = await sampleTriggeredTimeline(page, {
            trigger: SELECT_TRIGGER,
            target: SELECT_CONTENT,
            triggerEvent: 'pointerdown',
            props: ['opacity', 'transform'],
        })
        const timeline = requireTimeline(result, 'expressive 下 Select 面板应有入场动画')
        expect(timeline.animations.map((animation) => animation.name).join(',')).toContain('caomei-select-content-in')
        expect(timeline.maxDuration, '入场时长应取 duration-fast').toBe(160)

        const [start, , end] = timeline.samples
        expect(Number.parseFloat(start.styles.opacity), '首帧应近似透明').toBeLessThan(0.5)
        expect(Number.parseFloat(end.styles.opacity), '终帧应完全不透明').toBeCloseTo(1, 2)
        expect(start.styles.transform, '首帧应带位移 / 缩放').not.toBe(end.styles.transform)
        expect(
            end.styles.transform === 'none' || end.styles.transform.startsWith('matrix(1, 0, 0, 1'),
            '终帧应回到无位移 / 无缩放',
        ).toBe(true)

        await expect.poll(async () => page.locator(SELECT_CONTENT).evaluate((element) => getComputedStyle(element).transform), {
            message: '动画结束后面板不得保留位移 / 缩放',
        }).toBe('none')

        await page.keyboard.press('Escape')
        await expect(page.locator(SELECT_CONTENT)).toHaveCount(0)
    })

    test('MultiSelect 面板入场与选中指示器入场', async ({ page }) => {
        await useExpressive(page)
        const panel = await sampleTriggeredTimeline(page, {
            trigger: MULTI_TRIGGER,
            target: MULTI_CONTENT,
            props: ['opacity', 'transform'],
        })
        const panelTimeline = requireTimeline(panel, 'expressive 下 MultiSelect 面板应有入场动画')
        expect(panelTimeline.animations.map((animation) => animation.name).join(',')).toContain('caomei-multi-select-content-in')
        expect(panelTimeline.maxDuration).toBe(160)

        await openMulti(page)
        const selection = await sampleTriggeredTimeline(page, {
            trigger: MULTI_ITEM,
            target: '.caomei-multi-select__indicator',
            props: ['opacity', 'transform'],
        })
        const selectTimeline = requireTimeline(selection, 'expressive 下 MultiSelect 选中指示器应有入场动画')
        expect(selectTimeline.animations.map((animation) => animation.name).join(',')).toContain('caomei-multi-select-indicator-in')
        expect(selectTimeline.maxDuration, '指示器入场应取 duration-fast').toBe(160)
        expect(Number.parseFloat(selectTimeline.samples[0].styles.opacity), '指示器首帧应近似透明').toBeLessThan(0.5)

        await page.keyboard.press('Escape')
        await expect(page.locator(MULTI_CONTENT)).toHaveCount(0)
    })

    test('AutoComplete 面板入场：淡入 + 位移缩放', async ({ page }) => {
        await useExpressive(page)
        const result = await sampleTriggeredTimeline(page, {
            trigger: AUTO_TRIGGER,
            target: AUTO_CONTENT,
            props: ['opacity', 'transform'],
        })
        const timeline = requireTimeline(result, 'expressive 下 AutoComplete 面板应有入场动画')
        expect(timeline.animations.map((animation) => animation.name).join(',')).toContain('caomei-auto-complete-content-in')
        expect(timeline.maxDuration).toBe(160)
        expect(Number.parseFloat(timeline.samples[0].styles.opacity), '首帧应近似透明').toBeLessThan(0.5)
        expect(Number.parseFloat(timeline.samples[2].styles.opacity), '终帧应完全不透明').toBeCloseTo(1, 2)

        await page.keyboard.press('Escape')
        await expect(page.locator(AUTO_CONTENT)).toHaveCount(0)
    })

    test('DatePicker 面板入场沿用既有动画并随轴延长', async ({ page }) => {
        await useExpressive(page)
        const result = await sampleTriggeredTimeline(page, {
            trigger: DATE_TRIGGER,
            target: DATE_CONTENT,
            props: ['opacity', 'transform'],
        })
        const timeline = requireTimeline(result, 'expressive 下 DatePicker 面板应有入场动画')
        expect(timeline.animations.map((animation) => animation.name).join(',')).toContain('caomei-date-picker-in')
        expect(timeline.maxDuration, 'expressive 下应取 duration-fast 160ms').toBe(160)

        await page.keyboard.press('Escape')
        await expect(page.locator(DATE_CONTENT)).toHaveCount(0)
    })

    test('Calendar 日期选中过渡非空且无位移', async ({ page }) => {
        await useExpressive(page)
        const day = page.locator(`${CALENDAR_DAY}:not([data-selected], [data-disabled], [data-outside-view], [data-unavailable])`).first()
        await expect(day).toBeVisible()
        const durations = parseDurations(await day.evaluate((element) => getComputedStyle(element).transitionDuration))
        expect(durations.length, '日期格应声明过渡').toBeGreaterThan(0)
        expect(durations.every((value) => value > 0)).toBe(true)

        const value = await day.getAttribute('data-value')
        const before = await day.evaluate((element) => getComputedStyle(element).backgroundColor)
        await day.click()
        const selected = page.locator(`${CALENDAR_DAY}[data-value="${value}"]`)
        await expect(selected).toHaveAttribute('data-selected', 'true')
        await expect.poll(async () => selected.evaluate((element) => getComputedStyle(element).backgroundColor), {
            message: '选中后背景色应过渡到主色',
        }).not.toBe(before)
    })

    test('ColorPicker 手柄悬浮放大，色板保留过渡', async ({ page }) => {
        await useExpressive(page)
        await openColorPicker(page)
        const thumb = page.locator(COLOR_THUMB).first()
        expect(
            parseDurations(await thumb.evaluate((element) => getComputedStyle(element).transitionDuration)).every((value) => value > 0),
            '手柄应声明非零过渡',
        ).toBe(true)
        await thumb.hover()
        await expect.poll(async () => computedScale(await readScale(thumb)), {
            message: 'expressive 下手柄悬浮应放大',
        }).toBeGreaterThan(1.01)

        const swatch = page.locator(COLOR_SWATCH).first()
        expect(
            parseDurations(await swatch.evaluate((element) => getComputedStyle(element).transitionDuration)).every((value) => value > 0),
            '色板应声明非零过渡',
        ).toBe(true)
    })

    test('SelectButton / ToggleButton 按下有轻微缩放', async ({ page }) => {
        await useExpressive(page)
        const segment = page.locator(SELECT_BUTTON_ITEM).first()
        expect(await readActiveScale(page, segment), '分段按钮按下应缩放').toBeLessThan(0.99)
        const toggle = page.locator(TOGGLE_BUTTON)
        expect(await readActiveScale(page, toggle), '切换按钮按下应缩放').toBeLessThan(0.99)
    })
})

test.describe('minimal 不新增动效', () => {
    test('面板 / 指示器 / 日期 / 手柄 / 按钮均保持既有行为', async ({ page }) => {
        await openSelect(page)
        expect(
            await page.locator(SELECT_CONTENT).evaluate((element) => getComputedStyle(element).animationName),
            'minimal Select 面板无入场动画',
        ).toBe('none')
        await page.keyboard.press('Escape')
        await expect(page.locator(SELECT_CONTENT)).toHaveCount(0)

        await openMulti(page)
        expect(
            await page.locator(MULTI_CONTENT).evaluate((element) => getComputedStyle(element).animationName),
            'minimal MultiSelect 面板无入场动画',
        ).toBe('none')
        await page.locator(MULTI_ITEM).first().click()
        expect(
            await page.locator('.caomei-multi-select__indicator').evaluate((element) => getComputedStyle(element).animationName),
            'minimal 选中指示器无入场动画',
        ).toBe('none')
        await page.keyboard.press('Escape')

        await openAuto(page)
        expect(
            await page.locator(AUTO_CONTENT).evaluate((element) => getComputedStyle(element).animationName),
            'minimal AutoComplete 面板无入场动画',
        ).toBe('none')
        await page.keyboard.press('Escape')

        expect(
            parseDurations(await page.locator(CALENDAR_DAY).first().evaluate((element) => getComputedStyle(element).transitionDuration)).every((value) => value === 0),
            'minimal 日期格无过渡',
        ).toBe(true)

        await openColorPicker(page)
        const thumb = page.locator(COLOR_THUMB).first()
        await thumb.hover()
        expect(computedScale(await readScale(thumb)), 'minimal 手柄悬浮不放大').toBeCloseTo(1, 2)

        expect(
            await page.locator(SELECT_BUTTON_ITEM).first().evaluate((element) => getComputedStyle(element).transitionProperty),
            'minimal 分段按钮不追加 transform 过渡',
        ).not.toContain('transform')
        expect(
            await page.locator(TOGGLE_BUTTON).evaluate((element) => getComputedStyle(element).transitionProperty),
            'minimal 切换按钮不追加 transform 过渡',
        ).not.toContain('transform')
    })
})

test.describe('reduced-motion 压平', () => {
    test.use({ reducedMotion: 'reduce' })

    test('expressive 下面板 / 指示器 / 日期 / 手柄 / 按钮均无位移缩放', async ({ page }) => {
        await useExpressive(page)

        await openSelect(page)
        expect(
            await page.locator(SELECT_CONTENT).evaluate((element) => getComputedStyle(element).animationName),
            'reduce Select 面板无入场动画',
        ).toBe('none')
        await page.keyboard.press('Escape')

        await openMulti(page)
        expect(
            await page.locator(MULTI_CONTENT).evaluate((element) => getComputedStyle(element).animationName),
            'reduce MultiSelect 面板无入场动画',
        ).toBe('none')
        await page.locator(MULTI_ITEM).first().click()
        expect(
            await page.locator('.caomei-multi-select__indicator').evaluate((element) => getComputedStyle(element).animationName),
            'reduce 选中指示器无入场动画',
        ).toBe('none')
        await page.keyboard.press('Escape')

        expect(
            parseDurations(await page.locator(CALENDAR_DAY).first().evaluate((element) => getComputedStyle(element).transitionDuration)).every((value) => value === 0),
            'reduce 日期格过渡归零',
        ).toBe(true)

        await openColorPicker(page)
        const thumb = page.locator(COLOR_THUMB).first()
        await thumb.hover()
        expect(computedScale(await readScale(thumb)), 'reduce 手柄悬浮不放大').toBeCloseTo(1, 2)

        expect(await readActiveScale(page, page.locator(SELECT_BUTTON_ITEM).first()), 'reduce 分段按钮不缩放').toBeCloseTo(1, 2)
        expect(await readActiveScale(page, page.locator(TOGGLE_BUTTON)), 'reduce 切换按钮不缩放').toBeCloseTo(1, 2)
    })
})
