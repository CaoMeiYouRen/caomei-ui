import { expect, test as base } from '@playwright/test'

/**
 * 导航类组件的对齐回归：宿主文档普遍带 `li + li { margin-top }`（`.vp-doc` / `.prose`），
 * 组件若不复位相邻项间距，面包屑会首项偏上、菜单项与子菜单触发器高度不一致。
 *
 * 夹具 `#component-alignment` 复刻该宿主规则；断言只看几何，与动画无关
 * （全局 `reducedMotion: 'reduce'` 已消除过渡对测量的干扰）。
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

test.describe('宿主 li 间距下的组件对齐', () => {
    test('面包屑各项顶端对齐且不外扩间距', async ({ page }) => {
        const items = page.locator('#component-alignment .caomei-breadcrumb__item')
        await expect(items).toHaveCount(3)
        const metrics = await items.evaluateAll((elements) =>
            elements.map((element) => {
                const rect = element.getBoundingClientRect()
                return { top: rect.top, marginTop: getComputedStyle(element).marginTop }
            }),
        )
        const tops = metrics.map((metric) => metric.top)
        const min = Math.min(...tops)
        const max = Math.max(...tops)
        expect(max - min, `面包屑项顶端应一致，实测 ${tops.join(' / ')}`).toBeLessThanOrEqual(0.5)
        for (const metric of metrics) {
            expect(metric.marginTop, '相邻 li 的宿主间距应被复位').toBe('0px')
        }
    })

    test('菜单项与子菜单触发器同高', async ({ page }) => {
        const targets = page.locator('#component-alignment .caomei-menu__item')
        const count = await targets.count()
        expect(count, '应渲染 5 个菜单项 / 触发器').toBe(5)
        const heights = await targets.evaluateAll((elements) =>
            elements.map((element) => element.getBoundingClientRect().height),
        )
        const min = Math.min(...heights)
        const max = Math.max(...heights)
        expect(max - min, `菜单项与子菜单触发器应同高，实测 ${heights.join(' / ')}`).toBeLessThanOrEqual(0.5)

        const submenu = page.locator('#component-alignment .caomei-menu__submenu')
        const submenuHeight = await submenu.evaluate((element) => element.getBoundingClientRect().height)
        expect(
            Math.abs(submenuHeight - heights[0]),
            `子菜单包裹层高度应与普通项一致，实测 ${submenuHeight} vs ${heights[0]}`,
        ).toBeLessThanOrEqual(0.5)

        const margins = await page
            .locator('#component-alignment .caomei-menu__list > li')
            .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).marginTop))
        for (const margin of margins) {
            expect(margin, '菜单 li 的宿主间距应被复位').toBe('0px')
        }
    })

    test('菜单链接不被宿主 a 样式劫持', async ({ page }) => {
        const links = page.locator('#component-alignment .caomei-menu a.caomei-menu__item')
        const count = await links.count()
        expect(count, '应渲染 3 个链接项（概览 / 帮助 / 禁用）').toBe(3)
        const styles = await links.evaluateAll((elements) =>
            elements.map((element) => {
                const computed = getComputedStyle(element)
                return {
                    decoration: computed.textDecorationLine,
                    color: computed.color,
                    weight: computed.fontWeight,
                }
            }),
        )
        for (const style of styles) {
            expect(style.decoration, '菜单链接不得继承宿主下划线').toBe('none')
            expect(style.color, '菜单链接颜色应来自组件 token').not.toBe('rgb(52, 81, 178)')
            expect(style.weight, '非当前项不应被宿主字重覆盖').not.toBe('500')
        }

        // 宿主 `.prose a:hover`（0,2,1）同样会压过基础规则，hover 态须单独保住颜色
        const help = page.locator('#component-alignment .caomei-menu a.caomei-menu__item').nth(1)
        await help.hover()
        const hovered = await help.evaluate((element) => ({
            color: getComputedStyle(element).color,
            decoration: getComputedStyle(element).textDecorationLine,
        }))
        expect(hovered.color, 'hover 态颜色不应被宿主规则劫持').not.toBe('rgb(52, 81, 178)')
        expect(hovered.decoration, 'hover 态不得出现下划线').toBe('none')

        // 当前项的 hover 不得被通用 hover 规则改回正文色
        const current = page.locator('#component-alignment .caomei-menu a.caomei-menu__item[aria-current]')
        const currentBefore = await current.evaluate((element) => getComputedStyle(element).color)
        await current.hover()
        const currentAfter = await current.evaluate((element) => getComputedStyle(element).color)
        expect(currentAfter, '当前项 hover 应保持 current-color').toBe(currentBefore)

        // 禁用链接同样不得被宿主 hover 改色
        const disabled = page.locator('#component-alignment .caomei-menu a.caomei-menu__item[aria-disabled="true"]')
        const disabledBefore = await disabled.evaluate((element) => getComputedStyle(element).color)
        await disabled.hover()
        const disabledAfter = await disabled.evaluate((element) => getComputedStyle(element).color)
        expect(disabledAfter, '禁用项 hover 不得改变文字色').toBe(disabledBefore)
        expect(disabledAfter, '禁用项颜色不得被宿主规则劫持').not.toBe('rgb(52, 81, 178)')
    })
})
