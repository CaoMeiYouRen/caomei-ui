import { expect, test as base, type Locator } from '@playwright/test'
import panelCases from './fixtures/overlay-panels.json' with { type: 'json' }

/**
 * 模态内浮层层级回归（常驻）。
 *
 * 背景（用户报告，2026-09-30）：在 Dialog 内使用 Select 时，面板被模态内容盖住——
 * 面板的 z-index 取自「遮罩层」档位（与 `.caomei-dialog__overlay` 同值、低于
 * `.caomei-dialog__content`），面板只在与模态内容不重叠的区域内可见。Reka 的 popper 会把
 * 面板的计算 `z-index` 复制到**包裹层**，故包裹层的档位就是面板的实际层叠位置。
 *
 * 判定口径：
 * - **命中测试**是最终判据：取面板中心点做 `elementFromPoint`，命中元素必须落在面板内
 *   （面板被盖住时命中的是模态内容）；
 * - **前置守卫**：面板与模态内容区域必须真实重叠（否则命中测试恒真、失去判别力）；
 * - **机制断言**：面板计算 `z-index` 必须高于 `.caomei-dialog__content`（命中测试的解释性证据）；
 * - **判别力自证**：补偿后模态内容的**根节点与后代**都必须可命中，且 `inline` 用例的探针
 *   必须落在模态层内——命中测试自身不得退化（详见 `paintOrderHitTest` 与 `inlinePaintOrderHitTest`）。
 *
 * 面板挂到 `body` 后不参与几何裁剪，故用例不假设面板落在模态边框内。
 */

/** 几何容差：吸收子像素取整与 1px 边框 */
const TOLERANCE = 1

interface PanelCase {
    name: string
    /** 模态内的触发器选择器 */
    trigger: string
    /** 面板本体选择器（挂在 body 上的 Reka 内容元素） */
    panel: string
}

/**
 * 受检浮层清单（本表即受检范围的事实源）——登记于 `fixtures/overlay-panels.json`，
 * 与声明层守卫 `check:overlay-z-index` 的 T10 **双向对账**：`src` 中声明锚定浮层档位的组件
 * 必须逐项出现在本清单，反之亦然（新增 portal 浮层组件而未补清单即 `governance:check` 失败）。
 *
 * 覆盖**全部 7 个 portal 浮层面板**：均由 Reka 的 popper 包裹层承载 z-index，任一类的档位
 * 低于模态内容即被盖住。夹具见 `test/e2e/fixtures/app.vue` 的 `#overlay-in-dialog` 段。
 */
const PANEL_CASES: PanelCase[] = panelCases.cases
// color-picker 面板挂 body、无法用祖先限定；`inline` 形态复用同一基类，清单以 `:not(...)` 显式排除

/** 受检面下界（冗余守卫：精确对账由 `check:overlay-z-index` 的 T10 承担） */
const MIN_PANEL_CASES = 7

const DIALOG_CONTENT = '.caomei-dialog__content'
const DIALOG_OVERLAY = '.caomei-dialog__overlay'
const DIALOG_TRIGGER = '#overlay-in-dialog button'

/** 每个用例独立收集 console error / page error，并统一导航（与 `field-overflow.e2e.ts` 同构）。 */
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

/** 取元素相对视口的边框盒 */
async function rectOf(locator: Locator): Promise<{ x: number, y: number, width: number, height: number }> {
    const box = await locator.boundingBox()
    if (!box) {
        throw new Error('元素不可见或无几何盒，无法测量')
    }
    return box
}

