/**
 * 主题预设契约：预设清单、必需 token 与设计向预设的对比度下界。
 *
 * - 清单：`src/styles/index.css` 必须导入全部预设文件，`presets/` 不得再出现 `minimal.css`；
 * - 结构：每个预设都提供亮色规则、暗色规则（属性 / class 两种写法）与 `data-scheme="auto"` 媒体查询；
 * - token：亮 / 暗都覆盖最小必需集合，避免预设只改 primary 后其余值随机继承；
 * - 对比度：`sakura` / `forest` / `ink` 为设计向新增预设，按 WCAG 2.x 相对亮度守住 AA（正文按 7:1 更严档）。
 *
 * `caomei` / `momei` 为下游品牌源，存在已在设计规范 §3.2 / §5.2 登记的有意例外，故不做全量对比度断言。
 */
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const STYLES = join(REPO_ROOT, 'src', 'styles')
const PRESETS_DIR = join(STYLES, 'presets')
const SWITCHER_FILE = join(REPO_ROOT, 'docs', '.vitepress', 'theme', 'components', 'theme-preset-switcher.vue')

const PRESET_NAMES = ['caomei', 'momei', 'sakura', 'forest', 'ink'] as const
const DESIGN_PRESETS = ['sakura', 'forest', 'ink'] as const

const REQUIRED_LIGHT_TOKENS = [
    '--caomei-color-primary',
    '--caomei-color-primary-foreground',
    '--caomei-color-primary-solid',
    '--caomei-color-success',
    '--caomei-color-warning',
    '--caomei-color-danger',
    '--caomei-color-bg',
    '--caomei-color-bg-elevated',
    '--caomei-color-text',
    '--caomei-color-text-muted',
    '--caomei-color-border',
    '--caomei-radius-sm',
    '--caomei-radius-md',
    '--caomei-radius-lg',
] as const

const REQUIRED_DARK_TOKENS = [
    '--caomei-color-primary',
    '--caomei-color-primary-foreground',
    '--caomei-color-bg',
    '--caomei-color-bg-elevated',
    '--caomei-color-text',
    '--caomei-color-text-muted',
    '--caomei-color-border',
    '--caomei-color-success',
    '--caomei-color-warning',
    '--caomei-color-danger',
] as const

function readPreset(name: string): string {
    return readFileSync(join(PRESETS_DIR, `${name}.css`), 'utf8')
}

/** 读取某个选择器块的声明文本；块内无嵌套规则。 */
function readBlock(css: string, selectorPattern: string): string {
    const match = new RegExp(`${selectorPattern}\\s*\\{([\\s\\S]*?)\\n\\}`, 'm').exec(css)
    return match?.[1] ?? ''
}

