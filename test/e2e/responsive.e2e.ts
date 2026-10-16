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
 * **自驱视口探针**（用例内 `setViewportSize` 到 200px 宽 / 420px 高）只随**全量档**运行：其视口由用例
 * 自身设定、不随矩阵档变化，重复承载只会把 DPR 取整造成的刀刃差异带进来（已有用例注释声明「刀刃敏感」）；
 * 矩阵扩面档（`playwright.config.ts` 的 `only: 'responsive'`）承载矩阵敏感用例，不重复承载自驱探针。
 *
 * 每个用例在 mobile / tablet / desktop 三个全量档下各跑一遍，矩阵扩面档再各跑一遍（见 playwright.config.ts）。
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

/** §2 的 sm 档：≤640px 时 sm 规则命中，且窄于 md 档 */
const SM_BREAKPOINT = 640
/** §2 的 lg 档：≤1024px 时 lg 规则命中（`sm` / `md` 均为「不窄于自身」的下界之上） */
const LG_BREAKPOINT = 1024
/**
 * 矩阵扩面档的视口宽度与档名（**与 `playwright.config.ts` 一致性由本文件下方的漂移守卫对账**，见
 * 「矩阵档口径」用例——不跨项目 import `playwright.config.ts`：它属 composite 的 `tsconfig.node.json`，
 * 跨项目引用会触发 TS6305（输出 `.d.ts` 未构建），故改在运行时从 Playwright 全量配置读回对账）。
 */
const NARROW_320_PROJECT = 'mobile-320'
const GAP_900_PROJECT = 'gap-900'
const NARROW_320_WIDTH = 320
const GAP_900_WIDTH = 900

/**
 * 承载**自驱视口探针**的档（矩阵扩面档不承载，口径见文件头）；由漂移守卫对账。
 */
const FULL_MATRIX_PROJECTS: readonly string[] = ['mobile', 'tablet', 'desktop']

/**
 * 栅格断点用例（响应式设计 §3 矩阵 #18）的期望值：三档断点同时命中时**最窄档最终生效**。
 *
 * 本表是「窄档覆盖宽档」契约的可判定载体——列 A 仅声明 `span`，列 B 的 `md` 只声明 `span`，
 * 用于回归「断点对象只声明部分字段时，其余字段回退到**基础档**取值」的契约（非逐档级联：
 * 列 B 落到 md 档时 `order` 应回到基础值 `0`，而非沿用 lg 档的 `2`）。
 */
const GRID_BREAKPOINT_EXPECTATIONS = [
    {
        width: 1280,
        label: `>${LG_BREAKPOINT}（无媒体查询命中）`,
        a: { start: '1', end: 'span 24', order: '0' },
        b: { start: '1', end: 'span 24', order: '0' },
    },
    {
        width: LG_BREAKPOINT,
        label: `≤${LG_BREAKPOINT}（lg）`,
        a: { start: '1', end: 'span 12', order: '0' },
        b: { start: '13', end: 'span 12', order: '2' },
    },
    {
        /** 空档档内部点：`sm` / `md` 命名之外的 769–1023px 应维持 lg（≤1024）形态 */
        width: GAP_900_WIDTH,
        label: `769–1023 空档（lg 仍命中）`,
        a: { start: '1', end: 'span 12', order: '0' },
        b: { start: '13', end: 'span 12', order: '2' },
    },
    {
        width: MD_BREAKPOINT,
        label: `≤${MD_BREAKPOINT}（md 覆盖 lg）`,
        a: { start: '1', end: 'span 8', order: '0' },
        b: { start: '1', end: 'span 8', order: '0' },
    },
    {
        width: SM_BREAKPOINT,
        label: `≤${SM_BREAKPOINT}（sm 覆盖 md / lg）`,
        a: { start: '1', end: 'span 24', order: '0' },
        b: { start: '1', end: 'span 24', order: '0' },
    },
    {
        /** 极窄档内部点：320px 仍在 sm 档内，取值须与 640px 一致（拦「按精确宽度 / 反向方向」误写的规则） */
        width: NARROW_320_WIDTH,
        label: `极窄 ${NARROW_320_WIDTH}（sm 仍命中）`,
        a: { start: '1', end: 'span 24', order: '0' },
        b: { start: '1', end: 'span 24', order: '0' },
    },
]