/**
 * 面板与模态内容重叠区中心的「绘制顺序」命中测试。
 *
 * Reka 在**部分**嵌套浮层（实测为 Select）打开时会把模态内容整棵子树置为 `pointer-events: none`
 * （以便把面板之外的点击判为「外部点击」），而命中测试会跳过不可命中的元素——此时
 * `elementFromPoint` 恒返回面板、**无法反映绘制顺序**。故命中测试前按需临时把模态内容恢复为
 * 可命中（其余浮层不置 `none`，无需补偿），使命中结果等于真实绘制顺序：面板被盖住时命中的是
 * 模态内容内的元素。
 *
 * **判别力自证**（防静默失效）：补偿后必须确认模态内容**根节点与后代**都确实可命中——
 * 上游 Reka 若改为在 `body` / 包裹层维护 `pointer-events`（而非目标元素内联值），或把
 * `pointer-events: none` 挂在模态内容的子包裹层，补偿会静默失效并让断言恒真；
 * 此时用例失败并提示复核该手法，而不是悄悄失去判别力。
 *
 * @returns `inside` 为命中元素是否落在面板内；`hit` 为命中元素描述（定位失败用）
 */
async function paintOrderHitTest(
    panel: Locator,
    dialog: Locator,
): Promise<{ inside: boolean, hit: string }> {
    const [panelRect, dialogRect] = await Promise.all([rectOf(panel), rectOf(dialog)])
    const x = (Math.max(panelRect.x, dialogRect.x) + Math.min(panelRect.x + panelRect.width, dialogRect.x + dialogRect.width)) / 2
    const y = (Math.max(panelRect.y, dialogRect.y) + Math.min(panelRect.y + panelRect.height, dialogRect.y + dialogRect.height)) / 2

    const needsCompensation = await dialog.evaluate((element) => getComputedStyle(element).pointerEvents === 'none')
    // 保存 / 还原内联值（不可用 `removeProperty`：Reka 以元素内联值参与嵌套层的
    // pointer-events 记账，抹掉属性会让面板关闭后模态内容停留在不可命中状态）
    const savedPointerEvents = needsCompensation
        ? await dialog.evaluate((element) => element.style.pointerEvents)
        : ''
    if (needsCompensation) {
        await dialog.evaluate((element) => {
            element.style.pointerEvents = 'auto'
        })
    }
    try {
        const hitTestable = await dialog.evaluate((element) => getComputedStyle(element).pointerEvents !== 'none')
        expect(
            hitTestable,
            '命中测试前提不成立：模态内容不可命中时命中结果无法反映绘制顺序，请复核补偿手法',
        ).toBe(true)

        // 判别力自证（后代）：只自证根节点不够——`pointer-events: none` 若挂在模态内容的
        // **子包裹层**上，根节点可命中而后代仍不可命中，命中测试会失真。这里在模态内容内
        // 取一个可命中的后代，确认其中心点的命中仍落在模态内容子树内（即「后代参与绘制顺序」）。
        const descendantProbe = await dialog.evaluate((element) => {
            const describe = (node: Element) => `${node.tagName.toLowerCase()}.${node.getAttribute('class') ?? ''}`
            for (const candidate of Array.from(element.querySelectorAll('*'))) {
                const rect = candidate.getBoundingClientRect()
                if (rect.width === 0 || rect.height === 0) {
                    continue
                }
                const cx = rect.x + rect.width / 2
                const cy = rect.y + rect.height / 2
                if (cx < 0 || cy < 0 || cx > window.innerWidth || cy > window.innerHeight) {
                    continue
                }
                if (getComputedStyle(candidate).pointerEvents === 'none') {
                    continue
                }
                const hit = document.elementFromPoint(cx, cy)
                if (hit !== null && element.contains(hit) && hit !== element) {
                    return { ok: true, hit: describe(hit) }
                }
            }
            return { ok: false, hit: 'null' }
        })
        expect(
            descendantProbe.ok,
            '命中测试判别力自证失败：模态内容后代不可命中（补偿可能只作用于根节点，或 pointer-events: none 挂在子包裹层）',
        ).toBe(true)

        return await panel.evaluate((element, point) => {
            const hit = document.elementFromPoint(point.x, point.y)
            return {
                inside: hit !== null && element.contains(hit),
                // 用 `getAttribute('class')`：`className` 在 SVG 元素上是 `SVGAnimatedString`，序列化不可读
                hit: hit === null ? 'null' : `${hit.tagName.toLowerCase()}.${hit.getAttribute('class') ?? ''}`,
            }
        }, { x, y })
    } finally {
        if (needsCompensation) {
            await dialog.evaluate((element, value) => {
                element.style.pointerEvents = value
            }, savedPointerEvents)
        }
    }
}

