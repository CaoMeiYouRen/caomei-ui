import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { expect, test, type Page } from '@playwright/test'
import { measureContrast } from './helpers/contrast'

/**
 * 预设对比度矩阵（真实 Chromium，常驻）。
 *
 * 受检面 = 6 预设（minimal / caomei / momei / sakura / forest / ink）× 明暗 × 2 种背景
 * （页面底 `bg` 与抬升面 `bg-elevated`）：
 * 1. **tone 文本**：5 语气 × soft / outline × Tag / Message + 一条 `text-muted` 样本 = 21 条，阈值 ≥ 4.5:1；
 * 2. **控件边界**：Input / Checkbox / Switch / Slider / Calendar 导航 / RTE 容器 = 6 条，WCAG 1.4.11 图形阈值 ≥ 3:1；
 * 3. **`-solid` 配对**：5 语气的实底按钮 × 默认 / hover / active = 5 条 × 3 态，阈值 ≥ 4.5:1
 *    （`caomei` `primary-solid` 为在册品牌例外，见 `SOLID_EXCEPTIONS`）；
 * 4. **正向对照**：12 档的 `--caomei-color-primary` 必须互不相同，证明预设 / 明暗确实生效；
 * 5. **axe 复核**：Tag / Message 的 `color-contrast` 规则零违规（与人工矩阵同源、可复现）。
 *
 * 文本按**实际合成背景**计算（soft 底为半透明 `color-mix`）；边界与底色按「颜色 vs 父级实际背景」计算；
 * `-solid` 为不透明实底，仍按同一合成路径测量，以锁定「实底不得退化为半透明」。
 */

const SECTION = '#preset-contrast'
const TEXT_CELLS = `${SECTION} .caomei-tag, ${SECTION} .caomei-message, ${SECTION} .fixture-muted`

/** 6 预设 × 明暗 × 2 背景 × 21 条/档；下界防受检面被静默收窄。 */
const MIN_TEXT_CELLS = 21

/** 期望的文本键集合（20 条 tone 文本 + 1 条 muted）。 */
const EXPECTED_TEXT_KEYS = [
    ...['neutral', 'primary', 'success', 'warning', 'danger'].flatMap((tone) => [
        `tag/${tone}/soft`,
        `tag/${tone}/outline`,
        `message/${tone}/soft`,
        `message/${tone}/outline`,
    ]),
    'muted/text',
]

/** 期望的非文本键集合；下界防受检面被静默收窄（删条目不能靠长度自洽拦住）。 */
const EXPECTED_NON_TEXT_KEYS = ['input', 'checkbox', 'switch', 'slider', 'calendar-nav', 'rte-border']
const MIN_NON_TEXT_CELLS = EXPECTED_NON_TEXT_KEYS.length

/** 控件边界受检单元。 */
const NON_TEXT_CELLS = [
    { key: 'input', selector: `${SECTION} [data-nontext="input"] .caomei-field`, mode: 'border' },
    { key: 'checkbox', selector: `${SECTION} [data-nontext="checkbox"] .caomei-checkbox__control`, mode: 'border' },
    { key: 'switch', selector: `${SECTION} [data-nontext="switch"] .caomei-switch`, mode: 'background' },
    { key: 'slider', selector: `${SECTION} [data-nontext="slider"] .caomei-slider__track`, mode: 'background' },
    { key: 'calendar-nav', selector: `${SECTION} [data-nontext="calendar"] .caomei-calendar__nav`, mode: 'border' },
    { key: 'rte-border', selector: `${SECTION} [data-nontext="rte"] .caomei-rich-text-editor__editor`, mode: 'border' },
] as const

/** `-solid` 配对受检单元（5 语气的实底按钮）。 */
const SOLID_TONES = ['neutral', 'primary', 'success', 'warning', 'danger'] as const
const SOLID_CELLS = `${SECTION} .caomei-button[data-contrast-key^="solid/"]`

