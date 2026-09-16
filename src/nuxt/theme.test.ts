import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { CAOMEI_THEME_ALIASES, renderThemeCss, resolveThemeVariables } from './theme'

describe('resolveThemeVariables', () => {
    it('按语义别名映射为 CSS 变量', () => {
        expect(resolveThemeVariables({ primary: '#e63946', radius: '0.5rem' })).toEqual([
            { name: '--caomei-color-primary', value: '#e63946' },
            { name: '--caomei-radius-md', value: '0.5rem' },
        ])
    })

    it('primary-foreground 别名映射到对应 CSS 变量', () => {
        expect(resolveThemeVariables({ 'primary-foreground': '#0b0b0d' })).toEqual([
            { name: '--caomei-color-primary-foreground', value: '#0b0b0d' },
        ])
    })

    it('以 `--` 开头的键原样使用', () => {
        expect(resolveThemeVariables({ '--caomei-color-bg': '#000' })).toEqual([
            { name: '--caomei-color-bg', value: '#000' },
        ])
    })

    it('未知别名抛出明确错误', () => {
        expect(() => resolveThemeVariables({ nope: '1' })).toThrowError(/未知的主题 token：nope/)
    })

    it('空配置返回空数组', () => {
        expect(resolveThemeVariables()).toEqual([])
    })

    it('别名目标均为合法 CSS 变量名', () => {
        for (const variable of Object.values(CAOMEI_THEME_ALIASES)) {
            expect(variable.startsWith('--caomei-')).toBe(true)
        }
    })

    it('别名目标均存在于 theme.css（防重命名漂移）', () => {
        const themeCss = readFileSync(
            join(dirname(fileURLToPath(import.meta.url)), '..', 'styles', 'theme.css'),
            'utf8',
        )

        for (const target of Object.values(CAOMEI_THEME_ALIASES)) {
            expect(themeCss).toContain(`${target}:`)
        }
    })
})

describe('renderThemeCss', () => {
    it('渲染 :root 声明块', () => {
        expect(renderThemeCss({ primary: '#e63946' })).toBe(':root {\n    --caomei-color-primary: #e63946;\n}\n')
    })

    it('无配置时返回空字符串', () => {
        expect(renderThemeCss({})).toBe('')
    })
})
