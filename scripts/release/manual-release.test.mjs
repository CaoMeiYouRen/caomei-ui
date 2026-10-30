import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { afterAll, describe, expect, it } from 'vitest'
import { CURRENT_VERSION_STATEMENTS, statementFiles } from '../shared/version-statements.mjs'
import {
    assertPublishVersionStatements,
    assertVersionStatements,
    buildAnnounceArgs,
    buildPublishArgs,
    checkDistTagState,
    decideSyncCommit,
    extractChangelogSection,
    formatLocalTagNotPushed,
    isPrereleaseVersion,
    isValidShasum,
    parseArgs,
    parseDistTags,
    parseRemoteTagSha,
    planVersionStatementSync,
    resolveDistTag,
    resolveTagState,
    readUnpackedPackage,
    replacePackageVersion,
    replaceVersionInStatement,
    sha1File,
    STEPS,
    validateDate,
    validateOtp,
    validateVersion,
} from './manual-release.mjs'

const tempDirs = []

function tempDir(prefix) {
    const dir = mkdtempSync(join(tmpdir(), prefix))
    tempDirs.push(dir)
    return dir
}

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

// 直接使用**真实**登记表，锁定真实锚点形态（避免测试与实现静默分叉）
const STATEMENTS = CURRENT_VERSION_STATEMENTS

