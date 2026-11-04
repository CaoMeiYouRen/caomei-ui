import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { syncVersionStatements } from './sync-version-statements.mjs'

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

function createFixture({ readme = '当前版本：`1.0.0`\n', readmeEn = 'Current version is `1.0.0`\n', roadmap = '当前状态：当前版本 `1.0.0`\n' } = {}) {
    const root = mkdtempSync(join(tmpdir(), 'sync-version-statements-'))
    tempDirs.push(root)
    const write = (file, content) => {
        mkdirSync(dirname(join(root, file)), { recursive: true })
        writeFileSync(join(root, file), content, 'utf8')
    }
    write('package.json', JSON.stringify({ name: 'fixture-ui', version: '1.1.0' }))
    write('README.md', readme)
    write('README.en-US.md', readmeEn)
    write('docs/plan/roadmap.md', roadmap)
    return root
}

describe('syncVersionStatements', () => {
    it('同步三份版本句并返回改写文件', () => {
        const root = createFixture()
        const changed = syncVersionStatements({ version: '1.1.0', root })

        expect(changed.sort()).toEqual(['README.en-US.md', 'README.md', 'docs/plan/roadmap.md'])
        expect(readFileSync(join(root, 'README.md'), 'utf8')).toContain('`1.1.0`')
        expect(readFileSync(join(root, 'README.en-US.md'), 'utf8')).toContain('`1.1.0`')
        expect(readFileSync(join(root, 'docs/plan/roadmap.md'), 'utf8')).toContain('`1.1.0`')
    })

    it('已是目标版本时不改写', () => {
        const root = createFixture()
        syncVersionStatements({ version: '1.1.0', root })
        expect(syncVersionStatements({ version: '1.1.0', root })).toEqual([])
    })

    it('句式锚点缺失时 fail-closed', () => {
        const root = createFixture({ readme: '没有版本句\n' })
        expect(() => syncVersionStatements({ version: '1.1.0', root })).toThrow(/未匹配到/u)
    })

    it('锚点缺失时不留下部分改写', () => {
        const root = createFixture({ readme: '没有版本句\n' })
        expect(() => syncVersionStatements({ version: '1.1.0', root })).toThrow(/未匹配到/u)
        expect(readFileSync(join(root, 'README.en-US.md'), 'utf8')).toContain('`1.0.0`')
        expect(readFileSync(join(root, 'docs/plan/roadmap.md'), 'utf8')).toContain('`1.0.0`')
    })

    it('roadmap 版本句与发布日期 / 下一目标同句时拒绝同步', () => {
        const root = createFixture({
            roadmap: '当前状态：当前版本 `1.0.0`（2026-11-03 发布），下一目标版本 `1.1.0`。\n',
        })
        expect(() => syncVersionStatements({ version: '1.1.0', root })).toThrow(/不得与发布日期/u)
    })

    it('拒绝非法版本', () => {
        const root = createFixture()
        expect(() => syncVersionStatements({ version: 'latest', root })).toThrow(/Invalid --version/u)
    })
})
