import { expect, test as base, type Locator, type Page } from '@playwright/test'
import { boxOf, TOLERANCE } from './helpers/layout'

/**
 * 遮罩类组件协作常驻回归。
 *
 * 背景：本仓近期的三个真实问题（模态内面板被盖住、弹窗内长列表不可滚动、下游「Dialog 内
 * pointerdown 不触发」）都不是「组件单独坏了」，而是遮罩层、浮层、滚动锁、焦点 / 指针归属在
 * 同一页面叠加时的协作问题。调研与批次口径见
 * `docs/design/governance/2026-11-14-overlay-collaboration-research.md`，
 * 交付与验收记录见 `docs/design/governance/2026-11-14-phase33-m6-overlay-collaboration.md`。
 *
 * 判定口径：
 * - **真实指针**：面板展开走 `mouse.move/down/up`（不派发合成事件、不用 `dispatchEvent`），
 *   展开断言落在 **pointerdown 之后、pointerup 之前**，证明是指针按下路径而非 click 兜底；
 * - **残留复位**：`body` 内联 `overflow` / `padding-right` / `margin-right` / `pointer-events`
 *   与 `--scrollbar-width` 必须逐项恢复为**打开前取值**（不是「恢复为空」）；
 * - **重新可交互**：关闭后真实点击页面探针必须计数 +1（只断言样式会漏掉指针事件残留）；
 * - **几何**：滚动条补偿造成的位移以**实测滚动条宽**为上界，关闭后必须归零；
 * - **负向对照**：注入残留 `body.pointer-events: none` 后探针点击必须不生效（自证判别力）。
 *
 * 与既有 E2E 去重：
 * - `overlay-stacking.e2e.ts` 负责**层级与命中测试**（本条不重复 z-index / 绘制顺序结论）；
 * - `overlay-interaction.e2e.ts` 负责**单层焦点落位与滚动锁复位**（本条扩展为残留 / 栈 / 几何）；
 * - `select-long-list.e2e.ts` 负责 **Dialog 内**长列表（本条只补 Drawer 容器）。
 *
 * describe 分工：`协作主链路（单层）` = C1 ~ C5；`层叠与焦点（C7 / C8）` = Toast 层叠与焦点陷阱；
 * `嵌套（C6）` = Dialog → 二次确认、抽屉 → 对话框；`移动端触摸滚动（C9）` = CDP 触摸手势；
 * `残留与滚动锁栈（多层）` = 残留复位、多层滚动锁栈与负向对照。夹具见 `test/e2e/fixtures/app.vue` 的
 * `#overlay-collaboration` / `#collab-toast` / `#collab-nested` 三段。
 */

const DIALOG_CONTENT = '.caomei-dialog__content'
const DRAWER_CONTENT = '.caomei-drawer__content'
const SELECT_CONTENT = '.caomei-select__content[data-state="open"]'
/** 不限定状态的同族选择器：用于「面板已卸载」断言（关闭后不应残留任何面板节点） */
const SELECT_ANY = '.caomei-select__content'
const SELECT_VIEWPORT = '.caomei-select__viewport'
const SELECT_ITEM = '.caomei-select__item'

const DIALOG_OPEN = '#collab-dialog-open'
const DRAWER_OPEN = '#collab-drawer-open'
const DIALOG_SELECT = '#collab-dialog-select'
const LOCKED_SELECT = '#collab-dialog-select-locked'
const DRAWER_SELECT = '#collab-drawer-select'
const DIALOG_BLANK = '#collab-dialog-blank'
const DIALOG_VALUE = '#collab-dialog-value'
const DRAWER_VALUE = '#collab-drawer-value'
const CLICK_PROBE = '#collab-click-probe'
const CLICK_COUNT = '#collab-click-count'
const GEOMETRY_PROBE = '#collab-geometry-probe'
const STACK_DRAWER_TRIGGER = '#collab-dialog-open-drawer'
const LOCKED_SELECT_PAGE = '#collab-locked-select'
const TOAST_DIALOG_OPEN = '#collab-toast-open-dialog'
const TOAST_SHOW = '#collab-toast-show'
const TOAST_SHOW_TWO = '#collab-toast-show-two'
/** 协作段 provider 内的提示（`#toast-contrast` 段还有一个 provider，必须收窄作用域） */
const TOAST_SCOPE = '#collab-toast .caomei-toast'
const CONFIRM_CONTENT = '.caomei-confirm-dialog__content'
const NESTED_OPEN_DIALOG = '#collab-nested-open-dialog'
const NESTED_CONFIRM = '#collab-nested-confirm'
const NESTED_CONFIRM_RESULT = '#collab-nested-confirm-result'
const NESTED_OPEN_DRAWER = '#collab-nested-open-drawer'
const NESTED_DRAWER_DIALOG = '#collab-nested-drawer-open-dialog'

/**
 * `body` 上被滚动锁 / 指针锁触碰到的内联值快照。
 * `scrollbarWidth` 对应 `documentElement` 上的 `--scrollbar-width` 自定义属性。
 */
interface BodyState {
    overflow: string
    paddingRight: string
    marginRight: string
    pointerEvents: string
    scrollbarWidth: string
}