/**
 * 内联 ColorPicker 面板的绘制顺序命中测试。
 *
 * 内联面板位于页面流内，与居中模态的几何重叠随滚动位置变化，故不做「与模态内容重叠」的
 * 几何前置；改用**模态遮罩**作参照——遮罩覆盖整个视口，只要面板落在视口内，其可见区中心
 * 就必然处于模态层之下。判定：命中元素既不在面板内（绘制顺序正确），又落在模态层内（探针有效）。
 *
 * **补偿**：模态打开时上游会把宿主内容整棵子树置为 `pointer-events: none`（把面板之外的点击
 * 判为外部点击），命中测试会跳过不可命中的元素——此时命中恒返回模态层、无法反映绘制顺序。
 * 故命中测试前把面板自身临时恢复为可命中（`pointer-events: auto` 对祖先 `none` 生效），
 * 命中结果即等于真实绘制顺序；测试后按保存的内联值还原。
 *
 * 自证项：面板须仍与视口有非零交集、补偿后面板可命中、**模态层也可命中**——三者任一不成立，
 * 「命中不在面板内」都会恒真，此时用例失败而非静默通过。
 *
 * @returns `visible` 面板与视口是否有非零交集；两项 `pointerEvents`；命中描述与两项判定
 */
async function inlinePaintOrderHitTest(inlinePanel: Locator) {
    const needsCompensation = await inlinePanel.evaluate((element) => getComputedStyle(element).pointerEvents === 'none')
    const savedPointerEvents = needsCompensation
        ? await inlinePanel.evaluate((element) => element.style.pointerEvents)
        : ''
    if (needsCompensation) {
        await inlinePanel.evaluate((element) => {
            element.style.pointerEvents = 'auto'
        })
    }
    try {
        return await inlinePanel.evaluate((element, selectors) => {
            const rect = element.getBoundingClientRect()
            const left = Math.max(rect.left, 0)
            const top = Math.max(rect.top, 0)
            const right = Math.min(rect.right, window.innerWidth)
            const bottom = Math.min(rect.bottom, window.innerHeight)
            const visible = right - left > 0 && bottom - top > 0
            const pointerEvents = getComputedStyle(element).pointerEvents
            const overlay = document.querySelector(selectors.overlay)
            const dialog = document.querySelector(selectors.dialog)
            const overlayPointerEvents = overlay === null ? 'missing' : getComputedStyle(overlay).pointerEvents
            if (!visible) {
                return { visible, pointerEvents, overlayPointerEvents, hit: 'null', insideInlinePanel: false, insideModal: false }
            }
            const hit = document.elementFromPoint(left + (right - left) / 2, top + (bottom - top) / 2)
            return {
                visible,
                pointerEvents,
                overlayPointerEvents,
                hit: hit === null ? 'null' : `${hit.tagName.toLowerCase()}.${hit.getAttribute('class') ?? ''}`,
                insideInlinePanel: hit !== null && element.contains(hit),
                insideModal: hit !== null && ((dialog?.contains(hit) ?? false) || overlay === hit),
            }
        }, { dialog: DIALOG_CONTENT, overlay: DIALOG_OVERLAY })
    } finally {
        if (needsCompensation) {
            await inlinePanel.evaluate((element, value) => {
                element.style.pointerEvents = value
            }, savedPointerEvents)
        }
    }
}