/** 期望的实底键集合；下界防受检面被静默收窄。 */
const EXPECTED_SOLID_KEYS = SOLID_TONES.map((tone) => `solid/${tone}`)
const MIN_SOLID_CELLS = SOLID_TONES.length

/** 实底三态（hover / active 由 Button 的 `color-mix()` 派生）。 */
const SOLID_STATES = ['default', 'hover', 'active'] as const
type SolidState = (typeof SOLID_STATES)[number]

const SOLID_FORCED_PSEUDO: Record<SolidState, string[]> = {
    default: [],
    hover: ['hover'],
    active: ['hover', 'active'],
}

/** 状态稳定等待：`background-color` 参与 150ms 过渡。 */
const SOLID_SETTLE_MS = 260

/**
 * `-solid` 配对的在册例外（键 = `<preset>/<tone>`）。
 *
 * 唯一例外是 `caomei` 的 `primary-solid` `#e63946` 配 `on-solid` 白字 4.168:1——**品牌源保真**
 * （用户决策预设品牌色保持不变），见 `docs/design/design-spec.md` §3.2 与
 * `docs/design/governance/2026-10-01-phase18-m4-2-contrast-terminal-conclusions.md`。
 * `floor` 只是**默认态**的容忍下界；hover / active 仍按正式阈值（4.5 + 裕度）断言。
 * 配色修复到正式阈值后本表必须移除（下方 stale-exception 断言会失败）。
 */
const SOLID_EXCEPTIONS = new Map<string, { floor: number, reason: string }>([
    ['caomei/primary', {
        floor: 4,
        reason: '品牌源 primary-solid #e63946 + on-solid 白字 4.168:1，用户决策保留',
    }],
])

const PRESETS = ['minimal', 'caomei', 'momei', 'sakura', 'forest', 'ink'] as const
const THEMES = ['light', 'dark'] as const
const BACKGROUNDS = ['bg', 'elevated'] as const
type Background = (typeof BACKGROUNDS)[number]

const MIN_RATIO = 4.5
const MIN_MARGIN = 0.04
const MIN_NON_TEXT = 3
const MIN_NON_TEXT_MARGIN = 0.05

const require = createRequire(import.meta.url)
const AXE_SOURCE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')

interface AxeRunner {
    axe: {
        run: (context: string | string[], options: { runOnly: string[] }) => Promise<{ violations: { nodes: unknown[] }[] }>
    }
}

interface NonTextCell {
    key: string
    ratio: number
    color: string
    background: string
}