/** 读列的计算定位（`grid-column-start` / `grid-column-end` / `order`）。 */
async function readGridPlacement(locator: Locator) {
    return locator.evaluate((element) => {
        const style = getComputedStyle(element)
        return { start: style.gridColumnStart, end: style.gridColumnEnd, order: style.order }
    })
}

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
    /**
     * 形态收敛档上限（与组件实现中的 `@media (width <= N)` 一致，见响应式设计 §2 / §3 矩阵 #7）：
     * 视口不宽于该值时容器转为横向滚动，宽于该值时维持桌面单行形态。
     */
    convergeAt: number
    /** 收敛档下内容是否确实超宽（「确有滚动量」）；不超宽的组件同样命中档位规则但不要求滚动条 */
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
        convergeAt: LG_BREAKPOINT,
        scrollableWhenNarrow: true,
        entryFrom: (page) => page.locator('#wrap-dialog-footer button').first(),
    },
    {
        name: 'SplitButton',
        container: '#scroll-split-button .caomei-split-button',
        members: '#scroll-split-button .caomei-split-button > .caomei-button',
        convergeAt: LG_BREAKPOINT,
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
    'grid-breakpoint',
    'menu-navigation',
    'alert-contrast',
    'chart',
]

/**
 * §4 断言 1 的**受检面下界**（防「清单被静默删项 / 解析失效 ⇒ 用例仍全绿」）。
 *
 * 取值口径 = **当前受检面长度本身（贴身下界）**：语义只覆盖「清单被整体删项 ⇒ 循环跑 0 次仍变绿」
 * 一类静默收窄，不追求余量；配合下方逐 section 的「存在且唯一」断言补上「夹具 section 被移除」方向。
 * **清单扩项时须同步上调本值**（下界低于实际长度才拦得住删项）。
 */
const MIN_SECTIONS = 17

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

async function isWithinConverge(convergeAt: number, page: Page): Promise<boolean> {
    const viewport = await viewportOf(page)
    return viewport.width <= convergeAt
}

test.describe('矩阵档口径', () => {
    /*
      漂移守卫：装置侧的档名 / 档内内部点常量与 `playwright.config.ts` 的 project 视口必须一致。
      数值的唯一改动入口是配置表；本用例把「手写重复」变成**机检**（不一致即失败），
      这也是「矩阵口径写入单一事实源」在装置侧的兜底。
    */
    test('扩面档的档名、视口宽度与承载面与配置一致', () => {
        const projects = test.info().config.projects
        const projectOf = (name: string) => projects.find((project) => project.name === name)
        const viewportWidthOf = (name: string) => projectOf(name)?.use.viewport?.width
        const projectNames = projects.map((project) => project.name)

        expect(viewportWidthOf(NARROW_320_PROJECT), `${NARROW_320_PROJECT} 档的视口宽度`).toBe(NARROW_320_WIDTH)
        expect(viewportWidthOf(GAP_900_PROJECT), `${GAP_900_PROJECT} 档的视口宽度`).toBe(GAP_900_WIDTH)
        // 承载面同样对账：删掉 `only: 'responsive'` 会让定向档回到全量匹配（成本口径漂移）
        expect(
            projectOf(NARROW_320_PROJECT)?.testMatch,
            `${NARROW_320_PROJECT} 档应只承载响应式 spec`,
        ).toBe('**/responsive.e2e.ts')
        expect(
            projectOf(GAP_900_PROJECT)?.testMatch,
            `${GAP_900_PROJECT} 档应只承载响应式 spec`,
        ).toBe('**/responsive.e2e.ts')
        expect(
            [...FULL_MATRIX_PROJECTS],
            '全量档名单应等于配置中除两个定向档之外的 project（定向档名单与上面两处引用同源）',
        ).toEqual(projectNames.filter((name) => ![NARROW_320_PROJECT, GAP_900_PROJECT].includes(name)))
    })
})

