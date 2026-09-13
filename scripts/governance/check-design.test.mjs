import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
    RGB_BUDGET,
    collectGlobalTokens,
    collectLocalTokens,
    findLegacyNaming,
    findRawColors,
    findTokenIssues,
    findTypeScaleIssues,
    runChecks,
} from './check-design.mjs'

const REPO_ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..')
const readCss = (name) => readFileSync(join(REPO_ROOT, 'src/styles', name), 'utf8')

describe('check-design 仓库不变量', () => {
    it('仓库当前通过全部检查', () => {
        const result = runChecks()
        expect(result.tokenIssues).toEqual([])
        expect(result.rawColors.errors).toEqual([])
        expect(result.typeIssues).toEqual([])
        expect(result.legacyNaming).toEqual([])
        expect(result.rawColors.warnings.length).toBeLessThanOrEqual(RGB_BUDGET)
    })

    it('全局 token 覆盖基础与两套预设', () => {
        expect([...collectGlobalTokens()]).toEqual(
            expect.arrayContaining(['--caomei-color-primary', '--caomei-color-bg', '--caomei-radius-md']),
        )
    })

    it('预设取值与设计规范一致（关键锚点）', () => {
        const caomei = readCss('presets/caomei.css')
        expect(caomei).toContain('--caomei-color-primary: #e63946')
        expect(caomei).toContain('--caomei-color-bg: #18181b')
        expect(caomei).toContain('--caomei-color-bg-elevated: #27272a')

        const momei = readCss('presets/momei.css')
        expect(momei).toContain('--caomei-color-primary: #64748b')
        expect(momei).toContain('--caomei-color-bg: #020617')
        expect(momei).toContain('--caomei-color-text: #f1f5f9')
    })
})

describe('check-design 负向用例', () => {
    it('识别未定义且无 fallback 的 token 引用', () => {
        const entries = [{ file: '/tmp/opencode/x.vue', text: '<style>.a { color: var(--caomei-not-exist); }</style>' }]
        expect(findTokenIssues(entries, new Set())).toHaveLength(1)
    })

    it('带 fallback 的引用放行', () => {
        const entries = [{ file: '/tmp/opencode/x.vue', text: '<style>.a { color: var(--caomei-not-exist, red); }</style>' }]
        expect(findTokenIssues(entries, new Set())).toEqual([])
    })

    it('同文件局部定义的 token 放行', () => {
        const entries = [{ file: '/tmp/opencode/x.vue', text: '<style>.a { --caomei-local: red; color: var(--caomei-local); }</style>' }]
        expect(collectLocalTokens(entries[0].text).has('--caomei-local')).toBe(true)
        expect(findTokenIssues(entries, new Set())).toEqual([])
    })

    it('识别组件内原始 hex 色值', () => {
        const entries = [{ file: '/tmp/opencode/x.vue', text: '<style>.a { color: #fff; }</style>' }]
        expect(findRawColors(entries).errors).toHaveLength(1)
    })

    it('script / template 内容不误报', () => {
        const entries = [{ file: '/tmp/opencode/x.vue', text: '<script>const c = "#fff"</script><style>.a { color: red; }</style>' }]
        expect(findRawColors(entries).errors).toEqual([])
    })

    it('档位不一致时逐项报错', () => {
        const text = [
            'export type ComponentSize = \'small\' | \'md\'',
            'export type ComponentVariant = \'primary\'',
            'export type ComponentTone = \'danger\'',
        ].join('\n')
        expect(findTypeScaleIssues(text)).toHaveLength(3)
    })

    it('识别 PrimeVue 旧尺寸命名', () => {
        expect(findLegacyNaming([{ file: '/tmp/opencode/x.ts', text: 'size?: \'small\'' }])).toHaveLength(1)
    })
})