/** 读「边界色（边框或底色） vs 父级实际合成背景」的对比度。 */
async function measureNonText(page: Page, cells: typeof NON_TEXT_CELLS): Promise<NonTextCell[]> {
    return page.evaluate((entries) => {
        const context = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D

        const parse = (color: string): [number, number, number, number] => {
            if (/^color\(/iu.test(color.trim())) {
                const channels = color.match(/[\d.]+/gu)?.map(Number) ?? []
                const [red = 0, green = 0, blue = 0, alpha = 1] = channels
                return [red * 255, green * 255, blue * 255, alpha]
            }
            const sentinel = '#010203'
            context.fillStyle = sentinel
            context.fillStyle = color
            if (context.fillStyle === sentinel) {
                throw new Error(`无法解析颜色：${color}`)
            }
            const normalized = context.fillStyle as string
            if (normalized.startsWith('#')) {
                const hex = normalized.slice(1)
                return [
                    Number.parseInt(hex.slice(0, 2), 16),
                    Number.parseInt(hex.slice(2, 4), 16),
                    Number.parseInt(hex.slice(4, 6), 16),
                    1,
                ]
            }
            const numbers = normalized.match(/[\d.]+/g)?.map(Number) ?? []
            return [numbers[0] ?? 0, numbers[1] ?? 0, numbers[2] ?? 0, numbers[3] ?? 1]
        }

        /** 自根向下逐层合成，得到元素的实际背景。 */
        const composite = (element: Element | null): [number, number, number] => {
            const chain: string[] = []
            let node: Element | null = element
            while (node) {
                chain.push(getComputedStyle(node).backgroundColor)
                node = node.parentElement
            }
            let result: [number, number, number] = [255, 255, 255]
            for (const color of chain.reverse()) {
                const [red, green, blue, alpha] = parse(color)
                if (alpha === 0) {
                    continue
                }
                result = [
                    red * alpha + result[0] * (1 - alpha),
                    green * alpha + result[1] * (1 - alpha),
                    blue * alpha + result[2] * (1 - alpha),
                ]
            }
            return result
        }

        const luminance = ([red, green, blue]: [number, number, number]): number => {
            const channel = (value: number): number => {
                const ratio = value / 255
                return ratio <= 0.03928 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4
            }
            return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
        }

        const ratioOf = (a: [number, number, number], b: [number, number, number]): number => {
            const la = luminance(a)
            const lb = luminance(b)
            return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
        }

        return entries.flatMap((entry) => {
            const element = document.querySelector<HTMLElement>(entry.selector)
            if (!element) {
                return []
            }
            const style = getComputedStyle(element)
            const [red, green, blue, alpha] = parse(entry.mode === 'border' ? style.borderTopColor : style.backgroundColor)
            const background = composite(element.parentElement)
            const foreground: [number, number, number] = [
                red * alpha + background[0] * (1 - alpha),
                green * alpha + background[1] * (1 - alpha),
                blue * alpha + background[2] * (1 - alpha),
            ]
            return [{
                key: entry.key,
                ratio: ratioOf(foreground, background),
                color: entry.mode === 'border' ? style.borderTopColor : style.backgroundColor,
                background: `rgb(${background.map((value) => Math.round(value)).join(', ')})`,
            }]
        })
    }, cells as unknown as typeof NON_TEXT_CELLS)
}

/** 切换预设 / 明暗与背景面，并返回当前 `--caomei-color-primary`（正向对照用）。 */
async function applyContext(page: Page, preset: string, theme: string, background: Background): Promise<string> {
    const primary = await page.evaluate(([nextPreset, nextTheme, nextBackground]) => {
        const root = document.documentElement
        root.dataset.preset = nextPreset
        root.classList.toggle('dark', nextTheme === 'dark')
        root.dataset.theme = nextTheme
        const section = document.querySelector<HTMLElement>('#preset-contrast')
        if (section) {
            section.style.background = nextBackground === 'elevated' ? 'var(--caomei-color-bg-elevated)' : 'transparent'
        }
        return getComputedStyle(root).getPropertyValue('--caomei-color-primary').trim()
    }, [preset, theme, background])
    await page.waitForTimeout(200)
    return primary
}

interface SolidStateDriver {
    apply: (state: SolidState) => Promise<void>
}

/**
 * 登记 `-solid` 受检单元并返回可重复切换伪类状态的驱动器。
 *
 * 与 `button-states.e2e.ts` 同口径：`color-mix()` 派生值只能在真实浏览器里由强制伪类证明。
 * CDP 的 nodeId 在预设 / 明暗切换后保持稳定，故整条用例只登记一次。
 */
async function prepareSolidStates(page: Page): Promise<SolidStateDriver> {
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('DOM.enable')
    await cdp.send('CSS.enable')
    const { root } = await cdp.send('DOM.getDocument', { depth: -1 })
    const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: SOLID_CELLS })

    expect(nodeIds.length, '`-solid` 受检面不得被静默收窄').toBeGreaterThanOrEqual(MIN_SOLID_CELLS)

    return {
        async apply(state) {
            for (const nodeId of nodeIds) {
                await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [...SOLID_FORCED_PSEUDO[state]] })
            }
            await page.waitForTimeout(SOLID_SETTLE_MS)
        },
    }
}

/** 读 5 条实底按钮的未合成底色（用于「三态互不相同」的相对比较）。 */
async function solidSnapshots(page: Page): Promise<Map<string, string>> {
    const entries = await page.evaluate((selector) => Array.from(document.querySelectorAll<HTMLElement>(selector)).map((element) => [
        element.dataset.contrastKey ?? '',
        getComputedStyle(element).backgroundColor,
    ] as [string, string]), SOLID_CELLS)
    return new Map(entries)
}

