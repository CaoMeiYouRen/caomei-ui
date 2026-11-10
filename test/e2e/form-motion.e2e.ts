import { expect, test as base, type Locator, type Page } from '@playwright/test'
import { sampleTriggeredTimeline, type TimelineResult } from './helpers/motion'

/**
 * 表单输入动效（A4）的常驻回归。
 *
 * 覆盖：勾选指示器入场、Form invalid 标签 / 错误行、Slider 悬浮缩放、InputGroup 聚焦抬升、
 * InputNumber 步进按钮过渡；同时验证 `minimal` 不新增动效、`reduce` 无位移 / 缩放。
 * 采样统一走 `helpers/motion.ts`（有界帧轮询 + `pause()` + `currentTime`，不使用 `sleep`）。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#form-motion` section。
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

const CHECKBOX_CONTROL = '#form-motion-checkbox-group .caomei-checkbox__control'
const CHECKBOX_INDICATOR = '#form-motion-checkbox-group .caomei-checkbox__indicator'
const ERROR_TOGGLE = '#form-motion-error-toggle'
const FORM_ERROR = '#form-motion-form .caomei-form-item__error'
const FORM_LABEL = '#form-motion-form .caomei-form-item__label'
const SLIDER_THUMB = '#form-motion-slider .caomei-slider__thumb'
const INPUT_GROUP_MEMBER = '#form-motion-input-group .caomei-input'
const INPUT_GROUP_CONTROL = '#form-motion-input-group .caomei-input input'
const STEP_BUTTON = '#form-motion-input-number .caomei-input-number__button'

async function useExpressive(page: Page): Promise<void> {
    await page.evaluate(() => {
        document.documentElement.setAttribute('data-motion', 'expressive')
    })
}

/** 采样结果为空即视为验收失败（返回类型收窄，避免非空断言）。 */
function requireTimeline(result: TimelineResult | null, message: string): TimelineResult {
    if (!result) {
        throw new Error(message)
    }
    return result
}

function parseDurations(value: string): number[] {
    return value.split(',').map((part) => Number.parseFloat(part.trim())).filter((n) => !Number.isNaN(n))
}

function transformScale(value: string): number {
    if (value.trim() === 'none') {
        return 1
    }
    const match = /^matrix\(([^)]+)\)$/.exec(value.trim())
    return match ? Number(match[1].split(',')[0]) : Number.NaN
}

