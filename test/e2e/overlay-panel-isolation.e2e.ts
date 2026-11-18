import { expect, test } from '@playwright/test'

/**
 * 页面级浮层的兄弟隔离（常驻，三视口矩阵）。
 *
 * 背景：`useOpenStateIsolation` 在面板落位后给背景补 `inert` 与 `aria-hidden`、关闭时回退。
 * 本条覆盖两类页面级浮层（均默认非模态）：`DropdownMenu` 与 `Popover`。
 *
 * 判别力说明：面板经 Portal 挂在 `body` 末尾，其后不再有可聚焦节点，因此「Tab 后焦点不落在背景」
 * 本身在隔离失效时也可能成立。**隔离的判别力由「背景可聚焦元素无法以 `focus()` 获得焦点」承担**
 * （移除 `inert` 后该断言必然失败），Tab 断言只锁「焦点不回到背景」这一方向。
 *
 * 锁定背景（`disable-outside-pointer-events`）：Reka 非模态分支硬编码关闭该配置，外部点击仍会
 * 关闭浮层；组件补了外部关闭拦截。本文件用**视口内固定坐标**点击背景，并以「未锁定浮层在同一点击
 * 下会关闭」作为同源负向对照，避免「什么都没发生所以面板还开着」的假通过。
 */
const BACKGROUND = '#wrap-toolbar'

/** 视口内固定点击点：避开页面内容，命中 `html`（背景处于 `inert` 时同口径） */
const BACKGROUND_CLICK_POINT = { x: 4, y: 4 }

interface Surface {
    name: string
    trigger: string
    content: string
}

const SURFACES: Surface[] = [
    {
        name: 'DropdownMenu',
        trigger: '#panel-dropdown-menu-isolation .caomei-dropdown-menu__trigger',
        content: '.caomei-dropdown-menu__content',
    },
    {
        name: 'Popover',
        trigger: '#panel-popover-isolation .caomei-popover__trigger',
        content: '.caomei-popover__content',
    },
]

for (const surface of SURFACES) {
    test(`${surface.name} 展开时隔离背景，关闭后回退`, async ({ page }) => {
        await page.goto('/')

        await page.locator(surface.trigger).click()
        await expect(page.locator(surface.content)).toBeVisible()

        const isolation = await page.evaluate(({ triggerSelector, contentSelector, backgroundSelector }) => {
            const trigger = document.querySelector(triggerSelector)
            const content = document.querySelector(contentSelector)
            const background = document.querySelector(backgroundSelector)
            return {
                backgroundAriaHidden: background?.closest('[aria-hidden="true"]') !== null,
                backgroundInert: background?.closest('[inert]') !== null,
                contentIsolated: content?.closest('[inert]') !== null,
                triggerIsolated: trigger?.closest('[inert]') !== null,
            }
        }, { triggerSelector: surface.trigger, contentSelector: surface.content, backgroundSelector: BACKGROUND })
        expect(isolation.backgroundAriaHidden, '背景带 aria-hidden').toBe(true)
        expect(isolation.backgroundInert, '背景被补 inert').toBe(true)
        expect(isolation.contentIsolated, '面板自身不得被隔离').toBe(false)
        expect(isolation.triggerIsolated, '触发器是保留根，不得被隔离').toBe(false)

        // 判别力主证据：程序化聚焦背景按钮必须被拦截（移除 inert 后该断言必然失败）
        const backgroundFocus = await page.evaluate((backgroundSelector) => {
            const button = document.querySelector(backgroundSelector)?.querySelector('button') ?? null
            button?.focus()
            return button !== null && document.activeElement === button
        }, BACKGROUND)
        expect(backgroundFocus, '背景按钮不得获得焦点').toBe(false)

        // 关闭通道在 Tab 之前验证：非模态浮层在 Tab 移出后会被关闭，先锁 Escape 再测 Tab
        await page.keyboard.press('Escape')
        await expect(page.locator(surface.content)).toBeHidden()

        const residual = await page.evaluate((backgroundSelector) => ({
            backgroundIsolated: document.querySelector(backgroundSelector)?.closest('[inert]') !== null,
        }), BACKGROUND)
        expect(residual.backgroundIsolated, '关闭后背景不得残留隔离').toBe(false)
    })

    test(`${surface.name} 展开态按 Tab 后焦点不回到背景`, async ({ page }) => {
        await page.goto('/')

        await page.locator(surface.trigger).click()
        await expect(page.locator(surface.content)).toBeVisible()

        await page.keyboard.press('Tab')
        await page.waitForTimeout(50)

        const focusInBackground = await page.evaluate((backgroundSelector) => {
            const background = document.querySelector(backgroundSelector)
            const active = document.activeElement
            return active !== null && active !== document.body && background !== null
                && (background === active || background.contains(active))
        }, BACKGROUND)
        expect(focusInBackground, 'Tab 后焦点不得落在背景').toBe(false)

        // 正对照：未开启锁定背景的非模态浮层在焦点移出后关闭（`focusOutside` 分支的真实路径）
        await expect(page.locator(surface.content), 'Tab 移出后未锁定的非模态浮层应关闭').toBeHidden()
    })
}

test('锁定背景的 Popover 点击与 Tab 都不关闭且焦点不入背景', async ({ page }) => {
    await page.goto('/')

    const trigger = page.locator('#panel-popover-pointer-isolation .caomei-popover__trigger')
    const content = page.locator('.caomei-popover__content')

    await trigger.click()
    await expect(content).toBeVisible()

    await page.mouse.click(BACKGROUND_CLICK_POINT.x, BACKGROUND_CLICK_POINT.y)
    await expect(content, '背景点击不得关闭锁定背景的浮层').toBeVisible()

    // 验收口径要求的后续断言：点背景后浮层仍开 → Tab 仍不入背景
    await page.keyboard.press('Tab')
    await page.waitForTimeout(50)
    await expect(content, 'Tab 移出后锁定背景的浮层仍保持展开').toBeVisible()

    const focusInBackground = await page.evaluate((backgroundSelector) => {
        const background = document.querySelector(backgroundSelector)
        const active = document.activeElement
        return active !== null && active !== document.body && background !== null
            && (background === active || background.contains(active))
    }, BACKGROUND)
    expect(focusInBackground, '背景点击与 Tab 后焦点都不得进入背景').toBe(false)

    await page.keyboard.press('Escape')
    await expect(content).toBeHidden()

    const residual = await page.evaluate((backgroundSelector) => ({
        backgroundIsolated: document.querySelector(backgroundSelector)?.closest('[inert]') !== null,
    }), BACKGROUND)
    expect(residual.backgroundIsolated, '关闭后背景不得残留隔离').toBe(false)
})

test('对照：同一坐标点击会关闭未锁定背景的 Popover', async ({ page }) => {
    await page.goto('/')

    const content = page.locator('.caomei-popover__content')
    await page.locator('#panel-popover-isolation .caomei-popover__trigger').click()
    await expect(content).toBeVisible()

    await page.mouse.click(BACKGROUND_CLICK_POINT.x, BACKGROUND_CLICK_POINT.y)
    await expect(content, '未锁定背景时同一点击必须关闭浮层（证明点击路径有效）').toBeHidden()
})