test.describe('预设对比度矩阵', () => {
    test('6 预设 × 明暗 × 2 背景：tone 文本 ≥ 4.5:1 且控件边界 ≥ 3:1', async ({ page }) => {
        await page.goto('/?rte=1')
        // RTE 内核为异步加载；边界测点只在就绪后存在（其余边界项即时）
        await expect(page.locator(`${SECTION} [data-nontext="rte"] .caomei-rich-text-editor__editor`)).toBeVisible({ timeout: 60_000 })

        const primaries = new Set<string>()

        for (const preset of PRESETS) {
            for (const theme of THEMES) {
                for (const background of BACKGROUNDS) {
                    primaries.add(await applyContext(page, preset, theme, background))
                    const label = `${preset}/${theme}/${background}`

                    const texts = await measureContrast(page, TEXT_CELLS)
                    expect(texts.length, `${label}：tone 文本受检面不得被静默收窄`).toBeGreaterThanOrEqual(MIN_TEXT_CELLS)
                    expect(texts.map((cell) => cell.key).sort(), `${label}：文本受检键集合被替换`).toEqual([...EXPECTED_TEXT_KEYS].sort())
                    const textFailures = texts
                        .filter((cell) => cell.ratio < MIN_RATIO + MIN_MARGIN)
                        .map((cell) => `${cell.key}:${cell.ratio.toFixed(3)}`)
                        .join(' ')
                    expect(
                        Math.min(...texts.map((cell) => cell.ratio)),
                        `${label}：tone 文本低于阈值（${textFailures}）`,
                    ).toBeGreaterThanOrEqual(MIN_RATIO + MIN_MARGIN)

                    const nonText = await measureNonText(page, NON_TEXT_CELLS)
                    expect(nonText.length, `${label}：控件边界受检面不得被静默收窄`).toBeGreaterThanOrEqual(MIN_NON_TEXT_CELLS)
                    expect(nonText.map((cell) => cell.key).sort(), `${label}：控件边界受检键集合被替换`).toEqual([...EXPECTED_NON_TEXT_KEYS].sort())
                    const nonTextFailures = nonText
                        .filter((cell) => cell.ratio < MIN_NON_TEXT + MIN_NON_TEXT_MARGIN)
                        .map((cell) => `${cell.key}:${cell.ratio.toFixed(3)}`)
                        .join(' ')
                    expect(
                        Math.min(...nonText.map((cell) => cell.ratio)),
                        `${label}：控件边界低于 3:1（${nonTextFailures}）`,
                    ).toBeGreaterThanOrEqual(MIN_NON_TEXT + MIN_NON_TEXT_MARGIN)
                }
            }
        }

        // 正向对照：12 档的 primary 必须互不相同，否则「预设 / 明暗未生效」会让矩阵空转
        expect(primaries.size, '预设 / 明暗未真正生效（primary 取值出现重复）').toBe(PRESETS.length * THEMES.length)
    })

    test('6 预设 × 明暗 × 2 背景：`-solid` 配对默认 / hover / active ≥ 4.5:1', async ({ page }) => {
        // 24 档 × 3 态 × 260ms 过渡等待 + 测量；默认 30s 不足以覆盖矩阵
        test.setTimeout(120_000)
        await page.goto('/')
        const driver = await prepareSolidStates(page)

        const primaries = new Set<string>()
        const exceptionMin = new Map<string, number>()
        const failures: string[] = []

        for (const preset of PRESETS) {
            for (const theme of THEMES) {
                for (const background of BACKGROUNDS) {
                    primaries.add(await applyContext(page, preset, theme, background))
                    const label = `${preset}/${theme}/${background}`

                    const backgrounds = new Map<SolidState, Map<string, string>>()
                    for (const state of SOLID_STATES) {
                        await driver.apply(state)
                        const cells = await measureContrast(page, SOLID_CELLS)
                        expect(cells.length, `${label}/${state}：\`-solid\` 受检面不得被静默收窄`).toBeGreaterThanOrEqual(MIN_SOLID_CELLS)
                        expect(cells.map((cell) => cell.key).sort(), `${label}/${state}：实底受检键集合被替换`).toEqual([...EXPECTED_SOLID_KEYS].sort())
                        backgrounds.set(state, await solidSnapshots(page))

                        for (const cell of cells) {
                            const tone = cell.key.replace('solid/', '')
                            const exceptionKey = `${preset}/${tone}`
                            const exception = SOLID_EXCEPTIONS.get(exceptionKey)
                            // 例外只放宽**默认态**下限；hover / active 必须按正式阈值，避免跨态放宽掩盖回归
                            const threshold = exception && state === 'default' ? exception.floor : MIN_RATIO + MIN_MARGIN
                            if (cell.ratio < threshold) {
                                failures.push(`${label}/${state} ${cell.key}: ${cell.ratio.toFixed(3)} < ${threshold}`)
                            }
                            if (exception) {
                                exceptionMin.set(exceptionKey, Math.min(exceptionMin.get(exceptionKey) ?? Number.POSITIVE_INFINITY, cell.ratio))
                            }
                        }
                    }

                    // 三态必须有独立反馈：伪类未生效或 `color-mix()` 静默失效时，对比度断言会空转
                    const defaults = backgrounds.get('default') ?? new Map<string, string>()
                    const hovers = backgrounds.get('hover') ?? new Map<string, string>()
                    const actives = backgrounds.get('active') ?? new Map<string, string>()
                    for (const key of EXPECTED_SOLID_KEYS) {
                        expect(hovers.get(key), `${label}：${key} 的 hover 未改变实底色`).not.toBe(defaults.get(key))
                        expect(actives.get(key), `${label}：${key} 的 active 未提供独立反馈`).not.toBe(hovers.get(key))
                    }
                }
            }
        }

        expect(failures, '`-solid` 配对存在低于阈值 / 例外下限的组合').toEqual([])
        expect(BACKGROUNDS.length, '背景轴被静默收窄（验收要求 `bg` / `bg-elevated` 两档）').toBe(2)
        expect(primaries.size, '预设 / 明暗未真正生效（primary 取值出现重复）').toBe(PRESETS.length * THEMES.length)

        // 例外表不得静默失效：既不能低于下限继续恶化，也不能在被修复后残留（allowlist-stale）
        for (const [key, exception] of SOLID_EXCEPTIONS) {
            const observed = exceptionMin.get(key)
            expect(observed, `在册例外 ${key} 未被观测到（受检面或键集合被改坏）`).toBeDefined()
            expect(observed ?? 0, `${key}（${exception.reason}）低于例外下限 ${exception.floor}`).toBeGreaterThanOrEqual(exception.floor)
            expect(observed ?? 0, `${key} 已达到正式阈值（含裕度），请从 SOLID_EXCEPTIONS 移除（stale exception）`).toBeLessThan(MIN_RATIO + MIN_MARGIN)
        }
    })

    test('axe：Tag / Message 在 6 预设 × 明暗 × 2 背景下 color-contrast 零违规', async ({ page }) => {
        await page.goto('/')
        await page.addScriptTag({ content: AXE_SOURCE })

        for (const preset of PRESETS) {
            for (const theme of THEMES) {
                for (const background of BACKGROUNDS) {
                    await applyContext(page, preset, theme, background)
                    const violations = await page.evaluate(async () => {
                        const runner = (window as unknown as AxeRunner).axe
                        const result = await runner.run(['#preset-contrast .caomei-tag', '#preset-contrast .caomei-message'], { runOnly: ['color-contrast'] })
                        return result.violations.reduce((total, violation) => total + violation.nodes.length, 0)
                    })
                    expect(violations, `${preset}/${theme}/${background}：Tag / Message 存在 color-contrast 违规`).toBe(0)
                }
            }
        }
    })
})