function computedScale(value: string): number {
    if (value.trim() === 'none') {
        return 1
    }
    return Number.parseFloat(value)
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

async function readScale(locator: Locator): Promise<string> {
    return locator.evaluate((element) => getComputedStyle(element).scale)
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

async function toggleFormError(page: Page): Promise<void> {
    await page.locator(ERROR_TOGGLE).click()
    await expect(page.locator(FORM_ERROR)).toBeVisible()
}

test.describe('expressive 表单状态动效', () => {
    test('勾选指示器入场：0 / 50% / 100% 三帧可复现', async ({ page }) => {
        await useExpressive(page)
        const result = await sampleTriggeredTimeline(page, {
            trigger: CHECKBOX_CONTROL,
            target: CHECKBOX_INDICATOR,
            props: ['opacity', 'transform'],
            ratios: [0, 0.5, 0.99],
        })
        const timeline = requireTimeline(result, 'expressive 下勾选指示器应有入场动画')
        expect(timeline.animations.map((animation) => animation.name).join(',')).toContain('caomei-checkbox-indicator-in')
        expect(timeline.maxDuration, '入场时长应取 duration-fast').toBe(160)

        const [start, mid, end] = timeline.samples
        expect(Number.parseFloat(start.styles.opacity), '首帧应近似透明').toBeLessThan(0.5)
        const midOpacity = Number.parseFloat(mid.styles.opacity)
        expect(midOpacity).toBeGreaterThan(0)
        expect(midOpacity).toBeLessThan(1)
        expect(Number.parseFloat(end.styles.opacity), '终帧应完全不透明').toBeCloseTo(1, 2)
        expect(transformScale(start.styles.transform), '首帧应从 scale-from 开始').toBeCloseTo(0.96, 2)
        expect(transformScale(end.styles.transform), '终帧应回到 scale(1)').toBeCloseTo(1, 2)
    })

    test('Form invalid：标签颜色过渡 + 错误行淡入下移', async ({ page }) => {
        await useExpressive(page)

        const label = page.locator(FORM_LABEL)
        const labelDurations = parseDurations(await label.evaluate((element) => getComputedStyle(element).transitionDuration))
        expect(labelDurations.length, '标签应声明颜色过渡').toBeGreaterThan(0)
        expect(labelDurations.every((value) => value > 0)).toBe(true)
        const labelProperties = await label.evaluate((element) => getComputedStyle(element).transitionProperty)
        expect(labelProperties).toContain('color')

        const result = await sampleTriggeredTimeline(page, {
            trigger: ERROR_TOGGLE,
            target: FORM_ERROR,
            props: ['opacity', 'transform'],
            ratios: [0, 0.5, 0.99],
        })
        const timeline = requireTimeline(result, 'expressive 下错误行应有入场动画')
        expect(timeline.animations.map((animation) => animation.name).join(',')).toContain('caomei-form-item-error-in')
        expect(timeline.maxDuration, '错误行入场应取 duration-base').toBe(220)

        const [start, , end] = timeline.samples
        expect(Number.parseFloat(start.styles.opacity), '首帧应近似透明').toBeLessThan(0.5)
        expect(Number.parseFloat(end.styles.opacity), '终帧应完全不透明').toBeCloseTo(1, 2)
        expect(transformTranslateY(start.styles.transform), '首帧应位于下方 4px').toBeLessThan(-1)
        expect(transformTranslateY(end.styles.transform), '终帧应回到原位').toBeCloseTo(0, 2)
    })

    test('Slider 手柄悬浮放大，轨道保留颜色过渡', async ({ page }) => {
        await useExpressive(page)
        const thumb = page.locator(SLIDER_THUMB)
        const durations = parseDurations(await thumb.evaluate((element) => getComputedStyle(element).transitionDuration))
        expect(durations.length, '手柄应声明过渡').toBeGreaterThan(0)
        expect(durations.every((value) => value > 0)).toBe(true)

        await thumb.hover()
        await expect.poll(async () => computedScale(await readScale(thumb)), {
            message: 'expressive 下悬浮应放大手柄',
        }).toBeGreaterThan(1.01)

        const trackDurations = parseDurations(
            await page.locator('#form-motion-slider .caomei-slider__track').evaluate((element) => getComputedStyle(element).transitionDuration),
        )
        expect(trackDurations.every((value) => value > 0), '轨道应保留非零颜色过渡').toBe(true)
    })

    test('InputGroup 聚焦成员轻微上移，且不改变布局盒', async ({ page }) => {
        await useExpressive(page)
        const member = page.locator(INPUT_GROUP_MEMBER)
        const before = await layoutBox(member)
        await page.locator(INPUT_GROUP_CONTROL).focus()
        await expect.poll(async () => transformTranslateY(await readTransform(member)), {
            message: 'expressive 下聚焦成员应上移 2px',
        }).toBeLessThan(-1)
        const after = await layoutBox(member)
        expect(after, 'transform 不应改变布局盒').toEqual(before)

        const properties = await member.evaluate((element) => getComputedStyle(element).transitionProperty)
        expect(properties).toContain('transform')
    })

    test('InputNumber 步进按钮保留非零过渡时长', async ({ page }) => {
        await useExpressive(page)
        const button = page.locator(STEP_BUTTON).first()
        const durations = parseDurations(await button.evaluate((element) => getComputedStyle(element).transitionDuration))
        expect(durations.length, '步进按钮应声明过渡').toBeGreaterThan(0)
        expect(durations.every((value) => value > 0)).toBe(true)
        const properties = await button.evaluate((element) => getComputedStyle(element).transitionProperty)
        expect(properties).toContain('transform')
    })
})

test.describe('minimal 不新增动效', () => {
    test('勾选 / invalid / 滑块 / 聚焦 / 步进均无新动效', async ({ page }) => {
        await page.locator(CHECKBOX_CONTROL).first().click()
        const indicator = page.locator(CHECKBOX_INDICATOR)
        await expect(indicator).toBeVisible()
        expect(await indicator.evaluate((element) => getComputedStyle(element).animationName), 'minimal 勾选无入场动画').toBe('none')

        await toggleFormError(page)
        expect(
            await page.locator(FORM_ERROR).evaluate((element) => getComputedStyle(element).animationName),
            'minimal 错误行无入场动画',
        ).toBe('none')
        expect(
            parseDurations(await page.locator(FORM_LABEL).evaluate((element) => getComputedStyle(element).transitionDuration)).every((value) => value === 0),
            'minimal 标签无颜色过渡',
        ).toBe(true)

        const thumb = page.locator(SLIDER_THUMB)
        await thumb.hover()
        expect(computedScale(await readScale(thumb)), 'minimal 悬浮不放大').toBeCloseTo(1, 2)

        const member = page.locator(INPUT_GROUP_MEMBER)
        await page.locator(INPUT_GROUP_CONTROL).focus()
        expect(transformTranslateY(await readTransform(member)), 'minimal 聚焦不上移').toBe(0)
        expect(
            await member.evaluate((element) => getComputedStyle(element).transitionProperty),
            'minimal 不追加 transform 过渡',
        ).not.toContain('transform')

        expect(
            parseDurations(await page.locator(STEP_BUTTON).first().evaluate((element) => getComputedStyle(element).transitionDuration)).every((value) => value === 0),
            'minimal 步进按钮无过渡',
        ).toBe(true)
    })
})

test.describe('reduced-motion 压平', () => {
    test.use({ reducedMotion: 'reduce' })

    test('expressive 下仍无位移 / 缩放，过渡归零', async ({ page }) => {
        await useExpressive(page)

        await page.locator(CHECKBOX_CONTROL).first().click()
        const indicator = page.locator(CHECKBOX_INDICATOR)
        await expect(indicator).toBeVisible()
        expect(await indicator.evaluate((element) => getComputedStyle(element).animationName), 'reduce 勾选无入场动画').toBe('none')

        await toggleFormError(page)
        expect(
            await page.locator(FORM_ERROR).evaluate((element) => getComputedStyle(element).animationName),
            'reduce 错误行无入场动画',
        ).toBe('none')
        expect(
            parseDurations(await page.locator(FORM_LABEL).evaluate((element) => getComputedStyle(element).transitionDuration)).every((value) => value === 0),
            'reduce 标签过渡归零',
        ).toBe(true)

        const thumb = page.locator(SLIDER_THUMB)
        await thumb.hover()
        expect(computedScale(await readScale(thumb)), 'reduce 悬浮不放大').toBeCloseTo(1, 2)

        const member = page.locator(INPUT_GROUP_MEMBER)
        await page.locator(INPUT_GROUP_CONTROL).focus()
        expect(transformTranslateY(await readTransform(member)), 'reduce 聚焦不上移').toBe(0)
        expect(
            parseDurations(await page.locator(STEP_BUTTON).first().evaluate((element) => getComputedStyle(element).transitionDuration)).every((value) => value === 0),
            'reduce 步进按钮过渡归零',
        ).toBe(true)
    })
})
