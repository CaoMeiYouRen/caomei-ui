import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * 「极简」预设（`minimal`）契约守卫。
 *
 * 契约：缺省预设即「极简」——`src/styles/theme.css` 中 `:root` 与 `[data-preset="minimal"]`
 * 必须是**同一规则的选择器组**（token 只声明一次，显式指定与缺省渲染逐值一致）；
 * 该选择器在整张表中**只允许出现一次**（第二份声明会因源序更后而覆盖基础值，使缺省与显式渲染静默分叉）；
 * `presets/` 目录不得再出现 `minimal.css`，否则同一预设出现第二份声明。
 *
 * 真实渲染一致性由 `pnpm capture:styles`（缺省 0 差异）与浏览器验证
 * （缺省 vs `data-preset="minimal"` 逐值比对）承担；happy-dom 不算 CSS 级联。
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const THEME_CSS = join(REPO_ROOT, 'src', 'styles', 'theme.css')
const PRESETS_DIR = join(REPO_ROOT, 'src', 'styles', 'presets')
const MINIMAL_SELECTOR = '[data-preset=\'minimal\']'

/**
 * 按**顶层逗号**拆分选择器组（括号 / 属性选择器内的逗号不拆）。
 *
 * @param group 选择器组文本
 * @returns 原始片段列表（未归一化）
 */
function splitTopLevel(group: string): string[] {
    const parts: string[] = []
    let depth = 0
    let current = ''
    for (const char of group) {
        if (char === '(' || char === '[') {
            depth += 1
        }
        if (char === ')' || char === ']') {
            depth -= 1
        }
        if (char === ',' && depth === 0) {
            parts.push(current)
            current = ''
            continue
        }
        current += char
    }
    parts.push(current)
    return parts
}

/** 归一化选择器 / 选择器组片段（折叠空白） */
function normalizeSelector(value: string): string {
    return value.trim().replace(/\s+/g, ' ')
}

/**
 * 取样式表**首个规则**的选择器组（逗号分隔、逐项归一化空白），忽略注释。
 *
 * **已知边界**：以 `/([^{}]+)\{/` 定位规则选择器，不跨块；若首个规则之前出现顶层 at-rule
 * （如 `@import` / `@charset`），其前缀会被并入首个选择器组，使断言**响亮失败**（而非静默误判）。
 * 当前 `theme.css` 无前置 at-rule。
 *
 * @param css 样式表文本
 * @returns 选择器列表（无规则时为空数组）
 */
export function firstRuleSelectors(css: string): string[] {
    const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '')
    const match = /([^{}]+)\{/.exec(stripped)
    if (!match) {
        return []
    }
    return splitTopLevel(match[1]).map(normalizeSelector).filter(Boolean)
}

/**
 * 统计样式表中某选择器（归一化后）作为规则选择器出现的次数。
 *
 * @param css 样式表文本
 * @param selector 目标选择器
 * @returns 出现次数（同一规则的选择器组内出现也算一次）
 */
export function countSelectorOccurrences(css: string, selector: string): number {
    const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '')
    const target = normalizeSelector(selector)
    return [...stripped.matchAll(/([^{}]+)\{/g)]
        .flatMap((match) => splitTopLevel(match[1]))
        .map(normalizeSelector)
        .filter((item) => item === target)
        .length
}

describe('极简预设契约（判定函数）', () => {
    const cases: { name: string, css: string, expected: string[] }[] = [
        {
            name: '逗号分隔的选择器组逐项拆出',
            css: ':root,\n[data-preset=\'minimal\'] {\n    --caomei-color-bg: #fff;\n}',
            expected: [':root', MINIMAL_SELECTOR],
        },
        {
            name: '仅 :root 时不含 minimal 选择器（负向对照）',
            css: ':root {\n    --caomei-color-bg: #fff;\n}',
            expected: [':root'],
        },
        {
            name: '注释内的选择器形态不参与判定',
            css: '/* :root,\n[data-preset=\'minimal\'] {} */\n:root { --x: 1; }',
            expected: [':root'],
        },
        {
            name: '括号内的逗号不被拆开（:is() 形态）',
            css: ':is(.dark, [data-theme=\'dark\']) { --x: 1; }',
            expected: [':is(.dark, [data-theme=\'dark\'])'],
        },
        {
            name: '无规则时返回空数组',
            css: '/* 仅有注释 */',
            expected: [],
        },
    ]

    it.each(cases)('$name', ({ css, expected }) => {
        expect(firstRuleSelectors(css)).toEqual(expected)
    })

    it('重复声明被计入（负向夹具：第二份 minimal 规则必须被数到）', () => {
        const css = ':root,\n[data-preset=\'minimal\'] { --x: 1; }\n[data-preset=\'minimal\'] { --x: 2; }'
        expect(countSelectorOccurrences(css, MINIMAL_SELECTOR)).toBe(2)
    })

    it('注释中的选择器形态不计入', () => {
        const css = '/* [data-preset=\'minimal\'] { --x: 2; } */\n:root { --x: 1; }'
        expect(countSelectorOccurrences(css, MINIMAL_SELECTOR)).toBe(0)
    })
})

describe('极简预设契约（仓库现状）', () => {
    it(':root 与 [data-preset=\'minimal\'] 共享同一规则（token 单一事实源）', () => {
        const selectors = firstRuleSelectors(readFileSync(THEME_CSS, 'utf8'))
        expect(selectors).toContain(':root')
        expect(selectors).toContain(MINIMAL_SELECTOR)
    })

    it('[data-preset=\'minimal\'] 在 theme.css 中只出现一次（防第二份声明覆盖基础值）', () => {
        const count = countSelectorOccurrences(readFileSync(THEME_CSS, 'utf8'), MINIMAL_SELECTOR)
        expect(count).toBe(1)
    })

    it('presets/ 目录不含 minimal.css（防同一预设出现第二份声明）', () => {
        const files = readdirSync(PRESETS_DIR)
            .filter((name) => name.endsWith('.css'))
            .sort()
        expect(files).toEqual(['caomei.css', 'momei.css'])
    })
})
