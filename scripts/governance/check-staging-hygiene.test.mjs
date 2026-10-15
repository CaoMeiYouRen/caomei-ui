import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'
import {
    checkStagingHygiene,
    inspectStatus,
    ISSUE_CODES,
    parseStatusZ,
    readStagedPaths,
    SCOPE_FLOOR,
} from './check-staging-hygiene.mjs'

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), 'check-staging-hygiene.mjs')

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

/** 建一个隔离的 git 夹具仓库（工作区内的路径由调用方再写入）。 */
function createGitRepo() {
    const dir = mkdtempSync(join(tmpdir(), 'check-staging-hygiene-'))
    tempDirs.push(dir)
    spawnSync('git', ['init', '-q'], { cwd: dir })
    // 夹具自带身份：CI 运行器的 git 无法从系统账号推导用户（空 ident），提交会直接失败。
    spawnSync('git', ['config', 'user.email', 'fixture@example.com'], { cwd: dir })
    spawnSync('git', ['config', 'user.name', 'fixture'], { cwd: dir })
    return dir
}

/** 写入夹具文件（自动建父目录）。 */
function writeFixtureFile(root, relativePath, content) {
    const file = join(root, relativePath)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, content)
    return file
}

function git(root, args) {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' })
    if (result.status !== 0) {
        throw new Error(`git ${args.join(' ')} 失败：${result.stderr}`)
    }
    return result.stdout
}

function runCli(root) {
    return spawnSync('node', [SCRIPT, '--root', root], { encoding: 'utf8' })
}

describe('parseStatusZ', () => {
    it('解析普通状态条目（含未跟踪）', () => {
        const { entries, malformed } = parseStatusZ(' M a.txt\0?? b.txt\0A  c.txt\0')
        expect(malformed).toEqual([])
        expect(entries).toEqual([
            { x: ' ', y: 'M', path: 'a.txt' },
            { x: '?', y: '?', path: 'b.txt' },
            { x: 'A', y: ' ', path: 'c.txt' },
        ])
    })

    it('跳过重命名条目紧随的原路径 token', () => {
        const { entries, malformed } = parseStatusZ('R  new.txt\0old.txt\0M  keep.txt\0')
        expect(malformed).toEqual([])
        expect(entries).toEqual([
            { x: 'R', y: ' ', path: 'new.txt' },
            { x: 'M', y: ' ', path: 'keep.txt' },
        ])
    })

    it('不可解析的条目计入 malformed 而非静默丢弃', () => {
        const { entries, malformed } = parseStatusZ('MM\0M a.txt\0M  ok.txt\0')
        expect(malformed).toEqual(['MM', 'M a.txt'])
        expect(entries).toEqual([{ x: 'M', y: ' ', path: 'ok.txt' }])
    })
})

