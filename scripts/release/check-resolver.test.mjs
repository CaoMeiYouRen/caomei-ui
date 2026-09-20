import { describe, expect, it } from 'vitest'
import { countOccurrences, renderEntry, verifyProducedCss } from './check-resolver.mjs'

describe('renderEntry', () => {
    it('按 resolver 返回值生成命名导入与副作用导入', () => {
        const entry = renderEntry([{ name: 'CaomeiButton', from: 'caomei-ui', sideEffects: 'caomei-ui/theme.css' }])

        expect(entry).toContain('import { CaomeiButton } from \'caomei-ui\'')
        expect(entry).toContain('import \'caomei-ui/theme.css\'')
        expect(entry).toContain('console.log(CaomeiButton)')
    })

    it('无 sideEffects 时只生成命名导入', () => {
        const entry = renderEntry([{ name: 'CaomeiButton', from: 'caomei-ui' }])

        expect(entry).not.toContain('theme.css')
    })
})

describe('countOccurrences', () => {
    it('统计非重叠出现次数', () => {
        expect(countOccurrences('a:1;a:2;', 'a:')).toBe(2)
        expect(countOccurrences('none', 'a:')).toBe(0)
    })
})

describe('verifyProducedCss', () => {
    const baseCss = '--caomei-color-bg:x;--caomei-color-bg:y;.caomei-button{}'

    it('基础层一份且组件样式在时通过', () => {
        expect(verifyProducedCss(baseCss, 2)).toEqual({ ok: true, errors: [] })
    })

    it('基础层缺失时报错（sideEffects 未生效）', () => {
        const result = verifyProducedCss('.caomei-button{}', 2)

        expect(result.ok).toBe(false)
        expect(result.errors.some((item) => item.includes('sideEffects 未生效'))).toBe(true)
    })

    it('基础层重复注入时报错', () => {
        const result = verifyProducedCss(baseCss.repeat(2), 2)

        expect(result.ok).toBe(false)
        expect(result.errors.some((item) => item.includes('疑似重复注入'))).toBe(true)
    })

    it('期望值无法派生时报错（不静默跳过）', () => {
        const result = verifyProducedCss(baseCss, 0)

        expect(result.ok).toBe(false)
        expect(result.errors.some((item) => item.includes('无法从'))).toBe(true)
    })

    it('混入未引入组件样式时报错（按需失效）', () => {
        const result = verifyProducedCss(`${baseCss}.caomei-tag{}`, 2)

        expect(result.ok).toBe(false)
        expect(result.errors.some((item) => item.includes('按需失效'))).toBe(true)
    })
})
