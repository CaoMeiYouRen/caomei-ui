import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    checkDemoTransitionCopies,
    parseDeclarations,
    parseRules,
    REPO_ROOT,
    TRANSITION_COPIES,
    transitionProperties,
} from './check-demo-transition-copies.mjs'

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

function createFixture(files) {
    const dir = mkdtempSync(join(tmpdir(), 'check-demo-transition-copies-'))
    tempDirs.push(dir)
    for (const [relativePath, content] of Object.entries(files)) {
        const file = join(dir, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    return dir
}

const SMALL_REGISTRY = [
    { file: 'src/a.vue', selector: '.caomei-a', properties: ['color', 'background-color'] },
]

const SMALL_OPTS = { motionFile: 'motion.css', registry: SMALL_REGISTRY, minCopies: 1 }

const SOURCE = `<style>
.caomei-a {
    transition: color 150ms, background-color 150ms;
}
</style>`

const MOTION = `@media (prefers-reduced-motion: reduce) {
    .vitepress-demo-plugin__container .caomei-a {
        transition: color 150ms !important, background-color 150ms !important;
    }
}`

describe('parseRules', () => {
    it('解析选择器规则并标记 reduce 上下文', () => {
        const rules = parseRules(`@media (prefers-reduced-motion: reduce) { .a { color: red; } }`)
        expect(rules).toHaveLength(1)
        expect(rules[0].selector).toBe('.a')
        expect(rules[0].reduce).toBe(true)
    })

    it('跳过 keyframes 块', () => {
        const rules = parseRules('@keyframes x { from { opacity: 0; } } .a { color: red; }')
        expect(rules.map((rule) => rule.selector)).toEqual(['.a'])
    })

    it('逗号选择器列表按原样返回（由调用方拆分）', () => {
        const rules = parseRules('.a, .b { transition: color 1ms; }')
        expect(rules[0].selector).toBe('.a, .b')
    })
})

describe('parseDeclarations / transitionProperties', () => {
    it('解析声明并展开 var() 间接属性', () => {
        const declarations = parseDeclarations('--t: color 1ms, box-shadow 1ms; transition: var(--t);')
        const variables = new Map([['--t', declarations.get('--t')]])
        expect([...transitionProperties(declarations.get('transition'), variables)]).toEqual(['color', 'box-shadow'])
    })

    it('transition: none 视为空集', () => {
        expect(transitionProperties('none').size).toBe(0)
    })
})

describe('TRANSITION_COPIES', () => {
    it('受检面达到下界且选择器唯一', () => {
        expect(TRANSITION_COPIES.length).toBeGreaterThanOrEqual(25)
        const keys = TRANSITION_COPIES.map((entry) => `${entry.file}::${entry.selector}`)
        expect(new Set(keys).size).toBe(keys.length)
    })
})

describe('checkDemoTransitionCopies', () => {
    it('仓库现状：副本与组件源一致', () => {
        const result = checkDemoTransitionCopies(REPO_ROOT)
        expect(result.errors).toEqual([])
        expect(result.ok).toBe(true)
    })

    it('组件源属性漂移时报错', () => {
        const root = createFixture({
            'src/a.vue': '<style>.caomei-a { transition: color 150ms; }</style>',
            'motion.css': MOTION,
        })
        const result = checkDemoTransitionCopies(root, SMALL_OPTS)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('源漂移')
    })

    it('副本属性漂移时报错', () => {
        const root = createFixture({
            'src/a.vue': SOURCE,
            'motion.css': `@media (prefers-reduced-motion: reduce) {
                .vitepress-demo-plugin__container .caomei-a { transition: color 150ms !important; }
            }`,
        })
        const result = checkDemoTransitionCopies(root, SMALL_OPTS)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('副本漂移')
    })

    it('副本缺少 !important 时报错', () => {
        const root = createFixture({
            'src/a.vue': SOURCE,
            'motion.css': `@media (prefers-reduced-motion: reduce) {
                .vitepress-demo-plugin__container .caomei-a { transition: color 150ms, background-color 150ms; }
            }`,
        })
        const result = checkDemoTransitionCopies(root, SMALL_OPTS)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('副本缺少 !important')
    })

    it('组件新增未登记过渡时报错', () => {
        const root = createFixture({
            'src/a.vue': `<style>
                .caomei-a { transition: color 150ms, background-color 150ms; }
                .caomei-b { transition: opacity 1ms; }
            </style>`,
            'motion.css': MOTION,
        })
        const result = checkDemoTransitionCopies(root, SMALL_OPTS)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('未登记的组件过渡')
    })

    it('expressive 轴内的过渡不参与扫描', () => {
        const root = createFixture({
            'src/a.vue': `<style>
                .caomei-a { transition: color 150ms, background-color 150ms; }
                :where([data-motion='expressive']) .caomei-a { transition: transform 1ms; }
            </style>`,
            'motion.css': MOTION,
        })
        const result = checkDemoTransitionCopies(root, SMALL_OPTS)
        expect(result.ok).toBe(true)
    })

    it('demo 层出现孤儿副本时报错', () => {
        const root = createFixture({
            'src/a.vue': SOURCE,
            'motion.css': `${MOTION}
                @media (prefers-reduced-motion: reduce) {
                    .vitepress-demo-plugin__container .caomei-c { transition: opacity 1ms !important; }
                }`,
        })
        const result = checkDemoTransitionCopies(root, SMALL_OPTS)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('孤儿副本')
    })

    it('受检面下界收窄时报错', () => {
        const root = createFixture({ 'src/a.vue': SOURCE, 'motion.css': MOTION })
        const result = checkDemoTransitionCopies(root, { ...SMALL_OPTS, minCopies: 5 })
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('受检面收窄')
    })
})
