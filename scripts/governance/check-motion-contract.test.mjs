import { describe, expect, it } from 'vitest'
import { MOTION_TOKEN_NAMES } from '../../test/e2e/helpers/motion.ts'
import {
    DEFAULT_TOKENS,
    ISSUE_CODES,
    REDUCE_TOKENS,
    REQUIRED_REDUCE_FILES,
    animationNameOf,
    analyzeMotionContract,
    checkMotionContract,
    parseTokens,
} from './check-motion-contract.mjs'

/** 生成一份满足契约的主题 CSS。 */
function themeCss() {
    const expressiveTokens = Object.fromEntries(
        Object.entries(DEFAULT_TOKENS).map(([name, value]) => [name, value === '150ms' ? '220ms' : value]),
    )
    const defaults = Object.entries(DEFAULT_TOKENS).map(([name, value]) => `    ${name}: ${value};`).join('\n')
    const expressive = Object.entries(expressiveTokens).map(([name, value]) => `    ${name}: ${value};`).join('\n')
    const reduce = Object.entries(REDUCE_TOKENS).map(([name, value]) => `    ${name}: ${value};`).join('\n')
    return `:root {\n${defaults}\n}\n\n[data-motion='expressive'] {\n${expressive}\n}\n\n@media (prefers-reduced-motion: reduce) {\n    :root,\n    [data-motion] {\n${reduce}\n    }\n}\n`
}

/** 构造受检文件表（含 25 个占位文件以满足下界）。 */
function filesWith(entry) {
    const files = new Map()
    for (const path of REQUIRED_REDUCE_FILES) {
        files.set(path, '@media (prefers-reduced-motion: reduce) { .x { transition: none; } }')
    }
    for (let i = 0; i < 25; i += 1) {
        files.set(`src/components/c${i}/c${i}.vue`, '.x { color: red; }')
    }
    files.set(entry.path, entry.text)
    return files
}

const analyze = (entry) =>
    analyzeMotionContract({ themeCss: themeCss(), files: filesWith(entry) }, { enforceScopeFloor: false })

const codesOf = (result) => result.issues.map((issue) => issue.code)

describe('check-motion-contract 仓库不变量', () => {
    it('仓库当前通过全部检查', () => {
        const { issues } = checkMotionContract()
        expect(issues).toEqual([])
    })

    it('默认 token 值可解析', () => {
        const tokens = parseTokens(':root { --caomei-motion-duration-base: 150ms; }')
        expect(tokens.get('--caomei-motion-duration-base')).toBe('150ms')
    })
})

describe('裸时长与 transition all', () => {
    it('transition 裸时长被标记', () => {
        const result = analyze({ path: 'src/components/a/a.vue', text: '.x { transition: color 0.15s ease; }' })
        expect(codesOf(result)).toContain(ISSUE_CODES.bareDuration)
    })

    it('token 化 transition 通过', () => {
        const result = analyze({
            path: 'src/components/a/a.vue',
            text: '.x { transition: color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard); }',
        })
        expect(result.issues).toEqual([])
    })

    it('transition: all 被标记', () => {
        const result = analyze({
            path: 'src/components/a/a.vue',
            text: '.x { transition: all var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard); }',
        })
        expect(codesOf(result)).toContain(ISSUE_CODES.transitionAll)
    })

    it('reduce 下的 transition: none 通过', () => {
        const result = analyze({
            path: 'src/components/a/a.vue',
            text: '@media (prefers-reduced-motion: reduce) { .x { transition: none; } }',
        })
        expect(result.issues).toEqual([])
    })

    it('多行 transition 声明仍被扫描', () => {
        const result = analyze({
            path: 'src/components/a/a.vue',
            text: '.x {\n    transition:\n        top 0.15s ease,\n        color 0.15s ease;\n}',
        })
        expect(codesOf(result)).toContain(ISSUE_CODES.bareDuration)
    })

    it('transition-duration 裸值被标记', () => {
        const result = analyze({
            path: 'src/components/a/a.vue',
            text: '.x { transition-duration: 150ms; }',
        })
        expect(codesOf(result)).toContain(ISSUE_CODES.bareDuration)
    })
})

