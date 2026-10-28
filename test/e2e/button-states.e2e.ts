import { expect, test, type Page } from '@playwright/test'
import { measureContrast } from './helpers/contrast'

/**
 * Button 状态反馈复核（真实 Chromium，常驻）。
 *
 * 受检面 = 夹具 `#button-contrast` 段的 **3 变体 × 6 语气 = 18 条**（下界断言防清单被静默收窄）；
 * 暗色档经 `data-theme="dark"` 切换。三条判据：
 *
 * 1. **反馈存在**：强制 `:hover` / `:active` 后，计算样式必须与默认态 / 上一态不同——
 *    `color-mix()` 派生值在 happy-dom 里既不算 scoped CSS 也不解析，只能由真实浏览器证明；
 * 2. **对比度不降级**：三态（默认 / hover / active）× 亮暗两档，文字与实际合成背景的
 *    WCAG 相对亮度比均 ≥ 4.5:1（`ghost` 的半透明底色逐层合成后判定）；
 * 3. **边界不变**：`:disabled` 不参与状态反馈、`:focus-visible` 描边契约不变、
 *    `prefers-reduced-motion: reduce` 下无过渡。
 */

const SECTION = '#button-contrast'
const CELLS = `${SECTION} .caomei-button:not([data-button-disabled])`

/** 受检单元下界（3 变体 × 6 语气） */
const MIN_CELLS = 18

/** WCAG AA 正文阈值。 */
const MIN_RATIO = 4.5

/**
 * 最小裕度：实测最低组合为默认态 `danger`（4.83），状态色只向远离文字的方向移动，
 * 因此 0.04 的裕度不会把合法的状态派生判失败，又能拦住贴线回退。
 */
const MIN_MARGIN = 0.04

/** 状态稳定等待：`color` / `background-color` / `border-color` 均参与 150ms 过渡。 */
const SETTLE_MS = 260

const STATES = ['default', 'hover', 'active'] as const
type ButtonState = (typeof STATES)[number]

const FORCED_PSEUDO: Record<ButtonState, string[]> = {
    default: [],
    hover: ['hover'],
    active: ['hover', 'active'],
}

interface StateDriver {
    apply: (state: ButtonState) => Promise<void>
}

/** 打开夹具并登记受检单元；返回可重复切换伪类状态的驱动器。 */
async function prepare(page: Page): Promise<StateDriver> {
    await page.goto('/')

    const cdp = await page.context().newCDPSession(page)
    await cdp.send('DOM.enable')
    await cdp.send('CSS.enable')
    const { root } = await cdp.send('DOM.getDocument', { depth: -1 })
    const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: CELLS })

    expect(nodeIds.length, '按钮状态受检面不得被静默收窄').toBeGreaterThanOrEqual(MIN_CELLS)

    return {
        async apply(state) {
            for (const nodeId of nodeIds) {
                await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [...FORCED_PSEUDO[state]] })
            }
            await page.waitForTimeout(SETTLE_MS)
        },
    }
}

interface StateSnapshot {
    key: string
    color: string
    background: string
    border: string
}

/** 读 18 条按钮的状态色（未合成，用于「两态是否不同」的相对比较）。 */
async function snapshot(page: Page): Promise<StateSnapshot[]> {
    return page.evaluate((selector) => Array.from(document.querySelectorAll<HTMLElement>(selector)).map((element) => {
        const style = getComputedStyle(element)
        return {
            key: element.dataset.contrastKey ?? '',
            color: style.color,
            background: style.backgroundColor,
            border: style.borderTopColor,
        }
    }), CELLS)
}

/** 失败明细（键 / 实测比）便于定位到具体变体 × 语气。 */
function describeFailures(cells: { key: string, ratio: number, color: string, background: string }[]): string {
    return cells
        .filter((cell) => cell.ratio < MIN_RATIO + MIN_MARGIN)
        .map((cell) => `${cell.key}: ${cell.ratio.toFixed(3)}（${cell.color} on ${cell.background}）`)
        .join('; ')
}

async function expectContrast(page: Page, driver: StateDriver, label: string): Promise<void> {
    for (const state of STATES) {
        await driver.apply(state)
        const cells = await measureContrast(page, CELLS)
        expect(cells.length, `${label} / ${state}：受检面不得被静默收窄`).toBeGreaterThanOrEqual(MIN_CELLS)
        expect(
            Math.min(...cells.map((cell) => cell.ratio)),
            `${label} / ${state}：最低对比度应高出阈值一个可维护裕度（${describeFailures(cells)}）`,
        ).toBeGreaterThanOrEqual(MIN_RATIO + MIN_MARGIN)
        expect(describeFailures(cells), `${label} / ${state}：存在低于阈值的组合`).toBe('')
    }
}

