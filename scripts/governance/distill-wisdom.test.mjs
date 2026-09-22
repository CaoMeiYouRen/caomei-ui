import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
    RECONCILE_REQUIRED_FROM,
    checkWisdom,
    countActiveEntries,
    isActiveEntryLine,
    parseArchiveSections,
    parseWisdom,
    readArchive,
    readWisdom,
    reconcileArchive,
    resolveThreshold,
    runDistillWisdom,
} from './distill-wisdom.mjs'

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

const sample = `# Session Wisdom

## 当前条目 (Active)

### 2026-09-12

- **[env] tmpdir**：可写 TMPDIR
- **[pattern] docs**：文档站链路

## 已蒸馏条目 (Historical)

- [2026-01-01] [bug] old → docs
`

describe('distill-wisdom', () => {
    const tempDirs = []

    // 仅清理本测试自建于系统临时目录下的 mkdtemp 目录
    function writeWisdom(content) {
        const dir = mkdtempSync(join(tmpdir(), 'caomei-wisdom-'))
        tempDirs.push(dir)
        const file = join(dir, 'wisdom.md')
        writeFileSync(file, content, 'utf8')
        return file
    }

    afterEach(() => {
        while (tempDirs.length > 0) {
            rmSync(tempDirs.pop(), { recursive: true, force: true })
        }
    })

    it('只统计活跃段条目，排除已蒸馏段', () => {
        expect(countActiveEntries(sample)).toBe(2)
        expect(parseWisdom(sample)).toEqual([
            '**[env] tmpdir**：可写 TMPDIR',
            '**[pattern] docs**：文档站链路',
        ])
    })

    it('忽略缩进子 bullet，只计顶层条目', () => {
        const markdown = `## 当前条目 (Active)\n\n- 顶层条目\n  - 子说明（不计入）\n- 另一条\n`
        expect(countActiveEntries(markdown)).toBe(2)
    })

    it('兼容无 bullet 的迁移摘要行', () => {
        const markdown = `## 当前条目 (Active)\n\n[2026-09-12] [env] a → docs/x.md\n- [2026-09-13] [bug] b\n`
        expect(countActiveEntries(markdown)).toBe(2)
    })

    it('兼容 CRLF 换行', () => {
        const markdown = '## 当前条目 (Active)\r\n\r\n- a\r\n- b\r\n'
        expect(countActiveEntries(markdown)).toBe(2)
    })

    it('isActiveEntryLine 识别两类条目行', () => {
        expect(isActiveEntryLine('- entry')).toBe(true)
        expect(isActiveEntryLine('[2026-09-12] [env] x')).toBe(true)
        expect(isActiveEntryLine('  - nested')).toBe(false)
        expect(isActiveEntryLine('### 2026-09-12')).toBe(false)
    })

    it('文件缺失时视为跳过且不报错', () => {
        expect(readWisdom('/nonexistent/caomei/wisdom.md')).toBeNull()
        expect(checkWisdom('/nonexistent/caomei/wisdom.md', 20)).toEqual({
            available: false,
            count: 0,
            threshold: 20,
            needsDistill: false,
        })
    })

    it('达到阈值时判定需要蒸馏', () => {
        const file = writeWisdom(sample)
        expect(checkWisdom(file, 2).needsDistill).toBe(true)
        expect(checkWisdom(file, 5).needsDistill).toBe(false)
    })

    it('阈值非法时回退默认值', () => {
        expect(resolveThreshold('abc')).toBe(20)
        expect(resolveThreshold('0')).toBe(20)
        expect(resolveThreshold('-3')).toBe(20)
        expect(resolveThreshold('15')).toBe(15)
    })

    it('CLI 输出契约：check / report / skipped', () => {
        const file = writeWisdom(sample)
        expect(runDistillWisdom(['--check'], { file }).message).toBe('WISDOM_OK: 2 active entries (threshold 20)')
        expect(runDistillWisdom(['--check', '--threshold=2'], { file }).message).toBe('WISDOM_NEEDS_DISTILL: 2 active entries (threshold 2)')
        expect(runDistillWisdom([], { file }).message).toBe('WISDOM_REPORT: 2 active entries (threshold 20)')
        expect(runDistillWisdom(['--check'], { file: '/nonexistent/caomei/wisdom.md' }).message).toBe('WISDOM_SKIPPED: wisdom not found')
    })

    /**
     * 对账样本：一个「声明与条目一致」的新批次 + 一个旧格式批次（无声明、早于对账起始批次）。
     */
    const archiveSample = `# Session 经验归档

## 2026-09-19 阶段归档蒸馏（说明）

> 本批活跃 **3 条全部处置**；归档摘要 **3 行**。

- [2026-09-18] [pattern] 甲 → docs/a.md
- [2026-09-18] [pattern] 乙 → docs/a.md
- [2026-09-18] [pattern] 丙 → docs/a.md

## 2026-09-12 与更早

- [2026-09-12] [env] 旧条目 → docs/b.md
`

    function writeArchive(content) {
        const dir = mkdtempSync(join(tmpdir(), 'caomei-archive-'))
        tempDirs.push(dir)
        const file = join(dir, 'experience-archive.md')
        writeFileSync(file, content, 'utf8')
        return file
    }

    it('解析批次段的日期、声明值与段内条目数', () => {
        const sections = parseArchiveSections(archiveSample)
        expect(sections).toHaveLength(2)
        expect(sections[0]).toMatchObject({ date: '2026-09-19', declared: 3, archivedLines: 3, bullets: 3 })
        expect(sections[1]).toMatchObject({ date: '2026-09-12', declared: null, archivedLines: null, bullets: 1 })
    })

    it('声明与条目一致时对账通过；旧批次无声明不判', () => {
        expect(reconcileArchive(archiveSample)).toEqual([])
    })

    it('对账起始批次缺声明时判 missing-declaration', () => {
        const content = archiveSample.replace('> 本批活跃 **3 条全部处置**；归档摘要 **3 行**。', '')
        const issues = reconcileArchive(content)
        expect(issues.map((issue) => issue.type)).toEqual(['missing-declaration'])
        expect(RECONCILE_REQUIRED_FROM).toBe('2026-09-14')
    })

    it('声明值与条目数不符时判 count-mismatch 与 archived-lines-mismatch', () => {
        expect(reconcileArchive(archiveSample.replace('活跃 **3 条全部处置**', '活跃 **4 条全部处置**')).map((issue) => issue.type)).toEqual(['count-mismatch'])
        expect(reconcileArchive(archiveSample.replace('归档摘要 **3 行**', '归档摘要 **5 行**')).map((issue) => issue.type)).toEqual(['archived-lines-mismatch'])
    })

    it('空归档与无任何声明分别判为拒绝空扫描通过', () => {
        expect(reconcileArchive('# Session 经验归档\n\n正文。\n').map((issue) => issue.type)).toEqual(['empty-archive'])
        const oldOnly = `## 2026-09-12 与更早\n\n- [2026-09-12] [env] 旧条目 → docs/b.md\n`
        expect(reconcileArchive(oldOnly).map((issue) => issue.type)).toEqual(['no-declaration'])
    })

    it('CLI 对账契约：通过 / 不符 exit 1 / 归档缺失 exit 1', () => {
        const ok = runDistillWisdom(['--reconcile'], { archiveFile: writeArchive(archiveSample) })
        expect(ok.message).toBe('WISDOM_ARCHIVE_OK: 2 archive sections reconciled')
        expect(ok.exitCode).toBeUndefined()

        const mismatch = runDistillWisdom(['--reconcile'], { archiveFile: writeArchive(archiveSample.replace('活跃 **3 条全部处置**', '活跃 **4 条全部处置**')) })
        expect(mismatch.exitCode).toBe(1)
        expect(mismatch.message).toContain('WISDOM_ARCHIVE_MISMATCH')
        expect(mismatch.message).toContain('count-mismatch')

        const missing = runDistillWisdom(['--reconcile'], { archiveFile: '/nonexistent/caomei/experience-archive.md' })
        expect(missing.message).toBe('WISDOM_ARCHIVE_MISSING: archive not found')
        expect(missing.exitCode).toBe(1)
    })

    it('声明写在前言之外（条目之后）时按未声明处理', () => {
        const content = [
            '## 2026-09-19 阶段归档蒸馏（说明）',
            '',
            '- [2026-09-18] [pattern] 甲 → docs/a.md',
            '',
            '> 事后补记：本批活跃 1 条。',
            '',
        ].join('\n')
        expect(parseArchiveSections(content)[0].declared).toBeNull()
        expect(reconcileArchive(content).map((issue) => issue.type)).toEqual(['missing-declaration'])
    })

    it('仓库不变量：归档各批次段计数对账通过', () => {
        const markdown = readArchive(join(PROJECT_ROOT, 'docs/design/governance/experience-archive.md'))
        expect(markdown).not.toBeNull()
        const sections = parseArchiveSections(markdown)
        expect(sections.length).toBeGreaterThanOrEqual(7)
        expect(sections.filter((section) => section.declared !== null).length).toBeGreaterThanOrEqual(5)
        expect(reconcileArchive(markdown)).toEqual([])
    })
})
