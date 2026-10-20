import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { generateChangelog, parseArgs, readPackageField, stripEmptyUnreleasedSection, validateOptions } from './generate-changelog.mjs'

const tempDirs = []

function createGitFixture() {
    const dir = mkdtempSync(join(tmpdir(), 'generate-changelog-'))
    tempDirs.push(dir)
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'fixture-ui', changelog: { language: 'zh' } }))

    const git = (...args) => execFileSync('git', args, { cwd: dir, stdio: 'pipe' })
    git('init', '--quiet')
    git('config', 'user.email', 'fixture@example.com')
    git('config', 'user.name', 'Fixture')
    git('remote', 'add', 'origin', 'https://github.com/example/fixture-ui.git')
    git('commit', '--quiet', '--allow-empty', '-m', 'feat(core): 新增核心能力')
    git('commit', '--quiet', '--allow-empty', '-m', 'fix(core): 修复边界问题')
    git('commit', '--quiet', '--allow-empty', '-m', 'refactor(core)!: 破坏性调整', '-m', 'BREAKING CHANGE: 调整公共契约')

    return dir
}

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

describe('stripEmptyUnreleasedSection', () => {
    it('移除空的 Unreleased 段（含分隔线）', () => {
        const content = '# fixture-ui\n\n# Unreleased (2026-10-20)\n\n---\n\n# [0.7.0](url) (2026-10-20)\n\n### 新功能\n'
        expect(stripEmptyUnreleasedSection(content)).toBe('# fixture-ui\n\n# [0.7.0](url) (2026-10-20)\n\n### 新功能\n')
    })

    it('移除无下一个版本标题的空 Unreleased 段', () => {
        const content = '# fixture-ui\n\n# Unreleased (2026-10-20)\n\n---\n'
        expect(stripEmptyUnreleasedSection(content)).toBe('# fixture-ui\n\n')
    })

    it('空串 / 只有分隔线时原样返回', () => {
        expect(stripEmptyUnreleasedSection('')).toBe('')
        expect(stripEmptyUnreleasedSection('---\n')).toBe('---\n')
    })

    it('保留有内容的 Unreleased 段与相邻版本', () => {
        const content = '# fixture-ui\n\n# Unreleased (2026-10-20)\n\n* 尚未发布\n\n# [0.7.0](url) (2026-10-20)\n'
        const stripped = stripEmptyUnreleasedSection(content)
        expect(stripped).toContain('# Unreleased')
        expect(stripped).toContain('尚未发布')
        expect(stripped).toContain('# [0.7.0](url) (2026-10-20)')
    })
})

describe('generate-changelog', () => {
    it('parseArgs 解析 --key=value 形式', () => {
        const options = parseArgs(['node', 'script', '--version=0.1.0', '--date=2026-09-19'])
        expect(options).toEqual({ version: '0.1.0', date: '2026-09-19' })
    })

    it('parseArgs 拒绝空格分隔形式', () => {
        expect(() => parseArgs(['node', 'script', '--date', '2026-09-19'])).toThrow(/Unsupported argument/u)
    })

    it('validateOptions 拒绝非法版本与日期', () => {
        expect(() => validateOptions({ version: 'abc' })).toThrow(/Invalid --version/u)
        expect(() => validateOptions({ date: '2026/09/19' })).toThrow(/Invalid --date/u)
        expect(() => validateOptions({ version: '0.1.0', date: '2026-09-19' })).not.toThrow()
    })

    it('readPackageField 读取指定仓库根的字段', async () => {
        const root = createGitFixture()
        expect(await readPackageField('name', root)).toBe('fixture-ui')
        // git 夹具与读取都要派生 git 子进程；全量并行负载下默认 5s 上限可能不足，显式放宽（非掩盖挂起）
    }, 30_000)

    it('指定版本且同名 tag 已存在时不输出空 Unreleased 段', async () => {
        const root = createGitFixture()
        // tag 落在中间提交：模拟「版本 tag 已建立后再用同名版本重生成」的形态。
        execFileSync('git', ['tag', 'v0.0.1', 'HEAD~1'], { cwd: root, stdio: 'pipe' })
        const content = await generateChangelog({ version: '0.1.0', date: '2026-09-19', root })

        expect(content).not.toContain('# Unreleased')
        expect(content).toContain('# [0.1.0]')
        expect(content).toContain('(2026-09-19)')
        expect(content).toContain('## [0.0.1]')
    }, 30_000)

    it('生成结果按预设分组，保留 BREAKING CHANGES 且不产生 issue 链接', async () => {
        const root = createGitFixture()
        const content = await generateChangelog({ version: '0.1.0', date: '2026-09-19', root })

        expect(content.startsWith('# fixture-ui')).toBe(true)
        expect(content).toContain('# 0.1.0 (2026-09-19)')
        expect(content).toContain('### ✨ 新功能')
        expect(content).toContain('### 🐛 Bug 修复')
        expect(content).toContain('### 💥 BREAKING CHANGES')
        expect(content).not.toContain('### 📝 文档')
        expect(content).not.toContain('/issues/')
        expect(content).not.toContain('closes')
        // 同上：夹具构建 + changelog 生成共用 git 子进程，显式放宽超时
    }, 30_000)
})
