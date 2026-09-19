import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { generateChangelog, parseArgs, readPackageField, validateOptions } from './generate-changelog.mjs'

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
    })

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
    })
})
