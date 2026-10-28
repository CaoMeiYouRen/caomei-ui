import type { Page } from '@playwright/test'

/**
 * 真实浏览器中的文本 / 背景对比度测量（WCAG 2.x 相对亮度，返回**未舍入**比值）。
 *
 * 判定口径：按**实际合成背景**而不是元素自身的 `background-color`——`soft` 变体、
 * `ghost` 按钮、`color-mix()` 派生的状态底色都是半透明或 `color(srgb …)` 形态，
 * 只读自身会得到与渲染无关的结果。合成自元素向上逐层叠加至根节点。
 *
 * 受检单元通过 `data-contrast-key` 声明自己的标识（如 `danger/soft`、`ghost/danger@hover`），
 * 由调用方自行决定切片与阈值，本模块只负责测量。
 *
 * 只覆盖**纯色（含半透明）背景**：`background-image`（渐变 / 纹理）与祖先 `opacity` 不参与合成，
 * 出现这类形态时结果会偏离真实渲染，故受检面不得引入它们（当前两个调用点的受检单元均为纯色）。
 */

/** 单条测量结果：`ratio` 为判定用未舍入值，`color` / `background` 为展示用序列化值。 */
export interface ContrastCell {
    key: string
    ratio: number
    color: string
    background: string
}

/** 与元素同处一个页面的受检单元测量。 */
export async function measureContrast(page: Page, selector: string): Promise<ContrastCell[]> {
    return page.evaluate((target) => {
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
             * 只接受 `srgb`：其它色彩空间（如 `display-p3` / `srgb-linear`）的通道语义不同，
             * 按 0–1 直接乘 255 会得出「看起来合法」的错误比值——一律 fail-closed。
             */
            if (/^color\(/iu.test(color.trim())) {
                if (!/^color\(srgb\s/iu.test(color.trim())) {
                    throw new Error(`不支持的色彩空间：${color}（仅接受 color(srgb …)）`)
                }
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
            if (!/^rgba?\(/u.test(normalized)) {
                throw new Error(`不支持的色彩形态：${color}（仅接受 #hex / rgb() / rgba() / color(srgb …)）`)
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

        return Array.from(document.querySelectorAll<HTMLElement>(target)).map((element) => {
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
                key: element.dataset.contrastKey ?? '',
                // 判定用未舍入值（舍入仅用于展示：先舍入再比较会把 4.495–4.4999 放行）
                ratio,
                color: style.color,
                background: `rgb(${background.map((value) => Math.round(value)).join(', ')})`,
            }
        })
    }, selector)
}