describe('animation 白名单', () => {
    it('非加载类 animation 裸时长被标记', () => {
        const result = analyze({
            path: 'src/components/a/a.vue',
            text: '.x { animation: caomei-tooltip-in 0.1s ease-out; }',
        })
        expect(codesOf(result)).toContain(ISSUE_CODES.bareDuration)
    })

    it('加载类 animation 允许组件级时长', () => {
        const result = analyze({
            path: 'src/components/button/button.vue',
            text: '.x { animation: caomei-button-spin 0.6s linear infinite; }',
        })
        expect(result.issues).toEqual([])
    })

    it('加载类文件允许 animation-duration 降速', () => {
        const result = analyze({
            path: 'src/components/skeleton/skeleton.vue',
            text: '@media (prefers-reduced-motion: reduce) { .x { animation-duration: 2.4s; } }',
        })
        expect(result.issues).toEqual([])
    })

    it('加载类文件的未登记降速值被标记', () => {
        const result = analyze({
            path: 'src/components/skeleton/skeleton.vue',
            text: '.x { animation-duration: 3s; }',
        })
        expect(codesOf(result)).toContain(ISSUE_CODES.bareDuration)
    })

    it('逗号列表只放行白名单项', () => {
        const result = analyze({
            path: 'src/components/a/a.vue',
            text: '.x { animation: caomei-button-spin 0.6s linear infinite, caomei-tooltip-in 0.2s ease-out; }',
        })
        expect(codesOf(result)).toContain(ISSUE_CODES.bareDuration)
    })

    it('非加载类文件的 animation-duration 裸值被标记', () => {
        const result = analyze({
            path: 'src/components/a/a.vue',
            text: '.x { animation-duration: 2.4s; }',
        })
        expect(codesOf(result)).toContain(ISSUE_CODES.bareDuration)
    })

    it('animation-name 解析：名称在时长之后', () => {
        expect(animationNameOf('150ms ease caomei-x')).toBe('caomei-x')
        expect(animationNameOf('caomei-x 150ms ease')).toBe('caomei-x')
        expect(animationNameOf('none')).toBeNull()
    })
})

describe('动效验收装置', () => {
    it('E2E 采样装置的 token 清单与默认集合一致', () => {
        expect([...MOTION_TOKEN_NAMES].sort()).toEqual(Object.keys(DEFAULT_TOKENS).sort())
    })
})

