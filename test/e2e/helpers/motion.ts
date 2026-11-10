import { type Locator, type Page } from '@playwright/test'

/**
 * 动效验收的确定性采样装置（L3）。
 *
 * 口径来源：[动效体系评估 §6.2](../../../docs/design/governance/2026-11-08-motion-system-evaluation.md)。
 * 三条硬约束：
 * 1. **不使用 `sleep`**：等待动画出现靠有界 `requestAnimationFrame` 轮询（帧内可判定）；
 *    轮询带独立的定时器兜底（`Promise.race`），页面被节流时也能按预算返回而不是挂起；
 * 2. **暂停后取样**：取到动画立即 `pause()`，把 `currentTime` 设到目标比例再读计算样式，
 *    避免 CI 负载导致的「动画已结束」竞态；
 * 3. **采样后收尾**：`finish()` 到终态（无限循环动画退化为 `cancel()`），不把元素留在中间帧。
 */

/** 动效 token 名称（与 `check-motion-contract` 的默认集合一致）。 */
export const MOTION_TOKEN_NAMES = [
    '--caomei-motion-duration-instant',
    '--caomei-motion-duration-fast',
    '--caomei-motion-duration-base',
    '--caomei-motion-duration-emphasis',
    '--caomei-motion-duration-slow',
    '--caomei-motion-duration-slower',
    '--caomei-motion-ease-standard',
    '--caomei-motion-ease-out',
    '--caomei-motion-ease-in-out',
    '--caomei-motion-ease-linear',
    '--caomei-motion-distance-sm',
    '--caomei-motion-distance-md',
    '--caomei-motion-scale-from',
] as const

/** 默认采样比例：起点 / 中点 / 终点。 */
export const DEFAULT_RATIOS = [0, 0.5, 1] as const

/** 默认采样属性：淡入淡出与几何位移。 */
export const DEFAULT_PROPS = ['opacity', 'transform'] as const

export interface MotionTokenSnapshot {
    values: Record<string, string>
    missing: string[]
}

/** 读取动效 token 的计算值（可指定容器，用于验证 `data-motion` 的继承范围）。 */
export async function readMotionTokens(target: Locator): Promise<MotionTokenSnapshot> {
    return target.evaluate((element, names) => {
        const computed = getComputedStyle(element)
        const values: Record<string, string> = {}
        const missing: string[] = []
        for (const name of names) {
            const value = computed.getPropertyValue(name).trim()
            values[name] = value
            if (!value) {
                missing.push(name)
            }
        }
        return { values, missing }
    }, [...MOTION_TOKEN_NAMES])
}

export interface AnimationDescriptor {
    /** 动画名（`animation`）或过渡属性（`transition`） */
    name: string
    type: 'animation' | 'transition'
    duration: number
    delay: number
    easing: string
}

export interface TimelineSample {
    ratio: number
    currentTime: number
    styles: Record<string, string>
}

export interface TimelineResult {
    animations: AnimationDescriptor[]
    samples: TimelineSample[]
    /** 本组动画的最大时长（毫秒） */
    maxDuration: number
}

export interface TimelineOptions {
    ratios?: readonly number[]
    props?: readonly string[]
}

export interface TriggerTimelineOptions extends TimelineOptions {
    /** 触发元素选择器（在页面内派发 `triggerEvent`，与采样同一宏任务起点） */
    trigger: string
    /** 动画宿主选择器 */
    target: string
    /** 触发事件：默认 `click`；Reka SelectTrigger 在 `pointerdown` 打开面板 */
    triggerEvent?: 'click' | 'pointerdown'
    /** `enter` 等入场动画；`exit` 先等 `data-state="closed"` 再取退场动画 */
    mode?: 'enter' | 'exit'
    /** 有界等待上限（毫秒），默认 3000 */
    timeout?: number
}

/**
 * 触发交互并在同一帧内暂停采样，按比例读取计算样式。
 *
 * @returns 采样结果；等待期内无动画出现返回 `null`（reduce 或未启用该动效）
 */
