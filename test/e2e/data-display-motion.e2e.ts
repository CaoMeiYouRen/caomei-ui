import { expect, test as base, type Locator, type Page } from '@playwright/test'
import { readMotionTokens, sampleTriggeredTimeline, type TimelineResult } from './helpers/motion'

/**
 * 数据展示动效的常驻回归（动效评估 `docs/design/governance/2026-11-08-motion-system-evaluation.md` §4）。
 *
 * 覆盖：DataTable 行悬浮 / 选中底色过渡、排序激活列提亮、展开区透明度入场；
 * 同时验证 `minimal` 不新增动效、`reduce` 压平且无布局位移。
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#data-display-motion` section。
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
        await use(errors)
    }, { auto: true }],
})

test.use({ reducedMotion: 'no-preference' })

test.afterEach(({ pageErrors }) => {
    expect(pageErrors, '页面不得产生 console error').toEqual([])
})

const TABLE = '#data-display-motion .caomei-data-table'
const ROW = `${TABLE} .caomei-data-table__row`
const EXPANDER = `${TABLE} .caomei-data-table__row-expander`
const EXPANSION_CELL = `${TABLE} .caomei-data-table__row-expansion-cell`
const SORT_BUTTON = `${TABLE} .caomei-data-table__sort`
const SORT_ICON = `${TABLE} .caomei-data-table__sort-icon`
const SORT_INDEX = `${TABLE} .caomei-data-table__sort-index`
const DATA_VIEW = '#data-display-motion-view'
const DATA_VIEW_CONTENT = `${DATA_VIEW} .caomei-data-view__content`
const DATA_VIEW_LAYOUT_TOGGLE = '#data-display-motion-layout-toggle'
const DATA_VIEW_TOGGLE = '#data-display-motion-view-toggle'

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

async function readBackground(locator: Locator): Promise<string> {
    return locator.evaluate((element) => getComputedStyle(element).backgroundColor)
}

async function readColor(locator: Locator): Promise<string> {
    return locator.evaluate((element) => getComputedStyle(element).color)
}

/** 布局盒（offset*，不含 transform）：用于断言动效不触发布局位移。 */
async function layoutBox(locator: Locator): Promise<Record<string, number>> {
    return locator.evaluate((element) => {
        const target = element as HTMLElement
        return {
            top: target.offsetTop,
            left: target.offsetLeft,
            width: target.offsetWidth,
            height: target.offsetHeight,
        }
    })
}

/** `expressive` 下 `--caomei-motion-duration-base` 的毫秒值（避免硬编码）。 */
async function baseDurationMs(target: Locator): Promise<number> {
    const snapshot = await readMotionTokens(target)
    return Number.parseFloat(snapshot.values['--caomei-motion-duration-base'])
}