/**
 * 触摸滚动时 Chromium 对被动的 `touchend` 取消尝试给出的平台告警：
 * 「Ignored attempt to cancel a touchend event with cancelable=false」。
 *
 * 它不是页面异常：原生滚动进行中时，任何监听器对 `touchend` 调 `preventDefault` 都会得到这条提示，
 * 而 CDP 注入的触摸序列必然进入该状态。按研究记录 §7「环境差异显式登记」处理，但有两条边界：
 * - **只在 C9 的 describe 内生效**（`allowTouchCancellationNoise` 由该 describe 的 `beforeEach` 打开、
 *   其 `afterEach` 关闭），其余用例出现的同类告警仍判失败；
 * - 只按**精确前缀**（`startsWith`）放行，不做子串匹配。
 */
const TOUCH_CANCEL_NOISE = 'Ignored attempt to cancel a touchend event with cancelable=false'
/** 是否允许 C9 的触摸取消告警；由 `移动端触摸滚动（C9）` describe 的钩子开关。 */
let allowTouchCancellationNoise = false

/** 每个用例独立收集 console error / page error，并统一导航（与 `overlay-stacking.e2e.ts` 同构）。 */
const test = base.extend<{ pageErrors: string[] }>({
    pageErrors: [async ({ page }, use) => {
        const errors: string[] = []
        page.on('console', (message) => {
            if (message.type() !== 'error') {
                return
            }
            const text = message.text()
            if (allowTouchCancellationNoise && text.startsWith(TOUCH_CANCEL_NOISE)) {
                return
            }
            errors.push(`console.error: ${text}`)
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

/** 以 root 运行（容器内常见）时 Chromium 必须关闭沙箱，与 `playwright.config.ts` 口径一致 */
const IS_ROOT = typeof process.getuid === 'function' && process.getuid() === 0

/**
 * 用**真实经典滚动条**运行本规格：Playwright 默认下发 `--hide-scrollbars`，滚动条不占位
 * （`innerWidth === clientWidth`），Reka 的 `padding-right` 补偿路径恒不触发，滚动锁的几何断言
 * 会退化为「没有滚动条时没有位移」。移除该默认参数后滚动条真实占位，补偿与位移上界才有对照对象
 * （无滚动条占位的形态——如移动端 overlay 滚动条——由断言内的 `scrollbar > 0` 分支覆盖）。
 *
 * `args` 与 `playwright.config.ts` 的 `CHROMIUM_ARGS` 手工同步：覆盖 `launchOptions` 会整对象替换，
 * 不继承配置里的容器必需参数；不直接 import 配置是因为 spec 与配置文件之间没有 TS 工程引用
 * （跨项目 import 会触发 TS6305，口径同 `MATRIX_VIEWPORTS` 注释）。
 */
test.use({
    launchOptions: {
        ignoreDefaultArgs: ['--hide-scrollbars'],
        args: [
            '--disable-dev-shm-usage',
            ...(process.env.CI || IS_ROOT ? ['--no-sandbox'] : []),
            ...(IS_ROOT ? ['--no-zygote'] : []),
        ],
    },
})

/** 读取 `body` 上被滚动锁 / 指针锁触碰到的全部内联值。 */
async function bodyState(page: Page): Promise<BodyState> {
    return page.evaluate(() => ({
        overflow: document.body.style.overflow,
        paddingRight: document.body.style.paddingRight,
        marginRight: document.body.style.marginRight,
        pointerEvents: document.body.style.pointerEvents,
        scrollbarWidth: document.documentElement.style.getPropertyValue('--scrollbar-width'),
    }))
}

/** 实测经典滚动条占位宽（无头 Chromium 隐藏滚动条时为 0）。 */
async function scrollbarWidth(page: Page): Promise<number> {
    // 先等夹具挂载完成：冷启动时 `goto` 可能早于应用渲染，空文档没有滚动条，会把宽度测成 0
    await page.locator('#overlay-collaboration').waitFor({ state: 'attached' })
    return page.evaluate(() => window.innerWidth - document.documentElement.clientWidth)
}

/** 真实指针点击：滚动入视口后按 move → down → up 派发（不走 `dispatchEvent`）。 */
async function realPointerClick(page: Page, target: Locator): Promise<void> {
    await target.scrollIntoViewIfNeeded()
    const box = await target.boundingBox()
    if (!box) {
        throw new Error('目标元素没有几何盒，无法派发真实指针')
    }
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.up()
}

/**
 * 用真实指针展开 Select：展开断言位于 pointerdown 与 pointerup 之间。
 * 若面板只在 click（pointerup 之后）才展开，这里会失败——判别力即来自该时序。
 */
async function openSelectByPointer(page: Page, trigger: Locator, label: string): Promise<void> {
    await expect(page.locator(SELECT_CONTENT), `${label} 展开前不应已有面板`).toBeHidden()

    await trigger.scrollIntoViewIfNeeded()
    const box = await trigger.boundingBox()
    if (!box) {
        throw new Error(`${label} 触发器没有几何盒`)
    }
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await expect(page.locator(SELECT_CONTENT), `${label} 应在 pointerdown 后展开面板`).toBeVisible()
    await page.mouse.up()
}

/** 点击当前展开面板中的选项（按可访问名精确匹配，避免「国家 1」误中「国家 10」）。 */
async function clickOption(page: Page, label: string): Promise<void> {
    const option = page.locator(SELECT_CONTENT).getByRole('option', { name: label, exact: true })
    await expect(option, `选项「${label}」应可见`).toBeVisible()
    await realPointerClick(page, option)
}

/** 命中测试：元素中心点是否命中自身（被上层遮罩盖住时会命中上层）。 */
async function hitTestInside(page: Page, selector: string): Promise<boolean> {
    return page.evaluate((target) => {
        const element = document.querySelector(target)
        if (!element) {
            return false
        }
        const box = element.getBoundingClientRect()
        const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
        return Boolean(hit && (element === hit || element.contains(hit)))
    }, selector)
}

/** 当前焦点是否落在给定选择器命中的元素上。 */
async function focusOn(page: Page, selector: string): Promise<boolean> {
    return page.evaluate((target) => document.activeElement === document.querySelector(target), selector)
}

test.describe('协作主链路（单层）', () => {
    test('C1 Dialog：真实指针展开 Select、选择后模型更新并归还焦点', async ({ page }) => {
        await page.locator(DIALOG_OPEN).click()
        const dialog = page.locator(DIALOG_CONTENT)
        await expect(dialog).toBeVisible()

        await openSelectByPointer(page, page.locator(DIALOG_SELECT), 'Dialog 内 Select')
        await clickOption(page, '按创建时间倒序排列')

        await expect(page.locator(SELECT_ANY), '选择后面板应卸载').toHaveCount(0)
        await expect(page.locator(DIALOG_VALUE), 'v-model 应更新为所选值').toHaveText('created-desc')
        await expect.poll(
            () => focusOn(page, DIALOG_SELECT),
            { message: '面板关闭后焦点应回到触发器' },
        ).toBe(true)
        await expect(dialog, '选择选项不应关闭对话框').toBeVisible()
    })

    test('C1 Drawer：真实指针展开 Select、选择后模型更新并归还焦点', async ({ page }) => {
        await page.locator(DRAWER_OPEN).click()
        const drawer = page.locator(DRAWER_CONTENT)
        await expect(drawer).toBeVisible()

        await openSelectByPointer(page, page.locator(DRAWER_SELECT), 'Drawer 内 Select')
        await clickOption(page, '国家 1')

        await expect(page.locator(SELECT_ANY), '选择后面板应卸载').toHaveCount(0)
        await expect(page.locator(DRAWER_VALUE), 'v-model 应更新为所选值').toHaveText('c1')
        await expect.poll(
            () => focusOn(page, DRAWER_SELECT),
            { message: '面板关闭后焦点应回到触发器' },
        ).toBe(true)
        await expect(drawer, '选择选项不应关闭抽屉').toBeVisible()
    })

    test('C2 单层：关闭 Dialog 后指针事件与滚动锁逐项复位，页面重新可交互', async ({ page }) => {
        const initial = await bodyState(page)

        await page.locator(DIALOG_OPEN).click()
        await expect(page.locator(DIALOG_CONTENT)).toBeVisible()
        // 判别力前置：模态确实抑制了 body 指针事件（否则「恢复」断言没有对照对象）
        await expect.poll(
            () => bodyState(page).then((state) => state.pointerEvents),
            { message: '模态打开时应抑制 body 指针事件' },
        ).toBe('none')

        await page.keyboard.press('Escape')
        await expect(page.locator(DIALOG_CONTENT)).toHaveCount(0)

        await expect.poll(
            () => bodyState(page),
            { message: '关闭后 overflow / padding-right / margin-right / pointer-events 必须恢复为打开前取值' },
        ).toEqual(initial)

        await expect(page.locator(CLICK_COUNT), '计数节点应渲染为整数').toHaveText(/^\d+$/)
        const before = Number(await page.locator(CLICK_COUNT).textContent())
        await realPointerClick(page, page.locator(CLICK_PROBE))
        await expect(
            page.locator(CLICK_COUNT),
            '关闭后真实点击页面探针必须生效（指针事件残留会表现为不计数）',
        ).toHaveText(String(before + 1))
    })

    test('C3 单层：滚动锁开关与滚动条补偿几何', async ({ page }) => {
        const initial = await bodyState(page)
        const scrollbar = await scrollbarWidth(page)
        const probe = page.locator(GEOMETRY_PROBE)
        await probe.scrollIntoViewIfNeeded()
        const before = await boxOf(probe)
        const marginRightBefore = await page.evaluate(
            () => Number.parseFloat(getComputedStyle(document.body).marginRight) || 0,
        )

        await page.locator(DIALOG_OPEN).click()
        await expect(page.locator(DIALOG_CONTENT)).toBeVisible()
        await expect.poll(
            () => bodyState(page).then((state) => state.overflow),
            { message: '打开后应锁定 body 滚动' },
        ).toBe('hidden')

        const whileOpen = await boxOf(probe)
        /*
          in-flow 探针的期望位移按 Reka 的两项补偿推导（`useBodyScrollLock`）：
          ① 滚动条占位消失 ⇒ 内容可用宽 +sw；② `body.padding-right = sw` ⇒ 抵消 ①；
          ③ `body.margin-right` 被置 0 ⇒ 内容宽再增加「打开前的 margin-right」（默认 UA 8px）。
          故补偿生效时期望宽度变化 = `scrollbar > 0 ? marginRightBefore : 0`，位置不变。
          若 ② 缺失，宽度会多出 sw；若 ③ 缺失，宽度会少 marginRightBefore —— 都以 1px 上界判出。
        */
        const expectedWidthShift = scrollbar > 0 ? marginRightBefore : 0
        expect(
            Math.abs(whileOpen.x - before.x),
            `打开后水平位移（${whileOpen.x - before.x}）应 ≤ ${TOLERANCE}px`,
        ).toBeLessThanOrEqual(TOLERANCE)
        expect(
            Math.abs(whileOpen.width - before.width - expectedWidthShift),
            `打开后宽度变化（${whileOpen.width - before.width}）应等于补偿推导值 ${expectedWidthShift}px（±${TOLERANCE}）`,
        ).toBeLessThanOrEqual(TOLERANCE)

        const openPadding = await bodyState(page).then((state) => state.paddingRight)
        if (scrollbar > 0) {
            expect(openPadding, '有滚动条时必须按实测宽度补偿 padding-right').toBe(`${scrollbar}px`)
            // ③ 的机制断言：Reka 在补偿时把 body 的 margin-right 置 0
            expect(
                await page.evaluate(() => getComputedStyle(document.body).marginRight),
                '补偿时 body margin-right 应被置 0',
            ).toBe('0px')
        } else {
            expect(openPadding, '无滚动条占位时不应写入补偿值').toBe(initial.paddingRight)
        }

        await page.keyboard.press('Escape')
        await expect(page.locator(DIALOG_CONTENT)).toHaveCount(0)

        const after = await boxOf(probe)
        expect(Math.abs(after.x - before.x), '关闭后水平位置应完全复位').toBeLessThanOrEqual(TOLERANCE)
        expect(Math.abs(after.width - before.width), '关闭后宽度应完全复位').toBeLessThanOrEqual(TOLERANCE)
        await expect.poll(() => bodyState(page), { message: '关闭后滚动锁应逐项复位' }).toEqual(initial)
    })

    test('C3 单层：bodyLock Select 单独取锁并在关闭后复位', async ({ page }) => {
        const initial = await bodyState(page)
        const scrollbar = await scrollbarWidth(page)

        // 无模态父层：取锁行为与对话框的锁相互独立，这里单独验证「取锁」一侧
        await openSelectByPointer(page, page.locator(LOCKED_SELECT_PAGE), '页面级 bodyLock Select')
        await expect.poll(
            () => bodyState(page).then((state) => state.overflow),
            { message: 'bodyLock Select 打开后应锁定 body 滚动' },
        ).toBe('hidden')
        if (scrollbar > 0) {
            await expect.poll(
                () => bodyState(page).then((state) => state.paddingRight),
                { message: 'bodyLock Select 应按实测滚动条宽补偿 padding-right' },
            ).toBe(`${scrollbar}px`)
        }

        await page.keyboard.press('Escape')
        await expect(page.locator(SELECT_ANY), 'Esc 应卸载面板').toHaveCount(0)
        await expect.poll(
            () => bodyState(page),
            { message: '关闭后 overflow / padding-right / margin-right / pointer-events 必须逐项复位' },
        ).toEqual(initial)
    })

    test('C4 Drawer：长列表面板内部可滚动且不越出视口', async ({ page }) => {
        await page.locator(DRAWER_OPEN).click()
        await expect(page.locator(DRAWER_CONTENT)).toBeVisible()

        await openSelectByPointer(page, page.locator(DRAWER_SELECT), 'Drawer 内长列表 Select')
        const viewport = page.locator(SELECT_VIEWPORT)
        await expect(viewport).toBeVisible()

        // 前置：面板视口必须真的产生内部滚动，否则「可滚」断言恒真
        await expect.poll(
            () => viewport.evaluate((element) => element.scrollHeight > element.clientHeight),
            { message: '长列表必须产生内部滚动（视口高度上限生效）' },
        ).toBe(true)

        const panel = await boxOf(page.locator(SELECT_CONTENT))
        const viewportHeight = await page.evaluate(() => window.innerHeight)
        expect(panel.y, '面板不得越出视口顶边').toBeGreaterThanOrEqual(-TOLERANCE)
        expect(panel.y + panel.height, '面板不得越出视口底边').toBeLessThanOrEqual(viewportHeight + TOLERANCE)

        await viewport.hover()
        await page.mouse.wheel(0, 400)
        await expect.poll(
            () => viewport.evaluate((element) => element.scrollTop),
            { message: '滚轮必须真实改变面板内滚动位置' },
        ).toBeGreaterThan(0)

        await page.keyboard.press('End')
        await expect(page.locator(SELECT_ITEM).last(), '键盘 End 后末项应滚入视野').toBeInViewport()
    })

    test('C5 Dialog：Esc 与外部点击按层关闭', async ({ page }) => {
        await page.locator(DIALOG_OPEN).click()
        const dialog = page.locator(DIALOG_CONTENT)
        await expect(dialog).toBeVisible()

        // ① Esc 只关面板
        await openSelectByPointer(page, page.locator(DIALOG_SELECT), 'C5 Select')
        await page.keyboard.press('Escape')
        await expect(page.locator(SELECT_ANY), '第一次 Esc 应卸载面板').toHaveCount(0)
        await expect(dialog, '第一次 Esc 不得关闭对话框').toBeVisible()

        // ② 点击对话框内部空白只关面板
        await openSelectByPointer(page, page.locator(DIALOG_SELECT), 'C5 Select 二次展开')
        await realPointerClick(page, page.locator(DIALOG_BLANK))
        await expect(page.locator(SELECT_ANY), '点击内部空白应卸载面板').toHaveCount(0)
        await expect(dialog, '点击内部空白不得关闭对话框').toBeVisible()

        // ③ 点击遮罩关闭对话框（取任一落在面板外的视口角点）
        const dialogRect = await boxOf(dialog)
        const corners = await page.evaluate(() => [
            { x: 5, y: 5 },
            { x: window.innerWidth - 5, y: 5 },
            { x: 5, y: window.innerHeight - 5 },
            { x: window.innerWidth - 5, y: window.innerHeight - 5 },
        ])
        const outside = corners.find(({ x, y }) => (
            x < dialogRect.x
            || x > dialogRect.x + dialogRect.width
            || y < dialogRect.y
            || y > dialogRect.y + dialogRect.height
        ))
        expect(outside, '视口角点必须存在落在对话框之外的位置（遮罩点击前置）').toBeDefined()
        if (!outside) {
            throw new Error('视口角点必须存在落在对话框之外的位置（遮罩点击前置）')
        }
        await page.mouse.click(outside.x, outside.y)
        await expect(dialog, '点击遮罩应关闭对话框').toHaveCount(0)
    })
})

test.describe('层叠与焦点（C7 / C8）', () => {
    test('C7 Dialog 打开时 Toast 可命中、不关闭对话框，且不改变对话框层级', async ({ page }) => {
        await page.locator(TOAST_DIALOG_OPEN).click()
        const dialog = page.locator(DIALOG_CONTENT)
        await expect(dialog).toBeVisible()

        const dialogZIndex = () => page.evaluate((selector) => {
            const element = document.querySelector(selector)
            return element ? getComputedStyle(element).zIndex : null
        }, DIALOG_CONTENT)
        const baselineZ = await dialogZIndex()
        expect(baselineZ, '对话框内容应有可读的 z-index（层级对照前置）').not.toBe('auto')

        // 探针先行：页面上**每一个**提示视图层容器的 pointer-events 都必须为 none
        // （只查一个会命中 `#toast-contrast` 段的另一个 provider，对本 provider 没有对照力）
        await expect.poll(
            () => page.evaluate(() => {
                const viewports = [...document.querySelectorAll('.caomei-toast-viewport')]
                return viewports.length > 0 && viewports.every((element) => getComputedStyle(element).pointerEvents === 'none')
            }),
            { message: '所有提示视图层容器的 pointer-events 均应为 none' },
        ).toBe(true)

        await realPointerClick(page, page.locator(TOAST_SHOW))
        const toast = page.locator(TOAST_SCOPE).first()
        await expect(toast, '对话框内触发后应出现提示').toBeVisible()
        await expect.poll(
            () => toast.evaluate((element) => getComputedStyle(element).pointerEvents),
            { message: '提示本体必须 pointer-events: auto（视图层 none 只作用于空白区）' },
        ).toBe('auto')

        const hitInsideToast = await page.evaluate((scope) => {
            const element = document.querySelector(scope)
            if (!element) {
                return null
            }
            const box = element.getBoundingClientRect()
            const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
            return hit ? element === hit || element.contains(hit) : null
        }, TOAST_SCOPE)
        expect(hitInsideToast, '提示中心必须命中提示自身（被对话框盖住时会命中上层）').toBe(true)
        await expect(dialog, '提示出现不得关闭对话框').toBeVisible()

        // 多条提示：命中仍成立、对话框层级不变
        await realPointerClick(page, page.locator(TOAST_SHOW_TWO))
        await expect(page.locator(TOAST_SCOPE), '应累计三条提示').toHaveCount(3)
        expect(await hitTestInside(page, TOAST_SCOPE), '多条提示后命中仍应落在提示自身').toBe(true)
        expect(await dialogZIndex(), '多条提示不得改变对话框层级').toBe(baselineZ)
        await expect(dialog).toBeVisible()

        // 关闭一条提示：对话框仍在
        await realPointerClick(page, page.locator(`${TOAST_SCOPE} .caomei-toast__close`).first())
        await expect(page.locator(TOAST_SCOPE), '关闭一条后应剩两条').toHaveCount(2)
        await expect(dialog, '关闭提示不得关闭对话框').toBeVisible()
    })

    test('C8 焦点陷阱：Tab 不逃出对话框，Select 展开后焦点进入面板并归还触发器', async ({ page }) => {
        await page.locator(DIALOG_OPEN).click()
        const dialog = page.locator(DIALOG_CONTENT)
        await expect(dialog).toBeVisible()

        const focusInside = (selector: string) => page.evaluate((target) => {
            const root = document.querySelector(target)
            return Boolean(root && document.activeElement && root.contains(document.activeElement))
        }, selector)
        /** 顶层 = 对话框内容与已展开面板（面板经 portal 挂在 body，不是对话框的后代）。 */
        const focusInTopLayer = () => page.evaluate(() => {
            const active = document.activeElement
            if (!active) {
                return false
            }
            const dialogRoot = document.querySelector('.caomei-dialog__content')
            const list = document.querySelector('[role="listbox"]')
            const inDialog = Boolean(dialogRoot?.contains(active))
            const inList = Boolean(list?.contains(active))
            return inDialog || inList || Boolean(active.closest('[role="listbox"], [role="option"]'))
        })

        await expect.poll(
            () => focusInside(DIALOG_CONTENT),
            { message: '对话框打开后焦点应落在对话框内' },
        ).toBe(true)

        const visited = new Set<string>()
        for (let index = 0; index < 12; index += 1) {
            await page.keyboard.press('Tab')
            await expect.poll(
                () => focusInside(DIALOG_CONTENT),
                { message: `第 ${index + 1} 次 Tab 后焦点不得逃出对话框（焦点陷阱）` },
            ).toBe(true)
            // 同时记录焦点身份：只断言「仍在框内」无法区分「循环」与「Tab 被吞掉且焦点不动」
            visited.add(await page.evaluate(() => {
                const active = document.activeElement
                return active ? `${active.tagName}.${active.id || active.className}` : ''
            }))
        }
        expect(visited.size, `Tab 循环应经过多个可聚焦元素，实际停留在：${[...visited].join(' / ')}`).toBeGreaterThanOrEqual(3)
        // 12 次 Tab 后若经过的不同元素少于 12 个，说明循环确实回到过先前的元素（而不是一路前进后被吞掉）
        expect(visited.size, `12 次 Tab 应出现回环（实际经过 ${visited.size} 个不同元素）`).toBeLessThan(12)

        // 键盘展开 Select：焦点应进入面板；Shift+Tab 不得逃出顶层；Esc 关闭后焦点回触发器
        await page.locator(DIALOG_SELECT).focus()
        await page.keyboard.press('Enter')
        await expect(page.locator(SELECT_CONTENT), 'Enter 应展开面板').toBeVisible()
        await expect.poll(
            () => page.evaluate(() => Boolean(document.activeElement?.closest('[role="listbox"], [role="option"]'))),
            { message: '面板展开后焦点应进入列表' },
        ).toBe(true)

        await page.keyboard.press('Shift+Tab')
        await expect.poll(
            focusInTopLayer,
            { message: 'Shift+Tab 不得把焦点带出顶层（对话框内容或已展开面板）' },
        ).toBe(true)

        await page.keyboard.press('Escape')
        await expect(page.locator(SELECT_ANY), 'Esc 应卸载面板').toHaveCount(0)
        await expect.poll(
            () => focusOn(page, DIALOG_SELECT),
            { message: '面板关闭后焦点应回到触发器' },
        ).toBe(true)
        await expect(dialog).toBeVisible()
    })
})

test.describe('嵌套（C6）', () => {
    test('C6 嵌套：Dialog → 二次确认：命中 / Esc 只关最上层 / 锁两层释放 / 焦点归还', async ({ page }) => {
        const initial = await bodyState(page)

        await page.locator(NESTED_OPEN_DIALOG).click()
        const detail = page.locator(DIALOG_CONTENT)
        await expect(detail).toBeVisible()
        await expect.poll(
            () => bodyState(page).then((state) => state.overflow),
            { message: '详情对话框打开后应取滚动锁' },
        ).toBe('hidden')
        // 单层基线：关闭上层后必须回到这一组取值（只断言 overflow 会漏掉指针锁与 padding 的提前释放）
        const parentOnly = await bodyState(page)

        await realPointerClick(page, page.locator(NESTED_CONFIRM))
        const confirm = page.locator(CONFIRM_CONTENT)
        await expect(confirm, '二次确认应叠加在详情对话框之上').toBeVisible()
        expect(await hitTestInside(page, CONFIRM_CONTENT), '确认框中心必须命中自身').toBe(true)

        // 负向对照：把确认框压到父层之下（子层被父层盖住）时，同一条命中测试必须失败
        try {
            await page.evaluate((selector) => {
                const element = document.querySelector(selector)
                if (element instanceof HTMLElement) {
                    element.dataset.collabZIndex = element.style.zIndex
                    element.style.zIndex = '0'
                }
            }, CONFIRM_CONTENT)
            expect(
                await hitTestInside(page, CONFIRM_CONTENT),
                '子层被父层盖住时命中测试必须失败（判别力自证）',
            ).toBe(false)
        } finally {
            await page.evaluate((selector) => {
                const element = document.querySelector(selector)
                if (element instanceof HTMLElement) {
                    element.style.zIndex = element.dataset.collabZIndex ?? ''
                    delete element.dataset.collabZIndex
                }
            }, CONFIRM_CONTENT)
        }
        expect(await hitTestInside(page, CONFIRM_CONTENT)).toBe(true)

        // Esc 只关最上层：确认框关闭、详情仍在、滚动锁不得提前释放、焦点归还触发键
        await page.keyboard.press('Escape')
        await expect(confirm, 'Esc 应只关闭最上层的确认框').toHaveCount(0)
        await expect(detail, 'Esc 不得关闭下层详情对话框').toBeVisible()
        await expect.poll(
            () => bodyState(page).then((state) => ({
                overflow: state.overflow,
                pointerEvents: state.pointerEvents,
                paddingRight: state.paddingRight,
            })),
            { message: '下层仍在：滚动锁与指针锁都必须保持，padding 不得被上层释放时清掉' },
        ).toEqual({
            overflow: 'hidden',
            pointerEvents: parentOnly.pointerEvents,
            paddingRight: parentOnly.paddingRight,
        })
        await expect(page.locator(NESTED_CONFIRM_RESULT), 'Esc 关闭应结算为取消').toHaveText('已取消')
        await expect.poll(
            () => focusOn(page, NESTED_CONFIRM),
            { message: '关闭确认框后焦点应回到触发键' },
        ).toBe(true)

        await page.keyboard.press('Escape')
        await expect(detail, '第二次 Esc 应关闭详情对话框').toHaveCount(0)
        await expect.poll(
            () => bodyState(page),
            { message: '两层全部关闭后滚动锁与指针锁必须逐项复位' },
        ).toEqual(initial)
    })

    test('C6 嵌套：Drawer → Dialog：命中 / Esc 只关最上层 / 锁两层释放 / 焦点归还', async ({ page }) => {
        const initial = await bodyState(page)

        await page.locator(NESTED_OPEN_DRAWER).click()
        const drawer = page.locator(DRAWER_CONTENT)
        await expect(drawer).toBeVisible()
        await expect.poll(
            () => bodyState(page).then((state) => state.overflow),
            { message: '抽屉打开后应取滚动锁' },
        ).toBe('hidden')
        const parentOnly = await bodyState(page)

        await realPointerClick(page, page.locator(NESTED_DRAWER_DIALOG))
        const inner = page.locator(DIALOG_CONTENT)
        await expect(inner, '抽屉内对话框应叠加在抽屉之上').toBeVisible()
        expect(await hitTestInside(page, DIALOG_CONTENT), '抽屉内对话框中心必须命中自身').toBe(true)

        await page.keyboard.press('Escape')
        await expect(inner, 'Esc 应只关闭上层对话框').toHaveCount(0)
        await expect(drawer, 'Esc 不得关闭下层抽屉').toBeVisible()
        await expect.poll(
            () => bodyState(page).then((state) => ({
                overflow: state.overflow,
                pointerEvents: state.pointerEvents,
                paddingRight: state.paddingRight,
            })),
            { message: '下层仍在：滚动锁与指针锁都必须保持，padding 不得被上层释放时清掉' },
        ).toEqual({
            overflow: 'hidden',
            pointerEvents: parentOnly.pointerEvents,
            paddingRight: parentOnly.paddingRight,
        })
        await expect.poll(
            () => focusOn(page, NESTED_DRAWER_DIALOG),
            { message: '关闭对话框后焦点应回到抽屉内的触发键' },
        ).toBe(true)

        await page.keyboard.press('Escape')
        await expect(drawer, '第二次 Esc 应关闭抽屉').toHaveCount(0)
        await expect.poll(
            () => bodyState(page),
            { message: '两层全部关闭后滚动锁与指针锁必须逐项复位' },
        ).toEqual(initial)
    })
})

test.describe('移动端触摸滚动（C9）', () => {
    // mobile / tablet 两个 project 自带 `hasTouch`；本处主要为 desktop project 提供触摸环境证据
    test.use({ hasTouch: true })

    test.beforeEach(() => {
        allowTouchCancellationNoise = true
    })

    test.afterEach(() => {
        allowTouchCancellationNoise = false
    })

    test('C9 触摸滑动在长列表面板内滚动生效且不关闭抽屉', async ({ page, context }) => {
        await page.locator(DRAWER_OPEN).tap()
        const drawer = page.locator(DRAWER_CONTENT)
        await expect(drawer).toBeVisible()

        await page.locator(DRAWER_SELECT).tap()
        const panel = page.locator(SELECT_CONTENT)
        await expect(panel, '触摸应展开面板').toBeVisible()

        const viewport = page.locator(SELECT_VIEWPORT)
        await expect(viewport).toBeVisible()
        // 前置：面板内容必须真的可滚（否则手势无效会被误读成「触摸不生效」）
        expect(
            await viewport.evaluate((element) => element.scrollHeight > element.clientHeight),
            '面板内容须长于可视区（滚动前置）',
        ).toBe(true)
        const before = await viewport.evaluate((element) => element.scrollTop)
        const box = await boxOf(viewport)
        const x = Math.round(box.x + box.width / 2)
        const startY = Math.round(box.y + box.height - 16)

        // `touchscreen.tap` 只产生点按，不产生滚动；滚动必须走 CDP 的触摸序列
        const cdp = await context.newCDPSession(page)
        await cdp.send('Input.dispatchTouchEvent', {
            type: 'touchStart',
            touchPoints: [{ x, y: startY }],
        })
        for (const offset of [30, 60, 90, 120, 150, 180]) {
            await cdp.send('Input.dispatchTouchEvent', {
                type: 'touchMove',
                touchPoints: [{ x, y: startY - offset }],
            })
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })

        await expect.poll(
            () => viewport.evaluate((element) => element.scrollTop),
            { message: '触摸滑动应让面板内容滚动（scrollTop 增大）' },
        ).toBeGreaterThan(before + 10)
        await expect(drawer, '滚动面板不得关闭抽屉').toBeVisible()
        await expect(panel, '滚动后面板应保持展开').toBeVisible()
    })
})

test.describe('残留与滚动锁栈（多层）', () => {
    test('C2 负向对照：关闭后残留 pointer-events: none 时真实点击不生效', async ({ page }) => {
        // 前置：正常关闭后探针可点击（证明确立了「可交互」基线，而非探针本身点不动）
        await page.locator(DIALOG_OPEN).click()
        await expect(page.locator(DIALOG_CONTENT)).toBeVisible()
        await page.keyboard.press('Escape')
        await expect(page.locator(DIALOG_CONTENT)).toHaveCount(0)

        await expect(page.locator(CLICK_COUNT), '计数节点应渲染为整数').toHaveText(/^\d+$/)
        const baseline = Number(await page.locator(CLICK_COUNT).textContent())
        await realPointerClick(page, page.locator(CLICK_PROBE))
        await expect(page.locator(CLICK_COUNT), '基线：关闭后探针点击应生效').toHaveText(String(baseline + 1))

        // 注入残留：若用例仍通过，说明它没有判别力
        await page.evaluate(() => {
            document.body.style.pointerEvents = 'none'
        })
        try {
            await realPointerClick(page, page.locator(CLICK_PROBE))
            await expect(
                page.locator(CLICK_COUNT),
                '残留 pointer-events: none 未被检出——C2 的可交互断言失去判别力',
            ).toHaveText(String(baseline + 1))
        } finally {
            await page.evaluate(() => {
                document.body.style.pointerEvents = ''
            })
        }
    })

    test('C3 栈：Dialog + Select（bodyLock）逐层释放滚动锁', async ({ page }) => {
        const initial = await bodyState(page)
        const scrollbar = await scrollbarWidth(page)
        const probe = page.locator(GEOMETRY_PROBE)
        await probe.scrollIntoViewIfNeeded()
        const before = await boxOf(probe)
        const marginRightBefore = await page.evaluate(
            () => Number.parseFloat(getComputedStyle(document.body).marginRight) || 0,
        )

        await page.locator(DIALOG_OPEN).click()
        await expect(page.locator(DIALOG_CONTENT)).toBeVisible()
        await expect.poll(
            () => bodyState(page).then((state) => state.overflow),
            { message: '对话框打开后应锁定 body 滚动' },
        ).toBe('hidden')

        await openSelectByPointer(page, page.locator(LOCKED_SELECT), 'bodyLock Select')
        await expect.poll(
            () => bodyState(page).then((state) => state.overflow),
            { message: '子层再锁一层后仍应保持锁定' },
        ).toBe('hidden')

        const whileOpen = await boxOf(probe)
        const expectedWidthShift = scrollbar > 0 ? marginRightBefore : 0
        expect(
            Math.abs(whileOpen.x - before.x),
            '两层锁定期间 in-flow 内容不应发生位移',
        ).toBeLessThanOrEqual(TOLERANCE)
        expect(
            Math.abs(whileOpen.width - before.width - expectedWidthShift),
            `两层锁定期间的宽度变化应等于补偿推导值 ${expectedWidthShift}px（±${TOLERANCE}）`,
        ).toBeLessThanOrEqual(TOLERANCE)

        await page.keyboard.press('Escape')
        await expect(page.locator(SELECT_ANY), 'Esc 应卸载选择面板').toHaveCount(0)
        await expect.poll(
            () => bodyState(page).then((state) => state.overflow),
            { message: '关闭子层不得释放父层持有的滚动锁' },
        ).toBe('hidden')
        await expect.poll(
            () => bodyState(page).then((state) => state.pointerEvents),
            { message: '关闭子层不得恢复父层抑制的指针事件' },
        ).toBe('none')

        await page.keyboard.press('Escape')
        await expect(page.locator(DIALOG_CONTENT), '第二次 Esc 应关闭对话框').toHaveCount(0)

        await expect.poll(
            () => bodyState(page),
            { message: '最后一层关闭后必须恢复为打开前取值' },
        ).toEqual(initial)
        const after = await boxOf(probe)
        expect(Math.abs(after.x - before.x), '最后一层关闭后水平位置应复位').toBeLessThanOrEqual(TOLERANCE)
        expect(Math.abs(after.width - before.width), '最后一层关闭后宽度应复位').toBeLessThanOrEqual(TOLERANCE)
    })

    test('C3 栈：Dialog + Drawer 叠加，Esc 只关最上层', async ({ page }) => {
        const initial = await bodyState(page)

        await page.locator(DIALOG_OPEN).click()
        const dialog = page.locator(DIALOG_CONTENT)
        await expect(dialog).toBeVisible()
        await expect.poll(
            () => bodyState(page).then((state) => state.overflow),
            { message: '对话框打开后应锁定 body 滚动' },
        ).toBe('hidden')

        await realPointerClick(page, page.locator(STACK_DRAWER_TRIGGER))
        const drawer = page.locator(DRAWER_CONTENT)
        await expect(drawer, '抽屉应打开').toBeVisible()

        await page.keyboard.press('Escape')
        await expect(drawer, '第一次 Esc 只应关闭最上层抽屉').toHaveCount(0)
        await expect(dialog, '父层对话框应保持打开').toBeVisible()
        await expect.poll(
            () => bodyState(page).then((state) => state.overflow),
            { message: '关闭抽屉不得释放对话框持有的滚动锁' },
        ).toBe('hidden')

        await page.keyboard.press('Escape')
        await expect(dialog, '第二次 Esc 应关闭对话框').toHaveCount(0)
        await expect.poll(
            () => bodyState(page),
            { message: '最后一层关闭后必须恢复为打开前取值' },
        ).toEqual(initial)
    })
})
