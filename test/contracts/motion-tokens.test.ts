import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * 动效 token 契约：默认（`minimal`）、`expressive` 轴与 `prefers-reduced-motion` 压平值。
 *
 * 静态契约由本文件锁定；真实渲染的轴切换与 reduce 行为由
 * `test/e2e/focus-and-motion.e2e.ts` 的「动效轴」用例承担；源码侧「不得出现裸时长」
 * 由 `pnpm check:motion-contract` 守卫。
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const THEME_CSS = join(REPO_ROOT, 'src', 'styles', 'theme.css')
const PRESETS_DIR = join(REPO_ROOT, 'src', 'styles', 'presets')

const DEFAULT_TOKENS: Record<string, string> = {
    '--caomei-motion-duration-instant': '100ms',
    '--caomei-motion-duration-fast': '120ms',
    '--caomei-motion-duration-base': '150ms',
    '--caomei-motion-duration-emphasis': '180ms',
    '--caomei-motion-duration-slow': '200ms',
    '--caomei-motion-duration-slower': '300ms',
    '--caomei-motion-ease-standard': 'ease',
    '--caomei-motion-ease-out': 'ease-out',
    '--caomei-motion-ease-in-out': 'ease-in-out',
    '--caomei-motion-ease-linear': 'linear',
    '--caomei-motion-distance-sm': '0px',
    '--caomei-motion-distance-md': '0px',
    '--caomei-motion-scale-from': '1',
}

const EXPRESSIVE_TOKENS: Record<string, string> = {
    ...DEFAULT_TOKENS,
    '--caomei-motion-duration-instant': '120ms',
    '--caomei-motion-duration-fast': '160ms',
    '--caomei-motion-duration-base': '220ms',
    '--caomei-motion-duration-emphasis': '240ms',
    '--caomei-motion-duration-slow': '300ms',
    '--caomei-motion-duration-slower': '400ms',
    '--caomei-motion-ease-standard': 'cubic-bezier(0.2, 0, 0, 1)',
    '--caomei-motion-ease-out': 'cubic-bezier(0.2, 0, 0, 1)',
    '--caomei-motion-ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    '--caomei-motion-distance-sm': '4px',
    '--caomei-motion-distance-md': '8px',
    '--caomei-motion-scale-from': '0.96',
}

const REDUCE_TOKENS: Record<string, string> = {
    '--caomei-motion-duration-instant': '0s',
    '--caomei-motion-duration-fast': '0s',
    '--caomei-motion-duration-base': '0s',
    '--caomei-motion-duration-emphasis': '0s',
    '--caomei-motion-duration-slow': '0s',
    '--caomei-motion-duration-slower': '0s',
    '--caomei-motion-distance-sm': '0px',
    '--caomei-motion-distance-md': '0px',
    '--caomei-motion-scale-from': '1',
}

/** 剥离块注释（保留换行）。 */
function stripComments(text: string): string {
    return text.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
}

/** 取选择器对应的规则体（括号配平）。 */
function blockOf(css: string, selector: string): string {
    const index = css.indexOf(selector)
    if (index === -1) {
        return ''
    }
    const open = css.indexOf('{', index + selector.length)
    if (open === -1) {
        return ''
    }
    let depth = 0
    for (let i = open; i < css.length; i += 1) {
        if (css[i] === '{') {
            depth += 1
        } else if (css[i] === '}') {
            depth -= 1
            if (depth === 0) {
                return css.slice(open + 1, i)
            }
        }
    }
    return ''
}

/** 解析 token 声明。 */
function tokensOf(body: string): Map<string, string> {
    const tokens = new Map<string, string>()
    for (const match of body.matchAll(/(--caomei-motion-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
        tokens.set(match[1], match[2].trim().replace(/\s+/g, ' '))
    }
    return tokens
}

const css = stripComments(readFileSync(THEME_CSS, 'utf8'))
const defaults = tokensOf(blockOf(css, ':root'))
const expressive = tokensOf(blockOf(css, '[data-motion=\'expressive\']'))
const reduce = tokensOf(blockOf(css, '@media (prefers-reduced-motion: reduce)'))

describe('动效 token 默认值（minimal）', () => {
    it('13 个 token 的名称与值与迁移前现值一致', () => {
        expect(Object.fromEntries(defaults)).toEqual(DEFAULT_TOKENS)
    })
})

describe('动效轴 expressive', () => {
    it('覆盖全部 13 个 token，且不进入 data-preset 命名空间', () => {
        expect(Object.fromEntries(expressive)).toEqual(EXPRESSIVE_TOKENS)
        expect(css).not.toContain('[data-preset=\'expressive\']')
    })

    it('时长 / 缓动 / 位移 / 缩放均比 minimal 更明显或保持（不对 minimal 生效）', () => {
        for (const name of Object.keys(DEFAULT_TOKENS)) {
            expect(expressive.get(name), name).toBeDefined()
        }
        expect(Number.parseFloat(expressive.get('--caomei-motion-duration-base') ?? '0')).toBeGreaterThan(
            Number.parseFloat(defaults.get('--caomei-motion-duration-base') ?? '0'),
        )
        expect(expressive.get('--caomei-motion-scale-from')).not.toBe('1')
        expect(expressive.get('--caomei-motion-distance-sm')).not.toBe('0px')
    })
})

describe('prefers-reduced-motion 压平', () => {
    it('全部时长归零、位移归零、缩放回 1', () => {
        expect(Object.fromEntries(reduce)).toEqual(REDUCE_TOKENS)
    })

    it('reduce 规则位于 expressive 之后（同特异性时后者胜出）', () => {
        expect(css.indexOf('@media (prefers-reduced-motion: reduce)')).toBeGreaterThan(
            css.indexOf('[data-motion=\'expressive\']'),
        )
    })
})

describe('轴独立性', () => {
    it('预设文件不声明动效 token（配色与动效正交）', () => {
        for (const file of readdirSync(PRESETS_DIR).filter((name) => name.endsWith('.css'))) {
            const preset = readFileSync(join(PRESETS_DIR, file), 'utf8')
            expect(preset, file).not.toContain('--caomei-motion-')
        }
    })
})
