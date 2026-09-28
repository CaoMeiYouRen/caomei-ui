import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { checkFile, collectMdFiles, projectRoot, runCheckLinks } from './check-links.mjs'

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

function createFixture(files) {
    const dir = mkdtempSync(join(tmpdir(), 'check-links-'))
    tempDirs.push(dir)
    for (const [relativePath, content] of Object.entries(files)) {
        const file = join(dir, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    return dir
}

function errorsFor(root, relativePath) {
    return checkFile(join(root, relativePath), root)
}

const BASE_FIXTURE = {
    'docs/guide/a.md': '# A\n',
    'docs/components/b.md': '# B\n',
    'AGENTS.md': '# AGENTS\n',
    'README.md': '# README\n',
    'scripts/tool.mjs': '// tool\n',
}

describe('文档站范围外链接（VitePress dead-link 面）', () => {
    it('docs/ 下的相对链接解析到仓库根文件时报错', () => {
        const root = createFixture({
            ...BASE_FIXTURE,
            'docs/guide/a.md': '# A\n\n见 [AGENTS](../../AGENTS.md)。\n',
        })
        const errors = errorsFor(root, 'docs/guide/a.md')
        expect(errors).toHaveLength(1)
        expect(errors[0]).toContain('超出站点范围')
        expect(errors[0]).toContain('../../AGENTS.md')
    })

    it('省略 .md 的跨根链接（经 .md 回退解析）同样报错', () => {
        const root = createFixture({
            ...BASE_FIXTURE,
            'docs/guide/a.md': '# A\n\n见 [AGENTS](../../AGENTS)。\n',
        })
        const errors = errorsFor(root, 'docs/guide/a.md')
        expect(errors).toHaveLength(1)
        expect(errors[0]).toContain('超出站点范围')
    })

    it('非 docs 的 Markdown 允许链接仓库根文件', () => {
        const root = createFixture({
            ...BASE_FIXTURE,
            'README.md': '# README\n\n见 [AGENTS](./AGENTS.md)。\n',
        })
        expect(errorsFor(root, 'README.md')).toEqual([])
    })

    it('docs/ 内互相链接不报错', () => {
        const root = createFixture({
            ...BASE_FIXTURE,
            'docs/guide/a.md': '# A\n\n见 [B](../components/b.md)。\n',
        })
        expect(errorsFor(root, 'docs/guide/a.md')).toEqual([])
    })

    it('站点内首段以 `..` 开头的目录不被误判（分隔符锚定）', () => {
        const root = createFixture({
            ...BASE_FIXTURE,
            'docs/..foo/b.md': '# B\n',
            'docs/guide/a.md': '# A\n\n见 [B](../..foo/b.md)。\n',
        })
        expect(errorsFor(root, 'docs/guide/a.md')).toEqual([])
    })

    it('站点根路径链接在 docs/ 下按 docs 根解析', () => {
        const root = createFixture({
            ...BASE_FIXTURE,
            'docs/guide/a.md': '# A\n\n见 [B](/components/b)。\n',
        })
        expect(errorsFor(root, 'docs/guide/a.md')).toEqual([])
    })
})

describe('既有规则不回退', () => {
    it('目标不存在时报错', () => {
        const root = createFixture({
            ...BASE_FIXTURE,
            'docs/guide/a.md': '# A\n\n见 [X](./missing.md)。\n',
        })
        const errors = errorsFor(root, 'docs/guide/a.md')
        expect(errors).toHaveLength(1)
        expect(errors[0]).toContain('链接目标不存在')
    })

    it('超出仓库根的路径穿越报错', () => {
        const root = createFixture({
            ...BASE_FIXTURE,
            'docs/guide/a.md': '# A\n\n见 [X](../../../outside.md)。\n',
        })
        const errors = errorsFor(root, 'docs/guide/a.md')
        expect(errors).toHaveLength(1)
        expect(errors[0]).toContain('超出项目范围')
    })

    it('本地绝对路径链接报错', () => {
        const root = createFixture({
            ...BASE_FIXTURE,
            'docs/guide/a.md': '# A\n\n见 [X](C:/foo/bar.md)。\n',
        })
        const errors = errorsFor(root, 'docs/guide/a.md')
        expect(errors).toHaveLength(1)
        expect(errors[0]).toContain('本地绝对路径')
    })

    it('锚点在目标文件不存在时报错', () => {
        const root = createFixture({
            ...BASE_FIXTURE,
            'docs/guide/a.md': '# A\n\n见 [B](../components/b.md#不存在)。\n',
        })
        const errors = errorsFor(root, 'docs/guide/a.md')
        expect(errors).toHaveLength(1)
        expect(errors[0]).toContain('找不到对应标题')
    })
})

describe('受检面与仓库现状', () => {
    it('受检面覆盖 docs/ 且未静默收窄', () => {
        const files = collectMdFiles(projectRoot)
        expect(files.length).toBeGreaterThanOrEqual(200)
        expect(files.some((f) => f.endsWith('docs/design/documentation-site.md'))).toBe(true)
    })

    it('仓库现状无跨根链接（docs:check:links 全绿）', () => {
        const { errors } = runCheckLinks()
        expect(errors).toEqual([])
    })

    it('脚本可独立执行（存在入口文件）', () => {
        expect(existsSync(join(projectRoot, 'scripts/docs/check-links.mjs'))).toBe(true)
    })
})
