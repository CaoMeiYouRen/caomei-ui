import { expect, test } from '@playwright/test'

/**
 * 浮层展开态的「首击穿透」（常驻，真实浏览器）。
 *
 * 背景：打开态给浮层外的兄弟节点补 `inert` 后，`inert` 子树不参与命中测试——用户点击背景控件时
 * 第一次点击只关闭浮层、控件没被激活（要再点一次），即「首击被吞」。本套件守住修复后的语义：
 * **一次点击同时完成「关闭浮层」与「激活背景控件」**。
 *
 * 机制：`src/_shared/open-state-inert.ts` 在 `pointerdown` 的 `window` 捕获阶段（早于组件层 /
 * Reka 的 `document` 捕获监听）撤销本模块写入的 `inert`，使浏览器后续的命中测试落到真实控件；
 * 不做合成点击补派（补派会与原生点击叠加成双触发）。
 *
 * 判定口径：
 * - 打开时背景确实被隔离（前置守卫：否则「点击生效」可能因为压根没隔离而恒真）；
 * - 对每个受检浮层族，点击背景按钮**一次**后：面板关闭、计数 +1、隔离不残留。
 */

/** 背景按钮与其计数（夹具 `#first-click`） */
const TARGET = '#first-click-target'
const COUNT = '#first-click-count'

/**
 * 受检浮层族：模态与非模态分别校验**不同语义**。
 *
 * - 非模态（Combobox 一族）：背景仍可交互 → 首击必须穿透（一次点击既关面板又激活控件）；
 * - 模态（Select）：Reka 把 `body` / 应用根置为 `pointer-events: none`，背景本就不可交互 →
 *   「点击只关闭、不激活」是模态语义，本套件按此断言，防止把模态改坏成可穿透。
 */
const SURFACES = [
    {
        name: 'Select（模态）',
        trigger: '#panel-select .caomei-select',
        content: '.caomei-select__content',
        /** 首击是否应穿透（模态 = false） */
        passThrough: false,
    },
    {
        name: 'MultiSelect（非模态）',
        trigger: '#panel-multi-select .caomei-multi-select',
        content: '.caomei-multi-select__content',
        passThrough: true,
    },
    {
        name: 'AutoComplete（非模态）',
        trigger: '#panel-auto-complete .caomei-auto-complete',
        content: '.caomei-auto-complete__content',
        passThrough: true,
    },
]

for (const surface of SURFACES) {
    test(`${surface.name} 展开时点击背景按钮：${surface.passThrough ? '一次即激活' : '只关闭不激活'}`, async ({ page }) => {
        await page.goto('/')

        // 前置守卫（reset 计数后先确认初始值）
        await page.evaluate((selector) => {
            const output = document.querySelector(selector)
            if (output) {
                output.textContent = '0'
            }
        }, COUNT)

        await page.locator(surface.trigger).click()
        await expect(page.locator(surface.content)).toBeVisible()

        // 前置守卫：背景此刻确实被隔离，否则「点击生效」不构成判别力
        const isolated = await page.evaluate((target) => {
            const button = document.querySelector(target)
            return { background: button?.closest('[inert]') !== null }
        }, TARGET)
        expect(isolated.background, '展开态背景被隔离').toBe(true)

        // 不能用 `locator.click()`：它会先做 actionability 检查并以「element is inert」直接失败，
        // 根本不会派发 pointerdown。这里用原始鼠标按坐标点击，等价于用户真实点击（无检查）。
        const box = await page.locator(TARGET).boundingBox()
        if (!box) {
            throw new Error('背景按钮没有几何盒')
        }
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)

        await expect(page.locator(surface.content)).toBeHidden()
        // count 的初始值可能受前序用例干扰，取修复后的读数与点击前读数比较
        const countAfter = await page.locator(COUNT).innerText()
        if (surface.passThrough) {
            expect(Number(countAfter), '非模态浮层：一次点击应激活背景按钮').toBeGreaterThan(0)
        } else {
            expect(Number(countAfter), '模态浮层：首击只关闭面板，不激活背景控件（有意）').toBe(0)
        }

        const residual = await page.evaluate((target) => ({
            background: document.querySelector(target)?.closest('[inert]') !== null,
        }), TARGET)
        expect(residual.background, '关闭后背景不得残留隔离').toBe(false)
    })
}