describe('布局属性动画审计', () => {
    it('未登记的布局属性过渡被标记', () => {
        const result = analyze({
            path: 'src/components/a/a.vue',
            text: '.x { transition: width var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard); }',
        })
        expect(codesOf(result)).toContain(ISSUE_CODES.layoutTransition)
    })

    it('白名单内的布局属性过渡通过', () => {
        const result = analyze({
            path: 'src/components/password/password.vue',
            text: '.x { transition: width var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard); }',
        })
        expect(result.issues).toEqual([])
    })

    it('白名单文件新增未登记属性仍被标记', () => {
        const result = analyze({
            path: 'src/components/password/password.vue',
            text: '.x { transition: height var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard); }',
        })
        expect(codesOf(result)).toContain(ISSUE_CODES.layoutTransition)
    })

    it('未登记的布局属性关键帧被标记', () => {
        const result = analyze({
            path: 'src/components/a/a.vue',
            text: '@keyframes custom-slide { from { height: 0; } to { height: 40px; } }',
        })
        expect(codesOf(result)).toContain(ISSUE_CODES.layoutKeyframe)
    })

    it('白名单关键帧通过', () => {
        const result = analyze({
            path: 'src/components/accordion/accordion-item.vue',
            text: '@keyframes caomei-accordion-slide-down { from { height: 0; } to { height: var(--x); } }',
        })
        expect(result.issues).toEqual([])
    })

    it('时长前置的 transition 简写仍能识别布局属性', () => {
        const result = analyze({
            path: 'src/components/a/a.vue',
            text: '.x { transition: var(--caomei-motion-duration-base) width var(--caomei-motion-ease-standard); }',
        })
        expect(codesOf(result)).toContain(ISSUE_CODES.layoutTransition)
    })

    it('transition-property 长写被标记', () => {
        const result = analyze({
            path: 'src/components/a/a.vue',
            text: '.x { transition-property: width, color; transition-duration: var(--caomei-motion-duration-base); }',
        })
        expect(codesOf(result)).toContain(ISSUE_CODES.layoutTransition)
    })

    it('transition-property: all 被标记', () => {
        const result = analyze({
            path: 'src/components/a/a.vue',
            text: '.x { transition-property: all; transition-duration: var(--caomei-motion-duration-base); }',
        })
        expect(codesOf(result)).toContain(ISSUE_CODES.transitionAll)
    })

    it('逻辑属性过渡被标记', () => {
        const result = analyze({
            path: 'src/components/a/a.vue',
            text: '.x { transition: margin-inline-start var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard); }',
        })
        expect(codesOf(result)).toContain(ISSUE_CODES.layoutTransition)
    })

    it('白名单文件使用长写形式通过', () => {
        const result = analyze({
            path: 'src/components/progress-bar/progress-bar.vue',
            text: '.x { transition-property: width; transition-duration: var(--caomei-motion-duration-slower); }',
        })
        expect(result.issues).toEqual([])
    })

    it('白名单关键帧跨文件借用名称被标记', () => {
        const result = analyze({
            path: 'src/components/a/a.vue',
            text: '@keyframes caomei-accordion-slide-down { from { height: 0; } to { height: 20px; } }',
        })
        expect(codesOf(result)).toContain(ISSUE_CODES.layoutKeyframe)
    })

    it('行高等扩展布局属性的关键帧被标记', () => {
        const result = analyze({
            path: 'src/components/a/a.vue',
            text: '@keyframes custom-line { from { line-height: 10px; } to { line-height: 20px; } }',
        })
        expect(codesOf(result)).toContain(ISSUE_CODES.layoutKeyframe)
    })

    it('只动画 transform / opacity 的关键帧不受限', () => {
        const result = analyze({
            path: 'src/components/a/a.vue',
            text: '@keyframes custom-fade { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: none; } }',
        })
        expect(result.issues).toEqual([])
    })
})

describe('token 登记与三组声明', () => {
    it('未登记 token 被标记', () => {
        const result = analyze({
            path: 'src/components/a/a.vue',
            text: '.x { transition: color var(--caomei-motion-duration-unknown); }',
        })
        expect(codesOf(result)).toContain(ISSUE_CODES.unknownToken)
    })

    it('缺默认声明被标记', () => {
        const css = themeCss().replace(/ {4}--caomei-motion-duration-base: 150ms;\n/, '')
        const result = analyzeMotionContract({ themeCss: css, files: filesWith({ path: 'src/a.vue', text: '' }) })
        expect(codesOf(result)).toContain(ISSUE_CODES.missingDefault)
    })

    it('缺 expressive 覆盖被标记', () => {
        const css = themeCss().replace('    --caomei-motion-duration-base: 220ms;\n', '')
        const result = analyzeMotionContract({ themeCss: css, files: filesWith({ path: 'src/a.vue', text: '' }) })
        expect(codesOf(result)).toContain(ISSUE_CODES.missingExpressive)
    })

    it('reduce 未归零被标记', () => {
        const css = themeCss().replace('--caomei-motion-duration-base: 0s;', '--caomei-motion-duration-base: 150ms;')
        const result = analyzeMotionContract({ themeCss: css, files: filesWith({ path: 'src/a.vue', text: '' }) })
        expect(codesOf(result)).toContain(ISSUE_CODES.reduceMismatch)
    })

    it('受检面收窄被标记', () => {
        const result = analyzeMotionContract({ themeCss: themeCss(), files: new Map() })
        expect(codesOf(result)).toContain(ISSUE_CODES.scopeNarrowed)
    })

    it('必选 reduce 来源缺兜底被标记', () => {
        const files = filesWith({ path: 'src/a.vue', text: '' })
        files.set(REQUIRED_REDUCE_FILES[0], '.x { transition: none; }')
        const result = analyzeMotionContract({ themeCss: themeCss(), files }, { enforceScopeFloor: false })
        expect(codesOf(result)).toContain(ISSUE_CODES.missingReduceCoverage)
    })
})
