import { expect, test as base, type Locator, type Page } from '@playwright/test'
import { sampleTriggeredTimeline, type TimelineResult } from './helpers/motion'

/**
 * 基础与布局动效（A5）的常驻回归。
 *
 * 覆盖：Avatar / Image 加载入场、Tag 悬浮与选中过渡、Card 悬浮抬升、Badge 过渡沿用 token；
 * Divider / Row / Col 为静态对照（不得产生动画或布局位移）。同时验证 `minimal` 不新增动效、
 * `reduce` 无位移 / 缩放。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#basic-layout-motion` section。
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

const AVATAR_TOGGLE = '#basic-layout-avatar-toggle'
const AVATAR_IMAGE = '#basic-layout-avatar .caomei-avatar__image'
const IMAGE_TOGGLE = '#basic-layout-image-toggle'
const IMAGE = '#basic-layout-image .caomei-image__img'
const TAG = '#basic-layout-tag .caomei-tag'
const CARD = '#basic-layout-card .caomei-card'
const BADGE = '#basic-layout-badge .caomei-badge'
const DIVIDER = '#basic-layout-divider'
const GRID = '#basic-layout-grid .caomei-row'

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

function transformTranslateY(value: string): number {
    if (value.trim() === 'none') {
        return 0
    }
    const match = /^matrix\(([^)]+)\)$/.exec(value.trim())
    return match ? Number(match[1].split(',')[5]) : Number.NaN
}

async function readTransform(locator: Locator): Promise<string> {
    return locator.evaluate((element) => getComputedStyle(element).transform)
}

async function readBackground(locator: Locator): Promise<string> {
    return locator.evaluate((element) => getComputedStyle(element).backgroundColor)
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

test.describe('expressive 基础与布局动效', () => {
    test('Avatar 图片加载入场：淡入且不位移', async ({ page }) => {
        await useExpressive(page)
        const result = await sampleTriggeredTimeline(page, {
            trigger: AVATAR_TOGGLE,
            target: AVATAR_IMAGE,
            props: ['opacity', 'transform'],
            ratios: [0, 0.5, 0.99],
        })
        const timeline = requireTimeline(result, 'expressive 下 Avatar 图片应有入场动画')
        expect(timeline.animations.map((animation) => animation.name).join(',')).toContain('caomei-avatar-image-in')
        expect(timeline.maxDuration, '入场时长应取 duration-base').toBe(220)

        const [start, , end] = timeline.samples
        expect(Number.parseFloat(start.styles.opacity), '首帧应近似透明').toBeLessThan(0.5)
        expect(Number.parseFloat(end.styles.opacity), '终帧应完全不透明').toBeCloseTo(1, 2)
        expect(start.styles.transform, '入场不应产生位移 / 缩放').toBe(end.styles.transform)
    })

    test('Image 加载入场与预览指示器过渡', async ({ page }) => {
        await useExpressive(page)
        const result = await sampleTriggeredTimeline(page, {
            trigger: IMAGE_TOGGLE,
            target: IMAGE,
            props: ['opacity'],
            ratios: [0, 0.5, 0.99],
        })
        const timeline = requireTimeline(result, 'expressive 下 Image 应有入场动画')
        expect(timeline.animations.map((animation) => animation.name).join(',')).toContain('caomei-image-in')
        expect(timeline.maxDuration, '入场时长应取 duration-base').toBe(220)
        expect(Number.parseFloat(timeline.samples[0].styles.opacity), '首帧应近似透明').toBeLessThan(0.5)
        expect(Number.parseFloat(timeline.samples[2].styles.opacity), '终帧应完全不透明').toBeCloseTo(1, 2)

        const trigger = page.locator('#basic-layout-image .caomei-image__preview-trigger')
        await expect(trigger).toBeVisible()
        const icon = trigger.locator('.caomei-image__preview-icon')
        expect(
            parseDurations(await icon.evaluate((element) => getComputedStyle(element).transitionDuration)).every((value) => value > 0),
            '预览指示器应保留非零过渡',
        ).toBe(true)
    })

    test('Tag 悬浮 / 选中过渡非空且无布局位移', async ({ page }) => {
        await useExpressive(page)
        const tag = page.locator(TAG)
        const durations = parseDurations(await tag.evaluate((element) => getComputedStyle(element).transitionDuration))
        expect(durations.length, 'Tag 应声明过渡').toBeGreaterThan(0)
        expect(durations.every((value) => value > 0)).toBe(true)

        const before = await layoutBox(tag)
        const background = await readBackground(tag)
        await tag.hover()
        await expect.poll(async () => readBackground(tag), {
            message: 'expressive 下悬浮应过渡到底色加深态',
        }).not.toBe(background)
        const after = await layoutBox(tag)
        expect(after, '颜色过渡不应改变布局盒').toEqual(before)

        await tag.click()
        expect(await tag.getAttribute('aria-pressed'), '点击后应进入选中态').toBe('true')
    })

    test('Card 悬浮抬升 4px，且不改变布局盒', async ({ page }) => {
        await useExpressive(page)
        const card = page.locator(CARD)
        const before = await layoutBox(card)
        await card.hover()
        await expect.poll(async () => transformTranslateY(await readTransform(card)), {
            message: 'expressive 下卡片应抬升 4px',
        }).toBeLessThan(-3)
        const after = await layoutBox(card)
        expect(after, 'transform 不应改变布局盒').toEqual(before)
    })

    test('Badge 过渡沿用 motion token', async ({ page }) => {
        await useExpressive(page)
        const badge = page.locator(BADGE)
        const durations = parseDurations(await badge.evaluate((element) => getComputedStyle(element).transitionDuration))
        expect(durations.length, 'Badge 应声明过渡').toBeGreaterThan(0)
        expect(durations.every((value) => value > 0)).toBe(true)
        expect(Math.max(...durations), 'expressive 下应取 duration-base 220ms').toBeCloseTo(0.22, 2)
        const properties = await badge.evaluate((element) => getComputedStyle(element).transitionProperty)
        expect(properties).toContain('min-width')
    })

    test('Divider / Row / Col 为静态对照：无动画、无过渡', async ({ page }) => {
        await useExpressive(page)
        for (const selector of [DIVIDER, GRID, `${GRID} .caomei-col`]) {
            const element = page.locator(selector).first()
            await expect(element).toBeVisible()
            const style = await element.evaluate((node) => {
                const computed = getComputedStyle(node)
                return { animation: computed.animationName, durations: computed.transitionDuration }
            })
            expect(style.animation, `${selector} 不应有动画`).toBe('none')
            expect(parseDurations(style.durations).every((value) => value === 0), `${selector} 不应有过渡`).toBe(true)
        }
    })
})

test.describe('minimal 不新增动效', () => {
    test('Avatar / Image / Tag / Card / Badge 保持既有行为', async ({ page }) => {
        await page.locator(AVATAR_TOGGLE).click()
        await expect(page.locator(AVATAR_IMAGE)).toBeVisible()
        expect(
            await page.locator(AVATAR_IMAGE).evaluate((element) => getComputedStyle(element).animationName),
            'minimal Avatar 无入场动画',
        ).toBe('none')

        await page.locator(IMAGE_TOGGLE).click()
        await expect(page.locator(IMAGE)).toBeVisible()
        expect(
            await page.locator(IMAGE).evaluate((element) => getComputedStyle(element).animationName),
            'minimal Image 无入场动画',
        ).toBe('none')

        const tag = page.locator(TAG)
        expect(
            parseDurations(await tag.evaluate((element) => getComputedStyle(element).transitionDuration)).every((value) => value === 0),
            'minimal Tag 无过渡',
        ).toBe(true)
        const background = await readBackground(tag)
        await tag.hover()
        expect(await readBackground(tag), 'minimal 悬浮不改变底色').toBe(background)

        const card = page.locator(CARD)
        await card.hover()
        await expect.poll(async () => transformTranslateY(await readTransform(card)), {
            message: 'minimal 保持既有 -2px 抬升',
        }).toBeCloseTo(-2, 1)

        expect(
            parseDurations(await page.locator(BADGE).evaluate((element) => getComputedStyle(element).transitionDuration)).every((value) => value === 0.15),
            'minimal Badge 保持既有 150ms 过渡',
        ).toBe(true)
    })
})

test.describe('reduced-motion 压平', () => {
    test.use({ reducedMotion: 'reduce' })

    test('expressive 下图片 / 标签 / 卡片均无位移 / 缩放', async ({ page }) => {
        await useExpressive(page)

        await page.locator(AVATAR_TOGGLE).click()
        await expect(page.locator(AVATAR_IMAGE)).toBeVisible()
        expect(
            await page.locator(AVATAR_IMAGE).evaluate((element) => getComputedStyle(element).animationName),
            'reduce Avatar 无入场动画',
        ).toBe('none')

        await page.locator(IMAGE_TOGGLE).click()
        await expect(page.locator(IMAGE)).toBeVisible()
        expect(
            await page.locator(IMAGE).evaluate((element) => getComputedStyle(element).animationName),
            'reduce Image 无入场动画',
        ).toBe('none')

        const tag = page.locator(TAG)
        expect(
            parseDurations(await tag.evaluate((element) => getComputedStyle(element).transitionDuration)).every((value) => value === 0),
            'reduce Tag 过渡归零',
        ).toBe(true)
        const background = await readBackground(tag)
        await tag.hover()
        expect(await readBackground(tag), 'reduce 悬浮不改变底色').toBe(background)

        const card = page.locator(CARD)
        await card.hover()
        expect(transformTranslateY(await readTransform(card)), 'reduce 卡片不抬升').toBe(0)

        expect(
            parseDurations(await page.locator(BADGE).evaluate((element) => getComputedStyle(element).transitionDuration)).every((value) => value === 0),
            'reduce Badge 过渡归零',
        ).toBe(true)
    })
})
