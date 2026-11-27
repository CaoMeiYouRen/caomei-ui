import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    REPO_ROOT,
    collectStyleSurface,
    diffSurfaces,
    extractSourceTreeFromGit,
} from './diff-consumer-impact.mjs'

const tempDirs = []

function createTempDir(prefix) {
    // 必须落在仓库 `node_modules` 内：vue-component-meta 以 tsconfig 为 program 根，`vue` 的类型
    // 需要沿目录上溯解析；放在系统临时目录会让基线树的类型解析降级，抽取结果失真。
    mkdirSync(join(REPO_ROOT, 'node_modules'), { recursive: true })
    const dir = mkdtempSync(join(REPO_ROOT, 'node_modules', prefix))
    tempDirs.push(dir)
    return dir
}

function createStyleTree({ vue = '', css = '' } = {}) {
    const root = createTempDir('.impact-style-')
    mkdirSync(join(root, 'src', 'components', 'demo'), { recursive: true })
    writeFileSync(join(root, 'src', 'components', 'demo', 'demo.vue'), `<template><div class="caomei-demo" /></template>\n<style>\n.caomei-demo {\n    --caomei-demo-gap: 4px;\n}\n</style>\n${vue}`)
    writeFileSync(join(root, 'src', 'styles.css'), css)
    return root
}

/** 构造一份 surface（仅保留 diff 判定用到的字段）。 */
function surface({ components = {}, tokens = [], classNames = [] }) {
    return { components, tokens, classNames }
}

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

describe('diff-consumer-impact 样式面扫描', () => {
    it('只收 --caomei-* 变量声明与 .caomei-* 类名', () => {
        const root = createStyleTree({
            css: [
                ':root {',
                '    --caomei-space-1: 4px;',
                '    --other-token: 1px;',
                '}',
                '.caomei-demo__inner:hover { color: red; }',
                '/* 注释里的 --caomei-not-a-declaration 不算 */',
                'var(--caomei-space-1)',
                '',
            ].join('\n'),
        })
        const result = collectStyleSurface(root)
        expect(result.tokens).toEqual(['--caomei-demo-gap', '--caomei-space-1'])
        expect(result.classNames).toEqual(['.caomei-demo', '.caomei-demo__inner'])
    })
})

describe('diff-consumer-impact 变化清单', () => {
    const baseComponents = {
        'demo-a': {
            props: [
                { name: 'size', type: 'string', default: '"md"', required: false },
                { name: 'legacy', type: 'string', default: null, required: false },
            ],
            events: ['update:modelValue'],
            slots: ['default'],
        },
        'demo-b': { props: [], events: [], slots: [] },
    }

    it('组件与 prop 增删、默认值与 required 收紧均被记录', () => {
        const report = diffSurfaces(
            surface({ components: baseComponents, tokens: ['--caomei-x'], classNames: ['.caomei-x'] }),
            surface({
                components: {
                    'demo-a': {
                        props: [
                            { name: 'size', type: 'string', default: '"sm"', required: true },
                            { name: 'variant', type: 'string', default: null, required: true },
                        ],
                        events: ['update:modelValue', 'change'],
                        slots: ['default', 'header'],
                    },
                    'demo-c': { props: [], events: [], slots: [] },
                },
                tokens: ['--caomei-x', '--caomei-y'],
                classNames: ['.caomei-x', '.caomei-y'],
            }),
        )

        expect(report.components).toEqual({ added: ['demo-c'], removed: ['demo-b'] })
        expect(report.props.added).toEqual(['demo-a#variant'])
        expect(report.props.removed).toEqual(['demo-a#legacy'])
        expect(report.props.changed).toEqual([
            { key: 'demo-a#size', change: 'default', before: '"md"', after: '"sm"' },
            { key: 'demo-a#size', change: 'required', before: false, after: true },
        ])
        expect(report.events).toEqual({ added: ['demo-a#change'], removed: [] })
        expect(report.slots).toEqual({ added: ['demo-a#header'], removed: [] })
        expect(report.tokens).toEqual({ added: ['--caomei-y'], removed: [] })
        expect(report.classNames).toEqual({ added: ['.caomei-y'], removed: [] })
        // breaking = 组件删除 1 + prop 删除 1 + required 收紧 1
        expect(report.summary.breaking).toBe(3)
        expect(report.summary.additive).toBe(1 + 1 + 1 + 1)
    })

    it('required 由 true 放宽为 false 不计入 breaking', () => {
        const report = diffSurfaces(
            surface({ components: { 'demo-a': { props: [{ name: 'p', type: 'string', default: null, required: true }], events: [], slots: [] } } }),
            surface({ components: { 'demo-a': { props: [{ name: 'p', type: 'string', default: null, required: false }], events: [], slots: [] } } }),
        )
        expect(report.props.changed).toEqual([
            { key: 'demo-a#p', change: 'required', before: true, after: false },
        ])
        expect(report.summary.breaking).toBe(0)
    })

    it('变量与类名删除计入 breaking（消费方覆盖样式会失效）', () => {
        const report = diffSurfaces(
            surface({ tokens: ['--caomei-old'], classNames: ['.caomei-old'] }),
            surface({ tokens: [], classNames: [] }),
        )
        expect(report.tokens.removed).toEqual(['--caomei-old'])
        expect(report.classNames.removed).toEqual(['.caomei-old'])
        expect(report.summary.breaking).toBe(2)
    })
})

