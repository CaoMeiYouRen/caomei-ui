import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    ARTIFACTS_DIR,
    checkReviewGateArtifacts,
    parseArgs,
    resolveSkip,
} from './check-review-gate-artifacts.mjs'

const SCRIPT_PATH = join(process.cwd(), 'scripts/governance/check-review-gate-artifacts.mjs')
const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

function createFixture(files) {
    const dir = mkdtempSync(join(tmpdir(), 'check-review-gate-'))
    tempDirs.push(dir)
    for (const [relativePath, content] of Object.entries(files)) {
        const file = join(dir, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    return dir
}

const ARTIFACT = '# Review Gate — 示例\n\n- 范围：`git diff`（1 文件）\n\n## Review Gate\n- 结论：Pass\n'
const SECONDS = (n) => new Date(n * 1000)

function runGit(dir, args) {
    const result = spawnSync('git', args, { cwd: dir, encoding: 'utf8' })
    if (result.status !== 0) {
        throw new Error(`git ${args.join(' ')} 失败：${result.stderr}`)
    }
}

/**
 * 建临时 git 仓库并按初始内容提交一次，用于版本号豁免的暂存 diff 判定。
 *
 * @param {Record<string, string>} files 相对路径 → 内容
 * @returns {string} 仓库根
 */
function createGitFixture(files) {
    const dir = createFixture(files)
    runGit(dir, ['init', '-q'])
    runGit(dir, ['config', 'user.email', 'fixture@example.com'])
    runGit(dir, ['config', 'user.name', 'fixture'])
    runGit(dir, ['add', '-A'])
    runGit(dir, ['commit', '-q', '-m', 'init'])
    return dir
}

/** 改写工作区文件并暂存。 */
function stageWrite(root, relativePath, content) {
    writeFileSync(join(root, relativePath), content)
    runGit(root, ['add', relativePath])
}

describe('parseArgs', () => {
    it('解析 --scope 多文件', () => {
        expect(parseArgs(['--scope', 'a.ts', 'b.ts'])).toEqual({ root: null, scope: ['a.ts', 'b.ts'], error: null })
    })

    it('解析 --root', () => {
        expect(parseArgs(['--root', '/repo', '--scope', 'a.ts'])).toEqual({ root: '/repo', scope: ['a.ts'], error: null })
    })

    it('未知参数按错误返回，不静默放行', () => {
        expect(parseArgs(['--verbose']).error).toContain('不支持的参数')
        expect(parseArgs(['stray']).error).toContain('未知位置参数')
    })
})

describe('resolveSkip', () => {
    it('CI 环境跳过', () => {
        const root = createFixture({ [`${ARTIFACTS_DIR}/r.md`]: ARTIFACT })
        expect(resolveSkip({ root, ci: true, scope: ['a.ts'] }).skip).toBe(true)
    })

    it('工件目录缺失跳过', () => {
        const root = createFixture({ 'src/a.ts': 'export {}\n' })
        const result = resolveSkip({ root, ci: false, scope: ['src/a.ts'] })
        expect(result.skip).toBe(true)
        expect(result.reason).toContain(ARTIFACTS_DIR)
    })

    it('受检范围为空跳过', () => {
        const root = createFixture({ [`${ARTIFACTS_DIR}/r.md`]: ARTIFACT })
        expect(resolveSkip({ root, ci: false, scope: [] }).skip).toBe(true)
    })

    it('本地态、有范围时不跳过', () => {
        const root = createFixture({
            [`${ARTIFACTS_DIR}/r.md`]: ARTIFACT,
            'src/a.ts': 'export {}\n',
        })
        expect(resolveSkip({ root, ci: false, scope: ['src/a.ts'] }).skip).toBe(false)
    })
})

describe('版本号变更豁免（npm version 发布元数据）', () => {
    it('仅 package.json 版本号变更时跳过', () => {
        const root = createGitFixture({
            [`${ARTIFACTS_DIR}/r.md`]: ARTIFACT,
            'package.json': '{\n  "name": "demo",\n  "version": "0.3.0"\n}\n',
        })
        stageWrite(root, 'package.json', '{\n  "name": "demo",\n  "version": "0.4.0"\n}\n')
        const result = resolveSkip({ root, ci: false, scope: ['package.json'] })
        expect(result.skip).toBe(true)
        expect(result.reason).toContain('版本号')
    })

    it('package-lock.json 仅版本号变更时同样跳过', () => {
        const root = createGitFixture({
            [`${ARTIFACTS_DIR}/r.md`]: ARTIFACT,
            'package.json': '{\n  "version": "0.3.0"\n}\n',
            'package-lock.json': '{\n  "name": "demo",\n  "version": "0.3.0"\n}\n',
        })
        stageWrite(root, 'package.json', '{\n  "version": "0.4.0"\n}\n')
        stageWrite(root, 'package-lock.json', '{\n  "name": "demo",\n  "version": "0.4.0"\n}\n')
        const result = resolveSkip({ root, ci: false, scope: ['package.json', 'package-lock.json'] })
        expect(result.skip).toBe(true)
    })

    it('版本号外加其它字段变更时不跳过', () => {
        const root = createGitFixture({
            [`${ARTIFACTS_DIR}/r.md`]: ARTIFACT,
            'package.json': '{\n  "version": "0.3.0",\n  "type": "module"\n}\n',
        })
        stageWrite(root, 'package.json', '{\n  "version": "0.4.0",\n  "type": "commonjs"\n}\n')
        const result = resolveSkip({ root, ci: false, scope: ['package.json'] })
        expect(result.skip).toBe(false)
    })

    it('非清单文件的版本号变更不豁免（防绕过）', () => {
        const root = createGitFixture({
            [`${ARTIFACTS_DIR}/r.md`]: ARTIFACT,
            'data.json': '{\n  "version": "1.0.0"\n}\n',
        })
        stageWrite(root, 'data.json', '{\n  "version": "2.0.0"\n}\n')
        const result = resolveSkip({ root, ci: false, scope: ['data.json'] })
        expect(result.skip).toBe(false)
    })

    it('版本号变更 + 代码文件同批时不豁免', () => {
        const root = createGitFixture({
            [`${ARTIFACTS_DIR}/r.md`]: ARTIFACT,
            'package.json': '{\n  "version": "0.3.0"\n}\n',
            'src/a.ts': 'export const a = 1\n',
        })
        stageWrite(root, 'package.json', '{\n  "version": "0.4.0"\n}\n')
        stageWrite(root, 'src/a.ts', 'export const a = 2\n')
        const result = resolveSkip({ root, ci: false, scope: ['package.json', 'src/a.ts'] })
        expect(result.skip).toBe(false)
    })

    it('以 ++ / -- 开头的其它内容行不被误吞（防判定击穿）', () => {
        const root = createGitFixture({
            [`${ARTIFACTS_DIR}/r.md`]: ARTIFACT,
            'package.json': '{\n  "version": "0.3.0",\n--OLD\n}\n',
        })
        stageWrite(root, 'package.json', '{\n  "version": "0.4.0",\n++INJECTED\n}\n')
        const result = resolveSkip({ root, ci: false, scope: ['package.json'] })
        expect(result.skip).toBe(false)
    })

    it('删除代码文件 + 版本号 bump 不豁免（删除项须计入）', () => {
        const root = createGitFixture({
            [`${ARTIFACTS_DIR}/r.md`]: ARTIFACT,
            'package.json': '{\n  "version": "0.3.0"\n}\n',
            'src/important.ts': 'export const important = 1\n',
        })
        stageWrite(root, 'package.json', '{\n  "version": "0.4.0"\n}\n')
        runGit(root, ['rm', '-q', 'src/important.ts'])
        const result = resolveSkip({ root, ci: false })
        expect(result.skip).toBe(false)
    })

    it('版本号豁免不依赖工件新鲜度：工件陈旧也无问题', () => {
        const root = createGitFixture({
            [`${ARTIFACTS_DIR}/r.md`]: ARTIFACT,
            'package.json': '{\n  "version": "0.3.0"\n}\n',
        })
        utimesSync(join(root, ARTIFACTS_DIR, 'r.md'), SECONDS(1000), SECONDS(1000))
        stageWrite(root, 'package.json', '{\n  "version": "0.4.0"\n}\n')
        utimesSync(join(root, 'package.json'), SECONDS(1001), SECONDS(1001))
        const result = checkReviewGateArtifacts({ root, ci: false, scope: ['package.json'] })
        expect(result.skipped).toBe(true)
        expect(result.issues).toEqual([])
    })

    it('CLI 对版本号变更 exit 0 并打印跳过原因', () => {
        const root = createGitFixture({
            [`${ARTIFACTS_DIR}/r.md`]: ARTIFACT,
            'package.json': '{\n  "version": "0.3.0"\n}\n',
        })
        stageWrite(root, 'package.json', '{\n  "version": "0.4.0"\n}\n')
        const result = spawnSync(process.execPath, [SCRIPT_PATH, '--root', root, '--scope', 'package.json'], {
            cwd: root,
            encoding: 'utf8',
            env: { ...process.env, CI: '' },
        })
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('跳过')
        expect(result.stdout).toContain('版本号')
    })

    it('CLI 默认（无 --scope）由暂存区推导时同样豁免（原始缺陷复现点）', () => {
        const root = createGitFixture({
            [`${ARTIFACTS_DIR}/r.md`]: ARTIFACT,
            'package.json': '{\n  "version": "0.3.0"\n}\n',
        })
        stageWrite(root, 'package.json', '{\n  "version": "0.4.0"\n}\n')
        const result = spawnSync(process.execPath, [SCRIPT_PATH, '--root', root], {
            cwd: root,
            encoding: 'utf8',
            env: { ...process.env, CI: '' },
        })
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('版本号')
    })
})

describe('checkReviewGateArtifacts', () => {
    it('存在不早于受检范围的工件时通过', () => {
        const root = createFixture({
            [`${ARTIFACTS_DIR}/r.md`]: ARTIFACT,
            'src/a.ts': 'export {}\n',
        })
        utimesSync(join(root, 'src/a.ts'), SECONDS(1000), SECONDS(1000))
        utimesSync(join(root, ARTIFACTS_DIR, 'r.md'), SECONDS(1001), SECONDS(1001))
        const result = checkReviewGateArtifacts({ root, ci: false, scope: ['src/a.ts'] })
        expect(result.issues).toEqual([])
        expect(result.artifacts).toBe(1)
    })

    it('工件早于受检范围时判缺新鲜工件', () => {
        const root = createFixture({
            [`${ARTIFACTS_DIR}/r.md`]: ARTIFACT,
            'src/a.ts': 'export {}\n',
        })
        utimesSync(join(root, ARTIFACTS_DIR, 'r.md'), SECONDS(1000), SECONDS(1000))
        utimesSync(join(root, 'src/a.ts'), SECONDS(1001), SECONDS(1001))
        const result = checkReviewGateArtifacts({ root, ci: false, scope: ['src/a.ts'] })
        expect(result.issues).toHaveLength(1)
        expect(result.issues[0]).toContain('新鲜')
    })

    it('受检范围文件在磁盘上均不存在时按缺件处理', () => {
        const root = createFixture({ [`${ARTIFACTS_DIR}/r.md`]: ARTIFACT })
        const result = checkReviewGateArtifacts({ root, ci: false, scope: ['src/gone.ts'] })
        expect(result.issues).toHaveLength(1)
        expect(result.issues[0]).toContain('均不存在')
    })

    it('没有任何记录时判缺工件', () => {
        const root = createFixture({
            [`${ARTIFACTS_DIR}/README.md`]: '# 装置说明\n',
            'src/a.ts': 'export {}\n',
        })
        const result = checkReviewGateArtifacts({ root, ci: false, scope: ['src/a.ts'] })
        expect(result.issues).toHaveLength(1)
        expect(result.issues[0]).toContain('没有任何记录')
    })

    it('CI 环境跳过并给出原因', () => {
        const root = createFixture({ 'src/a.ts': 'export {}\n' })
        const result = checkReviewGateArtifacts({ root, ci: true, scope: ['src/a.ts'] })
        expect(result.skipped).toBe(true)
        expect(result.issues).toEqual([])
    })
})

describe('CLI 退出码', () => {
    it('缺新鲜工件时 exit 1 并给出修复方向', () => {
        const root = createFixture({
            [`${ARTIFACTS_DIR}/r.md`]: ARTIFACT,
            'src/a.ts': 'export {}\n',
        })
        utimesSync(join(root, ARTIFACTS_DIR, 'r.md'), SECONDS(1000), SECONDS(1000))
        utimesSync(join(root, 'src/a.ts'), SECONDS(1001), SECONDS(1001))
        const result = spawnSync(process.execPath, [SCRIPT_PATH, '--root', root, '--scope', 'src/a.ts'], {
            cwd: root,
            encoding: 'utf8',
            env: { ...process.env, CI: '' },
        })
        expect(result.status).toBe(1)
        expect(result.stderr).toContain('新鲜')
        expect(result.stderr).toContain('修复方向')
    })

    it('存在新鲜工件时 exit 0', () => {
        const root = createFixture({
            [`${ARTIFACTS_DIR}/r.md`]: ARTIFACT,
            'src/a.ts': 'export {}\n',
        })
        utimesSync(join(root, 'src/a.ts'), SECONDS(1000), SECONDS(1000))
        utimesSync(join(root, ARTIFACTS_DIR, 'r.md'), SECONDS(1001), SECONDS(1001))
        const result = spawnSync(process.execPath, [SCRIPT_PATH, '--root', root, '--scope', 'src/a.ts'], {
            cwd: root,
            encoding: 'utf8',
            env: { ...process.env, CI: '' },
        })
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('OK')
    })

    it('CI 环境下 exit 0 并打印跳过原因', () => {
        const root = createFixture({ 'src/a.ts': 'export {}\n' })
        const result = spawnSync(process.execPath, [SCRIPT_PATH, '--root', root, '--scope', 'src/a.ts'], {
            cwd: root,
            encoding: 'utf8',
            env: { ...process.env, CI: '1' },
        })
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('跳过')
    })
})
