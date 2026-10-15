import { expect, test, type Page } from '@playwright/test'

/**
 * Alert 对比度复核（真实 Chromium，常驻）。
 *
 * 判据：**WCAG 2.x 相对亮度**对比度——正文（14px 常规）阈值 **4.5:1**，亮色与暗色两档分别测量。
 *
 * 为什么按「实际合成背景」而非「元素自身 `background-color`」判定：`soft` 变体的底色是
 * `color-mix(in srgb, <tone> 8%, transparent)`——半透明底色必须与页面实际底色（夹具根节点
 * 取 `--caomei-color-bg`）**逐层合成**后才是眼睛看到的背景；只读元素自身会得到与真实
 * 渲染无关的低对比度（透明底被当成黑/白）。
 *
 * 受检面 = 夹具 `#alert-contrast` 段的 **5 色调 × 3 变体 = 15 条**（下界断言防清单被静默收窄）；
 * 暗色档经 `data-theme="dark"` 切换（与 `theme.css` 的暗色选择器一致）。
 */

const SECTION = '#alert-contrast'
const CELLS = `${SECTION} .caomei-alert`

/** 受检单元下界（5 色调 × 3 变体） */
const MIN_CELLS = 15

/** WCAG AA 正文阈值 */
const MIN_RATIO = 4.5

/**
 * 最小裕度：比值**贴线通过**时任何 token 微调 / 取整变化即翻档。取 `0.04` 的依据：
 * - 下界——必须能拦下真正的贴线：旧配置（soft 底 8%）实测 `success` 仅高出阈值 **0.0068**，
 *   本裕度会将其判失败；
 * - 上界——裕度受 tone 语义色本身限制：`neutral` / `danger` 对白底为 4.83，故 soft 变体的
 *   理论最大裕度约 0.33；取 0.04 是「可维护」与「不逼迫把底色调到几乎不可见」之间的折中。
 * 实测最低值随断言一并输出，便于在报告里直接读到当前裕度。
 */
const MIN_MARGIN = 0.04

interface CellMeasurement {
    tone: string
    variant: string
    ratio: number
    color: string
    background: string
}

