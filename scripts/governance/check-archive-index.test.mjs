import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    ARCHIVE_DIR,
    checkArchiveIndex,
    ISSUE_CODES,
    linkTargets,
    sameDirFile,
} from './check-archive-index.mjs'

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

function createFixture(files) {
    const dir = mkdtempSync(join(tmpdir(), 'check-archive-index-'))
    tempDirs.push(dir)
    for (const [relativePath, content] of Object.entries(files)) {
        const file = join(dir, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    return dir
}

function archive(files, index) {
    const fixture = {}
    for (const name of files) {
        fixture[`${ARCHIVE_DIR}/${name}`] = `# ${name}\n`
    }
    fixture[`${ARCHIVE_DIR}/index.md`] = index
    return createFixture(fixture)
}

const validIndex = [
    '# 索引',
    '',
    '| 文件 | 范围 |',
    '|:---|:---|',
    '| [todo-archive-phases-00-06.md](./todo-archive-phases-00-06.md) | Phase 0 ~ 6 |',
    '| [todo-archive-phases-07-12.md](./todo-archive-phases-07-12.md) | Phase 7 ~ 12 |',
].join('\n')

describe('linkTargets / sameDirFile', () => {
    it('提取链接目标并剥离锚点', () => {
        expect(linkTargets('[a](./a.md#x) 和 [b](https://x)')).toEqual(['./a.md', 'https://x'])
    })

    it('只接受同目录 md', () => {
        expect(sameDirFile('./a.md')).toBe('a.md')
        expect(sameDirFile('a.md#x')).toBe('a.md')
        expect(sameDirFile('../a.md')).toBe(null)
        expect(sameDirFile('https://x/a.md')).toBe(null)
        expect(sameDirFile('./index.md')).toBe(null)
    })
})

describe('checkArchiveIndex', () => {
    it('命名与索引一致时通过', () => {
        const root = archive(['todo-archive-phases-00-06.md', 'todo-archive-phases-07-12.md'], validIndex)
        const result = checkArchiveIndex(root, { minFiles: 1 })
        expect(result.issues).toEqual([])
        expect(result.files).toHaveLength(2)
    })

    it('旧命名判 naming', () => {
        const root = archive(['phase-00-06.md', 'todo-archive-phases-07-12.md'], validIndex)
        expect(checkArchiveIndex(root, { minFiles: 1 }).issues.some((i) => i.code === ISSUE_CODES.naming)).toBe(true)
    })

    it('分片未入索引判 missing-index', () => {
        const root = archive(['todo-archive-phases-00-06.md', 'todo-archive-phases-07-12.md', 'todo-archive-phases-13-17.md'], validIndex)
        expect(checkArchiveIndex(root, { minFiles: 1 }).issues.some((i) => i.code === ISSUE_CODES.missingIndex)).toBe(true)
    })

    it('索引指向不存在文件判 missing-file', () => {
        const index = validIndex.replace('todo-archive-phases-07-12.md)', 'todo-archive-phases-99.md)')
        const root = archive(['todo-archive-phases-00-06.md', 'todo-archive-phases-07-12.md'], index)
        const issues = checkArchiveIndex(root, { minFiles: 1 }).issues
        expect(issues.some((i) => i.code === ISSUE_CODES.missingFile)).toBe(true)
        expect(issues.some((i) => i.code === ISSUE_CODES.missingIndex)).toBe(true)
    })

    it('索引表重复目标判 duplicate-index-row', () => {
        const index = `${validIndex}\n| [again](./todo-archive-phases-00-06.md) | 重复 |`
        const root = archive(['todo-archive-phases-00-06.md', 'todo-archive-phases-07-12.md'], index)
        expect(checkArchiveIndex(root, { minFiles: 1 }).issues.some((i) => i.code === ISSUE_CODES.duplicateIndexRow)).toBe(true)
    })

    it('分片数低于下界判 scope-narrowed', () => {
        const root = archive(['todo-archive-phases-00-06.md'], validIndex)
        expect(checkArchiveIndex(root, { minFiles: 2 }).issues.some((i) => i.code === ISSUE_CODES.scopeNarrowed)).toBe(true)
    })

    it('索引缺失判 index-missing', () => {
        const root = createFixture({ [`${ARCHIVE_DIR}/todo-archive-phases-00-06.md`]: '# x\n' })
        expect(checkArchiveIndex(root, { minFiles: 1 }).issues[0].code).toBe(ISSUE_CODES.indexMissing)
    })
})
