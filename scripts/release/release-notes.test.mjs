import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { readReleaseNotes } from './release-notes.mjs'

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

function createFixture(files = {}) {
    const root = mkdtempSync(join(tmpdir(), 'release-notes-'))
    tempDirs.push(root)
    for (const [file, content] of Object.entries(files)) {
        const target = join(root, file)
        mkdirSync(join(target, '..'), { recursive: true })
        writeFileSync(target, content, 'utf8')
    }
    return root
}

describe('readReleaseNotes', () => {
    it('读取对应版本的里程碑文案', () => {
        const root = createFixture({ 'docs/release-notes/1.2.3.md': '\n## 里程碑\n\n内容\n' })
        expect(readReleaseNotes({ version: '1.2.3', root })).toBe('## 里程碑\n\n内容')
    })

    it('文件缺失时返回空串（普通发布不受影响）', () => {
        const root = createFixture()
        expect(readReleaseNotes({ version: '1.2.4', root })).toBe('')
    })

    it('拒绝非法版本', () => {
        const root = createFixture()
        expect(() => readReleaseNotes({ version: '../1.2.3', root })).toThrow(/Invalid --version/u)
    })
})
