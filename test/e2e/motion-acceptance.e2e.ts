import { expect, test as base, type Page } from '@playwright/test'
import {
    collectDocumentAnimations,
    readMotionTokens,
    sampleTriggeredTimeline,
    type TimelineResult,
} from './helpers/motion'

/**
 * 动效验收矩阵的常驻回归（L3）。
 *
 * 口径来源：[动效体系评估 §6](../../../docs/design/governance/2026-11-08-motion-system-evaluation.md)
 * 与 [动效验收记录](../../../docs/design/governance/2026-11-09-phase29-m6-1-motion-acceptance.md) §2。
 * 覆盖轴与 reduce token、浮层进出场、导航与操作时间轴、
 * 性能长任务冒烟与 reduce 下的无障碍约束。
 *
 * 采样统一走 `helpers/motion.ts`：有界帧轮询 + `pause()` + `currentTime`，**不使用 `sleep`**；
 * 既有批次的行为细节仍由 `overlay-motion` / `navigation-motion` / `focus-and-motion` 承担，
 * 本规格只做跨批次的验收对账，不重复断言。
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

const DIALOG_CONTENT = '.caomei-dialog__content'
const DIALOG_CLOSE = `${DIALOG_CONTENT} .caomei-dialog__close`
const ACCORDION_TRIGGER = '#accordion-collapsible-custom .caomei-accordion__trigger'
const ACCORDION_CONTENT = '#accordion-collapsible-custom .caomei-accordion__content'

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

function asNumber(value: string | undefined): number {
    return Number.parseFloat(value ?? '')
}

test.describe('动效轴与 token', () => {
    test('minimal / expressive / reduce 三态 token 值', async ({ page }) => {
        const html = page.locator('html')
        const minimal = await readMotionTokens(html)
        expect(minimal.missing, '13 个动效 token 必须全部可解析').toEqual([])
        expect(minimal.values['--caomei-motion-duration-base']).toBe('150ms')
        expect(minimal.values['--caomei-motion-duration-slow']).toBe('200ms')
        expect(minimal.values['--caomei-motion-distance-md']).toBe('0px')
        expect(minimal.values['--caomei-motion-scale-from']).toBe('1')

        await useExpressive(page)
        const expressive = await readMotionTokens(html)
        expect(expressive.values['--caomei-motion-duration-base']).toBe('220ms')
        expect(expressive.values['--caomei-motion-duration-slow']).toBe('300ms')
        expect(expressive.values['--caomei-motion-distance-md']).toBe('8px')
        expect(expressive.values['--caomei-motion-scale-from']).toBe('0.96')
        expect(expressive.values['--caomei-motion-ease-standard']).toBe('cubic-bezier(0.2, 0, 0, 1)')

        await page.emulateMedia({ reducedMotion: 'reduce' })
        const reduce = await readMotionTokens(html)
        for (const token of [
            '--caomei-motion-duration-instant',
            '--caomei-motion-duration-fast',
            '--caomei-motion-duration-base',
            '--caomei-motion-duration-emphasis',
            '--caomei-motion-duration-slow',
            '--caomei-motion-duration-slower',
        ]) {
            expect(reduce.values[token], `reduce 下 ${token} 应归零`).toBe('0s')
        }
        expect(reduce.values['--caomei-motion-distance-sm']).toBe('0px')
        expect(reduce.values['--caomei-motion-distance-md']).toBe('0px')
        expect(reduce.values['--caomei-motion-scale-from']).toBe('1')
    })

    test('局部容器挂载 data-motion 只影响后代', async ({ page }) => {
        await page.evaluate(() => document.querySelector('#tabs-horizontal')?.setAttribute('data-motion', 'expressive'))
        const descendant = await readMotionTokens(page.locator('#tabs-horizontal .caomei-tabs__trigger').first())
        expect(descendant.values['--caomei-motion-duration-base']).toBe('220ms')

        const root = await readMotionTokens(page.locator('html'))
        expect(root.values['--caomei-motion-duration-base'], '容器挂载不应污染根节点').toBe('150ms')
    })
})

test.describe('浮层进出场时间轴', () => {
    test('Dialog 入场：0 / 50% / 100% 三帧可复现', async ({ page }) => {
        await useExpressive(page)
        const result = await sampleTriggeredTimeline(page, {
            trigger: '#dialog-open',
            target: DIALOG_CONTENT,
        })
        const timeline = requireTimeline(result, 'expressive 下 Dialog 内容应有入场动画')
        expect(timeline.animations.map((animation) => animation.name).join(',')).toContain('caomei-dialog-content-in')
        expect(timeline.maxDuration, '入场时长应取 duration-base').toBe(220)

        const [start, mid, end] = timeline.samples
        expect(asNumber(start.styles.opacity), '首帧应为透明').toBeLessThan(0.5)
        const midOpacity = asNumber(mid.styles.opacity)
        expect(midOpacity).toBeGreaterThan(0)
        expect(midOpacity).toBeLessThan(1)
        expect(asNumber(end.styles.opacity), '终帧应完全不透明').toBeCloseTo(1, 2)
        expect(start.styles.transform, '首帧应带缩放 / 位移').not.toBe(end.styles.transform)
        expect(end.styles.transform, '终帧应回到居中无缩放').toContain('matrix(1, 0, 0, 1')
    })

    test('Dialog 退场：动画存在且移除时机不早于退场结束', async ({ page }) => {
        await useExpressive(page)
        await sampleTriggeredTimeline(page, { trigger: '#dialog-open', target: DIALOG_CONTENT })

        const exit = await sampleTriggeredTimeline(page, {
            trigger: DIALOG_CLOSE,
            target: DIALOG_CONTENT,
            mode: 'exit',
        })
        const timeline = requireTimeline(exit, 'expressive 下 Dialog 应有退场动画')
        expect(timeline.animations.map((animation) => animation.name).join(',')).toContain('caomei-dialog-content-out')
        expect(timeline.maxDuration, '退场时长应取 duration-fast').toBe(160)
        expect(asNumber(timeline.samples[0].styles.opacity), '退场首帧应可见').toBeCloseTo(1, 2)
        expect(asNumber(timeline.samples[2].styles.opacity), '退场终帧应透明').toBeCloseTo(0, 2)

        await expect(page.locator(DIALOG_CONTENT), '退场结束后 DOM 应移除').toHaveCount(0)
    })

    test.describe('reduce 双向断言', () => {
        test.use({ reducedMotion: 'reduce' })

        test('reduce 下 Dialog 无动画且终态与默认一致', async ({ page }) => {
            await useExpressive(page)
            const result = await sampleTriggeredTimeline(page, {
                trigger: '#dialog-open',
                target: DIALOG_CONTENT,
                timeout: 1200,
            })
            expect(result, 'reduce 下不应出现可动的时间轴').toBeNull()

            const settled = await page.locator(DIALOG_CONTENT).evaluate((element) => {
                const computed = getComputedStyle(element)
                const animations = element.getAnimations()
                return {
                    opacity: computed.opacity,
                    durations: animations.map((animation) => Number(animation.effect?.getComputedTiming().duration ?? 0)),
                }
            })
            expect(settled.opacity, 'reduce 不改变终态').toBe('1')
            expect(settled.durations, 'reduce 下不应留下可动时间轴').toHaveLength(0)
        })
    })
})

test.describe('导航与操作时间轴', () => {
    test('Accordion 展开高度单调增长', async ({ page }) => {
        await useExpressive(page)
        const result = await sampleTriggeredTimeline(page, {
            trigger: ACCORDION_TRIGGER,
            target: ACCORDION_CONTENT,
            props: ['height', 'opacity'],
        })
        const timeline = requireTimeline(result, 'expressive 下 Accordion 应有展开动画')
        const names = timeline.animations.map((animation) => animation.name).join(',')
        expect(names).toContain('caomei-accordion-slide-down')
        expect(names, 'height 动画须叠加淡入').toContain('caomei-accordion-fade-in')
        expect(timeline.animations.some((animation) => animation.duration > 0)).toBe(true)

        const heights = timeline.samples.map((sample) => asNumber(sample.styles.height))
        expect(heights[0], '首帧高度为 0').toBe(0)
        expect(heights[1], '中段应有可见高度').toBeGreaterThan(0)
        expect(heights[2], '终帧高度应大于中段').toBeGreaterThan(heights[1])
    })

    test('Button 过渡随轴切换扩展到 transform', async ({ page }) => {
        const button = page.locator('#dialog-open')
        const readTransition = () => button.evaluate((element) => {
            const computed = getComputedStyle(element)
            return {
                properties: computed.transitionProperty,
                durations: computed.transitionDuration,
            }
        })

        const minimal = await readTransition()
        expect(minimal.properties).not.toContain('transform')
        expect(minimal.durations).toContain('0.15s')

        await useExpressive(page)
        const expressive = await readTransition()
        expect(expressive.properties).toContain('transform')
        expect(expressive.durations).toContain('0.22s')
    })
})

test.describe('性能冒烟（宽松阈值，主观流畅度交人工）', () => {
    test('代表性动画期间无超过 1.5s 的长任务', async ({ page }) => {
        await useExpressive(page)
        const longTasks = await page.evaluate(async () => {
            const durations: number[] = []
            let observer: PerformanceObserver | null = null
            try {
                observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        durations.push(entry.duration)
                    }
                })
                observer.observe({ type: 'longtask', buffered: false })
            } catch {
                return null
            }
            const frame = () => new Promise<void>((resolve) => {
                requestAnimationFrame(() => {
                    resolve()
                })
            })
            const click = (selector: string) => {
                const element = document.querySelector(selector)
                if (element instanceof HTMLElement) {
                    element.click()
                }
            }

            click('#dialog-open')
            await frame()
            await frame()
            click('.caomei-dialog__content .caomei-dialog__close')
            click('#accordion-collapsible-custom .caomei-accordion__trigger')
            for (let index = 0; index < 30; index += 1) {
                await frame()
            }
            observer.disconnect()
            return durations
        })

        test.skip(longTasks === null, '当前浏览器不支持 longtask 观测')
        if (longTasks === null) {
            return
        }
        test.info().annotations.push({
            type: 'longtask',
            description: longTasks.length === 0
                ? '窗口内无长任务（>50ms）'
                : `窗口内长任务 ${longTasks.length} 个，最大 ${Math.round(Math.max(...longTasks))}ms`,
        })
        expect(longTasks.filter((duration) => duration > 1500), '长任务超过 1.5s 应阻断').toEqual([])
    })
})

test.describe('无障碍约束（reduce）', () => {
    test.use({ reducedMotion: 'reduce' })

    test('reduce 下无位移 / 缩放入场，焦点环仍可见', async ({ page }) => {
        await useExpressive(page)
        await page.locator(ACCORDION_TRIGGER).click()
        await expect(page.locator(ACCORDION_CONTENT)).toBeVisible()
        await page.locator('#dialog-open').click()
        await expect(page.locator(DIALOG_CONTENT)).toBeVisible()

        const animations = await collectDocumentAnimations(page)
        const moving = animations.filter((animation) => animation.duration > 0 && animation.transform && !animation.infinite)
        expect(moving, 'reduce 下不应运行一次性位移 / 缩放动画（加载类循环不在面内）').toEqual([])
        const fastLoop = animations.filter((animation) => animation.infinite && animation.duration < 333)
        expect(fastLoop, '无限循环动画不得快于 3 次 / 秒').toEqual([])

        const cdp = await page.context().newCDPSession(page)
        try {
            await cdp.send('DOM.enable')
            await cdp.send('CSS.enable')
            const { root } = await cdp.send('DOM.getDocument', { depth: -1 })
            const selector = '#tabs-horizontal .caomei-tabs__trigger'
            const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector })
            expect(nodeId, '焦点环目标选择器未命中').not.toBe(0)
            await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['focus-visible'] })
            const outline = await page.locator(selector).first().evaluate((element) => {
                const computed = getComputedStyle(element)
                return { style: computed.outlineStyle, width: computed.outlineWidth }
            })
            expect(outline.style, 'reduce 不得移除焦点可见性').not.toBe('none')
            expect(outline.width).toBe('2px')
            await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] })
        } finally {
            await cdp.detach()
        }
    })
})
