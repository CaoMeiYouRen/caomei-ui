import { expect, test as base, type Page } from '@playwright/test'

/**
 * 图表封装的常驻回归（真实 Chromium）。
 *
 * 覆盖封装层在**真实浏览器**中才成立的四件事（happy-dom 下无 2D 画布上下文，单测只能覆盖接线与降级）：
 *
 * 1. **可选 peer 真实加载**：`vue-echarts` / `echarts` 按需加载后渲染出画布；
 * 2. **按需注册确实生效**：画布**有实际绘制内容**——只注册了 `BarChart` / `GridComponent` /
 *    `TooltipComponent` / `CanvasRenderer`，若封装层代注册全量内核（或注册缺失导致系列不渲染），
 *    像素探针会以空白画布失败。这是本装置的主要判别力来源；
 * 3. **autoresize 默认开启**：容器宽度变化后画布 CSS 宽度跟随；
 * 4. **容器语义**：`label` 输出 `role="group"` + `aria-label`，高度取默认值。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#chart`；每个用例在 mobile / tablet / desktop
 * 三个 project 下各跑一遍（见 `playwright.config.ts`）。
 */

const CHART = '#chart-basic'
const CANVAS = `${CHART} canvas`
const HOST = '#chart-resize-host'

/** 画布非空像素占比下界（坐标轴 / 文字亦计入）。 */
const MIN_INK_RATIO = 0.005

/**
 * **彩色**像素占比下界：系列图形取主题调色板（饱和色），而坐标轴、刻度与文字均为灰阶。
 * 因此「彩色占比」才是「系列确实按需注册并绘制」的判别探针——只注册坐标轴组件时，
 * 墨迹占比仍会因轴线与文字而达标（**实测该口径不具判别力**，首版即因此漏过负向对照）。
 *
 * 下界由实测校准（desktop project，同一夹具）：
 * - 注册 `BarChart` 时 0.00173；去掉 `BarChart` 的负向对照为 0.0000391（仅剩抗锯齿边缘的彩色噪声）；
 * - 取 0.0005：高于负值 12.8 倍、低于正值 3.5 倍，两侧均有余量。
 *
 * **改色板（含后续由 `--caomei-*` token 派生主题的批次）后必须重校准**：饱和度门（`max - min > 24`）与
 * 下界都绑定在「系列色为饱和色」这一前提上，低饱和 / 灰阶友好色板可能跌破门限而**误杀正确实现**。
 * 复算方式：把夹具的 `use([...])` 里去掉 `BarChart` 跑一次 `-g "内核按需加载"`，读到色占比即为负值基线。
 */
const MIN_COLOR_RATIO = 0.0005

/** 每个用例独立收集 console error / page error，并统一导航（与 `responsive.e2e.ts` 同构）。 */
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
    expect(pageErrors, '图表用例不应产生 console error / page error').toEqual([])
})

interface CanvasProbe {
    width: number
    height: number
    /** alpha > 0 的像素占比（坐标轴 / 文字亦计入） */
    inkRatio: number
    /** 饱和像素占比（系列图形为调色板色，灰阶的轴与文字不计入） */
    colorRatio: number
    /** 画布的 CSS 宽度（容器尺寸变化后的自适应判据） */
    cssWidth: number
}

/** 读画布的尺寸与实际绘制内容；画布缺失时直接失败，避免调用处写非空断言。 */
async function readCanvas(page: Page, selector: string): Promise<CanvasProbe> {
    const probe = await page.evaluate((target) => {
        const canvas = document.querySelector<HTMLCanvasElement>(target)
        if (!canvas) {
            return null
        }
        const context = canvas.getContext('2d')
        if (!context) {
            throw new Error('画布缺少 2D 上下文')
        }
        const { width, height } = canvas
        const { data } = context.getImageData(0, 0, width, height)
        let painted = 0
        let colorful = 0
        for (let index = 0; index < data.length; index += 4) {
            if (data[index + 3] === 0) {
                continue
            }
            painted += 1
            const max = Math.max(data[index], data[index + 1], data[index + 2])
            const min = Math.min(data[index], data[index + 1], data[index + 2])
            if (max - min > 24) {
                colorful += 1
            }
        }
        return {
            width,
            height,
            inkRatio: painted / (width * height),
            colorRatio: colorful / (width * height),
            cssWidth: canvas.getBoundingClientRect().width,
        }
    }, selector)

    if (!probe) {
        throw new Error(`未找到画布：${selector}`)
    }
    return probe
}

test.describe('图表封装', () => {
    test('内核按需加载后画出内容，且容器带可访问语义', async ({ page }) => {
        await expect(page.locator(CANVAS)).toBeVisible()

        const root = page.locator(CHART)
        await expect(root).toHaveAttribute('role', 'group')
        await expect(root).toHaveAttribute('aria-label', '月度趋势')

        const canvas = await readCanvas(page, CANVAS)
        expect(canvas.width).toBeGreaterThan(0)
        expect(canvas.height).toBeGreaterThan(0)
        expect(canvas.inkRatio, '画布为空白：内核未绘制任何内容').toBeGreaterThan(MIN_INK_RATIO)
        expect(canvas.colorRatio, '画布无彩色像素：系列未注册或未绘制').toBeGreaterThan(MIN_COLOR_RATIO)

        // 默认高度取 `--caomei-chart-height` 回退值 20rem
        const box = await root.boundingBox()
        expect(box?.height ?? 0).toBeGreaterThan(200)
    })

    test('容器宽度变化后画布自动跟随（autoresize 默认开启）', async ({ page }) => {
        await expect(page.locator(CANVAS)).toBeVisible()
        const before = await readCanvas(page, CANVAS)
        expect(before.inkRatio).toBeGreaterThan(MIN_INK_RATIO)

        const hostWidth = await page.locator(HOST).evaluate((element) => element.getBoundingClientRect().width)
        await page.locator(HOST).evaluate((element, width) => {
            element.style.width = `${String(width)}px`
        }, Math.round(hostWidth / 2))

        await expect.poll(async () => (await readCanvas(page, CANVAS)).cssWidth)
            .toBeLessThan(before.cssWidth - 20)

        const after = await readCanvas(page, CANVAS)
        expect(after.inkRatio, 'resize 后画布不得空白').toBeGreaterThan(MIN_INK_RATIO)

        await page.locator(HOST).evaluate((element) => {
            element.style.width = ''
        })
    })
})