test.describe('expressive 数据展示动效', () => {
    test('行底色过渡消费 duration-base，悬浮可采样', async ({ page }) => {
        await useExpressive(page)
        const row = page.locator(ROW).first()
        await expect(row).toBeVisible()

        const expectedSeconds = (await baseDurationMs(row)) / 1000
        const durations = parseDurations(await row.evaluate((element) => getComputedStyle(element).transitionDuration))
        expect(durations.length, '行应声明底色过渡').toBeGreaterThan(0)
        expect(durations.every((value) => value > 0)).toBe(true)
        expect(Math.max(...durations), '过渡时长应取 duration-base').toBeCloseTo(expectedSeconds, 2)
        expect(
            await row.evaluate((element) => getComputedStyle(element).transitionProperty),
        ).toContain('background-color')

        const before = await readBackground(row)
        await row.hover()
        await expect.poll(async () => readBackground(row), {
            message: '悬浮底色应过渡到悬浮档',
        }).not.toBe(before)
    })

    test('选中行底色过渡且不改变布局盒', async ({ page }) => {
        await useExpressive(page)
        const row = page.locator(ROW).first()
        const before = await layoutBox(row)
        const backgroundBefore = await readBackground(row)

        expect(
            await row.evaluate((element) => getComputedStyle(element).transitionProperty),
            '选中态复用行底色过渡',
        ).toContain('background-color')

        await row.locator('.caomei-checkbox').first().click()
        await expect(row).toHaveClass(/caomei-data-table__row--selected/)
        await expect.poll(async () => readBackground(row), {
            message: '选中底色应过渡到选中档',
        }).not.toBe(backgroundBefore)

        expect(await layoutBox(row), '底色过渡不应改变布局盒').toEqual(before)
    })

    test('排序激活列提亮，列宽不变', async ({ page }) => {
        await useExpressive(page)
        const sortButton = page.locator(SORT_BUTTON).first()
        const icon = page.locator(SORT_ICON).first()
        const index = page.locator(SORT_INDEX).first()
        const header = page.locator(`${TABLE} .caomei-data-table__th`).nth(1)
        const widthBefore = (await layoutBox(header)).width

        for (const element of [icon, index]) {
            expect(
                parseDurations(await element.evaluate((node) => getComputedStyle(node).transitionDuration)).every((value) => value > 0),
                '排序图标与多列序号应声明颜色过渡',
            ).toBe(true)
            expect(
                await element.evaluate((node) => getComputedStyle(node).transitionProperty),
            ).toContain('color')
        }

        const colorBefore = await readColor(icon)
        const indexColorBefore = await readColor(index)
        await sortButton.click()
        await expect(page.locator(`${TABLE} th[aria-sort='ascending']`)).toHaveCount(1)
        await expect.poll(async () => readColor(icon), {
            message: '排序激活后图标应提亮',
        }).not.toBe(colorBefore)
        await expect.poll(async () => readColor(index), {
            message: '排序激活后多列序号应提亮',
        }).not.toBe(indexColorBefore)
        expect((await layoutBox(header)).width, '提亮不应改变列宽').toBe(widthBefore)
    })

    test('行底色过渡可打断并收敛到终态', async ({ page }) => {
        await useExpressive(page)
        const row = page.locator(ROW).nth(1)
        const initial = await readBackground(row)

        await row.hover()
        await expect.poll(() => row.evaluate((element) =>
            element.getAnimations().filter((animation) => 'transitionProperty' in animation && animation.transitionProperty === 'background-color').length,
        ), { message: '悬浮应启动底色过渡' }).toBeGreaterThan(0)

        // 过渡进行中立即移出：中断后必须回到初始档，而不是停在中间帧
        await page.mouse.move(0, 0)
        await expect.poll(async () => readBackground(row), {
            message: '打断后应收敛回初始底色',
        }).toBe(initial)
    })

    test('DataView 加载态切换以透明度入场', async ({ page }) => {
        await useExpressive(page)
        const result = await sampleTriggeredTimeline(page, {
            trigger: DATA_VIEW_TOGGLE,
            target: DATA_VIEW_CONTENT,
            props: ['opacity', 'transform'],
            ratios: [0, 0.5, 0.99],
        })
        const timeline = requireTimeline(result, 'expressive 下 DataView 状态切换应有入场动画')
        expect(timeline.animations.map((item) => item.name).join(' '), '动画名应锚定到 DataView 入场').toMatch(/caomei-data-view-content-in(-|$)/)

        const start = timeline.samples[0]
        const end = timeline.samples[timeline.samples.length - 1]
        expect(Number(start.styles.opacity), '起点应从透明开始').toBeLessThan(0.5)
        expect(Number(end.styles.opacity), '终点应完全不透明').toBeCloseTo(1, 2)
        expect(end.styles.transform, 'DataView 入场不做位移 / 缩放').toBe('none')
    })

    test('DataView 列表 ↔ 网格切换以透明度入场', async ({ page }) => {
        await useExpressive(page)
        const result = await sampleTriggeredTimeline(page, {
            trigger: DATA_VIEW_LAYOUT_TOGGLE,
            target: DATA_VIEW_CONTENT,
            props: ['opacity', 'transform'],
            ratios: [0, 0.5, 0.99],
        })
        const timeline = requireTimeline(result, 'expressive 下 DataView 布局切换应有入场动画')
        expect(timeline.animations.map((item) => item.name).join(' '), '动画名应锚定到 DataView 入场').toMatch(/caomei-data-view-content-in(-|$)/)

        const start = timeline.samples[0]
        const end = timeline.samples[timeline.samples.length - 1]
        expect(Number(start.styles.opacity), '起点应从透明开始').toBeLessThan(0.5)
        expect(Number(end.styles.opacity), '终点应完全不透明').toBeCloseTo(1, 2)
        expect(end.styles.transform, '布局切换入场不做位移 / 缩放').toBe('none')
        await expect(page.locator(`${DATA_VIEW} .caomei-data-view`)).toHaveClass(/caomei-data-view--grid/)
    })

    test('展开区透明度入场：无位移、无高度动画', async ({ page }) => {
        await useExpressive(page)
        const result = await sampleTriggeredTimeline(page, {
            trigger: EXPANDER,
            target: EXPANSION_CELL,
            props: ['opacity', 'transform', 'height'],
            ratios: [0, 0.5, 0.99],
        })
        const timeline = requireTimeline(result, 'expressive 下展开区应有入场动画')
        expect(timeline.animations.map((item) => item.name).join(' '), '动画名应锚定到展开区入场').toMatch(/caomei-data-table-expansion-in(-|$)/)

        const [start, middle, end] = timeline.samples
        expect(Number(start.styles.opacity), '起点应从透明开始').toBeLessThan(0.5)
        expect(Number(middle.styles.opacity), '中段应处于过渡中').toBeGreaterThan(0)
        expect(Number(end.styles.opacity), '终点应完全不透明').toBeCloseTo(1, 2)
        for (const sample of timeline.samples) {
            expect(sample.styles.transform, '展开区不做位移 / 缩放').toBe('none')
        }
        const heights = timeline.samples.map((sample) => Number.parseFloat(sample.styles.height))
        expect(new Set(heights).size, '展开区高度不应参与动画').toBe(1)
    })
})

