import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
    DEFAULT_CURRENT,
    REPO_ROOT,
    collectDeclarationFiles,
    compareApiSurfaces,
    extractExportedNames,
    formatReport,
    main,
} from './diff-api.mjs'

function createDist(files) {
    const root = mkdtempSync(join(tmpdir(), 'diff-api-'))
    for (const [relative, content] of Object.entries(files)) {
        const file = join(root, relative)
        mkdirSync(join(file, '..'), { recursive: true })
        writeFileSync(file, content)
    }
    return root
}

describe('collectDeclarationFiles', () => {
    it('递归收集 .d.ts 并忽略其它产物', () => {
        const root = createDist({
            'index.d.ts': 'export {}',
            'components/button/index.d.ts': 'export {}',
            'components/button/style.css': '.a{}',
            'components/button/index.js': 'export {}',
        })
        expect(collectDeclarationFiles(root)).toEqual(['components/button/index.d.ts', 'index.d.ts'])
    })

    it('目录不存在时抛错', () => {
        expect(() => collectDeclarationFiles('/tmp/not-exist-diff-api')).toThrow('不是目录')
    })
})

describe('extractExportedNames', () => {
    it('提取 declare 导出与 export 列表（含别名与 type 前缀）', () => {
        const text = [
            'export declare class Foo {}',
            'export declare const bar: number',
            'export declare interface Baz {}',
            'export { A, B as C, type D }',
            'export * from "./other"',
            'export type * from "./types"',
        ].join('\n')
        const result = extractExportedNames(text)
        expect(result.names).toEqual(['A', 'Baz', 'C', 'D', 'Foo', 'bar'])
        expect(result.starExports).toBe(2)
    })

    it('识别 export type { ... }', () => {
        expect(extractExportedNames('export type { Foo, Bar };').names).toEqual(['Bar', 'Foo'])
    })
})

describe('默认路径', () => {
    it('REPO_ROOT 指向仓库根，默认 --current 为仓库 dist', () => {
        expect(existsSync(join(REPO_ROOT, 'package.json'))).toBe(true)
        expect(DEFAULT_CURRENT).toBe(join(REPO_ROOT, 'dist'))
    })
})

describe('compareApiSurfaces', () => {
    it('完全一致时通过', () => {
        const baseline = createDist({ 'index.d.ts': 'export declare class Foo {}' })
        const current = createDist({ 'index.d.ts': 'export declare class Foo {}' })
        const result = compareApiSurfaces({ baselineRoot: baseline, currentRoot: current })
        expect(result.breaking).toBe(false)
        expect(result.changedFiles).toEqual([])
    })

    it('删除文件判 breaking', () => {
        const baseline = createDist({ 'index.d.ts': 'export {}', 'extra.d.ts': 'export {}' })
        const current = createDist({ 'index.d.ts': 'export {}' })
        const result = compareApiSurfaces({ baselineRoot: baseline, currentRoot: current })
        expect(result.removedFiles).toEqual(['extra.d.ts'])
        expect(result.breaking).toBe(true)
    })

    it('删除导出判 breaking', () => {
        const baseline = createDist({ 'index.d.ts': 'export declare class Foo {}\nexport declare const bar: number' })
        const current = createDist({ 'index.d.ts': 'export declare class Foo {}' })
        const result = compareApiSurfaces({ baselineRoot: baseline, currentRoot: current })
        expect(result.removedExports).toEqual([{ file: 'index.d.ts', name: 'bar' }])
        expect(result.breaking).toBe(true)
    })

    it('新增文件与导出不判 breaking', () => {
        const baseline = createDist({ 'index.d.ts': 'export declare class Foo {}' })
        const current = createDist({
            'index.d.ts': 'export declare class Foo {}\nexport declare const extra: string',
            'components/alert.d.ts': 'export {}',
        })
        const result = compareApiSurfaces({ baselineRoot: baseline, currentRoot: current })
        expect(result.addedFiles).toEqual(['components/alert.d.ts'])
        expect(result.addedExports).toEqual([{ file: 'index.d.ts', name: 'extra' }])
        expect(result.breaking).toBe(false)
    })

    it('单文件删除重名导出仍判 breaking', () => {
        const baseline = createDist({
            'a.d.ts': 'export { default }',
            'b.d.ts': 'export { default }',
        })
        const current = createDist({
            'a.d.ts': '',
            'b.d.ts': 'export { default }',
        })
        const result = compareApiSurfaces({ baselineRoot: baseline, currentRoot: current })
        expect(result.removedExports).toEqual([{ file: 'a.d.ts', name: 'default' }])
        expect(result.breaking).toBe(true)
    })

    it('文件改名按删除 + 新增处理并判 breaking', () => {
        const baseline = createDist({ 'a.d.ts': 'export declare class Foo {}' })
        const current = createDist({ 'b.d.ts': 'export declare class Foo {}' })
        const result = compareApiSurfaces({ baselineRoot: baseline, currentRoot: current })
        expect(result.removedFiles).toEqual(['a.d.ts'])
        expect(result.addedFiles).toEqual(['b.d.ts'])
        expect(result.breaking).toBe(true)
    })

    it('仅内容变化时列出文件但不判 breaking', () => {
        const baseline = createDist({ 'index.d.ts': 'export declare class Foo { a: string }' })
        const current = createDist({ 'index.d.ts': 'export declare class Foo { b: string }' })
        const result = compareApiSurfaces({ baselineRoot: baseline, currentRoot: current })
        expect(result.changedFiles).toEqual(['index.d.ts'])
        expect(result.breaking).toBe(false)
    })
})

describe('formatReport', () => {
    it('无变化时明确无需人工复核', () => {
        const baseline = createDist({ 'index.d.ts': 'export declare class Foo {}' })
        const current = createDist({ 'index.d.ts': 'export declare class Foo {}' })
        const report = formatReport(compareApiSurfaces({ baselineRoot: baseline, currentRoot: current }))
        expect(report).toContain('无需人工复核')
        expect(report).not.toContain('内容变化需人工复核')
    })

    it('汇总删除、新增与内容变化', () => {
        const baseline = createDist({ 'index.d.ts': 'export declare class Foo {}\nexport declare const bar: number' })
        const current = createDist({ 'next.d.ts': 'export declare class Baz {}' })
        const report = formatReport(compareApiSurfaces({ baselineRoot: baseline, currentRoot: current }))
        expect(report).toContain('删除 / 重命名文件：index.d.ts')
        expect(report).toContain('新增文件：next.d.ts')
        expect(report).toContain('未通过')
    })
})

describe('main', () => {
    it('缺少 --baseline 返回 2', () => {
        expect(main(['--current=/tmp'])).toBe(2)
    })

    it('存在删除返回 1，无删除返回 0', () => {
        const baseline = createDist({ 'index.d.ts': 'export declare class Foo {}' })
        const current = createDist({ 'index.d.ts': '' })
        expect(main([`--baseline=${baseline}`, `--current=${current}`])).toBe(1)

        const same = createDist({ 'index.d.ts': 'export declare class Foo {}' })
        expect(main([`--baseline=${baseline}`, `--current=${same}`])).toBe(0)
    })
})
