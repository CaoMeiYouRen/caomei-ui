import { expect, test } from '@playwright/test'

/**
 * 选择器族展开态的兄弟隔离（常驻，三视口矩阵）。
 *
 * 背景：Reka 展开面板时只给背景兄弟节点加 `aria-hidden`，背景里的可聚焦元素仍留在
 * Tab 序列里（axe `aria-hidden-focus` 命中 `#app`）。组件层在面板落位后补 `inert` 与
 * `aria-hidden`、关闭时回退（`src/_shared/open-state-inert.ts`）。
 *
 * 语义差异（有意）：
 * - `Select` 是模态浮层：Reka 自己隐藏 `#app`，触发器随背景一起不可聚焦，焦点由面板承接；
 * - `MultiSelect` / `AutoComplete` 是非模态 Combobox：**字段自身必须保持可聚焦**（输入框就是
 *   交互面），隔离面只覆盖字段之外的背景；点击背景时先解除隔离，面板由外部点击关闭。
 *   `inert` 不参与命中测试，因此**首次点击背景只关闭面板、不激活背景控件**（第二次点击才落到
 *   控件上）；展开态按 Tab 由组件收起面板并把焦点交给字段之后的下一个控件（APG Combobox）。
 *
 * 判定：① 打开态背景同时具备 `aria-hidden` 与 `inert`、面板与字段不被隔离、背景不可聚焦、
 * 字段仍可输入；② 点击背景关闭面板且不残留隔离；③ 关闭后焦点交还字段；④ 展开态 Tab 收起
 * 面板并把焦点交给字段之后的下一个控件（非模态浮层）。
 */
const SURFACES = [
    {
        name: 'Select',
        root: '#panel-select .caomei-select',
        content: '.caomei-select__content',
        /** 字段是否随背景一起被隔离（模态浮层） */
        fieldIsolated: true,
        /** 字段内是否有可输入的搜索框 */
        typable: false,
    },
    {
        name: 'MultiSelect',
        root: '#panel-multi-select .caomei-multi-select',
        content: '.caomei-multi-select__content',
        fieldIsolated: false,
        typable: true,
    },
    {
        name: 'DatePicker',
        root: '#panel-date-picker .caomei-date-picker',
        content: '.caomei-date-picker__content',
        fieldIsolated: false,
        typable: false,
    },
    {
        name: 'AutoComplete',
        root: '#panel-auto-complete .caomei-auto-complete',
        content: '.caomei-auto-complete__content',
        fieldIsolated: false,
        typable: true,
    },
]

/** 背景分支：与三个字段同级、含可聚焦按钮的常驻区 */
const BACKGROUND = '#wrap-toolbar'

