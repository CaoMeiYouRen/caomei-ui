import { expect, test as base, type Locator, type Page } from '@playwright/test'
import {
    expectInsideViewport,
    expectKeyboardEntryRevealsFirstMember,
    expectKeyboardTabFocusVisibleInContainer,
    expectLocatorNoHorizontalOverflow,
    expectPageNoHorizontalOverflow,
    expectPanelNotNarrowerThanTrigger,
    expectScrollContainerMembersNotClipped,
    expectWrapContainerNotClipped,
    viewportOf,
} from './helpers/layout'

/**
 * 响应式设计 §4 验收标准的常驻用例（多视口）。
 *
 * 覆盖四类可判定口径：
 * 1. 浮层面板：落在视口内、不窄于触发器（断言 2 / 6）；
 * 2. 换行类容器：纵向不裁切、成员完整落在容器内（断言 3）；
 * 3. 滚动类容器：成员自身不被裁切、按档位可滚动、确有滚动量（断言 1 / 3）；
 * 4. 键盘聚焦：滚动容器内聚焦成员落在容器可视区内，且**聚焦前完全在滚动区外**时完整滚入（断言 3）。
 *
 * 用例级自动断言「0 console error」（断言 5）。断言 4（桌面与改动前基线一致）需批次自身基线归档，
 * 常驻用例只覆盖其形态回归部分（窄屏规则在桌面不生效）。
 *
 * **键盘聚焦口径现状**：§4 要求的强口径（无条件完整可见）当前不可达且待用户裁定——
 * 详见 `docs/design/responsive.md` §4 的键盘聚焦段与本仓库 backlog 候选。本文件按可判定部分断言，
 * 并在窄屏下硬性要求「完全在滚动区外」的分支被触发，避免该口径静默失去覆盖。
 *
 * 每个用例在 mobile / tablet / desktop 三个 project 下各跑一遍（见 playwright.config.ts）。
 */

/** 响应式设计 §2 的 md 档：≤768px 时组件的收敛规则生效 */
const MD_BREAKPOINT = 768

interface PanelCase {
    name: string
    /** 触发器选择器（限定在所属 section 内） */
    trigger: string
    /** 面板选择器：portal 挂在 body 下，故不加 section 前缀 */
    panel: string
}

interface WrapCase {
    name: string
    container: string
    members: string
    /** 打开容器的前置动作（如 Dialog 需要先点开触发器） */
    prepare?: (page: Page) => Promise<void>
}

interface ScrollCase {
    name: string
    container: string
    members: string
    /** 窄屏下内容是否确实超宽（「确有滚动量」）；不超宽的组件同样命中 md 档规则但不要求滚动条 */
    scrollableWhenNarrow: boolean
    /**
     * DOM 顺序上紧邻容器的可聚焦元素，用于「键盘进入容器」用例。
     * 视图注：夹具中有意把该元素排在容器之前（见 fixtures/app.vue 的 section 顺序）。
     * 只有窄屏确实超宽的容器需要（见 `SCROLL_KEYBOARD_CASES`）。
     */
    entryFrom?: (page: Page) => Locator
}

const PANEL_CASES: PanelCase[] = [
    { name: 'Select', trigger: '#panel-select .caomei-select', panel: '.caomei-select__content' },
    { name: 'MultiSelect', trigger: '#panel-multi-select .caomei-multi-select', panel: '.caomei-multi-select__content' },
    { name: 'AutoComplete', trigger: '#panel-auto-complete .caomei-auto-complete', panel: '.caomei-auto-complete__content' },
]

const WRAP_CASES: WrapCase[] = [
    {
        name: 'Toolbar',
        container: '#wrap-toolbar .caomei-toolbar',
        members: '#wrap-toolbar .caomei-toolbar > *',
    },
    {
        name: 'SelectButton',
        container: '#wrap-select-button .caomei-select-button',
        members: '#wrap-select-button .caomei-select-button__item',
    },
    {
        name: 'Dialog 页脚',
        container: '.caomei-dialog__footer',
        members: '.caomei-dialog__footer > *',
        prepare: async (page) => {
            await page.locator('#wrap-dialog-footer button').first().click()
        },
    },
]

const SCROLL_CASES: ScrollCase[] = [
    {
        name: 'ButtonGroup',
        container: '#scroll-button-group .caomei-button-group',
        members: '#scroll-button-group .caomei-button-group > .caomei-button',
        scrollableWhenNarrow: true,
        entryFrom: (page) => page.locator('#wrap-dialog-footer button').first(),
    },
    {
        name: 'SplitButton',
        container: '#scroll-split-button .caomei-split-button',
        members: '#scroll-split-button .caomei-split-button > .caomei-button',
        scrollableWhenNarrow: false,
    },
]

/**
 * 只对窄屏确实产生滚动量的容器跑键盘用例：成员总宽不超容器时（SplitButton），
 * 「滚入」无判别力（恒真），保留会给出虚假信心。SplitButton 的滚动容器样式由
 * `CaomeiButtonGroup` 承载，其滚入机制与 ButtonGroup 同源。
 */
const SCROLL_KEYBOARD_CASES = SCROLL_CASES.filter((scrollCase) => scrollCase.scrollableWhenNarrow)

