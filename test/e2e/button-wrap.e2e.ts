import { expect, test, type Page } from '@playwright/test'

/**
 * Button 内容换行（`wrap`）的真实几何回归。
 *
 * 受检面 = 夹具 `#button-wrap` 段 7 个单元：默认单行截断 / 换行 ja / 换行 ko（无空格长串）/
 * 宽容器 / `iconOnly` / `block` / `loading`。四条判据：
 *
 * 1. **默认仍是单行**：窄宽下高度等于档位高度、文本被横向截断（`scrollWidth > clientWidth`）；
 * 2. **wrap 生效**：窄宽下高度大于档位高度、无横向溢出（`scrollWidth <= clientWidth`）、文本层
 *    `white-space` 为 `normal`。ja / ko 在 `white-space: normal` 下按字（音节）断行；`overflow-wrap:
 *    anywhere` 兜的是长英文单词 / URL 这类不可断串；
 * 3. **边界**：宽容器下 wrap 不折行（高度仍为档位高度）；`iconOnly` 组合保持方形（宽 = 高，纵向内边距为 0）；
 * 4. **组合形态**：`block`（100% 宽）与 `loading` 在窄容器内同样折行增高、无横向溢出，且 `block` 宽度与窄档一致。
 */

const CONTROL_HEIGHT_MD = 36

interface WrapMetrics {
    height: number
    width: number
    scrollWidth: number
    clientWidth: number
    whiteSpace: string
    overflowWrap: string
    paddingTop: string
    paddingBottom: string
}

type WrapCase = 'truncate' | 'wrapJa' | 'wrapKo' | 'wrapWide' | 'wrapIcon' | 'wrapBlock' | 'wrapLoading'

async function readMetrics(page: Page): Promise<Record<WrapCase, WrapMetrics>> {
    return page.evaluate(() => {
        const read = (selector: string) => {
            const element = document.querySelector<HTMLElement>(selector)
            if (!element) {
                throw new Error(`受检单元缺失：${selector}`)
            }
            const content = element.querySelector<HTMLElement>('.caomei-button__content')
            const rect = element.getBoundingClientRect()
            const contentStyle = content ? getComputedStyle(content) : null
            const style = getComputedStyle(element)
            return {
                height: rect.height,
                width: rect.width,
                scrollWidth: content?.scrollWidth ?? 0,
                clientWidth: content?.clientWidth ?? 0,
                whiteSpace: contentStyle?.whiteSpace ?? '',
                overflowWrap: contentStyle?.overflowWrap ?? '',
                paddingTop: style.paddingTop,
                paddingBottom: style.paddingBottom,
            }
        }
        return {
            truncate: read('[data-wrap-case="truncate"]'),
            wrapJa: read('[data-wrap-case="wrap-ja"]'),
            wrapKo: read('[data-wrap-case="wrap-ko"]'),
            wrapWide: read('[data-wrap-case="wrap-wide"]'),
            wrapIcon: read('[data-wrap-case="wrap-icon"]'),
            wrapBlock: read('[data-wrap-case="wrap-block"]'),
            wrapLoading: read('[data-wrap-case="wrap-loading"]'),
        }
    })
}

test('默认单行截断，wrap 折行且高度自适应', async ({ page }) => {
    await page.goto('/')
    const metrics = await readMetrics(page)

    // 1. 默认单行：高度为档位高度，文本被截断
    expect(metrics.truncate.height).toBeCloseTo(CONTROL_HEIGHT_MD, 0)
    expect(metrics.truncate.scrollWidth).toBeGreaterThan(metrics.truncate.clientWidth)
    expect(metrics.truncate.whiteSpace).toBe('nowrap')

    // 2. wrap：高度大于档位高度、无横向溢出、按字符断开
    for (const [name, value] of [['wrap-ja', metrics.wrapJa], ['wrap-ko', metrics.wrapKo]] as const) {
        expect(value.height, `${name} 应折行增高`).toBeGreaterThan(CONTROL_HEIGHT_MD)
        expect(value.scrollWidth, `${name} 不应横向溢出`).toBeLessThanOrEqual(value.clientWidth + 1)
        expect(value.whiteSpace).toBe('normal')
        expect(value.overflowWrap).toBe('anywhere')
    }

    // 3. 边界：宽容器不折行；iconOnly 保持方形且无纵向内边距
    expect(metrics.wrapWide.height).toBeCloseTo(CONTROL_HEIGHT_MD, 0)
    expect(metrics.wrapIcon.width).toBeCloseTo(metrics.wrapIcon.height, 0)
    expect(metrics.wrapIcon.paddingTop).toBe('0px')
    expect(metrics.wrapIcon.paddingBottom).toBe('0px')

    // 4. block 与 loading 形态同样折行，且无横向溢出
    for (const [name, value] of [['wrap-block', metrics.wrapBlock], ['wrap-loading', metrics.wrapLoading]] as const) {
        expect(value.height, `${name} 应折行增高`).toBeGreaterThan(CONTROL_HEIGHT_MD)
        expect(value.scrollWidth, `${name} 不应横向溢出`).toBeLessThanOrEqual(value.clientWidth + 1)
    }
    expect(metrics.wrapBlock.width).toBeCloseTo(metrics.wrapJa.width, 0)
})
