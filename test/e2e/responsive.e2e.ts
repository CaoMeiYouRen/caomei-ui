import { expect, test as base, type Locator, type Page } from '@playwright/test'
import {
    boxOf,
    expectInsideViewport,
    expectKeyboardEntryRevealsFirstMember,
    expectKeyboardTabFocusVisibleInContainer,
    expectLocatorNoHorizontalOverflow,
    expectPageNoHorizontalOverflow,
    expectPanelNotNarrowerThanTrigger,
    expectPanelSizeCapped,
    expectScrollContainerMembersNotClipped,
    expectWrapContainerNotClipped,
    TOLERANCE,
    viewportOf,
} from './helpers/layout'

/**
 * 响应式设计 §4 验收标准的常驻用例（多视口）。
 *
 * 覆盖五类可判定口径：
 * 1. 浮层面板：落在视口内、不窄于触发器（断言 2 / 6）；
 * 2. 含日历面板：DatePicker portal 面板落在视口内、带可用宽上限、内容完整（断言 2 / §3 矩阵 #6）；
 * 3. 换行类容器：纵向不裁切、成员完整落在容器内（断言 3）；
 * 4. 滚动类容器：成员自身不被裁切、按档位可滚动、确有滚动量（断言 1 / 3）；
 * 5. 键盘聚焦：滚动容器内聚焦成员落在容器可视区内，且**聚焦前完全在滚动区外**时完整滚入（断言 3）。
 *
 * 用例级自动断言「0 console error」（断言 5）。断言 4（桌面与改动前基线一致）需批次自身基线归档，
 * 常驻用例只覆盖其形态回归部分（窄屏规则在桌面不生效）。
 *
 * **键盘聚焦口径**：`docs/design/responsive.md` §4 采用**分档判定**（2026-09-17 用户裁定）——聚焦前
 * 完全在滚动区外 ⇒ 必须完整滚入；聚焦前已相交 ⇒ 必须仍相交（native 焦点滚动在聚焦前已有像素级
 * 可见边时不再介入，故「无条件完整可见」不作为验收标准，增强候选见仓库 backlog）。窄屏下硬性要求
 * 「完全在滚动区外」的分支被触发，避免该口径静默失去覆盖。
 *
 * 每个用例在 mobile / tablet / desktop 三个 project 下各跑一遍（见 playwright.config.ts）。
 */

/** 响应式设计 §2 的 md 档：≤768px 时组件的收敛规则生效 */
const MD_BREAKPOINT = 768

/**
 * Dialog 断点宽度用例（响应式设计 §3 矩阵 #17）：键与夹具 `dialogBreakpoints` 同源。
 * 三档验收视口分别命中「不命中（回退 lg）/ 1199 档 / 575 档」。
 */
const DIALOG_BREAKPOINT_WIDE_PX = 1199
const DIALOG_BREAKPOINT_NARROW_PX = 575
const DIALOG_BREAKPOINT_WIDE_PERCENT = 85
const DIALOG_BREAKPOINT_NARROW_PERCENT = 95
/** `size="lg"` 的档位宽度上限（未命中任何断点时的回退） */
const DIALOG_LG_MAX_WIDTH = 640

/** 视口宽度命中的断点档位（百分比）；宽于最宽档时返回 `undefined`（回退 `size` 档位宽度） */
function resolvedDialogBreakpointPercent(viewportWidth: number): number | undefined {
    if (viewportWidth <= DIALOG_BREAKPOINT_NARROW_PX) {
        return DIALOG_BREAKPOINT_NARROW_PERCENT
    }
    if (viewportWidth <= DIALOG_BREAKPOINT_WIDE_PX) {
        return DIALOG_BREAKPOINT_WIDE_PERCENT
    }
    return undefined
}

/**
 * 上限生效路径的合成探针尺寸：三档验收视口下面板（224×239）的可用空间上限恒不生效，
 * 故「上限生效 + 滚动降级」路径由探针用例承担——宽探针低于内容宽（224px）、高探针低于内容高（239px）。
 */
const NARROW_PROBE_WIDTH = 200
const SHORT_PROBE_HEIGHT = 420

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

