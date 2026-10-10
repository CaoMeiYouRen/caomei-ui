import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    checkDemoKeyframes,
    extractKeyframes,
    KEYFRAME_MAP,
    normalizeKeyframeBody,
    REPO_ROOT,
} from './check-demo-keyframes.mjs'

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

function createFixture(files) {
    const dir = mkdtempSync(join(tmpdir(), 'check-demo-keyframes-'))
    tempDirs.push(dir)
    for (const [relativePath, content] of Object.entries(files)) {
        const file = join(dir, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    return dir
}

const SMALL_MAP = [{ demo: 'caomei-demo-spin', file: 'src/a.vue', source: 'caomei-a-spin' }]
const SMALL_OPTS = { motionFile: 'motion.css', keyframeMap: SMALL_MAP, minDemoKeyframes: 1 }

describe('extractKeyframes', () => {
    it('提取含嵌套括号的 keyframes body（规范化）', () => {
        const map = extractKeyframes('@keyframes a { from { opacity: 0; } to { opacity: 1; } }')
        expect([...map.keys()]).toEqual(['a'])
        expect(map.get('a')).toBe('from{opacity:0;}to{opacity:1;}')
    })

    it('提取多个 keyframes', () => {
        const map = extractKeyframes('@keyframes x{a{}} @keyframes y{b{}}')
        expect([...map.keys()]).toEqual(['x', 'y'])
    })
})

describe('normalizeKeyframeBody', () => {
    it('忽略空白与注释', () => {
        expect(normalizeKeyframeBody('a {\n /* c */ b\n}')).toBe('a{b}')
    })
})

describe('KEYFRAME_MAP', () => {
    it('副本名唯一且非空', () => {
        const demos = KEYFRAME_MAP.map((item) => item.demo)
        expect(demos.length).toBeGreaterThan(0)
        expect(new Set(demos).size).toBe(demos.length)
    })
})

describe('checkDemoKeyframes', () => {
    it('仓库现状：副本与组件源一致', () => {
        const result = checkDemoKeyframes(REPO_ROOT)
        expect(result.errors).toEqual([])
        expect(result.ok).toBe(true)
    })

    it('副本 body 漂移时报错', () => {
        const root = createFixture({
            'motion.css': '@keyframes caomei-demo-spin { to { transform: rotate(180deg); } }',
            'src/a.vue': '@keyframes caomei-a-spin { to { transform: rotate(360deg); } }',
        })
        const result = checkDemoKeyframes(root, SMALL_OPTS)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('副本已漂移')
    })

    it('未登记的副本时报错', () => {
        const root = createFixture({
            'motion.css': '@keyframes caomei-demo-spin{to{transform:rotate(360deg)}} @keyframes caomei-demo-x{to{opacity:1}}',
            'src/a.vue': '@keyframes caomei-a-spin{to{transform:rotate(360deg)}}',
        })
        const result = checkDemoKeyframes(root, SMALL_OPTS)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('未在 KEYFRAME_MAP 登记')
    })

    it('源改名致映射悬空时报错', () => {
        const root = createFixture({
            'motion.css': '@keyframes caomei-demo-spin{to{transform:rotate(360deg)}}',
            'src/a.vue': '@keyframes caomei-a-renamed{to{transform:rotate(360deg)}}',
        })
        const result = checkDemoKeyframes(root, SMALL_OPTS)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('映射失效')
    })

    it('受检面下界收窄时报错', () => {
        const root = createFixture({
            'motion.css': '@keyframes caomei-demo-spin{to{transform:rotate(360deg)}}',
            'src/a.vue': '@keyframes caomei-a-spin{to{transform:rotate(360deg)}}',
        })
        const result = checkDemoKeyframes(root, { ...SMALL_OPTS, minDemoKeyframes: 5 })
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('受检面收窄')
    })
})