describe('diff-consumer-impact 发布差分回放', () => {
    it('1.3.0 → 1.4.0 的差异可被完整回放并命中已知变化', async () => {
        const { spawnSync } = await import('node:child_process')
        const canReplay = ['v1.3.0', 'v1.4.0'].every(
            (ref) => spawnSync('git', ['rev-parse', '--verify', '--quiet', `refs/tags/${ref}`], { cwd: REPO_ROOT }).status === 0,
        )
        if (!canReplay) {
            // 浅克隆 / 无 tag 的环境：跳过而非失败（回放依赖本仓 tag）
            return
        }

        const baseDir = createTempDir('.impact-130-')
        const targetDir = createTempDir('.impact-140-')
        extractSourceTreeFromGit('v1.3.0', baseDir)
        extractSourceTreeFromGit('v1.4.0', targetDir)
        expect(existsSync(join(baseDir, 'tsconfig.json'))).toBe(true)
        expect(existsSync(join(targetDir, 'src', 'components'))).toBe(true)

        const { collectConsumerSurface } = await import('./diff-consumer-impact.mjs')
        const report = diffSurfaces(
            collectConsumerSurface(baseDir),
            collectConsumerSurface(targetDir),
        )

        // 已知事实：1.4.0 的新增组件、新增 props / 事件、新增变量与类名
        expect(report.components.removed).toEqual([])
        expect(report.components.added).toEqual([
            'action-sheet', 'back-top', 'cascader', 'cell', 'descriptions', 'empty', 'input-otp',
            'popconfirm', 'rating', 'result', 'tabbar', 'time-picker', 'timeline', 'transfer',
        ])
        expect(report.props.added).toContain('data-table#columnVisibility')
        expect(report.props.removed).toEqual([])
        expect(report.props.changed).toContainEqual(
            { key: 'calendar#locale', change: 'default', before: 'defaultLocale', after: null },
        )
        expect(report.events.added).toEqual(['data-table#columnResizeEnd', 'data-table#update:columnSizing'])
        expect(report.tokens.added).toContain('--caomei-descriptions-columns')
        // 1.4.0 尚未引入的组件变量不得出现在该窗口：防「diff 把整棵树当成新增」
        expect(report.tokens.added).not.toContain('--caomei-carousel-gap')
        expect(report.classNames.added).toContain('.caomei-cascader__columns')
        expect(report.summary.breaking).toBe(0)
    }, 120_000)
})
