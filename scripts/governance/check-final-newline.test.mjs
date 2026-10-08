import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    checkRepo,
    hasFinalNewline,
    isBinary,
    parseInsertFinalNewline,
    scanPaths,
    SCOPE_FLOOR,
} from './check-final-newline.mjs'

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

function createFixture(files) {
    const dir = mkdtempSync(join(tmpdir(), 'check-final-newline-'))
    tempDirs.push(dir)
    for (const [relativePath, content] of Object.entries(files)) {
        const file = join(dir, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    return dir
}

/** 在夹具上初始化 git 仓库并把文件纳入跟踪（供 `checkRepo` 的 `git ls-files` 路径使用）。 */
function createGitFixture(files) {
    const dir = createFixture(files)
    spawnSync('git', ['init'], { cwd: dir })
    spawnSync('git', ['add', '-A'], { cwd: dir })
    return dir
}

describe('hasFinalNewline', () => {
    it('以 \\n 结尾为真', () => {
        expect(hasFinalNewline(Buffer.from('a\n'))).toBe(true)
        expect(hasFinalNewline(Buffer.from('line\n'))).toBe(true)
    })

    it('无换行或空文件为假', () => {
        expect(hasFinalNewline(Buffer.from('a'))).toBe(false)
        expect(hasFinalNewline(Buffer.from(''))).toBe(false)
    })
})

describe('isBinary', () => {
    it('含 NUL 判为二进制', () => {
        expect(isBinary(Buffer.from([0x61, 0x00, 0x62]))).toBe(true)
    })

    it('纯文本判为非二进制', () => {
        expect(isBinary(Buffer.from('hello world\n'))).toBe(false)
    })
})

describe('parseInsertFinalNewline', () => {
    it('[*] 声明 true 时为真', () => {
        const text = ['root = true', '', '[*]', 'insert_final_newline = true', 'indent_size = 4'].join('\n')
        expect(parseInsertFinalNewline(text)).toBe(true)
    })

    it('未声明或为 false 时为假', () => {
        expect(parseInsertFinalNewline('[*]\nindent_size = 4\n')).toBe(false)
        expect(parseInsertFinalNewline('[*]\ninsert_final_newline = false\n')).toBe(false)
    })

    it('仅其它段声明时不生效', () => {
        expect(parseInsertFinalNewline('[*]\nindent_size = 4\n[*.md]\ninsert_final_newline = true\n')).toBe(false)
    })

    it('忽略注释与空行', () => {
        const text = ['# 注释', '[*]', '; 另一注释', 'insert_final_newline=true'].join('\n')
        expect(parseInsertFinalNewline(text)).toBe(true)
    })
})

describe('scanPaths', () => {
    it('缺失末尾换行的文件被命中', () => {
        const dir = createFixture({ 'ok.md': 'ok\n', 'bad.md': 'bad' })
        const { checked, issues } = scanPaths(dir, ['ok.md', 'bad.md'])
        expect(checked).toBe(2)
        expect(issues).toEqual([{ code: 'missing-final-newline', detail: 'bad.md' }])
    })

    it('空文件与二进制文件跳过、不计入受检', () => {
        const dir = createFixture({ 'empty.txt': '', 'ok.txt': 'ok\n' })
        writeFileSync(join(dir, 'bin.dat'), Buffer.from([0x00, 0x01, 0x02]))
        const { checked, issues } = scanPaths(dir, ['empty.txt', 'ok.txt', 'bin.dat'])
        expect(checked).toBe(1)
        expect(issues).toEqual([])
    })

    it('符号链接跳过', () => {
        const dir = createFixture({ 'target.md': 'target' })
        symlinkSync(join(dir, 'target.md'), join(dir, 'link.md'))
        const { checked, issues } = scanPaths(dir, ['link.md'])
        expect(checked).toBe(0)
        expect(issues).toEqual([])
    })

    it('缺失文件跳过不报', () => {
        const dir = createFixture({ 'ok.md': 'ok\n' })
        const { checked, issues } = scanPaths(dir, ['ok.md', 'nope.md'])
        expect(checked).toBe(1)
        expect(issues).toEqual([])
    })
})

describe('checkRepo（仓库不变量）', () => {
    it('前提成立、受检面达下界、全部文件带末尾换行', () => {
        const { checked, issues } = checkRepo(process.cwd(), { enforceScope: true })
        expect(issues).toEqual([])
        expect(checked).toBeGreaterThanOrEqual(SCOPE_FLOOR.files)
    })

    it('缺少 .editorconfig 前提时报 premise-changed', () => {
        const dir = createFixture({ 'a.md': 'a\n' })
        const { issues } = checkRepo(dir, { enforceScope: false })
        expect(issues.some((issue) => issue.code === 'premise-changed')).toBe(true)
    })

    it('受检面不足下界且缺哨兵时报 scope-narrowed 与 sentinel-missing', () => {
        const dir = createGitFixture({
            '.editorconfig': '[*]\ninsert_final_newline = true\n',
            'a.md': 'ok\n',
        })
        const { checked, issues } = checkRepo(dir, { enforceScope: true })
        expect(checked).toBe(2)
        expect(issues.some((issue) => issue.code === 'scope-narrowed')).toBe(true)
        expect(issues.some((issue) => issue.code === 'sentinel-missing')).toBe(true)
    })

    it('非 git 目录时 fail-closed 报 git-error', () => {
        const dir = createFixture({ 'a.md': 'a\n' })
        const { issues } = checkRepo(dir, { enforceScope: false })
        expect(issues.some((issue) => issue.code === 'git-error')).toBe(true)
    })
})
