import { expect, test as base } from '@playwright/test'

/**
 * 导航与操作类动效（`data-motion="expressive"`）的浏览器回归。
 *
 * 覆盖 Tabs 内容、Accordion 高度 + 淡入、Menu 子菜单高度、Breadcrumb / Stepper 过渡、
 * Toolbar / Button 抬升、ButtonGroup 拼接成员不位移、SplitButton chevron 旋转；
 * 另验证 minimal 与 reduce 两条回退路径。
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
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-motion', 'expressive')
        })
        await use(errors)
    }, { auto: true }],
})

test.use({ reducedMotion: 'no-preference' })

test.afterEach(({ pageErrors }) => {
    expect(pageErrors, '页面不得产生 console error').toEqual([])
})

async function animationNameOf(selector: string, page: import('@playwright/test').Page): Promise<string> {
    return page.locator(selector).first().evaluate((element) => getComputedStyle(element).animationName)
}

async function transformOf(selector: string, page: import('@playwright/test').Page): Promise<string> {
    return page.locator(selector).first().evaluate((element) => getComputedStyle(element).transform)
}

test.describe('Tabs / Accordion / Menu', () => {
    test('Tabs 内容切换淡入', async ({ page }) => {
        await page.locator('#tabs-horizontal .caomei-tabs__trigger').nth(1).click()
        const content = '#tabs-horizontal .caomei-tabs__content[data-state="active"]'
        await expect(page.locator(content)).toBeVisible()
        expect(await animationNameOf(content, page)).toContain('caomei-tabs-content-in')
    })

    test('Accordion 展开叠加淡入', async ({ page }) => {
        await page.locator('#accordion-collapsible-custom .caomei-accordion__trigger').click()
        const content = '#accordion-collapsible-custom .caomei-accordion__content'
        await expect(page.locator(content)).toBeVisible()
        const names = await animationNameOf(content, page)
        expect(names).toContain('caomei-accordion-slide-down')
        expect(names).toContain('caomei-accordion-fade-in')
    })

    test('Menu 子菜单展开高度动画', async ({ page }) => {
        await page.locator('#menu-navigation .caomei-menu__submenu-trigger').click()
        const content = '#menu-navigation .caomei-menu__submenu-content'
        await expect(page.locator(content)).toBeVisible()
        expect(await animationNameOf(content, page)).toContain('caomei-menu-submenu-down')
    })

    test('Accordion 关闭时高度动画不被淡出提前截断', async ({ page }) => {
        const trigger = page.locator('#accordion-collapsible-custom .caomei-accordion__trigger')
        const selector = '#accordion-collapsible-custom .caomei-accordion__content'
        await trigger.click()
        const content = page.locator(selector)
        await expect(content).toBeVisible()
        await content.evaluate(async (element) => {
            await Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => undefined)))
        })
        await trigger.click()
        await page.waitForFunction((sel) => {
            const element = document.querySelector(sel)
            return !!element && element.getAnimations().length >= 2
        }, selector)
        const sample = await content.evaluate((element) => {
            const animations = element.getAnimations()
            animations.forEach((animation) => {
                animation.pause()
            })
            const heightAnimation = animations.find((animation) =>
                (animation as CSSAnimation).animationName.includes('caomei-accordion-slide-up'),
            )
            const fadeAnimation = animations.find((animation) =>
                (animation as CSSAnimation).animationName.includes('caomei-accordion-fade-out'),
            )
            if (!heightAnimation) {
                return null
            }
            const half = Number(heightAnimation.effect?.getTiming().duration ?? 0) / 2
            heightAnimation.currentTime = half
            if (fadeAnimation) {
                fadeAnimation.currentTime = half
            }
            const style = getComputedStyle(element)
            return {
                height: Number.parseFloat(style.height),
                opacity: Number.parseFloat(style.opacity),
                names: animations.map((animation) => (animation as CSSAnimation).animationName),
            }
        })
        expect(sample, '关闭时应有 slide-up 动画').not.toBeNull()
        expect(sample?.names.join(',')).toContain('caomei-accordion-fade-out')
        expect(sample?.height, '关闭中段高度应仍大于 0').toBeGreaterThan(0)
        expect(sample?.opacity, '关闭中段透明度应处于 0~1 之间').toBeGreaterThan(0)
        expect(sample?.opacity ?? 1).toBeLessThan(1)
    })
})

test.describe('Breadcrumb / Stepper / Toolbar', () => {
    test('Breadcrumb 链接与 Stepper 指示器过渡', async ({ page }) => {
        const durations = await page.locator('#menu-navigation .caomei-breadcrumb__link').first().evaluate((element) =>
            getComputedStyle(element).transitionDuration.split(',').map((value) => Number.parseFloat(value.trim())),
        )
        expect(durations.every((value) => value > 0), `breadcrumb 过渡应非零：${durations.join(', ')}`).toBe(true)

        const indicator = '#fv-stepper .caomei-stepper__indicator'
        const indicatorDurations = await page.locator(indicator).first().evaluate((element) =>
            getComputedStyle(element).transitionDuration.split(',').map((value) => Number.parseFloat(value.trim())),
        )
        expect(indicatorDurations.every((value) => value > 0), `stepper 过渡应非零：${indicatorDurations.join(', ')}`).toBe(true)
    })

    test('Toolbar 按钮悬浮抬升', async ({ page }) => {
        const button = '#fv-toolbar .caomei-toolbar__button'
        await page.locator(button).hover()
        await expect.poll(() => transformOf(button, page)).toBe('matrix(1, 0, 0, 1, 0, -1)')
    })
})

test.describe('Button / ButtonGroup / SplitButton', () => {
    test('Button 悬浮抬升，ButtonGroup 成员不位移', async ({ page }) => {
        const standalone = '#wrap-toolbar .caomei-button'
        await page.locator(standalone).first().hover()
        await expect.poll(() => transformOf(standalone, page)).toBe('matrix(1, 0, 0, 1, 0, -1)')

        const member = '#scroll-button-group .caomei-button'
        await page.locator(member).first().hover()
        expect(await transformOf(member, page)).toBe('none')
    })

    test('SplitButton 菜单打开时 chevron 旋转', async ({ page }) => {
        await page.locator('#scroll-split-button .caomei-split-button__menu').click()
        const icon = '#scroll-split-button .caomei-split-button__menu .caomei-icon'
        await expect.poll(() => transformOf(icon, page)).toContain('-1')
    })
})

test.describe('minimal / reduce 回退', () => {
    test('minimal 下导航动效不挂载', async ({ page }) => {
        await page.evaluate(() => {
            document.documentElement.removeAttribute('data-motion')
        })
        await page.locator('#tabs-horizontal .caomei-tabs__trigger').nth(1).click()
        const content = '#tabs-horizontal .caomei-tabs__content[data-state="active"]'
        await expect(page.locator(content)).toBeVisible()
        expect(await animationNameOf(content, page)).toBe('none')

        await page.locator('#menu-navigation .caomei-menu__submenu-trigger').click()
        expect(await animationNameOf('#menu-navigation .caomei-menu__submenu-content', page)).toBe('none')

        const button = '#wrap-toolbar .caomei-button'
        await page.locator(button).first().hover()
        expect(await transformOf(button, page)).toBe('none')

        await page.locator('#accordion-collapsible-custom .caomei-accordion__trigger').click()
        const accordionNames = await animationNameOf('#accordion-collapsible-custom .caomei-accordion__content', page)
        expect(accordionNames).toContain('caomei-accordion-slide-down')
        expect(accordionNames).not.toContain('caomei-accordion-fade-in')
    })

    test.describe('reduce 压平', () => {
        test.use({ reducedMotion: 'reduce' })

        test('reduce 下 Button 位移与子菜单动画被关闭', async ({ page }) => {
            const button = '#wrap-toolbar .caomei-button'
            await page.locator(button).first().hover()
            expect(await transformOf(button, page)).toBe('none')

            await page.locator('#menu-navigation .caomei-menu__submenu-trigger').click()
            expect(await animationNameOf('#menu-navigation .caomei-menu__submenu-content', page)).toBe('none')

            await page.locator('#accordion-collapsible-custom .caomei-accordion__trigger').click()
            expect(await animationNameOf('#accordion-collapsible-custom .caomei-accordion__content', page)).toBe('none')
        })
    })
})