for (const surface of SURFACES) {
    test(`${surface.name} 展开时背景被隔离且字段仍可用`, async ({ page }) => {
        await page.goto('/')

        await page.locator(surface.root).click()
        await expect(page.locator(surface.content)).toBeVisible()

        const isolation = await page.evaluate(({ rootSelector, contentSelector, backgroundSelector }) => {
            const rootEl = document.querySelector(rootSelector)
            const content = document.querySelector(contentSelector)
            const background = document.querySelector(backgroundSelector)
            return {
                backgroundAriaHidden: background?.closest('[aria-hidden="true"]') !== null,
                backgroundInert: background?.closest('[inert]') !== null,
                contentIsolated: content?.closest('[inert]') !== null,
                rootIsolated: rootEl?.closest('[inert]') !== null,
            }
        }, { rootSelector: surface.root, contentSelector: surface.content, backgroundSelector: BACKGROUND })
        expect(isolation.backgroundAriaHidden, '背景带 aria-hidden').toBe(true)
        expect(isolation.backgroundInert, '背景被补 inert').toBe(true)
        expect(isolation.contentIsolated, '面板自身不得被隔离').toBe(false)
        expect(isolation.rootIsolated, '字段隔离面与浮层模态性一致').toBe(surface.fieldIsolated)

        // 程序化聚焦背景按钮必须被拦截：只断言属性会被「属性在但不生效」假通过
        const backgroundFocus = await page.evaluate((backgroundSelector) => {
            const button = document.querySelector(backgroundSelector)?.querySelector('button') ?? null
            button?.focus()
            return button !== null && document.activeElement === button
        }, BACKGROUND)
        expect(backgroundFocus, '背景按钮不得获得焦点').toBe(false)

        if (surface.typable) {
            // 字段保持可聚焦：输入必须生效（隔离面越界会表现为打开即丢焦点、输入无效）
            await page.keyboard.type('苹果')
            const typed = await page.evaluate((rootSelector) => {
                const input = document.querySelector(`${rootSelector} input`) as HTMLInputElement | null
                return input?.value ?? ''
            }, surface.root)
            expect(typed, '字段输入生效').toContain('苹果')
        }

        await page.keyboard.press('Escape')
        await expect(page.locator(surface.content)).toBeHidden()

        const residual = await page.evaluate(({ rootSelector, backgroundSelector }) => ({
            rootIsolated: document.querySelector(rootSelector)?.closest('[inert]') !== null,
            backgroundIsolated: document.querySelector(backgroundSelector)?.closest('[inert]') !== null,
        }), { rootSelector: surface.root, backgroundSelector: BACKGROUND })
        expect(residual.rootIsolated, '关闭后不得残留隔离').toBe(false)
        expect(residual.backgroundIsolated, '关闭后背景不得残留隔离').toBe(false)
    })

    test(`${surface.name} 关闭后把焦点交还字段`, async ({ page }) => {
        await page.goto('/')

        await page.locator(surface.root).click()
        await expect(page.locator(surface.content)).toBeVisible()

        await page.keyboard.press('Escape')
        await expect(page.locator(surface.content)).toBeHidden()

        const afterClose = await page.evaluate((rootSelector) => {
            const rootEl = document.querySelector(rootSelector)
            const active = document.activeElement
            return {
                rootIsolated: rootEl?.closest('[inert]') !== null,
                focusedInside: active instanceof Node && rootEl?.contains(active) === true,
            }
        }, surface.root)
        expect(afterClose.rootIsolated, '关闭后不得残留隔离').toBe(false)
        expect(afterClose.focusedInside, '焦点回到字段内').toBe(true)
    })

    if (surface.typable) {
        const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

        test(`${surface.name} 展开态按 Tab 收起面板并交接焦点`, async ({ page }) => {
            await page.goto('/')

            await page.locator(surface.root).click()
            await expect(page.locator(surface.content)).toBeVisible()

            await page.keyboard.press('Tab')
            await expect(page.locator(surface.content)).toBeHidden()

            const next = await page.evaluate(({ rootSelector, focusable }) => {
                const field = document.querySelector(rootSelector)
                const active = document.activeElement as HTMLElement | null
                const expected = field === null
                    ? null
                    : [...document.querySelectorAll<HTMLElement>(focusable)]
                        .find((element) => !field.contains(element) && (field.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0)
                return {
                    isBody: active === document.body || active === null,
                    isNearest: expected !== null && active === expected,
                    isolated: active?.closest('[inert]') !== null,
                }
            }, { rootSelector: surface.root, focusable: FOCUSABLE })
            expect(next.isBody, '焦点不得落到 body').toBe(false)
            expect(next.isNearest, '焦点落在字段之后最近的可聚焦控件').toBe(true)
            expect(next.isolated, '焦点不得落在隔离子树').toBe(false)
        })

        test(`${surface.name} 展开态按 Shift+Tab 收起面板并向前交接焦点`, async ({ page }) => {
            await page.goto('/')

            await page.locator(surface.root).click()
            await expect(page.locator(surface.content)).toBeVisible()

            await page.keyboard.press('Shift+Tab')
            await expect(page.locator(surface.content)).toBeHidden()

            const previous = await page.evaluate((rootSelector) => {
                const field = document.querySelector(rootSelector)
                const active = document.activeElement as HTMLElement | null
                return {
                    isBody: active === document.body || active === null,
                    isBefore: field !== null && active !== null
                        && !field.contains(active)
                        && (field.compareDocumentPosition(active) & Node.DOCUMENT_POSITION_PRECEDING) !== 0,
                    isolated: active?.closest('[inert]') !== null,
                }
            }, surface.root)
            expect(previous.isBody, '焦点不得落到 body').toBe(false)
            expect(previous.isBefore, '焦点落在字段之前').toBe(true)
            expect(previous.isolated, '焦点不得落在隔离子树').toBe(false)
        })
    }

    test(`${surface.name} 点击背景关闭面板`, async ({ page }) => {
        await page.goto('/')

        await page.locator(surface.root).click()
        await expect(page.locator(surface.content)).toBeVisible()

        // 点空白背景区：`inert` 子树不参与命中测试，用坐标点击避免可操作性检查在 `inert` 上重试
        await page.mouse.click(8, 8)

        await expect(page.locator(surface.content)).toBeHidden()

        const residual = await page.evaluate((backgroundSelector) => ({
            backgroundIsolated: document.querySelector(backgroundSelector)?.closest('[inert]') !== null,
        }), BACKGROUND)
        expect(residual.backgroundIsolated, '关闭后背景不得残留隔离').toBe(false)
    })
}

test('模态内 DatePicker 展开时隔离背景且不与模态冲突', async ({ page }) => {
    await page.goto('/')

    await page.locator('#overlay-in-dialog button', { hasText: '打开浮层对话框' }).click()
    const dialog = page.locator('.caomei-dialog__content')
    await expect(dialog).toBeVisible()

    const dateTrigger = page.locator('#overlay-date-picker .caomei-date-picker')
    await dateTrigger.click()
    const datePanel = page.locator('.caomei-date-picker__content')
    await expect(datePanel).toBeVisible()

    const dateState = await page.evaluate(() => {
        const dialogEl = document.querySelector('.caomei-dialog__content')
        const panel = document.querySelector('.caomei-date-picker__content')
        const trigger = document.querySelector('#overlay-date-picker .caomei-date-picker')
        return {
            dialogIsolated: dialogEl?.closest('[inert]') !== null,
            panelIsolated: panel?.closest('[inert]') !== null,
            triggerIsolated: trigger?.closest('[inert]') !== null,
            backgroundIsolated: document.querySelector('#overlay-in-dialog')?.closest('[inert]') !== null,
        }
    })
    expect(dateState.dialogIsolated, '模态内容不得被隔离').toBe(false)
    expect(dateState.panelIsolated, '日期面板不得被隔离').toBe(false)
    expect(dateState.triggerIsolated, '触发器不得被隔离').toBe(false)
    expect(dateState.backgroundIsolated, '模态外的背景仍被隔离').toBe(true)

    await page.keyboard.press('Escape')
    await expect(datePanel).toBeHidden()
    await expect(dialog).toBeVisible()
})

test('模态内 ColorPicker 展开时隔离背景且不与模态冲突', async ({ page }) => {
    await page.goto('/')

    await page.locator('#overlay-in-dialog button', { hasText: '打开浮层对话框' }).click()
    const dialog = page.locator('.caomei-dialog__content')
    await expect(dialog).toBeVisible()

    const colorTrigger = page.locator('#overlay-color-picker .caomei-color-picker__trigger')
    await colorTrigger.click()
    const colorPanel = page.locator('.caomei-color-picker__panel:not(.caomei-color-picker__panel--inline)').first()
    await expect(colorPanel).toBeVisible()

    const colorState = await page.evaluate(() => ({
        dialogIsolated: document.querySelector('.caomei-dialog__content')?.closest('[inert]') !== null,
        panelIsolated: document.querySelector('.caomei-color-picker__panel:not(.caomei-color-picker__panel--inline)')?.closest('[inert]') !== null,
    }))
    expect(colorState.dialogIsolated, '模态内容不得被隔离').toBe(false)
    expect(colorState.panelIsolated, '颜色面板不得被隔离').toBe(false)

    await page.keyboard.press('Escape')
    await expect(colorPanel).toBeHidden()
})

test('模态内 Popover 展开时隔离背景且焦点不入背景', async ({ page }) => {
    await page.goto('/')

    await page.locator('#overlay-in-dialog button', { hasText: '打开浮层对话框' }).click()
    await expect(page.locator('.caomei-dialog__content')).toBeVisible()

    await page.locator('#overlay-popover .caomei-popover__trigger').click()
    const panel = page.locator('.caomei-popover__content')
    await expect(panel).toBeVisible()

    const state = await page.evaluate(() => ({
        panelIsolated: document.querySelector('.caomei-popover__content')?.closest('[inert]') !== null,
        // 判别力：同模态内的其它字段必须被 Popover 隔离面覆盖；
        // 只断言「模态外背景被隔离」会被 Dialog 自带的隔离兜住，接线缺失也能通过
        siblingFieldIsolated: document.querySelector('#overlay-select')?.closest('[inert]') !== null,
    }))
    expect(state.panelIsolated, '浮层面板不得被隔离').toBe(false)
    expect(state.siblingFieldIsolated, '模态内其它字段被 Popover 隔离').toBe(true)

    for (let index = 0; index < 2; index++) {
        await page.keyboard.press('Tab')
        const inBackground = await page.evaluate(() => {
            const active = document.activeElement
            return active !== null && active !== document.body && active.closest('[inert]') !== null
        })
        expect(inBackground, `第 ${index + 1} 次 Tab 落进了被隔离的背景`).toBe(false)
    }
})
