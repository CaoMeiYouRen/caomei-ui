import { expect, test as base, type Page } from '@playwright/test'

/**
 * 焦点可见扩面的常驻回归（设计规范 §6「所有组件」行：焦点态可见）。
 *
 * 首批覆盖 5 个非字段 / 非按钮组件（Checkbox / Switch / Tabs 触发器 / SelectButton 条目 /
 * Accordion 触发器）；本规格扩面到**静态可驱动**的其余组件（无需交互开合即可渲染出焦点目标，
 * 共 26 项，含非字段 / 非按钮与带清除 / 关闭按钮的字段族子元素）。边界见
 * `docs/design/governance/` 下的焦点可见扩面记录。
 *
 * 手法：经 CDP `CSS.forcePseudoState` 强制 `:focus-visible`（与 capture 装置的 `button-focus.*`
 * 同口径），断言强制后计算 `outline-style` 非 `none`、`outline-width` 非 `0px`；并以**强制前**
 * `outline-style === 'none'` 作判别力前置守卫——若样式改为常驻描边或选择器失效，前置守卫即失败。
 *
 * 未纳入面（见治理记录）：需交互开合（Dialog / Drawer / Toast / ColorPicker 面板内元素 /
 * 图片预览层）或 box-shadow 焦点环（DatePicker / Select 触发器，已由 capture `state.*` 承载）
 * 的形态不在本规格内。
 *
 * 每个用例在 mobile / tablet / desktop 三 project 下各跑一遍（见 `playwright.config.ts`）。
 */

interface FocusTarget {
    name: string
    selector: string
}

const FOCUS_TARGETS: FocusTarget[] = [
    // 首批：非字段 / 非按钮组件的 5 项
    { name: 'Checkbox', selector: '#ds-checkbox-default .caomei-checkbox__control' },
    { name: 'Switch', selector: '#ds-switch-default .caomei-switch' },
    { name: 'Tabs 触发器', selector: '#tabs-horizontal .caomei-tabs__trigger' },
    { name: 'SelectButton 条目', selector: '#wrap-select-button .caomei-select-button__item' },
    { name: 'Accordion 触发器', selector: '#accordion-collapsible-custom .caomei-accordion__trigger' },
    // 扩面：静态可驱动（无需交互开合即可渲染焦点目标）的其余组件
    { name: 'ToggleButton', selector: '#fv-toggle-button .caomei-toggle-button' },
    { name: 'RadioButton', selector: '#fv-radio .caomei-radio-button' },
    { name: 'Slider 滑块', selector: '#fv-slider .caomei-slider__thumb' },
    { name: 'Stepper 触发器', selector: '#fv-stepper .caomei-stepper__trigger' },
    { name: 'Paginator 控件', selector: '#fv-paginator .caomei-paginator__control' },
    { name: 'ToolbarButton', selector: '#fv-toolbar .caomei-toolbar__button' },
    { name: 'ToolbarLink', selector: '#fv-toolbar .caomei-toolbar__link' },
    { name: 'Popover 触发器', selector: '#fv-popover .caomei-popover__trigger' },
    { name: 'DropdownMenu 触发器', selector: '#fv-dropdown .caomei-dropdown-menu__trigger' },
    { name: 'ColorPicker 触发器', selector: '#fv-color-picker .caomei-color-picker__trigger' },
    { name: 'FileUpload 拖放区', selector: '#fv-file-upload-advanced .caomei-file-upload__dropzone' },
    { name: 'FileUpload 按钮', selector: '#fv-file-upload-basic .caomei-file-upload__button' },
    { name: 'Password 切换', selector: '#fv-password .caomei-password__toggle' },
    { name: 'Tag 关闭', selector: '#fv-tags .caomei-tag__close' },
    { name: 'Tag 可选中', selector: '#fv-tags .caomei-tag--selectable' },
    { name: 'Message 关闭', selector: '#fv-message .caomei-message__close' },
    { name: 'Tabs 面板', selector: '#fv-tabs-content .caomei-tabs__content' },
    { name: 'MultiSelect 标签移除', selector: '#fv-multi-select .caomei-multi-select__tag-remove' },
    { name: 'MultiSelect 清空', selector: '#fv-multi-select .caomei-multi-select__clear' },
    { name: 'AutoComplete 清空', selector: '#fv-auto-complete .caomei-auto-complete__clear' },
    { name: 'AutoComplete 下拉触发器', selector: '#fv-auto-complete .caomei-auto-complete__trigger' },
    { name: 'TagsInput 清空', selector: '#fv-tags-input .caomei-tags-input__clear' },
    { name: 'Select 清空', selector: '#fv-select .caomei-select__clear' },
    { name: 'Calendar 导航', selector: '#calendar-inline .caomei-calendar__nav' },
    { name: 'Calendar 日期', selector: '#calendar-inline .caomei-calendar__day' },
    { name: 'DataTable 排序', selector: '#data-table-sort-width .caomei-data-table__sort' },
]

/** 受检面下界：新增 / 删除目标必须同批更新此值，使「收窄受检范围」显式可见。 */
const MIN_FOCUS_TARGETS = 31

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

test.describe('焦点可见扩面：静态可驱动组件（非字段 / 非按钮 + 字段族子元素）', () => {
    test('受检面下界守卫：目标数不得被静默收窄', () => {
        expect(FOCUS_TARGETS.length, '焦点可见受检目标数低于下界（受检面被收窄？）').toBeGreaterThanOrEqual(MIN_FOCUS_TARGETS)
    })

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