describe('manual-release 版本句断言', () => {
    it('声明句已同步时无问题', () => {
        const statements = [{ file: 'A.md', pattern: /当前版本[：:]\s*`([^`\s]+)`/u, label: 'A 句' }]
        expect(assertVersionStatements({ 'A.md': '当前版本：`1.0.0`' }, '1.0.0', statements)).toEqual([])
    })

    it('声明句落后一版时给出问题清单', () => {
        const statements = [{ file: 'A.md', pattern: /当前版本[：:]\s*`([^`\s]+)`/u, label: 'A 句' }]
        const problems = assertVersionStatements({ 'A.md': '当前版本：`1.0.0-rc.1`' }, '1.0.0', statements)
        expect(problems).toHaveLength(1)
        expect(problems[0]).toContain('1.0.0-rc.1')
    })

    it('文件缺失或锚点被改写时 fail-closed', () => {
        const statements = [{ file: 'B.md', pattern: /当前版本[：:]\s*`([^`\s]+)`/u, label: 'B 句' }]
        expect(assertVersionStatements({}, '1.0.0', statements)[0]).toContain('文件缺失')
        expect(assertVersionStatements({ 'B.md': '版本：1.0.0' }, '1.0.0', statements)[0]).toContain('锚点')
    })

    it('默认登记表覆盖 README 中英与 roadmap', () => {
        const contentByFile = {
            'README.md': '当前版本：`1.0.0`\n当前最新版本为 `1.0.0`',
            'README.en-US.md': 'Current version is `1.0.0`',
            'docs/plan/roadmap.md': '当前状态：当前版本 `1.0.0`；其余',
        }
        expect(assertVersionStatements(contentByFile, '1.0.0')).toEqual([])
    })
})

describe('manual-release publish 前置断言', () => {
    const writeRoot = (version, files) => {
        const root = tempDir('caomei-publish-')
        writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'caomei-ui', version }))
        for (const [file, content] of Object.entries(files)) {
            const target = join(root, file)
            mkdirSync(dirname(target), { recursive: true })
            writeFileSync(target, content)
        }
        return root
    }

    const synced = {
        'README.md': '当前版本：`1.0.0`\n当前最新版本为 `1.0.0`',
        'README.en-US.md': 'Current version is `1.0.0`',
        'docs/plan/roadmap.md': '当前状态：当前版本 `1.0.0`；其余',
    }

    it('版本一致时通过', () => {
        expect(assertPublishVersionStatements(writeRoot('1.0.0', synced), '1.0.0')).toEqual([])
    })

    it('声明句落后一版时 fail-closed', () => {
        const root = writeRoot('1.0.0', { ...synced, 'README.md': '当前版本：`1.0.0-rc.1`' })
        const problems = assertPublishVersionStatements(root, '1.0.0')
        expect(problems.some((item) => item.includes('1.0.0-rc.1'))).toBe(true)
    })

    it('缺声明句载体时 fail-closed（不得因过滤而放行）', () => {
        const root = writeRoot('1.0.0', { ...synced })
        rmSync(join(root, 'README.en-US.md'))
        const problems = assertPublishVersionStatements(root, '1.0.0')
        expect(problems.some((item) => item.includes('文件缺失'))).toBe(true)
    })

    it('package.json 版本与目标不一致时 fail-closed', () => {
        const root = writeRoot('0.7.0', synced)
        expect(assertPublishVersionStatements(root, '1.0.0')[0]).toContain('漏跑 bump')
    })
})

describe('manual-release 步骤顺序', () => {
    it('sync 必须早于 publish（否则 tarball 内 README 版本句落后一版）', () => {
        expect(STEPS.indexOf('sync')).toBeGreaterThan(-1)
        expect(STEPS.indexOf('publish')).toBeGreaterThan(-1)
        expect(STEPS.indexOf('sync')).toBeLessThan(STEPS.indexOf('publish'))
        expect(STEPS[0]).toBe('preflight')
        expect(STEPS.at(-1)).toBe('announce')
        expect(new Set(STEPS).size).toBe(STEPS.length)
    })
})

describe('manual-release parseArgs', () => {
    it('解析 step 与参数', () => {
        expect(parseArgs(['bump', '--version=0.7.0', '--date=2026-10-10', '--yes'])).toMatchObject({
            step: 'bump',
            version: '0.7.0',
            date: '2026-10-10',
            yes: true,
            dryRun: false,
            error: null,
        })
    })

    it('--dry-run 与 run step', () => {
        expect(parseArgs(['run', '--version=0.7.0', '--dry-run'])).toMatchObject({ step: 'run', dryRun: true })
    })

    it('解析 --otp', () => {
        expect(parseArgs(['publish', '--version=0.7.0', '--otp=123456', '--yes'])).toMatchObject({
            step: 'publish',
            version: '0.7.0',
            otp: '123456',
            yes: true,
            error: null,
        })
    })

    it('解析 --tag', () => {
        expect(parseArgs(['run', '--version=1.0.0-rc.1', '--tag=next', '--dry-run'])).toMatchObject({
            step: 'run',
            version: '1.0.0-rc.1',
            tag: 'next',
            dryRun: true,
            error: null,
        })
        expect(parseArgs(['publish', '--version=1.0.0', '--tag=latest']).tag).toBe('latest')
    })

    it('拒绝未知参数 / 未知 step / 缺 step', () => {
        expect(parseArgs(['bump', '--version=0.7.0', '--nope']).error).toMatch(/不支持的参数/u)
        expect(parseArgs(['nope', '--version=0.7.0']).error).toMatch(/未知 step/u)
        expect(parseArgs(['--version=0.7.0']).error).toMatch(/缺少 step/u)
        expect(parseArgs(['bump', '--version=0.7.0', 'extra']).error).toMatch(/未知位置参数/u)
    })
})

describe('manual-release 校验', () => {
    it('validateVersion 接受 semver、拒绝空与非法', () => {
        expect(validateVersion('0.7.0')).toBe('0.7.0')
        expect(validateVersion('1.0.0-rc.1')).toBe('1.0.0-rc.1')
        expect(() => validateVersion(undefined)).toThrow(/缺少 --version/u)
        expect(() => validateVersion('0.7')).toThrow(/Invalid --version/u)
    })

    it('validateDate 接受 YYYY-MM-DD、拒绝其它形态', () => {
        expect(validateDate('2026-10-10')).toBe('2026-10-10')
        expect(validateDate(undefined)).toBeUndefined()
        expect(() => validateDate('2026/10/10')).toThrow(/Invalid --date/u)
    })

    it('validateOtp 接受 6-8 位数字，未提供时返回 undefined', () => {
        expect(validateOtp('123456')).toBe('123456')
        expect(validateOtp('12345678')).toBe('12345678')
        expect(validateOtp(undefined)).toBeUndefined()
        for (const otp of ['12345', '987654321', 'abcdef']) {
            expect(() => validateOtp(otp)).toThrow('Invalid --otp（期望 6-8 位数字）')
            try {
                validateOtp(otp)
            } catch (error) {
                // 错误日志不得回显 OTP 输入值
                expect(error.message).not.toContain(otp)
            }
        }
    })
})

describe('manual-release dist-tag', () => {
    it('isPrereleaseVersion 按 semver 后缀判定', () => {
        expect(isPrereleaseVersion('1.0.0-rc.1')).toBe(true)
        expect(isPrereleaseVersion('1.0.0-beta.2')).toBe(true)
        expect(isPrereleaseVersion('1.0.0')).toBe(false)
        expect(isPrereleaseVersion('0.7.0')).toBe(false)
    })

    it('resolveDistTag 按版本推断默认通道', () => {
        expect(resolveDistTag('1.0.0-rc.1', undefined)).toBe('next')
        expect(resolveDistTag('1.0.0', undefined)).toBe('latest')
        expect(resolveDistTag('0.7.0', undefined)).toBe('latest')
    })

    it('resolveDistTag 接受显式 next / latest，拒绝未知 tag', () => {
        expect(resolveDistTag('1.0.0-rc.1', 'next')).toBe('next')
        expect(resolveDistTag('1.0.0', 'latest')).toBe('latest')
        expect(resolveDistTag('1.0.0', 'next')).toBe('next')
        expect(() => resolveDistTag('1.0.0-rc.1', 'beta')).toThrow(/Invalid --tag/u)
    })

    it('预发布版本禁止发布到 latest（安全不变量）', () => {
        expect(() => resolveDistTag('1.0.0-rc.1', 'latest')).toThrow(/不得发布到 latest/u)
    })

    it('parseDistTags 解析 npm 输出，非法输入回落空对象', () => {
        expect(parseDistTags('{"latest":"0.7.0","next":"1.0.0-rc.1"}')).toEqual({
            latest: '0.7.0',
            next: '1.0.0-rc.1',
        })
        expect(parseDistTags('not json')).toEqual({})
        expect(parseDistTags('[]')).toEqual({})
        expect(parseDistTags('')).toEqual({})
    })

    it('checkDistTagState 断言目标 dist-tag，且 latest 上不得出现任何预发布版本', () => {
        expect(checkDistTagState({
            version: '1.0.0-rc.1',
            tag: 'next',
            distTags: { latest: '0.7.0', next: '1.0.0-rc.1' },
        })).toEqual({ ok: true, error: null })

        expect(checkDistTagState({
            version: '1.0.0-rc.1',
            tag: 'next',
            distTags: { latest: '0.7.0', next: '1.0.0-rc.2' },
        })).toMatchObject({ ok: false, error: expect.stringContaining('不一致') })

        expect(checkDistTagState({
            version: '1.0.0-rc.1',
            tag: 'next',
            distTags: { latest: '1.0.0-rc.1', next: '1.0.0-rc.1' },
        })).toMatchObject({ ok: false, error: expect.stringContaining('latest dist-tag') })

        // 历史 rc 占用 latest 同样失败（不只拦目标版本）
        expect(checkDistTagState({
            version: '1.0.0-rc.1',
            tag: 'next',
            distTags: { latest: '1.0.0-rc.0', next: '1.0.0-rc.1' },
        })).toMatchObject({ ok: false, error: expect.stringContaining('latest dist-tag') })

        expect(checkDistTagState({
            version: '1.0.0',
            tag: 'latest',
            distTags: { latest: '1.0.0', next: '1.0.0-rc.1' },
        })).toEqual({ ok: true, error: null })
    })
})

describe('manual-release shasum 形态', () => {
    it('isValidShasum 只接受 40 位小写十六进制', () => {
        expect(isValidShasum('a'.repeat(40))).toBe(true)
        expect(isValidShasum('5b59e41aa400b0e59ade6f6f10984ebf1faf3622')).toBe(true)
        expect(isValidShasum('A'.repeat(40))).toBe(false)
        expect(isValidShasum('abc')).toBe(false)
        expect(isValidShasum('')).toBe(false)
    })
})

describe('manual-release CLI 安全不变量', () => {
    const script = join(dirname(fileURLToPath(import.meta.url)), 'manual-release.mjs')
    const runCli = (args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' })

    it('rc + latest 在参数层拒绝，且不执行 publish', () => {
        const result = runCli(['publish', '--version=1.0.0-rc.1', '--tag=latest', '--dry-run'])
        expect(result.status).toBe(1)
        expect(result.stderr).toContain('不得发布到 latest')
        expect(result.stdout).not.toContain('npm publish')
    })

    it('rc + next dry-run 输出 --tag=next', () => {
        const result = runCli(['publish', '--version=1.0.0-rc.1', '--tag=next', '--dry-run'])
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('npm publish --tag=next')
    })
})

describe('manual-release publish 参数', () => {
    it('必须显式带目标 dist-tag', () => {
        expect(buildPublishArgs(undefined, 'next')).toEqual(['publish', '--tag=next'])
        expect(buildPublishArgs(undefined, 'latest')).toEqual(['publish', '--tag=latest'])
        expect(() => buildPublishArgs(undefined, undefined)).toThrow(/缺少目标 dist-tag/u)
    })

    it('有 OTP 时追加 --otp=<code>', () => {
        expect(buildPublishArgs('123456', 'latest')).toEqual(['publish', '--tag=latest', '--otp=123456'])
        expect(buildPublishArgs('123456', 'next')).toEqual(['publish', '--tag=next', '--otp=123456'])
    })
})

describe('manual-release GitHub Release 参数', () => {
    it('预发布标记 --prerelease，非 latest 通道标记 --latest=false', () => {
        expect(buildAnnounceArgs('1.0.0-rc.1', 'next', '/tmp/notes.md')).toEqual([
            'release', 'create', 'v1.0.0-rc.1', '--title', '1.0.0-rc.1', '--verify-tag', '--prerelease', '--latest=false', '--notes-file', '/tmp/notes.md',
        ])
        expect(buildAnnounceArgs('1.0.0', 'latest', '/tmp/notes.md')).toEqual([
            'release', 'create', 'v1.0.0', '--title', '1.0.0', '--verify-tag', '--notes-file', '/tmp/notes.md',
        ])
        expect(buildAnnounceArgs('1.0.0', 'next', undefined)).toEqual([
            'release', 'create', 'v1.0.0', '--title', '1.0.0', '--verify-tag', '--latest=false',
        ])
        expect(() => buildAnnounceArgs('1.0.0', undefined, undefined)).toThrow(/缺少目标 dist-tag/u)
    })
})

describe('manual-release tag 同步', () => {
    it('parseRemoteTagSha 取 tag 对象行，忽略 peeled 行；兼容 lightweight tag', () => {
        const tagSha = 'a'.repeat(40)
        const peeledSha = 'b'.repeat(40)
        const outputText = `${tagSha}\trefs/tags/v0.7.0\n${peeledSha}\trefs/tags/v0.7.0^{}\n`
        expect(parseRemoteTagSha(outputText)).toBe(tagSha)
        expect(parseRemoteTagSha(`${tagSha}\trefs/tags/v0.7.0\n`)).toBe(tagSha)
        expect(parseRemoteTagSha('')).toBeNull()
    })

    it('本地 tag 未推送时提示先 push 再重试 announce', () => {
        const message = formatLocalTagNotPushed('0.7.0', 'a'.repeat(40))
        expect(message).toContain('本地已有 tag v0.7.0')
        expect(message).toContain('git push origin v0.7.0')
        expect(message).toContain('重试 announce')
    })

    it('resolveTagState 覆盖四种本地 / 远程组合', () => {
        const shaA = 'a'.repeat(40)
        const shaB = 'b'.repeat(40)

        expect(resolveTagState({ version: '0.7.0', localSha: null, remoteSha: null })).toMatchObject({
            ok: false,
            error: expect.stringContaining('请先运行 bump'),
        })
        expect(resolveTagState({ version: '0.7.0', localSha: shaA, remoteSha: null })).toMatchObject({
            ok: false,
            error: expect.stringContaining('git push origin v0.7.0'),
        })
        expect(resolveTagState({ version: '0.7.0', localSha: null, remoteSha: shaA })).toMatchObject({
            ok: false,
            error: expect.stringContaining('git fetch --tags'),
        })
        expect(resolveTagState({ version: '0.7.0', localSha: shaA, remoteSha: shaB })).toMatchObject({
            ok: false,
            error: expect.stringContaining('不一致'),
        })
        expect(resolveTagState({ version: '0.7.0', localSha: shaA, remoteSha: shaA })).toEqual({
            ok: true,
            error: null,
        })
    })
})

describe('manual-release extractChangelogSection', () => {
    const changelog = [
        '# caomei-ui',
        '',
        '# Unreleased (2026-10-10)',
        '',
        '* work in progress',
        '',
        '# [0.6.0](https://example.com/compare/v0.5.0...v0.6.0) (2026-10-08)',
        '',
        '### ✨ 新功能',
        '',
        '* **governance:** 某守卫',
        '',
        '# [0.5.0](https://example.com/compare/v0.4.0...v0.5.0) (2026-09-30)',
        '',
        '### 🐛 Bug 修复',
        '',
    ].join('\n')

    it('抽取目标版本段落正文，止于下一个版本标题', () => {
        const section = extractChangelogSection(changelog, '0.6.0')
        expect(section).toContain('### ✨ 新功能')
        expect(section).toContain('某守卫')
        expect(section).not.toContain('Bug 修复')
        expect(section).not.toContain('# [0.5.0]')
    })

    it('不把 Unreleased 或相邻版本误认为目标版本', () => {
        expect(extractChangelogSection(changelog, '0.5.0')).toContain('Bug 修复')
        expect(extractChangelogSection(changelog, '9.9.9')).toBeNull()
    })

    it('版本边界：0.6.0 不匹配 0.6.01 形态', () => {
        const weird = '# [0.6.01](x) (2026-10-08)\n\nbody\n'
        expect(extractChangelogSection(weird, '0.6.0')).toBeNull()
    })
})

describe('manual-release 版本句同步', () => {
    it('replaceVersionInStatement 替换句内版本且保留句式', () => {
        const content = '项目当前版本：`0.6.0`，其余历史 0.5.0。'
        const result = replaceVersionInStatement(content, STATEMENTS[0].pattern, '0.7.0')
        expect(result.changed).toBe(true)
        expect(result.matched).toBe(true)
        expect(result.content).toBe('项目当前版本：`0.7.0`，其余历史 0.5.0。')
    })

    it('已是目标版本时不改内容', () => {
        const result = replaceVersionInStatement('当前版本：`0.7.0`', STATEMENTS[0].pattern, '0.7.0')
        expect(result).toMatchObject({ changed: false, matched: true })
    })

    it('planVersionStatementSync 处理同文件多锚点，且不触碰历史版本', () => {
        const entries = [
            { file: 'README.md', content: '当前版本：`0.6.0`\n当前最新版本为 `0.6.0`\n历史：0.1.0 / 0.2.0' },
            { file: 'README.en-US.md', content: 'Current version is `0.6.0`' },
            { file: 'docs/plan/roadmap.md', content: '当前状态：当前版本 `0.6.0`；0.1.0 起' },
        ]
        const planned = planVersionStatementSync(entries, '0.7.0', STATEMENTS)
        const readme = planned.find((item) => item.file === 'README.md')
        const en = planned.find((item) => item.file === 'README.en-US.md')
        const roadmap = planned.find((item) => item.file === 'docs/plan/roadmap.md')
        expect(readme.content).toBe('当前版本：`0.7.0`\n当前最新版本为 `0.7.0`\n历史：0.1.0 / 0.2.0')
        expect(readme.changed).toBe(true)
        expect(readme.matched).toBe(true)
        expect(en.content).toBe('Current version is `0.7.0`')
        expect(roadmap.content).toBe('当前状态：当前版本 `0.7.0`；0.1.0 起')
    })

    it('预发布版本与正式版可双向替换', () => {
        const entries = [
            { file: 'README.md', content: '当前版本：`0.7.0`\n当前最新版本为 `0.7.0`' },
            { file: 'README.en-US.md', content: 'Current version is `0.7.0`' },
            { file: 'docs/plan/roadmap.md', content: '当前状态：当前版本 `0.7.0`；' },
        ]
        const rc = planVersionStatementSync(entries, '1.0.0-rc.1', STATEMENTS)
        expect(rc.find((item) => item.file === 'docs/plan/roadmap.md').content).toBe('当前状态：当前版本 `1.0.0-rc.1`；')
        expect(rc.find((item) => item.file === 'README.md').content).toContain('当前版本：`1.0.0-rc.1`')

        const stableEntries = rc.map((item) => ({ file: item.file, content: item.content }))
        const stable = planVersionStatementSync(stableEntries, '1.0.0', STATEMENTS)
        expect(stable.find((item) => item.file === 'docs/plan/roadmap.md').content).toBe('当前状态：当前版本 `1.0.0`；')
    })

    it('未匹配锚点时标记 matched=false（不改内容）', () => {
        const planned = planVersionStatementSync([{ file: 'README.md', content: '没有版本句' }], '0.7.0', STATEMENTS)
        expect(planned[0]).toMatchObject({ matched: false, changed: false })
    })

    it('statementFiles 由登记表去重派生同步文件清单', () => {
        expect(statementFiles()).toEqual(['README.md', 'README.en-US.md', 'docs/plan/roadmap.md'])
    })
})

describe('manual-release replacePackageVersion', () => {
    it('保持格式与末尾换行', () => {
        const raw = '{\n  "name": "x",\n  "version": "0.6.0",\n  "type": "module"\n}\n'
        const { content, changed } = replacePackageVersion(raw, '0.7.0')
        expect(changed).toBe(true)
        expect(content).toBe('{\n  "name": "x",\n  "version": "0.7.0",\n  "type": "module"\n}\n')
        expect(content.endsWith('\n')).toBe(true)
    })

    it('同版本不改；缺 version 字段抛错', () => {
        expect(replacePackageVersion('{\n  "version": "0.7.0"\n}\n', '0.7.0').changed).toBe(false)
        expect(() => replacePackageVersion('{\n  "name": "x"\n}\n', '0.7.0')).toThrow(/未找到 "version" 字段/u)
    })
})

describe('decideSyncCommit', () => {
    it('有改写时提交改写文件', () => {
        expect(decideSyncCommit({ changedFiles: ['README.md'] })).toEqual({ action: 'commit', files: ['README.md'] })
    })

    it('已是目标版本但文件仍脏时 fail-closed', () => {
        expect(decideSyncCommit({ changedFiles: [], dirtyFiles: ['README.md'] })).toEqual({ action: 'error', files: ['README.md'] })
    })

    it('无改写且无脏文件时跳过', () => {
        expect(decideSyncCommit({ changedFiles: [], dirtyFiles: [] })).toEqual({ action: 'skip', files: [] })
    })

    it('改写优先于脏文件', () => {
        expect(decideSyncCommit({ changedFiles: ['a.md'], dirtyFiles: ['b.md'] })).toEqual({ action: 'commit', files: ['a.md'] })
    })
})

describe('manual-release 发布后校验工具', () => {
    it('sha1File 与 readUnpackedPackage 读取解包产物', () => {
        const dir = tempDir('caomei-unpack-')
        writeFileSync(join(dir, 'a.txt'), 'hello')
        expect(sha1File(join(dir, 'a.txt'))).toMatch(/^[0-9a-f]{40}$/u)

        const unpack = tempDir('caomei-pkg-')
        const packageDir = join(unpack, 'package')
        mkdirSync(packageDir)
        writeFileSync(
            join(packageDir, 'package.json'),
            JSON.stringify({ name: 'caomei-ui', version: '0.7.0', exports: { '.': './dist/index.js', './theme.css': './dist/x.css' } }),
        )
        expect(readUnpackedPackage(unpack)).toEqual({
            name: 'caomei-ui',
            version: '0.7.0',
            exports: ['.', './theme.css'],
        })
    })
})
