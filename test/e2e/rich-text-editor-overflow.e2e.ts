import { expect, test as base } from '@playwright/test'

/**
 * 富文本编辑器窄屏几何回归（常驻）。
 *
 * 背景：`CaomeiRichTextEditor` 根曾只设 `width: 100%`。它作为 grid / flex 项时 `min-width: auto`
 * 会被编辑器内核 nowrap 工具栏的 **min-content** 撑开，在窄屏下单点抬高整页宽度
 * （真实 Chromium 实测：390 视口 `documentElement.scrollWidth` = 1034）。修复为根类补
 * `min-width: 0`，把横向溢出交回内核工具栏自身滚动。
 *
 * 声明级守卫见 `test/contracts/rich-text-editor-layout.test.ts`（根类须同时声明 `width: 100%`
 * 与 `min-width: 0`）；**本套用例承载真实几何层断言**——声明存在不等于布局生效，二者互补。
 *
 * 判定面：页级横向溢出（`documentElement` / `body` 的 `scrollWidth` 对 `clientWidth`）
 * 与编辑器根相对视口 / 宿主容器的宽度。容差 1px 吸收子像素取整。
 *
 * 夹具：独立入口 `/rich-text-editor.html`（见 `fixtures/rich-text-editor-app.vue`），
 * 宿主为 `display: grid` 的压力容器；每个用例在 mobile / tablet / desktop 三个 project 下各跑一遍。
 */

/** 几何容差：吸收子像素取整 */
const TOLERANCE = 1

/** 受检压力用例的选择器（夹具即受检范围的事实源；宿主钉到 `.editor-host` 使夹具漂移 fail-closed） */
const HOST_SELECTOR = '#rich-text-editor-narrow .editor-host'
const EDITOR_SELECTOR = `${HOST_SELECTOR} .caomei-rich-text-editor`

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

        await page.goto('/rich-text-editor.html')
        await use(errors)
    }, { auto: true }],
})

test.afterEach(({ pageErrors }) => {
    expect(pageErrors, '页面不得产生 console error').toEqual([])
})

test('窄屏下富文本编辑器不抬高页级横向溢出', async ({ page }) => {
    const editor = page.locator(EDITOR_SELECTOR).first()
    await expect(editor).toBeVisible()
    // 内核挂载后工具栏才存在，min-content 压力面此时才成立
    await page.locator(`${HOST_SELECTOR} .md-editor`).first().waitFor({ state: 'visible' })

    const metrics = await page.evaluate((selector) => {
        const doc = document.documentElement
        const root = document.querySelector(selector) as HTMLElement
        const host = root.parentElement as HTMLElement
        return {
            viewportWidth: doc.clientWidth,
            pageScrollWidth: doc.scrollWidth,
            bodyScrollWidth: document.body.scrollWidth,
            editorWidth: Number(root.getBoundingClientRect().width.toFixed(1)),
            hostWidth: Number(host.getBoundingClientRect().width.toFixed(1)),
            hostDisplay: getComputedStyle(host).display,
        }
    }, EDITOR_SELECTOR)

    // 压力面守卫：判别力完全依赖宿主为 grid 容器（min-content 压力来源）。宿主被改为
    // block / 选择器漂移时 min-width: auto 不再产生横向溢出，四条断言会静默通过——
    // 故先 fail-closed 地锁定宿主形态，避免「夹具失能」被读成「契约成立」。
    expect(metrics.hostDisplay, '夹具压力面漂移：宿主须为 display: grid').toBe('grid')

    expect(metrics.pageScrollWidth - metrics.viewportWidth, `页级横向溢出（scrollWidth ${metrics.pageScrollWidth} / 视口 ${metrics.viewportWidth}）`).toBeLessThanOrEqual(TOLERANCE)
    expect(metrics.bodyScrollWidth - metrics.viewportWidth, 'body 横向溢出').toBeLessThanOrEqual(TOLERANCE)
    expect(metrics.editorWidth - metrics.viewportWidth, '编辑器根越出视口').toBeLessThanOrEqual(TOLERANCE)
    // 根宽须收敛到宿主容器（证明被压回轨道，而非把轨道撑宽）
    expect(metrics.editorWidth - metrics.hostWidth, '编辑器根越出宿主容器').toBeLessThanOrEqual(TOLERANCE)
})