interface CalendarPanelCase {
    name: string
    /** 触发器选择器（限定在所属 section 内） */
    trigger: string
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

/** DatePicker 的 portal 面板（定宽内容；同一页面同时只开一个） */
const DATE_PICKER_PANEL = '.caomei-date-picker__content'

/**
 * 含日历面板用例（§3 矩阵 #6）：面板为定宽内容（单月日历），右缘窄触发器用于验证横向收敛。
 * Calendar 的内联形态不产生浮层，按「容器不裁切」单独断言。
 */
const CALENDAR_PANEL_CASES: CalendarPanelCase[] = [
    { name: 'DatePicker', trigger: '#panel-date-picker .caomei-date-picker' },
    { name: 'DatePicker 右缘窄触发器', trigger: '#panel-date-picker-edge .caomei-date-picker' },
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
    'panel-date-picker',
    'panel-date-picker-edge',
    'calendar-inline',
    'dialog-breakpoints',
    'dialog-headerless',
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

test.describe('含日历面板：落在视口内且内容不裁切', () => {
    for (const calendarCase of CALENDAR_PANEL_CASES) {
        test(`${calendarCase.name} 面板落在视口内、带可用空间上限且内容完整`, async ({ page }) => {
            const trigger = page.locator(calendarCase.trigger)
            const panel = page.locator(DATE_PICKER_PANEL)

            await expect(trigger).toBeVisible()
            await trigger.click()
            await expect(panel).toBeVisible()

            const viewport = await viewportOf(page)
            await expectInsideViewport(panel, viewport, calendarCase.name)
            await expectLocatorNoHorizontalOverflow(panel, `${calendarCase.name} 面板`)
            await expectPanelSizeCapped(panel, calendarCase.name)
            await expectWrapContainerNotClipped(
                panel,
                panel.locator('.caomei-calendar'),
                `${calendarCase.name} 面板内容`,
            )

            await page.keyboard.press('Escape')
            await expect(panel).toBeHidden()
        })
    }
})

test.describe('含日历面板：可用宽上限生效路径', () => {
    test('极窄视口下面板收敛到可用宽且内容可滚动可达', async ({ page }) => {
        const trigger = page.locator('#panel-date-picker .caomei-date-picker')
        const panel = page.locator(DATE_PICKER_PANEL)

        // 1. 先在验收视口下记录「未触上限」的内容宽
        await expect(trigger).toBeVisible()
        await trigger.click()
        await expect(panel).toBeVisible()
        const contentWidth = (await boxOf(panel)).width
        await page.keyboard.press('Escape')
        await expect(panel).toBeHidden()

        // 2. 合成极窄视口后重新打开：点击会把触发器滚入视口，popper 按新视口重算（含可用宽上限）
        await page.setViewportSize({ width: NARROW_PROBE_WIDTH, height: 640 })
        await trigger.click()
        await expect(panel).toBeVisible()

        const viewport = await viewportOf(page)
        const capped = await boxOf(panel)
        expect(
            capped.width,
            `探针视口下未触发可用宽上限（面板宽 ${capped.width} ≥ 内容宽 ${contentWidth}），本用例失去判别力`,
        ).toBeLessThan(contentWidth)
        expect(
            capped.x + capped.width,
            `上限生效时面板右侧越出视口：right=${capped.x + capped.width} > innerWidth=${viewport.width}`,
        ).toBeLessThanOrEqual(viewport.width + TOLERANCE)
        await expectInsideViewport(panel, viewport, '极窄探针面板')

        // 同源比较：面板宽不得超出 Reka 写入的可用宽（变量缺失时 `parseFloat` 得 NaN，断言同样失败）
        const availableWidth = await panel.evaluate((element) =>
            Number.parseFloat(getComputedStyle(element).getPropertyValue('--reka-popover-content-available-width')))
        expect(
            capped.width,
            `面板宽 ${capped.width} 超过可用宽 ${availableWidth}`,
        ).toBeLessThanOrEqual(availableWidth + TOLERANCE)

        // 3. 降级通道存在：上限生效时内容可滚动（`overflow: auto`）。
        //    不断言「必然产生滚动条」——面板收敛后日历表格会自行压缩，是否溢出取决于可用宽（刀刃敏感）；
        //    内容可达性由 `overflow` 的可滚动取值保证。
        await expectPanelSizeCapped(panel, '极窄探针面板')
    })

    test('极矮视口下面板收敛到可用高且内容可纵向滚动可达', async ({ page }) => {
        const trigger = page.locator('#panel-date-picker .caomei-date-picker')
        const panel = page.locator(DATE_PICKER_PANEL)

        // 1. 先在验收视口下记录「未触上限」的内容高
        await expect(trigger).toBeVisible()
        await trigger.click()
        await expect(panel).toBeVisible()
        const contentHeight = (await boxOf(panel)).height
        await page.keyboard.press('Escape')
        await expect(panel).toBeHidden()

        // 2. 合成极矮视口后重新打开：点击会把触发器滚入视口，popper 按新视口的可用高收敛
        await page.setViewportSize({ width: 390, height: SHORT_PROBE_HEIGHT })
        await trigger.click()
        await expect(panel).toBeVisible()

        const viewport = await viewportOf(page)
        const capped = await boxOf(panel)
        /*
          高轴不逐项比较 `--reka-popover-content-available-height`：该值随滚动条占位与碰撞内边距变化，
          同源比较的二义性高于宽轴；此处以「前置守卫（上限确实生效）+ 视口内 + 纵向滚动可达」三段覆盖。
        */
        expect(
            capped.height,
            `探针视口下未触发可用高上限（面板高 ${capped.height} ≥ 内容高 ${contentHeight}），本用例失去判别力`,
        ).toBeLessThan(contentHeight)
        await expectInsideViewport(panel, viewport, '极矮探针面板')

        // 3. 降级通道：内容可纵向滚动可达（响应式设计 §2 降级原则）
        const degradation = await panel.evaluate((element) => ({
            overflowY: getComputedStyle(element).overflowY,
            scrollHeight: element.scrollHeight,
            clientHeight: element.clientHeight,
        }))
        expect(
            ['auto', 'scroll'],
            `上限生效时缺少纵向滚动降级通道（overflow-y=${degradation.overflowY}）`,
        ).toContain(degradation.overflowY)
        expect(
            degradation.scrollHeight,
            '上限生效时面板内容应可纵向滚动可达',
        ).toBeGreaterThan(degradation.clientHeight)
    })
})

test.describe('内联日历：不裁切且落在容器内', () => {
    test('内联日历与其网格完整落在容器内', async ({ page }) => {
        const section = page.locator('#calendar-inline')
        const calendar = section.locator('.caomei-calendar')

        await expect(calendar).toBeVisible()
        await expectWrapContainerNotClipped(section, calendar, '内联日历')
        await expectWrapContainerNotClipped(calendar, calendar.locator('.caomei-calendar__grid'), '内联日历网格')
    })
})

test.describe('浮层断点宽度（Dialog.breakpoints）', () => {
    test('面板宽度按命中档位取值且落在视口内', async ({ page }) => {
        const viewport = await viewportOf(page)
        const trigger = page.locator('#dialog-breakpoints button').first()
        const panel = page.locator('.caomei-dialog__content')

        await trigger.click()
        await expect(panel).toBeVisible()

        const percent = resolvedDialogBreakpointPercent(viewport.width)
        const expected = percent === undefined
            ? Math.min(viewport.width * 0.9, DIALOG_LG_MAX_WIDTH)
            : (viewport.width * percent) / 100

        const box = await boxOf(panel)
        expect(
            box.width,
            `视口 ${viewport.width} 命中档位 ${percent ?? '无（回退 lg）'}，面板宽应为 ${expected}`,
        ).toBeCloseTo(expected, 0)

        await expectInsideViewport(panel, viewport, 'Dialog 断点面板')
        await expectLocatorNoHorizontalOverflow(panel, 'Dialog 断点面板')

        await page.keyboard.press('Escape')
        await expect(panel).toBeHidden()
    })
})

test.describe('无头部对话框（Dialog showHeader=false）', () => {
    test('头部与关闭按钮不渲染，标题保留不可见可访问名', async ({ page }) => {
        const trigger = page.locator('#dialog-headerless button').first()
        await trigger.click()

        const panel = page.locator('.caomei-dialog__content')
        await expect(panel).toBeVisible()

        await expect(panel.locator('.caomei-dialog__header')).toHaveCount(0)
        await expect(panel.locator('.caomei-dialog__close')).toHaveCount(0)

        const labelledby = await panel.getAttribute('aria-labelledby')
        expect(labelledby, '隐藏标题仍须提供可访问名').toBeTruthy()
        const accessibleName = await page.evaluate(
            (id) => document.getElementById(id)?.textContent ?? '',
            labelledby as string,
        )
        expect(accessibleName.trim()).toBe('无头部对话框')

        const hiddenTitle = await panel.locator('.caomei-dialog__title').evaluate((element) => {
            const style = getComputedStyle(element)
            return { width: style.width, clipPath: style.clipPath }
        })
        expect(hiddenTitle.width, '隐藏标题应为 1px 盒').toBe('1px')
        expect(hiddenTitle.clipPath, '隐藏标题应被裁切').toContain('inset')

        await expectInsideViewport(panel, await viewportOf(page), '无头部对话框')
        await expectLocatorNoHorizontalOverflow(panel, '无头部对话框')

        await panel.locator('.caomei-dialog__footer button').click()
        await expect(panel).toBeHidden()
    })
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
                    : `${scrollCase.name}：Tab 遍历后聚焦成员仅部分可见（聚焦前已相交，native 不再滚动）`,
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

            // 窄屏下必须构造出「聚焦前完全在滚动区外」，否则分档口径的完整滚入分支失去覆盖（恒真用例）
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
