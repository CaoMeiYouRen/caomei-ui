import { expect, test as base } from '@playwright/test'

/**
 * Carousel 轮播的真实浏览器回归。
 *
 * 判别口径：
 * 1. 水平轮播每页与容器等宽，翻页后受控索引回写（`#carousel-index`）；
 * 2. 上一页 / 下一页按钮、指示点与方向键都能翻页，边界按钮禁用；
 * 3. `slidesPerView: 2` 每页两张、`gap` 生效且循环可回到首页；
 * 4. 纵向轮播按高度分页（主轴为 y）；
 * 5. 容器与页带轮播语义，页面无 console error。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#carousel`。
 */

const HORIZONTAL = '#carousel-horizontal'
const MULTI = '#carousel-multi'
const VERTICAL = '#carousel-vertical'
const INDEX = '#carousel-index'

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

async function readViewport(page: import('@playwright/test').Page, selector: string) {
    return page.evaluate((scope) => {
        const root = document.querySelector<HTMLElement>(scope)
        if (!root) {
            throw new Error(`未找到轮播 ${scope}`)
        }
        const viewport = root.querySelector<HTMLElement>('.caomei-carousel__viewport')
        const slides = [...root.querySelectorAll<HTMLElement>('.caomei-carousel__slide')]
        if (!viewport) {
            throw new Error('轮播未渲染视口')
        }
        const viewportRect = viewport.getBoundingClientRect()
        return {
            viewport: { width: viewportRect.width, height: viewportRect.height },
            slides: slides.map((slide) => {
                const rect = slide.getBoundingClientRect()
                return { width: rect.width, height: rect.height, label: slide.getAttribute('aria-label') }
            }),
            role: root.querySelector<HTMLElement>('[aria-roledescription="carousel"]')?.getAttribute('role'),
            roledescription: root.querySelector<HTMLElement>('[aria-roledescription="carousel"]')?.getAttribute('aria-roledescription'),
        }
    }, selector)
}

test('水平轮播：等宽分页、按钮与指示点翻页并回写受控索引', async ({ page }) => {
    await page.locator(HORIZONTAL).scrollIntoViewIfNeeded()
    const metrics = await readViewport(page, HORIZONTAL)

    expect(metrics.role).toBe('region')
    expect(metrics.roledescription).toBe('carousel')
    expect(metrics.slides).toHaveLength(3)
    expect(metrics.slides[0]?.width).toBeCloseTo(metrics.viewport.width, 0)
    expect(metrics.slides[0]?.label).toBe('第 1 张，共 3 张')

    const root = page.locator(HORIZONTAL)
    await expect(page.locator(INDEX)).toHaveText('0')
    await root.getByRole('button', { name: '下一张' }).click()
    await expect(page.locator(INDEX)).toHaveText('1')

    await root.locator('.caomei-carousel__dot').nth(2).click()
    await expect(page.locator(INDEX)).toHaveText('2')
    await expect(root.getByRole('button', { name: '下一张' })).toBeDisabled()

    await root.getByRole('button', { name: '上一张' }).click()
    await expect(page.locator(INDEX)).toHaveText('1')
    await expect(root.locator('.caomei-carousel__dot').nth(1)).toHaveAttribute('aria-current', 'true')
    await expect(root.locator('.caomei-carousel__dot').nth(0)).not.toHaveAttribute('aria-current', 'true')
})

test('水平轮播：拖拽翻页并回写受控索引', async ({ page }) => {
    await page.locator(HORIZONTAL).scrollIntoViewIfNeeded()
    const root = page.locator(HORIZONTAL).locator('[aria-roledescription="carousel"]')
    const box = await root.boundingBox()
    if (!box) {
        throw new Error('轮播未渲染')
    }

    const startX = box.x + box.width * 0.75
    const y = box.y + box.height / 2
    await page.mouse.move(startX, y)
    await page.mouse.down()
    await page.mouse.move(startX - box.width * 0.6, y, { steps: 12 })
    await page.mouse.up()

    await expect.poll(async () => Number(await page.locator(INDEX).textContent()), { timeout: 4000 }).toBeGreaterThan(0)
})

test('水平轮播：键盘方向键与 Home / End', async ({ page }) => {
    const root = page.locator(HORIZONTAL).locator('[aria-roledescription="carousel"]')
    await root.focus()
    await page.keyboard.press('End')
    await expect(page.locator(INDEX)).toHaveText('2')
    await page.keyboard.press('Home')
    await expect(page.locator(INDEX)).toHaveText('0')
    await page.keyboard.press('ArrowRight')
    await expect(page.locator(INDEX)).toHaveText('1')
})

test('每页两张：宽度分摊、循环翻页与指示点', async ({ page }) => {
    await page.locator(MULTI).scrollIntoViewIfNeeded()
    const metrics = await readViewport(page, MULTI)
    expect(metrics.slides).toHaveLength(5)

    const expected = (metrics.viewport.width - 8) / 2
    expect(metrics.slides[0]?.width).toBeCloseTo(expected, 0)

    const root = page.locator(MULTI)
    const dots = root.locator('.caomei-carousel__dot')
    const pageCount = await dots.count()
    expect(pageCount).toBeGreaterThan(1)
    await expect(root.getByRole('button', { name: '下一张' })).toBeEnabled()

    // 循环：首页可回绕到末页
    await expect(dots.first()).toHaveAttribute('aria-current', 'true')
    await root.getByRole('button', { name: '上一张' }).click()
    await expect(dots.last()).toHaveAttribute('aria-current', 'true')
})

test('纵向轮播：按高度分页，下一张后索引前进', async ({ page }) => {
    await page.locator(VERTICAL).scrollIntoViewIfNeeded()
    const metrics = await readViewport(page, VERTICAL)
    expect(metrics.viewport.height).toBeGreaterThan(0)
    expect(metrics.slides[0]?.height).toBeCloseTo(metrics.viewport.height, 0)

    const offsetFromViewport = async (pageIndex: number): Promise<number> => page.evaluate(({ scope, index }) => {
        const root = document.querySelector<HTMLElement>(scope)
        const viewport = root?.querySelector<HTMLElement>('.caomei-carousel__viewport')
        const slides = root?.querySelectorAll<HTMLElement>('.caomei-carousel__slide')
        const slide = slides?.[index]
        if (!viewport || !slide) {
            throw new Error('纵向轮播未渲染视口或页')
        }
        return Math.abs(slide.getBoundingClientRect().top - viewport.getBoundingClientRect().top)
    }, { scope: VERTICAL, index: pageIndex })

    await expect.poll(() => offsetFromViewport(0), { timeout: 4000 }).toBeLessThan(2)

    await page.locator(VERTICAL).getByRole('button', { name: '下一张' }).click()
    await expect(page.locator(`${VERTICAL} .caomei-carousel__dot`).nth(1)).toHaveAttribute('aria-current', 'true')
    await expect.poll(() => offsetFromViewport(1), { timeout: 4000 }).toBeLessThan(2)

    // 纵向方向键：回到首页后按下方向键应再次前进
    await page.locator(VERTICAL).getByRole('button', { name: '上一张' }).click()
    await expect(page.locator(`${VERTICAL} .caomei-carousel__dot`).nth(0)).toHaveAttribute('aria-current', 'true')
    await page.locator(`${VERTICAL} [aria-roledescription="carousel"]`).focus()
    await page.keyboard.press('ArrowDown')
    await expect(page.locator(`${VERTICAL} .caomei-carousel__dot`).nth(1)).toHaveAttribute('aria-current', 'true')
})
