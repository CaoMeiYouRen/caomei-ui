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
    extractTypeMembers,
    formatReport,
    main,
    stripDeclarationComments,
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

describe('extractTypeMembers / required 收紧', () => {
    it('解析属性、方法、quoted key 与泛型默认值，忽略注释', () => {
        const text = [
            'export interface Props<T extends object = {}> {',
            '  /** doc { fake } */',
            '  size?: string;',
            '  label: string;',
            '  submit?: () => void;',
            '  readonly open?: boolean;',
            '  "aria-label"?: string;',
            '}',
        ].join('\n')
        const members = extractTypeMembers(text).get('Props')
        expect([...members.members]).toEqual([
            ['size', { optional: true }],
            ['label', { optional: false }],
            ['submit', { optional: true }],
            ['open', { optional: true }],
            ['aria-label', { optional: true }],
        ])
        expect(members.hasExtends).toBe(false)
        expect(stripDeclarationComments('/** a */\nconst x = 1 // b')).not.toContain('a')
    })

    it('泛型约束中的 extends 不算接口继承', () => {
        const members = extractTypeMembers('export interface Props<T extends object = {}> { size?: string }')
        expect(members.get('Props').hasExtends).toBe(false)
    })

    it('optional → required 判 breaking', () => {
        const baseline = createDist({
            'index.d.ts': 'export interface Props { size?: string; label?: string }',
        })
        const current = createDist({
            'index.d.ts': 'export interface Props { size: string; label?: string }',
        })
        const result = compareApiSurfaces({ baselineRoot: baseline, currentRoot: current })
        expect(result.requiredTightened).toEqual([
            { file: 'index.d.ts', type: 'Props', member: 'size' },
        ])
        expect(result.breaking).toBe(true)
    })

    it('required → optional 与新增 required 成员不判 breaking', () => {
        const baseline = createDist({
            'index.d.ts': 'export interface Props { size: string }',
        })
        const current = createDist({
            'index.d.ts': 'export interface Props { size?: string; extra: string }',
        })
        const result = compareApiSurfaces({ baselineRoot: baseline, currentRoot: current })
        expect(result.requiredTightened).toEqual([])
        expect(result.breaking).toBe(false)
    })

    it('非继承接口的成员删除判 breaking', () => {
        const baseline = createDist({
            'index.d.ts': 'export interface Props { size?: string; label?: string }',
        })
        const current = createDist({
            'index.d.ts': 'export interface Props { size?: string }',
        })
        const result = compareApiSurfaces({ baselineRoot: baseline, currentRoot: current })
        expect(result.removedMembers).toEqual([
            { file: 'index.d.ts', type: 'Props', member: 'label' },
        ])
        expect(result.breaking).toBe(true)
    })

    it('继承接口的成员删除不判 breaking（成员可能上移到基接口）', () => {
        const baseline = createDist({
            'index.d.ts': 'export interface Props extends Base { label?: string }',
        })
        const current = createDist({
            'index.d.ts': 'export interface Props extends Base { }',
        })
        const result = compareApiSurfaces({ baselineRoot: baseline, currentRoot: current })
        expect(result.removedMembers).toEqual([])
        expect(result.breaking).toBe(false)
    })

    it('类型字面量的 required 收紧同样判 breaking', () => {
        const baseline = createDist({ 'index.d.ts': 'export type Props = { size?: string }' })
        const current = createDist({ 'index.d.ts': 'export type Props = { size: string }' })
        const result = compareApiSurfaces({ baselineRoot: baseline, currentRoot: current })
        expect(result.requiredTightened).toEqual([
            { file: 'index.d.ts', type: 'Props', member: 'size' },
        ])
        expect(result.breaking).toBe(true)
    })

    it('元组成员（[query: string]）不会被误判为索引签名', () => {
        const baseline = createDist({
            'index.d.ts': 'export interface Emits { complete: [query: string]; focus?: string }',
        })
        const current = createDist({
            'index.d.ts': 'export interface Emits { complete: [query: string] }',
        })
        const result = compareApiSurfaces({ baselineRoot: baseline, currentRoot: current })
        expect(result.removedMembers).toEqual([
            { file: 'index.d.ts', type: 'Emits', member: 'focus' },
        ])
        expect(result.breaking).toBe(true)
    })

    it('真正的索引签名接口跳过成员删除判定', () => {
        const baseline = createDist({
            'index.d.ts': 'export interface Options { [key: string]: unknown; size?: string }',
        })
        const current = createDist({
            'index.d.ts': 'export interface Options { [key: string]: unknown }',
        })
        const result = compareApiSurfaces({ baselineRoot: baseline, currentRoot: current })
        expect(result.removedMembers).toEqual([])
        expect(result.breaking).toBe(false)
    })

    it('成员顺序与 JSDoc 变化不判 breaking', () => {
        const baseline = createDist({
            'index.d.ts': '/** old */\nexport interface Props { size?: string; label?: string }',
        })
        const current = createDist({
            'index.d.ts': '/** new */\nexport interface Props { label?: string; size?: string }',
        })
        const result = compareApiSurfaces({ baselineRoot: baseline, currentRoot: current })
        expect(result.requiredTightened).toEqual([])
        expect(result.removedMembers).toEqual([])
        expect(result.breaking).toBe(false)
        expect(result.changedFiles).toEqual(['index.d.ts'])
    })

    it('quoted key 的引号风格变化不判 breaking', () => {
        const baseline = createDist({
            'index.d.ts': 'export interface Props { \'aria-label\'?: string }',
        })
        const current = createDist({
            'index.d.ts': 'export interface Props { "aria-label"?: string }',
        })
        const result = compareApiSurfaces({ baselineRoot: baseline, currentRoot: current })
        expect(result.removedMembers).toEqual([])
        expect(result.breaking).toBe(false)
    })

    it('类型字面量的成员删除判 breaking', () => {
        const baseline = createDist({
            'index.d.ts': 'export type Props = { size?: string; label?: string }',
        })
        const current = createDist({
            'index.d.ts': 'export type Props = { size?: string }',
        })
        const result = compareApiSurfaces({ baselineRoot: baseline, currentRoot: current })
        expect(result.removedMembers).toEqual([
            { file: 'index.d.ts', type: 'Props', member: 'label' },
        ])
        expect(result.breaking).toBe(true)
    })

    it('方法签名由 optional 收紧为 required 判 breaking', () => {
        const baseline = createDist({
            'index.d.ts': 'export interface Props { submit?(): void }',
        })
        const current = createDist({
            'index.d.ts': 'export interface Props { submit(): void }',
        })
        const result = compareApiSurfaces({ baselineRoot: baseline, currentRoot: current })
        expect(result.requiredTightened).toEqual([
            { file: 'index.d.ts', type: 'Props', member: 'submit' },
        ])
        expect(result.breaking).toBe(true)
    })

    it('字符串字面量里的 // 不会截断后续成员', () => {
        const baseline = createDist({
            'index.d.ts': 'export interface Url { href: \'https://a.b\'; label?: string }',
        })
        const current = createDist({
            'index.d.ts': 'export interface Url { href: \'https://a.b\' }',
        })
        const result = compareApiSurfaces({ baselineRoot: baseline, currentRoot: current })
        expect(result.removedMembers).toEqual([
            { file: 'index.d.ts', type: 'Url', member: 'label' },
        ])
        expect(result.breaking).toBe(true)
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

    it('汇总 required 收紧与成员删除', () => {
        const baseline = createDist({
            'index.d.ts': 'export interface Props { size?: string; label?: string }',
        })
        const current = createDist({
            'index.d.ts': 'export interface Props { size: string }',
        })
        const report = formatReport(compareApiSurfaces({ baselineRoot: baseline, currentRoot: current }))
        expect(report).toContain('required 收紧：index.d.ts → Props.size')
        expect(report).toContain('删除成员：index.d.ts → Props.label')
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

    it('required 收紧返回 1', () => {
        const baseline = createDist({ 'index.d.ts': 'export interface Props { size?: string }' })
        const current = createDist({ 'index.d.ts': 'export interface Props { size: string }' })
        expect(main([`--baseline=${baseline}`, `--current=${current}`])).toBe(1)
    })

    it('基线路径不存在返回 2', () => {
        expect(main(['--baseline=/tmp/not-exist-diff-api-baseline', '--current=/tmp/not-exist-diff-api-current'])).toBe(2)
    })
})
