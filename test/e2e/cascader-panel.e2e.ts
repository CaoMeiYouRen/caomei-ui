import { expect, test as base, type Locator } from '@playwright/test'

/**
 * Cascader 面板样式的真实浏览器几何守卫（常驻）。
 *
 * 背景：面板经 `PopoverPortal` 挂到 `body`，scoped 的 `data-v` 落在 popper 包裹层而非面板本体，
 * 组件内的 scoped 规则对面板根不生效——表现是面板退回 `.caomei-popover__content` 的基线
 * （`padding` 取 `--caomei-space-3`、圆角取 `--caomei-radius-lg`），Cascader 自己的
 * 「紧凑内边距 + md 圆角 + 列容器限宽」全部丢失。修法是改为命名空间化的非 scoped 规则
 * （与 Popover / Select / TreeSelect 同口径），本套件守住渲染结果，防回退。
 *
 * 断言口径（均可判别「规则未命中」与「规则命中」两种结果）：
 * - 面板 `padding` = `--caomei-space-1`（4px）；基线形态是 12px；
 * - 面板 `border-radius` = `--caomei-radius-md`（8px）；基线形态是 12px；
 * - 列容器 `max-width` = `min(40rem, 80vw)`；基线形态是无限制（面板宽度决定）。
 */

/**
 * 夹具位置：Cascader 位于浮层对话框（`#overlay-in-dialog`）内，须先打开对话框。
 * 模态不改变面板自身的计算样式，故几何断言在模态内测量与模态外等价。
 */
const DIALOG_TRIGGER = '#overlay-in-dialog > button'
const DIALOG_CONTENT = '.caomei-dialog__content'
const TRIGGER = '#overlay-cascader .caomei-cascader__trigger'
const PANEL = '.caomei-cascader__content'
const COLUMNS = '.caomei-cascader__columns'

/** 几何容差：吸收子像素取整 */
const TOLERANCE = 1

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

async function openPanel(page: import('@playwright/test').Page): Promise<Locator> {
    await page.locator(DIALOG_TRIGGER).click()
    await expect(page.locator(DIALOG_CONTENT)).toBeVisible()
    const trigger = page.locator(TRIGGER)
    await trigger.click()
    const panel = page.locator(PANEL)
    await expect(panel).toBeVisible()
    return panel
}

test.describe('Cascader 面板样式', () => {
    test('面板内边距与圆角取自 Cascader 自身的命名空间规则', async ({ page }) => {
        const panel = await openPanel(page)
        const metrics = await panel.evaluate((element) => {
            const style = getComputedStyle(element)
            return {
                paddingTop: style.paddingTop,
                paddingLeft: style.paddingLeft,
                borderRadius: style.borderTopLeftRadius,
            }
        })

        expect.soft(metrics.paddingTop, '面板上内边距应为 --caomei-space-1（4px）').toBe('4px')
        expect.soft(metrics.paddingLeft, '面板左内边距应为 --caomei-space-1（4px）').toBe('4px')
        expect(metrics.borderRadius, '面板圆角应为 --caomei-radius-md（8px）').toBe('8px')
    })

    test('列容器按 min(40rem, 80vw) 限宽，未被面板宽度顶开', async ({ page }) => {
        const panel = await openPanel(page)
        const columns = panel.locator(COLUMNS)
        const metrics = await columns.evaluate((element) => {
            const rect = element.getBoundingClientRect()
            return {
                width: rect.width,
                maxWidth: getComputedStyle(element).maxWidth,
                viewportWidth: window.innerWidth,
            }
        })

        const expectedMax = Math.min(640, metrics.viewportWidth * 0.8)
        expect(metrics.width, '列容器宽度不应超过 min(40rem, 80vw)').toBeLessThanOrEqual(expectedMax + TOLERANCE)
        const maxWidthPx = Number.parseFloat(metrics.maxWidth)
        if (Number.isFinite(maxWidthPx)) {
            expect(Math.abs(maxWidthPx - expectedMax), '列容器 max-width 应解析为 min(40rem, 80vw)').toBeLessThanOrEqual(TOLERANCE)
        }
    })

    test('面板内多列可见且首列条目可点选', async ({ page }) => {
        const panel = await openPanel(page)
        const columns = panel.locator('.caomei-cascader__column')
        expect(await columns.count(), '示例数据应至少渲染一列').toBeGreaterThan(0)

        const firstOption = columns.first().locator('.caomei-cascader__option').first()
        await firstOption.click()
        // 点选后首列必然出现激活态（解释性证据：面板内元素样式与交互均未因 portal 失效）
        await expect(firstOption).toHaveClass(/caomei-cascader__option--active/u)
    })
})
