import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    EN_ONLY_PAGES,
    MIN_SCOPE_PAGES,
    MISSING_TRANSLATION_EXEMPTIONS,
    STRUCTURE_EXEMPTIONS,
    collectPageSets,
    countSections,
    findParityIssues,
    findStructureDrift,
    isInSyncScope,
    resolveTargetRoot,
    runI18nParityCheck,
} from './check-i18n-parity.mjs'

/** 自工作目录向上定位仓库根（以 `.github/skills` 为锚点）。 */
function resolveRepoRoot() {
    let dir = process.cwd()
    while (!existsSync(join(dir, '.github/skills'))) {
        const parent = dirname(dir)
        if (parent === dir) {
            throw new Error('未能定位仓库根目录')
        }
        dir = parent
    }
    return dir
}

const PROJECT_ROOT = resolveRepoRoot()
const SCRIPT_PATH = join(PROJECT_ROOT, 'scripts/docs/check-i18n-parity.mjs')

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

function createFixture(files) {
    const dir = mkdtempSync(join(tmpdir(), 'check-i18n-parity-'))
    tempDirs.push(dir)
    for (const [relativePath, content] of Object.entries(files)) {
        const file = join(dir, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    return dir
}

describe('isInSyncScope', () => {
    it.each([
        ['guide/getting-started.md', true],
        ['components/button.md', true],
        ['design/architecture.md', false],
        ['standards/development.md', false],
        ['plan/todo.md', false],
        ['examples/button/basic.vue.md', false],
    ])('%s → %s', (page, expected) => {
        expect(isInSyncScope(page)).toBe(expected)
    })
})

describe('countSections', () => {
    it('只统计围栏外的 H2 / H3', () => {
        const content = ['# 标题', '## 一节', '### 小节', '```md', '## 围栏内', '### 围栏内', '```', '## 二节'].join('\n')
        expect(countSections(content)).toEqual({ h2: 2, h3: 1 })
    })
})

describe('findParityIssues', () => {
    it('同步范围内缺英文版判 missing-translation；范围外不判', () => {
        const issues = findParityIssues(['guide/a.md', 'components/b.md', 'design/c.md'], [], { enOnlyPages: {} })
        expect(issues.map((issue) => `${issue.type}:${issue.page}`)).toEqual([
            'missing-translation:guide/a.md',
            'missing-translation:components/b.md',
        ])
    })

    it('英文页缺中文源判 orphan-translation；登记的纯英文落地页放行', () => {
        expect(findParityIssues([], ['design/x.md'], { enOnlyPages: {} }).map((issue) => issue.type)).toEqual(['orphan-translation'])
        expect(findParityIssues([], ['plan/index.md']).map((issue) => issue.type)).toEqual([])
    })

    it('豁免项登记的中文页已不存在时同样报出（防惰性登记）', () => {
        expect(findParityIssues([], [], { enOnlyPages: {}, missingExemptions: { 'guide/gone.md': '暂缓' } }).map((issue) => issue.type)).toEqual(['stale-exemption'])
    })

    it('登记的纯英文落地页已不存在时同样报出（防惰性登记）', () => {
        expect(findParityIssues([], [], { enOnlyPages: { 'plan/index.md': '理由' } }).map((issue) => issue.type)).toEqual(['stale-en-only'])
    })

    it('豁免腐烂两向检查：豁免项已补齐 / 落地页已有中文源', () => {
        const reg = { enOnlyPages: {} }
        expect(findParityIssues(['guide/a.md'], ['guide/a.md'], { ...reg, missingExemptions: { 'guide/a.md': '暂缓' } }).map((issue) => issue.type)).toEqual(['stale-exemption'])
        expect(findParityIssues(['plan/index.md'], ['plan/index.md'], { enOnlyPages: { 'plan/index.md': '理由' } }).map((issue) => issue.type)).toEqual(['stale-en-only'])
        expect(findParityIssues(['guide/a.md'], [], { ...reg, missingExemptions: { 'guide/a.md': '暂缓' } })).toEqual([])
    })
})

describe('findStructureDrift', () => {
    const zh = '## 一\n\n## 二\n\n### 小节\n'
    it('章节数不一致判 structure-drift，登记豁免后放行', () => {
        const pair = { page: 'guide/a.md', zh, en: '## 一\n' }
        expect(findStructureDrift([pair], {}).map((issue) => issue.type)).toEqual(['structure-drift'])
        expect(findStructureDrift([pair], { 'guide/a.md': '有意差异' })).toEqual([])
    })

    it('豁免腐烂：章节数已一致但登记仍在 → stale-structure-exemption', () => {
        const pair = { page: 'guide/a.md', zh, en: zh }
        expect(findStructureDrift([pair], { 'guide/a.md': '有意差异' }).map((issue) => issue.type)).toEqual(['stale-structure-exemption'])
        expect(findStructureDrift([pair], {})).toEqual([])
    })

    it('豁免腐烂：登记页已不在受检对中（改名 / 英文缺失）同样报出', () => {
        expect(findStructureDrift([], { 'guide/gone.md': '有意差异' }).map((issue) => issue.type)).toEqual(['stale-structure-exemption'])
    })
})

describe('collectPageSets', () => {
    it('中文页排除 i18n/，英文页取自 i18n/<locale>/', () => {
        const root = createFixture({
            'docs/guide/a.md': '# a\n',
            'docs/design/b.md': '# b\n',
            'docs/i18n/en-US/guide/a.md': '# a\n',
        })
        expect(collectPageSets(join(root, 'docs'))).toEqual({
            zhPages: ['design/b.md', 'guide/a.md'],
            enPages: ['guide/a.md'],
        })
    })
})

describe('runI18nParityCheck', () => {
    it('范围达标且配对一致时零问题', () => {
        const root = createFixture({
            'docs/guide/a.md': '## 一\n\n## 二\n',
            'docs/design/b.md': '## 一\n',
            'docs/i18n/en-US/guide/a.md': '## One\n\n## Two\n',
            'docs/i18n/en-US/plan/index.md': '# Plan\n',
        })
        const result = runI18nParityCheck(root, {
            minScopePages: 1,
            syncScopePrefixes: ['guide/'],
            enOnlyPages: { 'plan/index.md': '登记为纯英文区落地页' },
            structureExemptions: {},
        })
        expect(result.issues).toEqual([])
        expect(result.scopedPages).toBe(1)
        expect(result.pairs).toBe(1)
    })

    it('缺英文版与章节数不一致均能在整体检查中被报出（接线级）', () => {
        const missing = createFixture({
            'docs/guide/a.md': '## 一\n',
            'docs/guide/b.md': '## 一\n',
            'docs/i18n/en-US/guide/a.md': '## One\n',
        })
        expect(runI18nParityCheck(missing, { minScopePages: 1, syncScopePrefixes: ['guide/'], enOnlyPages: {}, structureExemptions: {} }).issues.map((issue) => `${issue.type}:${issue.page}`)).toEqual([
            'missing-translation:guide/b.md',
        ])

        const drift = createFixture({
            'docs/guide/a.md': '## 一\n\n## 二\n',
            'docs/i18n/en-US/guide/a.md': '## One\n',
        })
        expect(runI18nParityCheck(drift, { minScopePages: 1, syncScopePrefixes: ['guide/'], enOnlyPages: {}, structureExemptions: {} }).issues.map((issue) => `${issue.type}:${issue.page}`)).toEqual([
            'structure-drift:guide/a.md',
        ])
    })

    it('某前缀整体为空时判 scope-prefix-empty（总数下界盖不住）', () => {
        const root = createFixture({
            'docs/components/a.md': '## 一\n',
            'docs/i18n/en-US/components/a.md': '## One\n',
        })
        const result = runI18nParityCheck(root, { minScopePages: 1, enOnlyPages: {}, structureExemptions: {} })
        expect(result.scopedPages).toBe(1)
        expect(result.issues.map((issue) => issue.type)).toEqual(['scope-prefix-empty'])
    })

    it('范围低于下界判 scope-narrowed；空集合判 empty-scan', () => {
        const root = createFixture({
            'docs/guide/a.md': '## 一\n',
            'docs/i18n/en-US/guide/a.md': '## One\n',
        })
        expect(runI18nParityCheck(root, { minScopePages: 5, syncScopePrefixes: ['guide/'], enOnlyPages: {}, structureExemptions: {} }).issues.map((issue) => issue.type)).toEqual(['scope-narrowed'])

        const empty = createFixture({ '.github/keep': '' })
        expect(runI18nParityCheck(empty).issues.map((issue) => issue.type)).toEqual(['empty-scan'])
    })
})

describe('resolveTargetRoot', () => {
    it('未知参数与非仓库目录按错误返回，含 package.json 者被接受', () => {
        expect(resolveTargetRoot('--verbose').error).toContain('不支持的参数')
        expect(resolveTargetRoot(join(tmpdir(), 'missing-root-xyz')).error).toContain('不是仓库根')
        const root = createFixture({ 'package.json': '{}' })
        expect(resolveTargetRoot(root, '/repo')).toEqual({ root, error: null })
    })
})

describe('CLI 退出码', () => {
    it('非法目标目录按失败退出', () => {
        const missing = spawnSync(process.execPath, [SCRIPT_PATH, join(tmpdir(), 'missing-root-xyz')], { encoding: 'utf8' })
        expect(missing.status).toBe(1)
        expect(missing.stderr).toContain('不是仓库根')
    })

    it('仓库自身通过时 exit 0 并打印受检面计数', () => {
        const result = spawnSync(process.execPath, [SCRIPT_PATH], { encoding: 'utf8' })
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('同步范围')
    })
})

describe('仓库不变量', () => {
    it('受检范围未被静默收窄，登记表仍有效，且当前仓库零问题', () => {
        const result = runI18nParityCheck(PROJECT_ROOT)
        expect(result.scopedPages).toBeGreaterThanOrEqual(MIN_SCOPE_PAGES)
        expect(result.pairs).toBe(result.scopedPages)
        expect(result.issues).toEqual([])
        for (const page of Object.keys(EN_ONLY_PAGES)) {
            expect(existsSync(join(PROJECT_ROOT, 'docs/i18n/en-US', page))).toBe(true)
        }
        for (const page of Object.keys(MISSING_TRANSLATION_EXEMPTIONS)) {
            expect(isInSyncScope(page)).toBe(true)
            expect(existsSync(join(PROJECT_ROOT, 'docs', page))).toBe(true)
        }
        for (const page of Object.keys(STRUCTURE_EXEMPTIONS)) {
            expect(isInSyncScope(page)).toBe(true)
            expect(existsSync(join(PROJECT_ROOT, 'docs', page))).toBe(true)
            expect(existsSync(join(PROJECT_ROOT, 'docs/i18n/en-US', page))).toBe(true)
        }
    })
})