test.describe('模态内浮层层级', () => {
    test('面板必须渲染在模态内容之上', async ({ page }) => {
        expect(PANEL_CASES.length, '受检浮层清单不得被静默收窄').toBeGreaterThanOrEqual(MIN_PANEL_CASES)

        await page.locator(DIALOG_TRIGGER).first().click()
        const dialog = page.locator(DIALOG_CONTENT)
        await expect(dialog).toBeVisible()

        const dialogRect = await rectOf(dialog)
        const dialogZIndex = await dialog.evaluate((element) => Number(getComputedStyle(element).zIndex))

        for (const panelCase of PANEL_CASES) {
            await page.locator(panelCase.trigger).first().click()
            const panel = page.locator(panelCase.panel)
            await expect(panel, `${panelCase.name} 面板应打开`).toBeVisible()

            const panelRect = await rectOf(panel)

            // 前置守卫：面板必须与模态内容区域真实重叠，否则命中测试失去判别力
            const overlapX = Math.min(panelRect.x + panelRect.width, dialogRect.x + dialogRect.width)
                - Math.max(panelRect.x, dialogRect.x)
            const overlapY = Math.min(panelRect.y + panelRect.height, dialogRect.y + dialogRect.height)
                - Math.max(panelRect.y, dialogRect.y)
            expect(
                overlapX > TOLERANCE && overlapY > TOLERANCE,
                `${panelCase.name} 面板未与模态内容重叠（几何前置不成立，命中测试无判别力）`,
            ).toBe(true)

            // 机制断言：面板计算 z-index 必须高于模态内容
            const panelZIndex = await panel.evaluate((element) => Number(getComputedStyle(element).zIndex))
            expect(
                panelZIndex,
                `${panelCase.name} 面板 z-index（${panelZIndex}）必须高于模态内容（${dialogZIndex}）`,
            ).toBeGreaterThan(dialogZIndex)

            // 最终判据：重叠区中心的绘制顺序命中必须落在面板内（被盖住时命中的是模态内容）
            const hit = await paintOrderHitTest(panel, dialog)
            expect(
                hit.inside,
                `${panelCase.name} 面板在重叠区被 ${hit.hit} 盖住`,
            ).toBe(true)

            await page.keyboard.press('Escape')
            await expect(panel).toBeHidden()
            // 锚定「只关了面板」：若 Escape 连带关闭模态，后续迭代会拿过期矩形继续、报错信息会误导
            await expect(dialog, 'Escape 只应关闭面板，不应关闭模态').toBeVisible()
        }
    })

    /**
     * `ColorPicker` 的 `inline` 形态是页面内的静态 flex item——`z-index` 对 flex item 同样生效，
     * 若被基类规则带上浮层档位，会在模态打开时绘制到模态卡片之上。该形态必须**不参与**浮层层叠。
     *
     * 判定：声明层（计算 `z-index === 'auto'`）**加**绘制顺序命中（面板可见区中心必须被模态层
     * 命中，而非面板自身）——只断言 `z-index` 不足以证明绘制结果，命中测试是其充分性证据。
     */
    test('内联 ColorPicker 面板不参与浮层层叠', async ({ page }) => {
        const inlinePanel = page.locator('#inline-color-picker .caomei-color-picker__panel--inline')
        await expect(inlinePanel, '夹具应渲染内联面板').toBeVisible()
        // 几何前置：面板须落在视口内，模态遮罩覆盖整个视口，命中测试才有意义
        await inlinePanel.scrollIntoViewIfNeeded()

        const zIndex = await inlinePanel.evaluate((element) => getComputedStyle(element).zIndex)
        expect(zIndex, '内联面板不得声明浮层档位（应与模态内容的 1001 无层叠关系）').toBe('auto')

        await page.locator(DIALOG_TRIGGER).first().click()
        await expect(page.locator(DIALOG_CONTENT)).toBeVisible()

        const probe = await inlinePaintOrderHitTest(inlinePanel)
        expect(probe.visible, '内联面板须仍落在视口内（几何前置不成立，命中测试无判别力）').toBe(true)
        expect(probe.pointerEvents, '补偿后内联面板仍不可命中（命中结果无法反映绘制顺序，请复核补偿手法）').not.toBe('none')
        expect(probe.overlayPointerEvents, '模态遮罩不可命中（探针无法落到模态层，命中测试无判别力）').not.toBe('none')
        expect(
            probe.insideInlinePanel,
            `内联面板被自身命中（绘制顺序异常，疑似继承了浮层档位）：${probe.hit}`,
        ).toBe(false)
        expect(probe.insideModal, `探针未落在模态层（命中测试无判别力）：${probe.hit}`).toBe(true)
    })
})