describe('inspectStatus', () => {
    const ctx = (statusOut, stagedPaths = ['a.txt']) => ({ statusOut, stagedPaths })

    it('仅索引有改动时不判失败', () => {
        const result = inspectStatus(ctx('M  a.txt\0A  b.txt\0', ['a.txt', 'b.txt']))
        expect(result.issues).toEqual([])
    })

    it('AM 判 partial-stage', () => {
        const result = inspectStatus(ctx('AM a.txt\0'))
        expect(result.issues.map((issue) => issue.code)).toEqual([ISSUE_CODES.partialStage])
    })

    it('MM 判 partial-stage', () => {
        const result = inspectStatus(ctx('MM a.txt\0'))
        expect(result.issues.map((issue) => issue.code)).toEqual([ISSUE_CODES.partialStage])
    })

    it('RM / MD / AD 同族组合一并判 partial-stage', () => {
        const result = inspectStatus(ctx('RM a.txt\0old-a.txt\0MD b.txt\0AD c.txt\0', ['a.txt', 'b.txt', 'c.txt']))
        expect(result.issues.map((issue) => issue.code)).toEqual([
            ISSUE_CODES.partialStage,
            ISSUE_CODES.partialStage,
            ISSUE_CODES.partialStage,
        ])
    })

    it('未跟踪与仅工作区改动不在面内', () => {
        const result = inspectStatus(ctx('?? a.txt\0 M b.txt\0', ['a.txt']))
        expect(result.issues).toEqual([])
    })

    it('受检面下界：已暂存非空但解析出 0 条目时判 scope-narrowed', () => {
        const result = inspectStatus({ stagedPaths: ['a.txt'], statusOut: '' })
        expect(result.issues.map((issue) => issue.code)).toContain(ISSUE_CODES.scopeNarrowed)
        expect(SCOPE_FLOOR.entries).toBe(1)
    })

    it('已暂存文件不在状态面内时判 staged-surface-incomplete', () => {
        const result = inspectStatus({ stagedPaths: ['a.txt', 'missing.txt'], statusOut: 'M  a.txt\0' })
        const codes = result.issues.map((issue) => issue.code)
        expect(codes).not.toContain(ISSUE_CODES.scopeNarrowed)
        expect(codes).toEqual([ISSUE_CODES.stagedSurfaceIncomplete])
        expect(result.issues[0].detail).toContain('missing.txt')
    })

    it('未合并冲突单出 unmerged 码，不并入 partial-stage', () => {
        const uu = inspectStatus({ stagedPaths: ['a.txt'], statusOut: 'UU a.txt\0' })
        expect(uu.issues.map((issue) => issue.code)).toEqual([ISSUE_CODES.unmerged])
        const aa = inspectStatus({ stagedPaths: ['b.txt'], statusOut: 'AA b.txt\0' })
        expect(aa.issues.map((issue) => issue.code)).toEqual([ISSUE_CODES.unmerged])
        const dd = inspectStatus({ stagedPaths: ['c.txt'], statusOut: 'DD c.txt\0' })
        expect(dd.issues.map((issue) => issue.code)).toEqual([ISSUE_CODES.unmerged])
    })

    it('已暂存删除（D 位）不判失败', () => {
        const result = inspectStatus({ stagedPaths: ['a.txt'], statusOut: 'D  a.txt\0' })
        expect(result.issues).toEqual([])
    })

    it('enforceScope=false 时不下受检面断言', () => {
        const result = inspectStatus({ stagedPaths: ['missing.txt'], statusOut: '', enforceScope: false })
        expect(result.issues).toEqual([])
    })

    it('malformed 条目独立出码', () => {
        const result = inspectStatus({ stagedPaths: ['a.txt'], statusOut: 'MM\0' })
        expect(result.issues.map((issue) => issue.code)).toContain(ISSUE_CODES.malformedEntry)
    })
})

describe('readStagedPaths', () => {
    it('取索引相对 HEAD 的全部变更路径（含删除）', () => {
        const root = createGitRepo()
        writeFixtureFile(root, 'a.txt', 'a\n')
        writeFixtureFile(root, 'b.txt', 'b\n')
        git(root, ['add', 'a.txt', 'b.txt'])
        git(root, ['commit', '-q', '-m', 'init', '--no-verify'])
        writeFixtureFile(root, 'a.txt', 'a2\n')
        git(root, ['add', 'a.txt'])
        git(root, ['rm', '-q', 'b.txt'])

        const staged = readStagedPaths(root)
        expect([...staged].sort()).toEqual(['a.txt', 'b.txt'])
    })
})

