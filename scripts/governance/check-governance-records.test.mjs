import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    INDEX_FILE,
    checkGovernanceIndex,
    collectIndexEntries,
    collectMarkdownFiles,
    collectPlanningPointerIssues,
    collectRecordFiles,
    resolveLinkTarget,
    resolveTargetRoot,
    runGovernanceRecordsCheck,
} from './check-governance-records.mjs'

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
const SCRIPT_PATH = join(PROJECT_ROOT, 'scripts/governance/check-governance-records.mjs')

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

/** 构造最小仓库夹具，返回仓库根目录。 */
function createFixture(files) {
    const dir = mkdtempSync(join(tmpdir(), 'check-governance-records-'))
    tempDirs.push(dir)
    for (const [relativePath, content] of Object.entries(files)) {
        const file = join(dir, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    return dir
}

const INDEX_WITH_ENTRY = '# 治理索引\n\n## 当前条目\n\n- [记录甲](./record-a.md)：说明\n'
const RECORD_A = '# 记录甲\n\n正文。\n'

describe('collectRecordFiles', () => {
    it('收录治理记录目录下的 md 并排除索引自身', () => {
        const root = createFixture({
            '.github/keep': '',
            'docs/design/governance/index.md': INDEX_WITH_ENTRY,
            'docs/design/governance/record-a.md': RECORD_A,
            'docs/design/governance/experience-archive.md': '# 经验归档\n',
            'docs/design/governance/nested/record-c.md': '# 记录丙\n',
        })
        expect(collectRecordFiles(root)).toEqual([
            'docs/design/governance/experience-archive.md',
            'docs/design/governance/record-a.md',
        ])
    })

    it('目录缺失时返回空列表（由上层判为 missing-index / empty-record-set）', () => {
        const root = createFixture({ '.github/keep': '' })
        expect(collectRecordFiles(root)).toEqual([])
    })
})

describe('collectIndexEntries', () => {
    it('只收录解析后位于治理记录目录内的链接，并给出行号', () => {
        const root = createFixture({
            '.github/keep': '',
            'docs/design/governance/index.md': [
                '# 治理索引',
                '',
                '- [记录甲](./record-a.md)',
                '- [外部](https://example.com/record.md)',
                '- [规范](../../standards/planning.md)',
                '- [锚点](#当前条目)',
            ].join('\n'),
            'docs/design/governance/record-a.md': RECORD_A,
        })
        const { indexExists, entries } = collectIndexEntries(root)
        expect(indexExists).toBe(true)
        expect(entries).toEqual([expect.objectContaining({ target: 'docs/design/governance/record-a.md', line: 3 })])
    })

    it('排除治理目录下的嵌套路径（记录目录为平铺结构）', () => {
        const root = createFixture({
            '.github/keep': '',
            'docs/design/governance/index.md': '# 治理索引\n\n- [记录甲](./record-a.md)\n- [嵌套](./nested/record-c.md)\n',
            'docs/design/governance/record-a.md': RECORD_A,
            'docs/design/governance/nested/record-c.md': '# 记录丙\n',
        })
        const { entries } = collectIndexEntries(root)
        expect(entries.map((entry) => entry.target)).toEqual(['docs/design/governance/record-a.md'])
        expect(checkGovernanceIndex(root)).toEqual([])
    })
})

describe('checkGovernanceIndex', () => {
    it('记录文件未被索引收录时判 missing-from-index', () => {
        const root = createFixture({
            '.github/keep': '',
            'docs/design/governance/index.md': INDEX_WITH_ENTRY,
            'docs/design/governance/record-a.md': RECORD_A,
            'docs/design/governance/record-b.md': '# 记录乙\n',
        })
        expect(checkGovernanceIndex(root).map((issue) => issue.type)).toEqual(['missing-from-index'])
        expect(checkGovernanceIndex(root)[0].message).toContain('record-b.md')
    })

    it('索引指向不存在的记录文件时判 dangling-index-entry', () => {
        const root = createFixture({
            '.github/keep': '',
            'docs/design/governance/index.md': '# 治理索引\n\n- [记录甲](./record-a.md)\n- [已删](./gone.md)\n',
            'docs/design/governance/record-a.md': RECORD_A,
        })
        const issues = checkGovernanceIndex(root)
        expect(issues).toHaveLength(1)
        expect(issues[0]).toMatchObject({ type: 'dangling-index-entry', line: 4 })
    })

    it('索引缺失、记录集为空与索引无链接分别判为对应问题（拒绝空扫描通过）', () => {
        const missingIndex = createFixture({ '.github/keep': '', 'docs/design/governance/record-a.md': RECORD_A })
        expect(checkGovernanceIndex(missingIndex).map((issue) => issue.type)).toEqual(['missing-index'])

        const emptyRecords = createFixture({ '.github/keep': '', 'docs/design/governance/index.md': INDEX_WITH_ENTRY })
        expect(checkGovernanceIndex(emptyRecords).map((issue) => issue.type)).toEqual(['empty-record-set'])

        const emptyIndex = createFixture({
            '.github/keep': '',
            'docs/design/governance/index.md': '# 治理索引\n\n暂无条目。\n',
            'docs/design/governance/record-a.md': RECORD_A,
        })
        expect(checkGovernanceIndex(emptyIndex).map((issue) => issue.type)).toEqual(['empty-index'])
    })

    it('索引与记录集合一致时零问题', () => {
        const root = createFixture({
            '.github/keep': '',
            'docs/design/governance/index.md': INDEX_WITH_ENTRY,
            'docs/design/governance/record-a.md': RECORD_A,
        })
        expect(checkGovernanceIndex(root)).toEqual([])
    })
})

describe('collectPlanningPointerIssues', () => {
    const PLAN_FILES = {
        'docs/plan/todo.md': '# 待办事项\n\n## 当前阶段\n\n### Phase 12：进行中\n',
        'docs/plan/todo-archive.md': '# 待办归档\n\n## Phase 10：国际化与移动端适配\n',
    }

    it('链接文字含阶段编号而目标已无该标识时判失效指针', () => {
        const root = createFixture({
            '.github/keep': '',
            ...PLAN_FILES,
            'docs/design/governance/r.md': '登记为 [Phase 10](../../plan/todo.md)。\n',
        })
        const issues = collectPlanningPointerIssues(root)
        expect(issues).toEqual([
            expect.objectContaining({
                type: 'stale-planning-pointer',
                file: 'docs/design/governance/r.md',
                line: 1,
            }),
        ])
        expect(issues[0].message).toContain('Phase 10')
    })

    it('改指归档后零问题', () => {
        const root = createFixture({
            '.github/keep': '',
            ...PLAN_FILES,
            'docs/design/governance/r.md': '登记为 [Phase 10](../../plan/todo-archive.md)。\n',
        })
        expect(collectPlanningPointerIssues(root)).toEqual([])
    })

    it('链接文字无规划标识、目标非规划载体、标识当前仍存在时均不判', () => {
        const root = createFixture({
            '.github/keep': '',
            ...PLAN_FILES,
            'docs/design/governance/a.md': '见 [待办事项](../../plan/todo.md) 的状态段。\n',
            'docs/design/governance/b.md': '见 [Phase 10](../../standards/planning.md) 的写法。\n',
            'docs/design/governance/c.md': '见 [Phase 12](../../plan/todo.md) 的条目表。\n',
        })
        expect(collectPlanningPointerIssues(root)).toEqual([])
    })

    it('兼容省略 .md 的链接写法', () => {
        const root = createFixture({
            '.github/keep': '',
            ...PLAN_FILES,
            'docs/design/governance/r.md': '登记为 [Phase 10](../../plan/todo)。\n',
        })
        expect(collectPlanningPointerIssues(root)).toHaveLength(1)
    })

    it('兼容带 title 的链接写法', () => {
        const root = createFixture({
            '.github/keep': '',
            ...PLAN_FILES,
            'docs/design/governance/r.md': '登记为 [Phase 10](../../plan/todo.md "标题")。\n',
        })
        expect(collectPlanningPointerIssues(root)).toHaveLength(1)
    })
})

describe('resolveLinkTarget', () => {
    it('外部链接、站内锚点与站点根路径返回 null', () => {
        const root = createFixture({ '.github/keep': '', 'docs/a.md': '# a\n' })
        expect(resolveLinkTarget(root, 'docs/a.md', 'https://example.com/x.md')).toBeNull()
        expect(resolveLinkTarget(root, 'docs/a.md', '#anchor')).toBeNull()
        expect(resolveLinkTarget(root, 'docs/a.md', '/guide/x')).toBeNull()
    })

    it('解析相对链接并兼容省略 .md', () => {
        const root = createFixture({
            '.github/keep': '',
            'docs/a.md': '# a\n',
            'docs/b.md': '# b\n',
        })
        expect(resolveLinkTarget(root, 'docs/a.md', './b.md')).toBe('docs/b.md')
        expect(resolveLinkTarget(root, 'docs/a.md', './b')).toBe('docs/b.md')
    })

    it('越出仓库根与目标不存在时返回 null', () => {
        const root = createFixture({ '.github/keep': '', 'docs/a.md': '# a\n' })
        expect(resolveLinkTarget(root, 'docs/a.md', '../../outside.md')).toBeNull()
        expect(resolveLinkTarget(root, 'docs/a.md', './missing.md')).toBeNull()
    })
})

describe('resolveTargetRoot', () => {
    it('未传参时回退到默认根目录', () => {
        expect(resolveTargetRoot(undefined, '/repo')).toEqual({ root: '/repo', error: null })
    })

    it('未知参数与非法目录按错误返回，不静默放行', () => {
        expect(resolveTargetRoot('--verbose').error).toContain('不支持的参数')
        expect(resolveTargetRoot(join(tmpdir(), 'missing-root-xyz')).error).toContain('不是仓库根')
    })

    it('含 .github/ 的目录被接受', () => {
        const repoRoot = createFixture({ '.github/agents/reviewer.agent.md': '# agent' })
        expect(resolveTargetRoot(repoRoot, '/repo')).toEqual({ root: repoRoot, error: null })
    })
})

describe('CLI 退出码', () => {
    it('非法目标目录按失败退出', () => {
        const missing = spawnSync(process.execPath, [SCRIPT_PATH, join(tmpdir(), 'missing-root-xyz')], { encoding: 'utf8' })
        expect(missing.status).toBe(1)
        expect(missing.stderr).toContain('不是仓库根')

        const unknownFlag = spawnSync(process.execPath, [SCRIPT_PATH, '--verbose'], { encoding: 'utf8' })
        expect(unknownFlag.status).toBe(1)
        expect(unknownFlag.stderr).toContain('不支持的参数')
    })

    it('存在失效指针时 exit 1，并在 stderr 报出类型与修复方向', () => {
        const root = createFixture({
            '.github/keep': '',
            'docs/plan/todo.md': '# 待办事项\n\n## 当前阶段\n',
            'docs/design/governance/index.md': INDEX_WITH_ENTRY,
            'docs/design/governance/record-a.md': '登记为 [Phase 10](../../plan/todo.md)。\n',
        })
        const result = spawnSync(process.execPath, [SCRIPT_PATH, root], { encoding: 'utf8' })
        expect(result.status).toBe(1)
        expect(result.stderr).toContain('stale-planning-pointer')
        expect(result.stderr).toContain('修复方向')
    })

    it('索引与指针均无问题时 exit 0 并打印通过信息', () => {
        const root = createFixture({
            '.github/keep': '',
            'docs/design/governance/index.md': INDEX_WITH_ENTRY,
            'docs/design/governance/record-a.md': RECORD_A,
        })
        const result = spawnSync(process.execPath, [SCRIPT_PATH, root], { encoding: 'utf8' })
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('OK')
    })
})

describe('仓库不变量', () => {
    it('受检范围未被静默收窄', () => {
        const records = collectRecordFiles(PROJECT_ROOT)
        expect(records.length).toBeGreaterThanOrEqual(50)
        expect(records).not.toContain(INDEX_FILE)
        expect(records).toContain(`docs/design/governance/experience-archive.md`)

        const { indexExists, entries } = collectIndexEntries(PROJECT_ROOT)
        expect(indexExists).toBe(true)
        expect(entries.length).toBeGreaterThanOrEqual(50)

        const markdownFiles = collectMarkdownFiles(PROJECT_ROOT)
        expect(markdownFiles.length).toBeGreaterThanOrEqual(200)
        expect(markdownFiles).toContain(INDEX_FILE)
        expect(markdownFiles).toContain('docs/plan/todo.md')
    })

    it('当前仓库治理索引与历史规划指针零问题', () => {
        const { indexIssues, pointerIssues } = runGovernanceRecordsCheck(PROJECT_ROOT)
        expect(indexIssues).toEqual([])
        expect(pointerIssues).toEqual([])
    })
})
