import { expect, test, type Page } from '@playwright/test'
import { measureContrast } from './helpers/contrast'

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
    const cells = await measureContrast(page, CELLS)
    return cells.map((cell) => {
        const [tone = '', variant = ''] = cell.key.split('/')
        return { tone, variant, ratio: cell.ratio, color: cell.color, background: cell.background }
    })
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
        expect(cells.every((cell) => cell.tone && cell.variant), '受检单元的 data-contrast-key 缺失').toBe(true)
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
        expect(cells.every((cell) => cell.tone && cell.variant), '受检单元的 data-contrast-key 缺失').toBe(true)
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
