import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { collectExportFiles, findInvalidFiles, findMissingExports } from './check-build.mjs'

const tempDirs = []

function createFixture(files = {}) {
    const dir = mkdtempSync(join(tmpdir(), 'check-build-'))
    tempDirs.push(dir)

    for (const [relative, content] of Object.entries(files)) {
        const absolute = join(dir, relative)
        mkdirSync(join(absolute, '..'), { recursive: true })
        writeFileSync(absolute, content)
    }

    return dir
}

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

describe('collectExportFiles', () => {
    it('收集字符串、条件对象与数组中的文件路径并排序去重', () => {
        const files = collectExportFiles({
            '.': { types: './dist/index.d.ts', import: './dist/index.js' },
            './styles.css': './dist/styles.css',
            './fallback': ['./dist/a.js', './dist/b.js'],
            './package.json': './package.json',
        })

        expect(files).toEqual([
            './dist/a.js',
            './dist/b.js',
            './dist/index.d.ts',
            './dist/index.js',
            './dist/styles.css',
            './package.json',
        ])
    })

    it('忽略空值节点，缺失 exports 时返回空数组', () => {
        expect(collectExportFiles({ '.': { import: './dist/index.js', default: null } })).toEqual([
            './dist/index.js',
        ])
        expect(collectExportFiles(undefined)).toEqual([])
    })
})

describe('findInvalidFiles', () => {
    it('区分缺失文件与空文件', () => {
        const dir = createFixture({
            'dist/index.js': 'export const a = 1\n',
            'dist/empty.js': '',
        })

        const result = findInvalidFiles(dir, ['./dist/index.js', './dist/empty.js', './dist/missing.js'])

        expect(result.missing).toEqual(['./dist/missing.js'])
        expect(result.empty).toEqual(['./dist/empty.js'])
    })
})

describe('findMissingExports', () => {
    it('筛出缺失的导出名', () => {
        expect(findMissingExports(['foo', 'bar'], ['foo', 'baz'])).toEqual(['baz'])
        expect(findMissingExports([], [])).toEqual([])
    })
})