async function measure(page: Page): Promise<CellMeasurement[]> {
    return page.evaluate((selector) => {
        const context = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D

        /** 借 canvas 归一化 `#rrggbb` / `rgb()` / `rgba()` 等为统一形态。 */
        const normalize = (color: string): string => {
            const sentinel = '#010203'
            context.fillStyle = sentinel
            context.fillStyle = color
            if (context.fillStyle === sentinel) {
                throw new Error(`无法解析颜色：${color}`)
            }
            return context.fillStyle
        }

        const parse = (color: string): [number, number, number, number] => {
            /*
             * `color(srgb r g b / a)`：`color-mix()` 的计算值在 Chromium 中以此形式序列化，
             * canvas 的 `fillStyle` 不接受该形态（会静默保留上一次赋值 ⇒ 恒得黑色背景），故单独解析。
             */
            if (/^color\(/iu.test(color.trim())) {
                const channels = color.match(/[\d.]+/gu)?.map(Number) ?? []
                const [red = 0, green = 0, blue = 0, alpha = 1] = channels
                return [red * 255, green * 255, blue * 255, alpha]
            }

            const normalized = normalize(color)
            if (normalized.startsWith('#')) {
                const hex = normalized.slice(1)
                return [
                    Number.parseInt(hex.slice(0, 2), 16),
                    Number.parseInt(hex.slice(2, 4), 16),
                    Number.parseInt(hex.slice(4, 6), 16),
                    1,
                ]
            }
            const numbers = normalized.match(/[\d.]+/g)?.map(Number) ?? []
            return [numbers[0] ?? 0, numbers[1] ?? 0, numbers[2] ?? 0, numbers[3] ?? 1]
        }

        /** 自根向下逐层合成，得到元素的实际背景（半透明层与上层合成）。 */
        const effectiveBackground = (element: Element): [number, number, number] => {
            const chain: string[] = []
            let node: Element | null = element
            while (node) {
                chain.push(getComputedStyle(node).backgroundColor)
                node = node.parentElement
            }

            let result: [number, number, number] = [255, 255, 255]
            for (const color of chain.reverse()) {
                const [red, green, blue, alpha] = parse(color)
                if (alpha === 0) {
                    continue
                }
                result = [
                    red * alpha + result[0] * (1 - alpha),
                    green * alpha + result[1] * (1 - alpha),
                    blue * alpha + result[2] * (1 - alpha),
                ]
            }

            return result
        }

        const luminance = ([red, green, blue]: [number, number, number]): number => {
            const channel = (value: number): number => {
                const ratio = value / 255
                return ratio <= 0.03928 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4
            }

            return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
        }

        return Array.from(document.querySelectorAll<HTMLElement>(selector)).map((element) => {
            const style = getComputedStyle(element)
            const background = effectiveBackground(element)
            const [red, green, blue, alpha] = parse(style.color)
            const text: [number, number, number] = [
                red * alpha + background[0] * (1 - alpha),
                green * alpha + background[1] * (1 - alpha),
                blue * alpha + background[2] * (1 - alpha),
            ]

            const foregroundLuminance = luminance(text)
            const backgroundLuminance = luminance(background)
            const ratio = (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
                / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)

            return {
                tone: element.dataset.alertTone ?? '',
                variant: element.dataset.alertVariant ?? '',
                // 判定用未舍入值（舍入仅用于展示：先舍入再比较会把 4.495–4.4999 放行）
                ratio,
                color: style.color,
                background: `rgb(${background.map((value) => Math.round(value)).join(', ')})`,
            }
        })
    }, CELLS)
}

/** 失败明细（色号 / 实测比）便于定位到具体 tone × variant。 */
function describeFailures(cells: CellMeasurement[]): string {
    return cells
        .filter((cell) => cell.ratio < MIN_RATIO + MIN_MARGIN)
        .map((cell) => `${cell.tone}/${cell.variant}: ${cell.ratio.toFixed(3)}（${cell.color} on ${cell.background}）`)
        .join('; ')
}

/** 实测最小比值（写入测试标题便于在报告里直接读到裕度）。 */
function minimumRatio(cells: CellMeasurement[]): number {
    return Math.min(...cells.map((cell) => cell.ratio))
}

test.describe('Alert 对比度复核', () => {
    test('亮色：全部色调 × 变体达到 WCAG AA 正文阈值', async ({ page }) => {
        await page.goto('/')

        const cells = await measure(page)
        expect(cells.length, '对比度受检面不得被静默收窄').toBeGreaterThanOrEqual(MIN_CELLS)
        expect(minimumRatio(cells), '亮色最低比值应高出阈值一个可维护裕度').toBeGreaterThanOrEqual(MIN_RATIO + MIN_MARGIN)
        expect(describeFailures(cells), '存在低于阈值的组合').toBe('')
    })

    test('暗色：全部色调 × 变体达到 WCAG AA 正文阈值', async ({ page }) => {
        await page.goto('/')
        await page.evaluate(() => {
            document.documentElement.dataset.theme = 'dark'
        })

        const cells = await measure(page)
        expect(cells.length, '对比度受检面不得被静默收窄').toBeGreaterThanOrEqual(MIN_CELLS)
        expect(minimumRatio(cells), '暗色最低比值应高出阈值一个可维护裕度').toBeGreaterThanOrEqual(MIN_RATIO + MIN_MARGIN)
        expect(describeFailures(cells), '存在低于阈值的组合').toBe('')
    })

    test('静态档：Alert 不构成 live region', async ({ page }) => {
        await page.goto('/')

        // 静态常驻内容不得进入 live region（否则页面加载时会播报、重渲染时重复播报）
        await expect(page.locator(`${SECTION} [role="status"], ${SECTION} [role="alert"], ${SECTION} [aria-live]`)).toHaveCount(0)
        await expect(page.locator(SECTION)).toContainText('当前为沙箱环境')
    })
})
