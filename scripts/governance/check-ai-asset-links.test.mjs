import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    collectAssetFiles,
    extractHeadings,
    extractLinks,
    githubSlug,
    scanAssets,
    scanFile,
    SCOPE_FLOOR,
    stripCode,
} from './check-ai-asset-links.mjs'

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

function createFixture(files) {
    const dir = mkdtempSync(join(tmpdir(), 'check-ai-asset-links-'))
    tempDirs.push(dir)
    for (const [relativePath, content] of Object.entries(files)) {
        const file = join(dir, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    return dir
}

describe('githubSlug', () => {
    it('数字开头标题不补前缀（与 VitePress 相反）', () => {
        expect(githubSlug('5. 任务粒度约束')).toBe('5-任务粒度约束')
        expect(githubSlug('4. 阶段与条目命名')).toBe('4-阶段与条目命名')
    })

    it('去标点、空格转连字符、保留 CJK', () => {
        expect(githubSlug('审计调用协议（audit-depth 与时间盒）')).toBe('审计调用协议audit-depth-与时间盒')
    })
})

describe('extractHeadings / stripCode / extractLinks', () => {
    it('抽取标题为 GitHub slug', () => {
        expect(extractHeadings('## 5. 任务粒度约束\n## A/B\n')).toEqual(['5-任务粒度约束', 'ab'])
    })

    it('剥离围栏与行内 code span', () => {
        const stripped = stripCode(['```', '](a.md#x)', '```', '`](b.md#y)`', '](c.md#z)'].join('\n'))
        expect(stripped).not.toContain('a.md')
        expect(stripped).not.toContain('b.md')
        expect(stripped).toContain('c.md')
    })

    it('抽取行内链接目标', () => {
        expect(extractLinks('见 [X](a.md#b) 与 [Y](./c.md)')).toEqual(['a.md#b', './c.md'])
    })
})

describe('scanFile', () => {
    it('GitHub slug 锚点有效时不报', () => {
        const dir = createFixture({ 'target.md': '## 5. 任务粒度约束\n' })
        const file = join(dir, 'source.md')
        writeFileSync(file, '见 [规范](target.md#5-任务粒度约束)')
        expect(scanFile(file, '见 [规范](target.md#5-任务粒度约束)')).toEqual([])
    })

    it('误用 VitePress slug（带 _）时报 bad-anchor', () => {
        const dir = createFixture({ 'target.md': '## 5. 任务粒度约束\n' })
        writeFileSync(join(dir, 'source.md'), '见 [规范](target.md#_5-任务粒度约束)')
        const issues = scanFile(join(dir, 'source.md'), '见 [规范](target.md#_5-任务粒度约束)')
        expect(issues.map((issue) => issue.code)).toEqual(['bad-anchor'])
    })

    it('目标文件不存在时报 missing-target', () => {
        const dir = createFixture({ 'source.md': '见 [缺失](nope.md#x)' })
        const issues = scanFile(join(dir, 'source.md'), '见 [缺失](nope.md#x)')
        expect(issues.map((issue) => issue.code)).toEqual(['missing-target'])
    })

    it('code span 内的示例链接不参与判定', () => {
        const dir = createFixture({ 'source.md': '示例 `见 [X](./xxx.md)`' })
        const issues = scanFile(join(dir, 'source.md'), '示例 `见 [X](./xxx.md)`')
        expect(issues).toEqual([])
    })
})

describe('collectAssetFiles / scanAssets', () => {
    it('收集入口文件与 .github 下的 md', () => {
        const dir = createFixture({
            'AGENTS.md': '# agents',
            'CLAUDE.md': '# claude',
            '.github/skills/demo/SKILL.md': '# demo',
            'docs/standards/x.md': '# docs（不在受检面）',
        })
        const files = collectAssetFiles(dir).map((file) => file.slice(dir.length + 1))
        expect(files).toEqual(['.github/skills/demo/SKILL.md', 'AGENTS.md', 'CLAUDE.md'])
    })

    it('下界与哨兵在下界收窄时触发', () => {
        const dir = createFixture({ 'AGENTS.md': '# agents' })
        const { issues } = scanAssets(dir, { enforceScope: true })
        expect(issues.some((issue) => issue.code === 'scope-narrowed')).toBe(true)
        expect(issues.some((issue) => issue.code === 'sentinel-missing')).toBe(true)
    })
})

describe('仓库不变量', () => {
    it('当前 AI 资产链接与 GitHub slug 锚点全部有效', () => {
        const cwdRoot = process.cwd()
        const { files, issues } = scanAssets(cwdRoot, { enforceScope: true })
        expect(issues).toEqual([])
        expect(files.length).toBeGreaterThanOrEqual(SCOPE_FLOOR.files)
    })
})
