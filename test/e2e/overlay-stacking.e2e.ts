import { expect, test as base, type Locator } from '@playwright/test'

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
 * - **机制断言**：面板计算 `z-index` 必须高于 `.caomei-dialog__content`（命中测试的解释性证据）。
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
 * 受检浮层清单（本表即受检范围的事实源）。
 *
 * 覆盖**全部 7 个 portal 浮层面板**：均由 Reka 的 popper 包裹层承载 z-index，任一类的档位
 * 低于模态内容即被盖住。夹具见 `test/e2e/fixtures/app.vue` 的 `#overlay-in-dialog` 段；
 * 新增「模态内可开合」的浮层组件时必须加入本表（`MIN_PANEL_CASES` 同步抬高），
 * 否则「面板高于模态」的契约失去覆盖。
 */
const PANEL_CASES: PanelCase[] = [
    { name: 'select', trigger: '#overlay-select .caomei-select', panel: '.caomei-select__content' },
    { name: 'multi-select', trigger: '#overlay-multi-select .caomei-multi-select', panel: '.caomei-multi-select__content' },
    { name: 'auto-complete', trigger: '#overlay-auto-complete .caomei-auto-complete', panel: '.caomei-auto-complete__content' },
    // 面板挂 body、无法用祖先限定；`inline` 形态复用同一基类，须显式排除（否则选择器命中两个元素）
    { name: 'color-picker', trigger: '#overlay-color-picker .caomei-color-picker__trigger', panel: '.caomei-color-picker__panel:not(.caomei-color-picker__panel--inline)' },
    { name: 'date-picker', trigger: '#overlay-date-picker .caomei-date-picker', panel: '.caomei-date-picker__content' },
    { name: 'popover', trigger: '#overlay-popover .caomei-popover__trigger', panel: '.caomei-popover__content' },
    { name: 'dropdown-menu', trigger: '#overlay-dropdown-menu .caomei-dropdown-menu__trigger', panel: '.caomei-dropdown-menu__content' },
]

/** 受检面下界：防止清单被静默收窄后「全部通过」变成空真（当前 = portal 浮层面板全集） */
const MIN_PANEL_CASES = 7

const DIALOG_CONTENT = '.caomei-dialog__content'
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
 * **判别力自证**（防静默失效）：补偿后必须确认模态内容**确实可命中**——上游 Reka 若改为在
 * `body` / 包裹层维护 `pointer-events`（而非目标元素内联值），补偿会静默失效并让断言恒真；
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
     */
    test('内联 ColorPicker 面板不参与浮层层叠', async ({ page }) => {
        const inlinePanel = page.locator('#inline-color-picker .caomei-color-picker__panel--inline')
        await expect(inlinePanel, '夹具应渲染内联面板').toBeVisible()

        await page.locator(DIALOG_TRIGGER).first().click()
        await expect(page.locator(DIALOG_CONTENT)).toBeVisible()

        const zIndex = await inlinePanel.evaluate((element) => getComputedStyle(element).zIndex)
        expect(zIndex, '内联面板不得声明浮层档位（应与模态内容的 1001 无层叠关系）').toBe('auto')
    })
})