describe('checkStagingHygiene（真实 git 夹具）', () => {
    it('全部已 add、工作区无残留改动时通过', () => {
        const root = createGitRepo()
        writeFixtureFile(root, 'a.txt', 'a\n')
        git(root, ['add', 'a.txt'])
        const result = checkStagingHygiene(root)
        expect(result.skipped).toBe(false)
        expect(result.issues).toEqual([])
    })

    it('AM（新增后未重新 add）判 partial-stage', () => {
        const root = createGitRepo()
        writeFixtureFile(root, 'a.txt', 'a\n')
        git(root, ['add', 'a.txt'])
        writeFixtureFile(root, 'a.txt', 'a-edited\n')
        const result = checkStagingHygiene(root)
        expect(result.issues.map((issue) => issue.code)).toEqual([ISSUE_CODES.partialStage])
    })

    it('MM（跟踪文件改后再改）判 partial-stage', () => {
        const root = createGitRepo()
        writeFixtureFile(root, 'a.txt', 'a\n')
        git(root, ['add', 'a.txt'])
        git(root, ['commit', '-q', '-m', 'init', '--no-verify'])
        writeFixtureFile(root, 'a.txt', 'a-staged\n')
        git(root, ['add', 'a.txt'])
        writeFixtureFile(root, 'a.txt', 'a-edited-again\n')
        const result = checkStagingHygiene(root)
        expect(result.issues.map((issue) => issue.code)).toEqual([ISSUE_CODES.partialStage])
    })

    it('未跟踪文件与工作区未暂存改动不误报', () => {
        const root = createGitRepo()
        writeFixtureFile(root, 'a.txt', 'a\n')
        git(root, ['add', 'a.txt'])
        git(root, ['commit', '-q', '-m', 'init', '--no-verify'])
        writeFixtureFile(root, 'untracked.txt', 'u\n')
        writeFixtureFile(root, 'a.txt', 'a-unstaged\n')
        const result = checkStagingHygiene(root)
        expect(result.issues).toEqual([])
    })

    it('无暂存内容时跳过', () => {
        const root = createGitRepo()
        writeFixtureFile(root, 'a.txt', 'a\n')
        const result = checkStagingHygiene(root)
        expect(result.skipped).toBe(true)
        expect(result.issues).toEqual([])
    })

    it('fail-closed：非 git 目录判 git-error 而非静默通过', () => {
        const root = mkdtempSync(join(tmpdir(), 'check-staging-hygiene-nongit-'))
        tempDirs.push(root)
        const result = checkStagingHygiene(root)
        expect(result.skipped).toBe(false)
        expect(result.issues.map((issue) => issue.code)).toEqual([ISSUE_CODES.gitError])
    })

    it('暂存删除（D 位）不误报，且不再触发「暂存范围为空」跳过', () => {
        const root = createGitRepo()
        writeFixtureFile(root, 'a.txt', 'a\n')
        git(root, ['add', 'a.txt'])
        git(root, ['commit', '-q', '-m', 'init', '--no-verify'])
        git(root, ['rm', '-q', 'a.txt'])
        const result = checkStagingHygiene(root)
        expect(result.skipped).toBe(false)
        expect(result.entries).toEqual([{ x: 'D', y: ' ', path: 'a.txt' }])
        expect(result.issues).toEqual([])
    })
})

describe('CLI（负向对照 / 正例）', () => {
    it('AM 夹具 exit 1', () => {
        const root = createGitRepo()
        writeFixtureFile(root, 'a.txt', 'a\n')
        git(root, ['add', 'a.txt'])
        writeFixtureFile(root, 'a.txt', 'a-edited\n')
        const result = runCli(root)
        expect(result.status).toBe(1)
        expect(result.stderr).toContain(ISSUE_CODES.partialStage)
    })

    it('MM 夹具 exit 1', () => {
        const root = createGitRepo()
        writeFixtureFile(root, 'a.txt', 'a\n')
        git(root, ['add', 'a.txt'])
        git(root, ['commit', '-q', '-m', 'init', '--no-verify'])
        writeFixtureFile(root, 'a.txt', 'a-staged\n')
        git(root, ['add', 'a.txt'])
        writeFixtureFile(root, 'a.txt', 'a-edited\n')
        const result = runCli(root)
        expect(result.status).toBe(1)
        expect(result.stderr).toContain(ISSUE_CODES.partialStage)
    })

    it('暂存区干净夹具 exit 0', () => {
        const root = createGitRepo()
        writeFixtureFile(root, 'a.txt', 'a\n')
        git(root, ['add', 'a.txt'])
        const result = runCli(root)
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('OK')
    })

    it('空暂存夹具跳过并 exit 0', () => {
        const root = createGitRepo()
        writeFixtureFile(root, 'a.txt', 'a\n')
        const result = runCli(root)
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('跳过')
    })

    it('fail-closed：非 git 目录 exit 1', () => {
        const root = mkdtempSync(join(tmpdir(), 'check-staging-hygiene-nongit-'))
        tempDirs.push(root)
        const result = runCli(root)
        expect(result.status).toBe(1)
        expect(result.stderr).toContain(ISSUE_CODES.gitError)
    })
})
