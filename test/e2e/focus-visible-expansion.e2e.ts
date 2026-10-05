import { expect, test as base, type Page } from '@playwright/test'

/**
 * 焦点可见扩面的常驻回归（设计规范 §6「所有组件」行：焦点态可见）。
 *
 * 既有覆盖集中在 Button / 字段族（capture `button-focus.*` + `state.*`）。本规格把受检面扩到
 * **非字段 / 非按钮**组件：Checkbox / Switch / Tabs 触发器 / SelectButton 条目 / Accordion 触发器。
 *
 * 手法：经 CDP `CSS.forcePseudoState` 强制 `:focus-visible`（与 capture 装置的 `button-focus.*`
 * 同口径），断言强制后计算 `outline-style` 非 `none`、`outline-width` 非 `0px`；并以**强制前**
 * `outline-style === 'none'` 作判别力前置守卫——若样式改为常驻描边或选择器失效，前置守卫即失败。
 *
 * 每个用例在 mobile / tablet / desktop 三 project 下各跑一遍（见 `playwright.config.ts`）。
 */

interface FocusTarget {
    name: string
    selector: string
}

const FOCUS_TARGETS: FocusTarget[] = [
    { name: 'Checkbox', selector: '#ds-checkbox-default .caomei-checkbox__control' },
    { name: 'Switch', selector: '#ds-switch-default .caomei-switch' },
    { name: 'Tabs 触发器', selector: '#tabs-horizontal .caomei-tabs__trigger' },
    { name: 'SelectButton 条目', selector: '#wrap-select-button .caomei-select-button__item' },
    { name: 'Accordion 触发器', selector: '#accordion-collapsible-custom .caomei-accordion__trigger' },
]

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

interface OutlineStyle {
    style: string
    width: string
    color: string
}

async function outlineOf(page: Page, selector: string): Promise<OutlineStyle> {
    return page.locator(selector).first().evaluate((element) => {
        const computed = getComputedStyle(element)
        return { style: computed.outlineStyle, width: computed.outlineWidth, color: computed.outlineColor }
    })
}

test.describe('焦点可见扩面：非字段 / 非按钮组件', () => {
    for (const target of FOCUS_TARGETS) {
        test(`${target.name}：:focus-visible 呈现可见焦点环`, async ({ page }) => {
            const before = await outlineOf(page, target.selector)
            expect(before.style, `${target.name} 强制前不应有常驻描边（判别力前置守卫）`).toBe('none')

            const cdp = await page.context().newCDPSession(page)
            try {
                await cdp.send('DOM.enable')
                await cdp.send('CSS.enable')
                const { root } = await cdp.send('DOM.getDocument', { depth: -1 })
                const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: target.selector })
                expect(nodeId, `${target.name} 选择器未命中`).not.toBe(0)

                await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['focus-visible'] })
                const focused = await outlineOf(page, target.selector)
                expect(focused.style, `${target.name} :focus-visible 应呈现描边`).not.toBe('none')
                expect(focused.width, `${target.name} 焦点环应为 2px`).toBe('2px')
                expect(focused.color, `${target.name} 焦点环应有可辨颜色`).not.toBe('rgba(0, 0, 0, 0)')

                await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] })
            } finally {
                await cdp.detach()
            }
        })
    }
})