test.describe('页面与用例容器无横向溢出', () => {
    test('页面与各用例 section 均无横向溢出', async ({ page }) => {
        expect(
            CASE_SECTION_IDS.length,
            '§4 断言 1 的受检面不得收窄到清单被静默删项（下界口径见 MIN_SECTIONS）',
        ).toBeGreaterThanOrEqual(MIN_SECTIONS)

        await expectPageNoHorizontalOverflow(page)

        for (const sectionId of CASE_SECTION_IDS) {
            await expect(page.locator(`#${sectionId}`), `夹具 section #${sectionId} 应存在且唯一`).toHaveCount(1)
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
        test.skip(
            !FULL_MATRIX_PROJECTS.includes(test.info().project.name),
            '自驱视口探针只随全量档运行（视口由用例自身设定，口径见文件头）',
        )

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
        test.skip(
            !FULL_MATRIX_PROJECTS.includes(test.info().project.name),
            '自驱视口探针只随全量档运行（视口由用例自身设定，口径见文件头）',
        )

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

test.describe('栅格断点：窄档覆盖宽档', () => {
    test('列定位与排序按视口断点覆盖，窄档最终生效', async ({ page }) => {
        const columnA = page.locator('#grid-col-a')
        const columnB = page.locator('#grid-col-b')
        await expect(columnA).toBeVisible()

        // 由宽到窄逐档收窄：证明取值随断点被**覆盖**（而非停留初始值）
        for (const { width, label, a, b } of GRID_BREAKPOINT_EXPECTATIONS) {
            await page.setViewportSize({ width, height: 900 })

            expect(await readGridPlacement(columnA), `视口 ${width}（${label}）列 A 定位`).toEqual(a)
            expect(await readGridPlacement(columnB), `视口 ${width}（${label}）列 B 定位`).toEqual(b)
        }
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
            const scrolling = await isWithinConverge(scrollCase.convergeAt, page)
            const container = page.locator(scrollCase.container)

            await expectScrollContainerMembersNotClipped(
                container,
                page.locator(scrollCase.members),
                {
                    overflowX: scrolling ? 'auto' : 'visible',
                    scrollable: scrolling && scrollCase.scrollableWhenNarrow,
                },
                scrollCase.name,
            )

            if (!scrolling) {
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
            const scrolling = await isWithinConverge(scrollCase.convergeAt, page)
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

            const strictPossible = await (async () => {
                const scrollRange = await container.evaluate((element) => element.scrollWidth - element.clientWidth)
                const firstMemberWidth = (await boxOf(page.locator(scrollCase.members).first())).width
                return { scrollRange, firstMemberWidth }
            })()

            /*
              收敛档内应尽量构造「聚焦前完全在滚动区外」的前置状态（分档口径的严格分支）。
              但该前置状态**几何上可构造**的前提是「可滚动量 ≥ 首个成员宽」——档内可用宽越大，滚动量越小
              （如 900px 档：可用宽 852 / 内容 967 ⇒ 滚动量 115px < 首个成员宽 150px），此时严格分支
              不可能触发，按「聚焦后仍相交」的分档口径退化并记 observation；同时断言该档确有滚动量。
            */
            if (scrolling) {
                expect(
                    strictPossible.scrollRange,
                    `${scrollCase.name} 在收敛档内应有滚动量（档位规则生效）`,
                ).toBeGreaterThan(0)

                if (strictPossible.scrollRange >= strictPossible.firstMemberWidth) {
                    expect(
                        wasFullyOutside,
                        `${scrollCase.name} 在收敛档内应构造出「聚焦前完全在滚动区外」的前置状态`
                        + `（可滚动量 ${strictPossible.scrollRange} ≥ 首个成员宽 ${strictPossible.firstMemberWidth}）`,
                    ).toBe(true)
                } else {
                    test.info().annotations.push({
                        type: 'observation',
                        description: `${scrollCase.name}：可滚动量 ${strictPossible.scrollRange}px < 首个成员宽 `
                            + `${strictPossible.firstMemberWidth}px，本档无法构造「完全在滚动区外」的前置状态，`
                            + '分档口径退化为「聚焦后仍相交」',
                    })
                }
            } else {
                // 收敛档外无滚动量，本用例退化为「焦点落位 + 成员落在容器内」的形态回归
                test.info().annotations.push({
                    type: 'observation',
                    description: `${scrollCase.name}：收敛档外无滚动量，按焦点落位与成员可见性回归`,
                })
            }
        })
    }
})