function declarations(block: string): Map<string, string> {
    const map = new Map<string, string>()
    for (const match of block.matchAll(/(--caomei-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
        map.set(match[1], match[2].trim())
    }
    return map
}

function lightBlock(css: string, name: string): string {
    return readBlock(css, `\\[data-preset='${name}'\\]`)
}

function darkBlock(css: string, name: string): string {
    return readBlock(css, `:is\\(\\[data-preset='${name}'\\]\\.dark, \\[data-preset='${name}'\\]\\[data-theme='dark'\\]\\)`)
}

function hexToRgb(hex: string): [number, number, number] {
    const value = hex.replace('#', '')
    const expanded = value.length === 3
        ? [...value].map((char) => char + char).join('')
        : value
    return [0, 2, 4].map((offset) => Number.parseInt(expanded.slice(offset, offset + 2), 16)) as [number, number, number]
}

function relativeLuminance(hex: string): number {
    const [r, g, b] = hexToRgb(hex).map((channel) => {
        const value = channel / 255
        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(foreground: string, background: string): number {
    const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a)
    return (lighter + 0.05) / (darker + 0.05)
}

describe('主题预设契约', () => {
    it('index.css 导入全部预设文件', () => {
        const index = readFileSync(join(STYLES, 'index.css'), 'utf8')
        for (const name of PRESET_NAMES) {
            expect(index, `缺少 ${name}.css 的导入`).toContain(`@import './presets/${name}.css';`)
        }
        expect(index).not.toContain(`@import './presets/minimal.css';`)
    })

    it('presets/ 目录只包含清单内的预设文件', () => {
        const files = readdirSync(PRESETS_DIR)
            .filter((name) => name.endsWith('.css'))
            .sort()
        expect(files).toEqual(PRESET_NAMES.map((name) => `${name}.css`).sort())
    })

    it('文档站预设切换器与预设清单一致', () => {
        const source = readFileSync(SWITCHER_FILE, 'utf8')
        const values = [...source.matchAll(/\{ value: '([a-z]+)', label:/g)].map((match) => match[1])
        expect(values).toEqual(['minimal', ...PRESET_NAMES])
    })

    it.each(PRESET_NAMES)('%s 具备亮 / 暗 / 系统跟随三段规则', (name) => {
        const css = readPreset(name)
        expect(lightBlock(css, name), '缺少亮色规则').not.toBe('')
        expect(darkBlock(css, name), '缺少暗色规则').not.toBe('')
        expect(css).toContain(`[data-preset='${name}'][data-scheme='auto']:not(.light, [data-theme='light'])`)
    })

    it.each(PRESET_NAMES)('%s 亮色覆盖必需 token', (name) => {
        const declared = declarations(lightBlock(readPreset(name), name))
        for (const token of REQUIRED_LIGHT_TOKENS) {
            expect(declared.has(token), `亮色缺少 ${token}`).toBe(true)
        }
    })

    it.each(PRESET_NAMES)('%s 暗色覆盖必需 token', (name) => {
        const declared = declarations(darkBlock(readPreset(name), name))
        for (const token of REQUIRED_DARK_TOKENS) {
            expect(declared.has(token), `暗色缺少 ${token}`).toBe(true)
        }
    })

    it.each(DESIGN_PRESETS)('%s 满足对比度下界', (name) => {
        const css = readPreset(name)
        for (const [mode, block] of [['亮色', lightBlock(css, name)], ['暗色', darkBlock(css, name)]] as const) {
            const tokens = declarations(block)
            const get = (token: string) => tokens.get(token) ?? ''

            expect(contrastRatio(get('--caomei-color-primary'), get('--caomei-color-primary-foreground')), `${mode} primary 配对`).toBeGreaterThanOrEqual(4.5)
            expect(contrastRatio(get('--caomei-color-primary'), get('--caomei-color-bg')), `${mode} primary 在 bg 上`).toBeGreaterThanOrEqual(4.5)
            expect(contrastRatio(get('--caomei-color-primary'), get('--caomei-color-bg-elevated')), `${mode} primary 在 bg-elevated 上`).toBeGreaterThanOrEqual(4.5)
            expect(contrastRatio(get('--caomei-color-text'), get('--caomei-color-bg')), `${mode} 正文`).toBeGreaterThanOrEqual(7)
            expect(contrastRatio(get('--caomei-color-text-muted'), get('--caomei-color-bg')), `${mode} 次要文字`).toBeGreaterThanOrEqual(4.5)
            expect(contrastRatio(get('--caomei-color-text-muted'), get('--caomei-color-bg-elevated')), `${mode} 次要文字（抬升面）`).toBeGreaterThanOrEqual(4.5)
        }

        const light = declarations(lightBlock(css, name))
        expect(contrastRatio(light.get('--caomei-color-primary-solid') ?? '', '#ffffff'), '实底与白字').toBeGreaterThanOrEqual(4.5)

        // 设计向预设的 -solid 保持跨明暗稳定：暗色块不得重声明 primary-solid。
        expect(declarations(darkBlock(css, name)).has('--caomei-color-primary-solid'), '设计向预设的 primary-solid 应跨明暗稳定').toBe(false)
    })
})
