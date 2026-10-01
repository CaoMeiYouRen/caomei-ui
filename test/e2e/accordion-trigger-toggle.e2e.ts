import { expect, test as base } from '@playwright/test'

/**
 * Accordion 触发器开合的常驻回归。
 *
 * 背景：用户 2026-10-02 报告「自定义触发器（`#trigger` 插槽）展开后无法关闭」。归因（真实 Chromium 复核）：
 * 触发器本身无问题（渲染为 `<h3>` 内的原生 `<button>`，无可嵌套交互元素），真正原因是**文档示例**
 * 把 `#trigger` 演示放在了**未传 `collapsible`** 的单开 Accordion 里——`CaomeiAccordion` 的
 * `collapsible` 默认 `false`（刻意与 PrimeVue「single 恒可收起」区分，已登记在组件页），此时已展开项
 * 按契约**不会**收起。示例已补 `collapsible`，本用例把两件事一起钉死：
 *
 * 1. `#trigger` 自定义触发器在 `collapsible` 下**可开可合**（回归「触发器失效」这类误判）；
 * 2. 默认单开模式（`collapsible=false`）二次点击**保持展开**——这是既有契约而非缺陷，防止后续
 *    把它当 bug 误改，也防止示例再次把两者混为一谈。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#accordion-trigger-toggle`；每个用例在
 * mobile / tablet / desktop 三个 project 下各跑一遍。
 */

const CUSTOM = '#accordion-collapsible-custom'
const SINGLE_DEFAULT = '#accordion-single-default'

/** 每个用例独立收集 console error / page error，并统一导航（与 `tabs-list-overflow.e2e.ts` 同构）。 */
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

test('自定义触发器在 collapsible 单开模式下可展开且可收起', async ({ page }) => {
    const trigger = page.locator(`${CUSTOM} .caomei-accordion__trigger`)
    await trigger.scrollIntoViewIfNeeded()
    await expect(trigger).toBeVisible()

    // 触发器形态守卫：必须仍是原生 button（自定义插槽不得把交互元素顶掉或嵌套）
    await expect(trigger).toHaveJSProperty('tagName', 'BUTTON')
    expect(
        await trigger.evaluate((element) => element.querySelectorAll('button, a, input, [role="button"]').length),
        '自定义触发器内容不得嵌套交互元素（否则点击语义会分叉）',
    ).toBe(0)

    await expect(trigger, '初始应收起').toHaveAttribute('aria-expanded', 'false')

    await trigger.click()
    await expect(trigger, '点击后应展开').toHaveAttribute('aria-expanded', 'true')

    await trigger.click()
    await expect(trigger, '再次点击应收起（用户报告的现象）').toHaveAttribute('aria-expanded', 'false')
})

test('默认单开模式二次点击保持展开（collapsible=false 契约）', async ({ page }) => {
    const trigger = page.locator(`${SINGLE_DEFAULT} .caomei-accordion__trigger`)
    await trigger.scrollIntoViewIfNeeded()
    await expect(trigger).toBeVisible()
    await expect(trigger, '初始应收起（否则「点击后展开」的断言无判别力）').toHaveAttribute('aria-expanded', 'false')

    await trigger.click()
    await expect(trigger, '点击后应展开').toHaveAttribute('aria-expanded', 'true')

    await trigger.click()
    await expect(
        trigger,
        '单开模式默认 collapsible=false：已展开项不收起属既有契约'
        + '（登记于 docs/components/accordion.md「从 PrimeVue 迁移」已知差异① 与 src/components/accordion/accordion.test.ts 的同名断言）',
    ).toHaveAttribute('aria-expanded', 'true')
})