test.describe('Button 状态反馈', () => {
    test('hover / active 与默认态的计算样式不同', async ({ page }) => {
        const driver = await prepare(page)

        const byState = new Map<ButtonState, StateSnapshot[]>()
        for (const state of STATES) {
            await driver.apply(state)
            byState.set(state, await snapshot(page))
        }

        const diff = (left: StateSnapshot, right: StateSnapshot): boolean =>
            left.color !== right.color || left.background !== right.background || left.border !== right.border

        for (const [index, hover] of (byState.get('hover') ?? []).entries()) {
            const base = byState.get('default')?.[index]
            expect(base, `缺少默认态快照：${hover.key}`).toBeDefined()
            if (base) {
                expect(diff(base, hover), `${hover.key}：hover 未改变任何状态色`).toBe(true)
            }
        }

        for (const [index, active] of (byState.get('active') ?? []).entries()) {
            const hover = byState.get('hover')?.[index]
            expect(hover, `缺少 hover 快照：${active.key}`).toBeDefined()
            if (hover) {
                expect(diff(hover, active), `${active.key}：active 未提供独立反馈`).toBe(true)
            }
        }
    })

    test('亮色：默认 / hover / active 全部变体 × 语气达到 WCAG AA 正文阈值', async ({ page }) => {
        const driver = await prepare(page)
        await expectContrast(page, driver, '亮色')
    })

    test('暗色：默认 / hover / active 全部变体 × 语气达到 WCAG AA 正文阈值', async ({ page }) => {
        const driver = await prepare(page)
        await page.evaluate(() => {
            document.documentElement.dataset.theme = 'dark'
        })
        await expectContrast(page, driver, '暗色')
    })

    test('disabled 不参与状态反馈', async ({ page }) => {
        await page.goto('/')

        const disabled = page.locator(`${SECTION} [data-button-disabled]`)
        await expect(disabled).toHaveCount(1)

        const read = (): Promise<{ background: string, color: string, cursor: string }> =>
            disabled.evaluate((element) => {
                const style = getComputedStyle(element)
                return { background: style.backgroundColor, color: style.color, cursor: style.cursor }
            })

        const before = await read()
        expect(before.cursor, '禁用态保持 not-allowed').toBe('not-allowed')

        const cdp = await page.context().newCDPSession(page)
        await cdp.send('DOM.enable')
        await cdp.send('CSS.enable')
        const { root } = await cdp.send('DOM.getDocument', { depth: -1 })

        // 阳性对照：同一强制机制作用在启用态按钮上必须改变状态色，否则「禁用态未变」无法自证
        const enabledSelector = `${SECTION} [data-contrast-key="primary/none"]`
        const { nodeId: enabledNodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: enabledSelector })
        expect(enabledNodeId, '阳性对照按钮未命中').toBeTruthy()
        const enabledBefore = await page.locator(enabledSelector).evaluate((element) => getComputedStyle(element).backgroundColor)
        await cdp.send('CSS.forcePseudoState', { nodeId: enabledNodeId, forcedPseudoClasses: ['hover'] })
        await page.waitForTimeout(SETTLE_MS)
        const enabledAfter = await page.locator(enabledSelector).evaluate((element) => getComputedStyle(element).backgroundColor)
        expect(enabledAfter, '强制 hover 未生效，禁用态断言不可信').not.toBe(enabledBefore)
        await cdp.send('CSS.forcePseudoState', { nodeId: enabledNodeId, forcedPseudoClasses: [] })

        const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: `${SECTION} [data-button-disabled]` })
        expect(nodeId, '禁用态按钮未命中').toBeTruthy()
        await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['hover', 'active'] })
        await page.waitForTimeout(SETTLE_MS)

        expect(await read(), '禁用态不得因 hover / active 改变状态色').toEqual(before)
    })

    test('focus-visible 描边契约不变', async ({ page }) => {
        const driver = await prepare(page)
        await driver.apply('default')

        const target = `${SECTION} [data-contrast-key="primary/none"]`
        const readOutline = (): Promise<{ style: string, width: string, offset: string }> =>
            page.locator(target).evaluate((element) => {
                const style = getComputedStyle(element)
                return {
                    style: style.outlineStyle,
                    width: style.outlineWidth,
                    offset: style.outlineOffset,
                }
            })

        // 判别力前置：未强制时本来就没有描边（与 focus-visible-expansion 用例同口径），否则下面的断言恒真
        expect((await readOutline()).style, '未聚焦时不应有描边（前置守卫）').toBe('none')

        const cdp = await page.context().newCDPSession(page)
        await cdp.send('DOM.enable')
        await cdp.send('CSS.enable')
        const { root } = await cdp.send('DOM.getDocument', { depth: -1 })
        const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: target })
        expect(nodeId, '焦点契约按钮未命中').toBeTruthy()
        await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['focus-visible'] })
        await page.waitForTimeout(SETTLE_MS)

        expect(await readOutline()).toEqual({ style: 'solid', width: '2px', offset: '2px' })
    })

    test('prefers-reduced-motion 下无过渡，但状态反馈仍生效', async ({ page }) => {
        /*
         * 本套 E2E 全局以 `reducedMotion: 'reduce'` 运行（`playwright.config.ts`），这里显式声明是为了
         * 让用例自解释；「默认动效 vs 减动效」的双向对照由 `focus-and-motion.e2e.ts` 的 no-preference 块承担。
         */
        await page.emulateMedia({ reducedMotion: 'reduce' })
        const driver = await prepare(page)

        const transition = await page.locator(`${SECTION} .caomei-button`).first().evaluate((element) => {
            const style = getComputedStyle(element)
            return { duration: style.transitionDuration, property: style.transitionProperty }
        })
        expect(transition.property, '减动效档不得保留过渡属性').toBe('none')
        expect(transition.duration).toBe('0s')

        await driver.apply('default')
        const base = await snapshot(page)
        await driver.apply('hover')
        const hover = await snapshot(page)

        expect(
            base.some((cell, index) => cell.background !== hover[index]?.background || cell.color !== hover[index]?.color),
            '减动效只关闭过渡，不得连状态反馈一起关掉',
        ).toBe(true)
    })
})