export async function sampleTriggeredTimeline(
    page: Page,
    options: TriggerTimelineOptions,
): Promise<TimelineResult | null> {
    const { trigger, target, mode = 'enter', triggerEvent = 'click', timeout = 3000 } = options
    const ratios = [...(options.ratios ?? DEFAULT_RATIOS)]
    const props = [...(options.props ?? DEFAULT_PROPS)]

    return page.evaluate(
        async ({ trigger: triggerSelector, target: targetSelector, mode: sampleMode, triggerEvent: sampleTriggerEvent, timeout: budget, ratios: sampleRatios, props: sampleProps }) => {
            const nextFrame = () => new Promise<void>((resolve) => {
                requestAnimationFrame(() => {
                    resolve()
                })
            })

            const describe = (animation: Animation): AnimationDescriptor => {
                const timing = animation.effect?.getComputedTiming()
                const type: AnimationDescriptor['type'] =
                    typeof CSSAnimation !== 'undefined' && animation instanceof CSSAnimation
                        ? 'animation'
                        : 'transition'
                const name = type === 'animation'
                    ? (animation as CSSAnimation).animationName
                    : (animation as CSSTransition).transitionProperty
                return {
                    name,
                    type,
                    duration: Number(timing?.duration ?? 0),
                    delay: Number(timing?.delay ?? 0),
                    easing: String(timing?.easing ?? ''),
                }
            }

            const sample = (element: Element, animations: Animation[]): TimelineResult => {
                animations.forEach((animation) => {
                    animation.pause()
                })
                const descriptors = animations.map(describe)
                const maxDuration = descriptors.length > 0
                    ? Math.max(...descriptors.map((descriptor) => descriptor.duration))
                    : 0
                const samples: TimelineSample[] = sampleRatios.map((ratio) => {
                    animations.forEach((animation, index) => {
                        const { duration, delay } = descriptors[index]
                        animation.currentTime = delay + duration * ratio
                    })
                    const computed = getComputedStyle(element)
                    const styles: Record<string, string> = {}
                    for (const property of sampleProps) {
                        styles[property] = computed.getPropertyValue(property).trim()
                    }
                    return { ratio, currentTime: maxDuration * ratio, styles }
                })
                for (const animation of animations) {
                    try {
                        animation.finish()
                    } catch {
                        animation.cancel()
                    }
                }
                return { animations: descriptors, samples, maxDuration }
            }

            const triggerElement = document.querySelector(triggerSelector)
            if (!triggerElement) {
                throw new Error(`触发元素不存在：${triggerSelector}`)
            }
            if (sampleTriggerEvent === 'pointerdown') {
                triggerElement.dispatchEvent(new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                    pointerType: 'mouse',
                    button: 0,
                }))
            } else {
                ;(triggerElement as HTMLElement).click()
            }

            const deadline = performance.now() + budget
            // 定时器只作预算兜底（rAF 被节流时不会出帧），不作为「等动画结束」的手段
            const tick = () => Promise.race([
                nextFrame(),
                new Promise<void>((resolve) => {
                    setTimeout(resolve, Math.max(deadline - performance.now(), 0))
                }),
            ])
            while (performance.now() < deadline) {
                await tick()
                const element = document.querySelector(targetSelector)
                if (!element) {
                    continue
                }
                if (sampleMode === 'exit' && element.getAttribute('data-state') !== 'closed') {
                    continue
                }
                const animations = element.getAnimations()
                if (animations.length > 0) {
                    return sample(element, animations)
                }
            }
            return null
        },
        {
            trigger,
            target,
            mode,
            triggerEvent,
            timeout,
            ratios,
            props,
        },
    )
}

/**
 * 收集整页当前动画的时长画像，用于 reduce 双向断言。
 *
 * 无限循环动画（加载指示）没有终态，单独按 `infinite` 标记返回。
 */
export interface DocumentAnimation {
    name: string
    type: 'animation' | 'transition'
    duration: number
    infinite: boolean
    transform: boolean
}

export async function collectDocumentAnimations(page: Page): Promise<DocumentAnimation[]> {
    return page.evaluate(() => {
        const result: DocumentAnimation[] = []
        for (const animation of document.getAnimations()) {
            const timing = animation.effect?.getComputedTiming()
            const effect = animation.effect as KeyframeEffect | null
            const keyframes = effect?.getKeyframes() ?? []
            const transform = keyframes.some((frame) => String(frame.transform ?? '') !== '')
            const type: 'animation' | 'transition' =
                typeof CSSAnimation !== 'undefined' && animation instanceof CSSAnimation ? 'animation' : 'transition'
            const name = type === 'animation'
                ? (animation as CSSAnimation).animationName
                : (animation as CSSTransition).transitionProperty
            result.push({
                name,
                type,
                duration: Number(timing?.duration ?? 0),
                infinite: timing?.iterations === Infinity,
                transform,
            })
        }
        return result
    })
}
