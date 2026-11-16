import { expect, test } from '@playwright/test'

/**
 * Select 展开态的兄弟隔离（常驻，三视口矩阵）。
 *
 * 背景：Reka 展开面板时只给背景兄弟节点加 `aria-hidden`，背景里的可聚焦元素仍留在
 * Tab 序列里（axe `aria-hidden-focus` 命中 `#app`）。组件层在面板落位后补 `inert`、
 * 关闭时回退（`src/_shared/open-state-inert.ts`）。
 *
 * 判定：
 * - 打开后背景宿主（`#app`）同时具备 `aria-hidden` 与 `inert`，面板自身不在 `inert` 子树内；
 * - Tab 不得把焦点落进背景（`closest('[inert]')` 为 null）——只断言属性会被「属性在但不生效」假通过；
 * - 关闭后不残留 `inert`，焦点回到触发器（隔离未及时回退会表现为焦点掉到 body）。
 */
test('展开时背景不可聚焦，关闭后回退隔离并把焦点交还触发器', async ({ page }) => {
    await page.goto('/')

    const trigger = page.locator('#panel-select .caomei-select')
    await trigger.click()
    await expect(page.locator('.caomei-select__content')).toBeVisible()

    const isolation = await page.evaluate(() => {
        const triggerEl = document.querySelector('#panel-select .caomei-select')
        const content = document.querySelector('.caomei-select__content')
        return {
            triggerAriaHidden: triggerEl?.closest('[aria-hidden="true"]') !== null,
            triggerInert: triggerEl?.closest('[inert]') !== null,
            contentIsolated: content?.closest('[inert]') !== null,
        }
    })
    expect(isolation.triggerAriaHidden, '背景仍带 Reka 写入的 aria-hidden').toBe(true)
    expect(isolation.triggerInert, '背景被补 inert').toBe(true)
    expect(isolation.contentIsolated, '面板自身不得被隔离').toBe(false)

    // Tab 若干次：焦点可以在面板内停留或落到浏览器界面，但不得进入背景
    for (let index = 0; index < 4; index++) {
        await page.keyboard.press('Tab')
        const inBackground = await page.evaluate(() => {
            const active = document.activeElement
            return active !== null && active !== document.body && active.closest('[inert]') !== null
        })
        expect(inBackground, `第 ${index + 1} 次 Tab 落进了被隔离的背景`).toBe(false)
    }

    await page.keyboard.press('Escape')
    await expect(page.locator('.caomei-select__content')).toBeHidden()

    const afterClose = await page.evaluate(() => {
        const triggerEl = document.querySelector('#panel-select .caomei-select')
        return {
            triggerIsolated: triggerEl?.closest('[inert]') !== null,
            focusedTrigger: document.activeElement?.classList.contains('caomei-select') ?? false,
        }
    })
    expect(afterClose.triggerIsolated, '关闭后不得残留隔离').toBe(false)
    expect(afterClose.focusedTrigger, '焦点回到触发器').toBe(true)
})