/** §4 断言 1 的容器清单（每个进入批次的用例 section） */
const CASE_SECTION_IDS = [
    'panel-select',
    'panel-multi-select',
    'panel-auto-complete',
    'wrap-toolbar',
    'wrap-select-button',
    'wrap-dialog-footer',
    'scroll-button-group',
    'scroll-split-button',
]

/**
 * 自动 fixture：每个用例独立收集 console error / page error（§4 断言 5），
 * 并完成统一导航。用 test-scoped 状态取代模块级可变变量，隔离交给框架。
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

test.afterEach(({ pageErrors }) => {
    expect(pageErrors, '页面不得产生 console error').toEqual([])
})

async function isNarrowViewport(page: Page): Promise<boolean> {
    const viewport = await viewportOf(page)
    return viewport.width <= MD_BREAKPOINT
}

test.describe('页面与用例容器无横向溢出', () => {
    test('页面与各用例 section 均无横向溢出', async ({ page }) => {
        await expectPageNoHorizontalOverflow(page)

        for (const sectionId of CASE_SECTION_IDS) {
            await expectLocatorNoHorizontalOverflow(page.locator(`#${sectionId}`), `#${sectionId}`)
        }
    })
})

test.describe('浮层面板：落在视口内且不窄于触发器', () => {
    for (const panelCase of PANEL_CASES) {
        test(`${panelCase.name} 面板落在视口内且不窄于触发器`, async ({ page }) => {
            const trigger = page.locator(panelCase.trigger)
            const panel = page.locator(panelCase.panel)

            await expect(trigger).toBeVisible()
            await trigger.click()
            await expect(panel).toBeVisible()

            await expectInsideViewport(panel, await viewportOf(page), panelCase.name)
            await expectPanelNotNarrowerThanTrigger(panel, trigger, panelCase.name)
            await expectLocatorNoHorizontalOverflow(panel, `${panelCase.name} 面板`)

            await page.keyboard.press('Escape')
            await expect(panel).toBeHidden()
        })
    }
})

test.describe('换行类容器：纵向不裁切', () => {
    for (const wrapCase of WRAP_CASES) {
        test(`${wrapCase.name} 容器纵向不裁切且成员完整落在容器内`, async ({ page }) => {
            if (wrapCase.prepare) {
                await wrapCase.prepare(page)
            }

            const container = page.locator(wrapCase.container)
            await expect(container).toBeVisible()
            await expectWrapContainerNotClipped(container, page.locator(wrapCase.members), wrapCase.name)
        })
    }
})

test.describe('滚动类容器：成员不被裁切', () => {
    for (const scrollCase of SCROLL_CASES) {
        test(`${scrollCase.name} 成员自身不被裁切`, async ({ page }) => {
            const narrow = await isNarrowViewport(page)
            const container = page.locator(scrollCase.container)

            await expectScrollContainerMembersNotClipped(
                container,
                page.locator(scrollCase.members),
                {
                    overflowX: narrow ? 'auto' : 'visible',
                    scrollable: narrow && scrollCase.scrollableWhenNarrow,
                },
                scrollCase.name,
            )

            if (!narrow) {
                await expectLocatorNoHorizontalOverflow(container, `${scrollCase.name} 桌面`)
            }
        })
    }
})

test.describe('滚动类容器：键盘聚焦滚入', () => {
    for (const scrollCase of SCROLL_KEYBOARD_CASES) {
        test(`${scrollCase.name} 键盘聚焦的成员落在容器可视区内`, async ({ page }) => {
            const container = page.locator(scrollCase.container)
            await expect(container).toBeVisible()

            const fullyVisible = await expectKeyboardTabFocusVisibleInContainer(
                page,
                container,
                page.locator(scrollCase.members),
                scrollCase.name,
            )

            // 行为观测（不作为通过条件）：Tab 遍历后是否完整可见取决于聚焦前的几何
            test.info().annotations.push({
                type: 'observation',
                description: fullyVisible
                    ? `${scrollCase.name}：Tab 遍历后聚焦成员完整可见`
                    : `${scrollCase.name}：Tab 遍历后聚焦成员仅部分可见（强口径不可达，待裁定）`,
            })
        })

        test(`${scrollCase.name} 键盘从容器外进入时成员完整滚入`, async ({ page }) => {
            const narrow = await isNarrowViewport(page)
            const container = page.locator(scrollCase.container)
            await expect(container).toBeVisible()

            const { entryFrom } = scrollCase
            if (!entryFrom) {
                throw new Error(`${scrollCase.name} 未声明 entryFrom，无法构造键盘进入路径`)
            }

            const wasFullyOutside = await expectKeyboardEntryRevealsFirstMember(
                page,
                container,
                page.locator(scrollCase.members),
                entryFrom(page),
                scrollCase.name,
            )

            // 窄屏下必须构造出「聚焦前完全在滚动区外」，否则强口径分支失去覆盖（恒真用例）
            if (narrow) {
                expect(
                    wasFullyOutside,
                    `${scrollCase.name} 在窄屏下应构造出「聚焦前完全在滚动区外」的前置状态`,
                ).toBe(true)
            } else {
                // 桌面档无滚动量，本用例退化为「焦点落位 + 成员落在容器内」的形态回归
                test.info().annotations.push({
                    type: 'observation',
                    description: `${scrollCase.name}：桌面档无滚动量，按焦点落位与成员可见性回归`,
                })
            }
        })
    }
})
