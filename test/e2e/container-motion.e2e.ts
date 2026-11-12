import { expect, test as base, type Page } from '@playwright/test'

/**
 * 容器层动效（数据展示）的常驻回归：Chart 与 RichTextEditor 只做「就绪后透明度入场」。
 *
 * 这两个组件的内核按需加载，入场动画在导航时就已播放完毕，故本套用例断言**计算样式声明**
 * （动画名 / 时长 token / 无位移属性）而非时间轴；时间轴采样由同批 DataTable / DataView 用例承担。
 * `reduce` 下断言动画名归零，避免「声明存在但 reduce 未压平」的回归。
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
        await use(errors)
    }, { auto: true }],
})

test.use({ reducedMotion: 'no-preference' })

test.afterEach(({ pageErrors }) => {
    expect(pageErrors, '页面不得产生 console error').toEqual([])
})

const CHART_CANVAS = '#chart .caomei-chart__canvas'
const RTE_EDITOR = '.caomei-rich-text-editor__editor'

async function useExpressive(page: Page): Promise<void> {
    await page.evaluate(() => {
        document.documentElement.setAttribute('data-motion', 'expressive')
    })
}

/** 读取动画名、时长与该组件消费的时长 token（token 名由用例给出，避免硬编码毫秒值）。 */
async function readAnimation(locator: ReturnType<Page['locator']>, tokenName: string): Promise<{
    name: string
    duration: number
    token: number
}> {
    return locator.evaluate((element, name) => {
        const style = getComputedStyle(element)
        return {
            name: style.animationName,
            duration: Number.parseFloat(style.animationDuration),
            token: Number.parseFloat(style.getPropertyValue(name).trim()),
        }
    }, tokenName)
}

test.describe('expressive 容器层入场', () => {
    test('Chart 画布就绪后声明透明度入场', async ({ page }) => {
        await page.goto('/')
        const canvas = page.locator(CHART_CANVAS)
        await expect(canvas).toBeVisible()
        await useExpressive(page)

        const animation = await readAnimation(canvas, '--caomei-motion-duration-base')
        expect(animation.name, '画布应绑定入场动画').toMatch(/caomei-chart-canvas-in(-|$)/)
        expect(animation.duration, '达标时长应为 duration-base').toBeCloseTo(animation.token / 1000, 2)
        expect(
            await canvas.evaluate((element) => getComputedStyle(element).transform),
            '画布入场不做位移 / 缩放',
        ).toBe('none')
    })

    test('富文本编辑器就绪后声明透明度入场', async ({ page }) => {
        await page.goto('/rich-text-editor.html')
        const editor = page.locator(RTE_EDITOR).first()
        await expect(editor).toBeVisible()
        await useExpressive(page)

        const animation = await readAnimation(editor, '--caomei-motion-duration-instant')
        expect(animation.name, '编辑器应绑定入场动画').toMatch(/caomei-rich-text-editor-in(-|$)/)
        expect(animation.duration, '达标时长应为 duration-instant').toBeCloseTo(animation.token / 1000, 2)
        expect(
            await editor.evaluate((element) => getComputedStyle(element).transform),
            '编辑器入场不做位移 / 缩放',
        ).toBe('none')
    })
})

test.describe('minimal 不新增动效', () => {
    test('Chart / 富文本编辑器无入场动画', async ({ page }) => {
        await page.goto('/')
        const canvas = page.locator(CHART_CANVAS)
        await expect(canvas).toBeVisible()
        expect(
            (await readAnimation(canvas, '--caomei-motion-duration-base')).name,
            'minimal 下画布无入场动画',
        ).toBe('none')

        await page.goto('/rich-text-editor.html')
        const editor = page.locator(RTE_EDITOR).first()
        await expect(editor).toBeVisible()
        expect(
            (await readAnimation(editor, '--caomei-motion-duration-instant')).name,
            'minimal 下编辑器无入场动画',
        ).toBe('none')
    })
})

test.describe('reduced-motion 压平', () => {
    test.use({ reducedMotion: 'reduce' })

    test('Chart / 富文本编辑器不播放入场动画', async ({ page }) => {
        await page.goto('/')
        const canvas = page.locator(CHART_CANVAS)
        await expect(canvas).toBeVisible()
        await useExpressive(page)
        expect((await readAnimation(canvas, '--caomei-motion-duration-base')).name, 'reduce 下画布无入场动画').toBe('none')

        await page.goto('/rich-text-editor.html')
        const editor = page.locator(RTE_EDITOR).first()
        await expect(editor).toBeVisible()
        await useExpressive(page)
        const animation = await readAnimation(editor, '--caomei-motion-duration-instant')
        expect(animation.name, 'reduce 下编辑器无入场动画').toBe('none')
        expect(animation.duration, 'reduce 下动画时长归零').toBe(0)
    })
})
