import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * 安全区 token 与工具类的声明契约守卫。
 *
 * 契约：`theme.css` 提供四个 `--caomei-safe-area-*`，默认取 `env(safe-area-inset-*, 0px)`；
 * `index.css` 的六个工具类把对应方向的 token 写成 `padding-*`（`-x` / `-y` 覆盖左右 / 上下两侧）。
 *
 * happy-dom 无布局引擎，故这里只守**声明层面**——真实几何由固定定位件接入后的逐件 E2E 与
 * `capture:styles` 的桌面零差异承担；本契约拦的是 token 值被改成魔法数、工具类方向写反、
 * 或改成 `padding` 简写这类静默破坏（简写会把未涉及的对侧一起清零）。
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const THEME_CSS = readFileSync(join(REPO_ROOT, 'src', 'styles', 'theme.css'), 'utf8')
const INDEX_CSS = readFileSync(join(REPO_ROOT, 'src', 'styles', 'index.css'), 'utf8')

const SIDES = ['top', 'right', 'bottom', 'left'] as const

const token = (side: (typeof SIDES)[number]) => `--caomei-safe-area-${side}`
const inset = (side: (typeof SIDES)[number]) => `env(safe-area-inset-${side}, 0px)`

/** 去掉 CSS 注释，避免注释文本参与声明匹配。 */
export function stripComments(css: string): string {
    return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/** 取选择器对应规则体；找不到返回 `undefined`（调用方据此判失败，避免静默跳过）。 */
export function ruleBody(css: string, selector: string): string | undefined {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`).exec(stripComments(css))?.[1]
}

/** 取规则体中的声明值（去空白）；未声明返回 `undefined`。 */
export function declarationOf(body: string | undefined, property: string): string | undefined {
    if (!body) {
        return undefined
    }
    const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(?:^|[;{])\\s*${escaped}\\s*:\\s*([^;]+);`).exec(stripComments(body))?.[1].trim()
}

describe('安全区 token 契约', () => {
    it.each(SIDES)('--caomei-safe-area-%s 默认取对应方向的 env() 并回落 0px', (side) => {
        expect(declarationOf(THEME_CSS, token(side))).toBe(inset(side))
    })

    it('四个方向全部声明且互不复用', () => {
        const values = SIDES.map((side) => declarationOf(THEME_CSS, token(side)))
        expect(values.every((value) => value !== undefined)).toBe(true)
        expect(new Set(values).size).toBe(SIDES.length)
    })
})

describe('安全区工具类契约', () => {
    const cases: { selector: string, declarations: Record<string, string> }[] = SIDES.map((side) => ({
        selector: `.caomei-safe-area-${side}`,
        declarations: { [`padding-${side}`]: `var(${token(side)}, 0px)` },
    }))

    it.each(cases)('$selector 写成对应单侧的 padding-*', ({ selector, declarations }) => {
        const body = ruleBody(INDEX_CSS, selector)
        expect(body, `${selector} 规则缺失`).toBeDefined()
        for (const [property, value] of Object.entries(declarations)) {
            expect(declarationOf(body, property)).toBe(value)
        }
    })

    it('.caomei-safe-area-x 覆盖左右两侧', () => {
        const body = ruleBody(INDEX_CSS, '.caomei-safe-area-x')
        expect(body).toBeDefined()
        expect(declarationOf(body, 'padding-right')).toBe('var(--caomei-safe-area-right, 0px)')
        expect(declarationOf(body, 'padding-left')).toBe('var(--caomei-safe-area-left, 0px)')
    })

    it('.caomei-safe-area-y 覆盖上下两侧', () => {
        const body = ruleBody(INDEX_CSS, '.caomei-safe-area-y')
        expect(body).toBeDefined()
        expect(declarationOf(body, 'padding-top')).toBe('var(--caomei-safe-area-top, 0px)')
        expect(declarationOf(body, 'padding-bottom')).toBe('var(--caomei-safe-area-bottom, 0px)')
    })

    it('工具类不得使用 padding 简写（会连带清零未涉及的对侧）', () => {
        const selectors = [...SIDES.map((side) => `.caomei-safe-area-${side}`), '.caomei-safe-area-x', '.caomei-safe-area-y']
        for (const selector of selectors) {
            const body = ruleBody(INDEX_CSS, selector)
            expect(body, `${selector} 规则缺失`).toBeDefined()
            expect(declarationOf(body, 'padding'), `${selector} 不得声明 padding 简写`).toBeUndefined()
        }
    })
})