test.describe('minimal 不新增动效', () => {
    test('行 / 排序图标 / 展开区保持静态', async ({ page }) => {
        const row = page.locator(ROW).first()
        expect(
            parseDurations(await row.evaluate((element) => getComputedStyle(element).transitionDuration)).every((value) => value === 0),
            'minimal 行无底色过渡',
        ).toBe(true)

        for (const selector of [SORT_ICON, SORT_INDEX]) {
            expect(
                parseDurations(await page.locator(selector).first().evaluate((element) => getComputedStyle(element).transitionDuration)).every((value) => value === 0),
                `minimal ${selector} 无颜色过渡`,
            ).toBe(true)
        }

        await page.locator(EXPANDER).first().click()
        await expect(page.locator(EXPANSION_CELL)).toBeVisible()
        expect(
            await page.locator(EXPANSION_CELL).evaluate((element) => getComputedStyle(element).animationName),
            'minimal 展开区无入场动画',
        ).toBe('none')

        await page.locator(DATA_VIEW_TOGGLE).click()
        expect(
            await page.locator(DATA_VIEW_CONTENT).evaluate((element) => getComputedStyle(element).animationName),
            'minimal DataView 状态切换无入场动画',
        ).toBe('none')
        await page.locator(DATA_VIEW_LAYOUT_TOGGLE).click()
        expect(
            await page.locator(DATA_VIEW_CONTENT).evaluate((element) => getComputedStyle(element).animationName),
            'minimal DataView 布局切换无入场动画',
        ).toBe('none')
    })
})

test.describe('reduced-motion 压平', () => {
    test.use({ reducedMotion: 'reduce' })

    test('expressive 下行 / 展开区过渡与动画归零', async ({ page }) => {
        await useExpressive(page)
        const row = page.locator(ROW).first()
        expect(
            parseDurations(await row.evaluate((element) => getComputedStyle(element).transitionDuration)).every((value) => value === 0),
            'reduce 行底色过渡归零',
        ).toBe(true)

        const before = await layoutBox(row)
        await row.hover()
        const after = await layoutBox(row)
        expect(after, 'reduce 悬浮不改变布局盒').toEqual(before)

        await page.locator(EXPANDER).first().click()
        await expect(page.locator(EXPANSION_CELL)).toBeVisible()
        const expansion = page.locator(EXPANSION_CELL)
        expect(
            parseDurations(await expansion.evaluate((element) => getComputedStyle(element).animationDuration)).every((value) => value === 0),
            'reduce 展开区动画时长归零',
        ).toBe(true)
        expect(await expansion.evaluate((element) => getComputedStyle(element).transform)).toBe('none')
        expect(await expansion.evaluate((element) => getComputedStyle(element).opacity)).toBe('1')

        await page.locator(DATA_VIEW_TOGGLE).click()
        const dataViewContent = page.locator(DATA_VIEW_CONTENT)
        await expect(dataViewContent).toBeVisible()
        expect(
            parseDurations(await dataViewContent.evaluate((element) => getComputedStyle(element).animationDuration)).every((value) => value === 0),
            'reduce DataView 状态切换动画时长归零',
        ).toBe(true)
        expect(await dataViewContent.evaluate((element) => getComputedStyle(element).opacity)).toBe('1')

        await page.locator(DATA_VIEW_LAYOUT_TOGGLE).click()
        expect(
            parseDurations(await page.locator(DATA_VIEW_CONTENT).evaluate((element) => getComputedStyle(element).animationDuration)).every((value) => value === 0),
            'reduce DataView 布局切换动画时长归零',
        ).toBe(true)
    })
})
