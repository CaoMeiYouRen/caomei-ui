import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    EXEMPT_COMMANDS,
    GIT_SUBCOMMANDS,
    MIN_CODE_LINES,
    MIN_COMMANDS,
    MIN_SCANNED_FILES,
    checkDocsGitRevision,
    extractCodeRegions,
    findGitCommands,
    inspectRevisionToken,
    isPersistentRevision,
    revisionCandidates,
    scanDocument,
} from './check-docs-git-revision.mjs'

const SCRIPT = resolve(dirname(new URL(import.meta.url).pathname), 'check-docs-git-revision.mjs')
const tempDirs = []
const tinyBounds = { files: 1, codeLines: 1, commands: 1 }

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

function makeTree(files) {
    const root = mkdtempSync(join(tmpdir(), 'check-docs-git-revision-'))
    tempDirs.push(root)
    for (const [rel, content] of Object.entries(files)) {
        const file = join(root, rel)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    return root
}

/** 把命令包进行内代码后扫描（确定性绝对路径，不依赖 cwd）。 */
function scanInline(command, { pathExists } = {}) {
    const source = ['前置说明。', '', `\`${command}\``].join('\n')
    return scanDocument('/repo/docs/x.md', source, { pathExists, root: '/repo/docs' })
}

/** 同行带「本地瞬态」标注的行内命令（reflog 标注口径的正例形态）。 */
function scanLabeled(command) {
    const source = `说明。\`${command}\`（**本地瞬态取证**、非跨机器可复现证据）`
    return scanDocument('/repo/docs/x.md', source, { root: '/repo/docs' })
}

describe('extractCodeRegions', () => {
    it('区分围栏与行内，且围栏行本身不计入', () => {
        const source = ['前文 `git diff` 后文', '', '```sh', 'git log x', '```'].join('\n')
        const segments = extractCodeRegions(source)
        expect(segments).toEqual([
            { line: 1, text: 'git diff', kind: 'inline', source: '前文 `git diff` 后文' },
            { line: 4, text: 'git log x', kind: 'fence', source: 'git log x' },
        ])
    })

    it('围栏内多行逐行产出（解析不跨行）', () => {
        const source = ['```sh', 'git diff --cached', 'docs/x.md', '```'].join('\n')
        const commands = findGitCommands(extractCodeRegions(source))
        expect(commands).toHaveLength(1)
        expect(commands[0]).toMatchObject({ line: 2, sub: 'diff' })
    })
})

describe('findGitCommands', () => {
    it('在行内分隔符处截断，避免吞掉管道右侧命令', () => {
        const source = '```sh\ngit diff 2f8dc00 --numstat | awk \'{a+=$1}\'\n```'
        const [command] = findGitCommands(extractCodeRegions(source))
        expect(command.text).toBe('git diff 2f8dc00 --numstat')
    })

    it('只识别登记的子命令（含 rev-list / reflog 扩面）', () => {
        expect(GIT_SUBCOMMANDS).toEqual(['log', 'show', 'diff', 'grep', 'rev-list', 'reflog'])
        expect(findGitCommands(extractCodeRegions('```sh\ngit status\n```'))).toEqual([])
    })

    it('prose 中的命令名提及不被当作命令（不在代码区）', () => {
        expect(findGitCommands(extractCodeRegions('与 git diff 为空。'))).toEqual([])
    })
})

describe('revisionCandidates / inspectRevisionToken', () => {
    it('index 与 worktree 作用域形态无 revision（`:path` 候选由 inspectRevisionToken 放行）', () => {
        expect(revisionCandidates('diff', '--cached --numstat')).toEqual([])
        expect(revisionCandidates('log', '-p')).toEqual([])
        expect(revisionCandidates('show', ':<file>')).toEqual([':<file>'])
        expect(inspectRevisionToken(':<file>')).toBeNull()
    })

    it('grep 的首个非 flag 令牌是 pattern，不算 revision', () => {
        expect(revisionCandidates('grep', '-nE pattern -- paths')).toEqual([])
        expect(revisionCandidates('grep', '-nE pattern b1da270')).toEqual(['b1da270'])
    })

    it('持久形态判定', () => {
        for (const token of ['2f8dc00', 'b1da270', '64a45d8~1', 'v0.3.0', '0.4.0', '<base>', '<end>']) {
            expect(isPersistentRevision(token), token).toBe(true)
        }
        for (const token of ['HEAD', 'main', 'origin/main', '@{u}']) {
            expect(isPersistentRevision(token), token).toBe(false)
        }
    })

    it('范围与 rev:path 复合形态', () => {
        expect(inspectRevisionToken('2f8dc00..fd2ff40')).toBeNull()
        expect(inspectRevisionToken('64a45d8~1..e56ea2f')).toBeNull()
        expect(inspectRevisionToken('b1da270:test/capture/baseline.json')).toBeNull()
        expect(inspectRevisionToken('src/')).toBeNull()
        expect(inspectRevisionToken('test/capture/baseline.json')).toBeNull()
        expect(inspectRevisionToken('HEAD:~1')).toMatchObject({ kind: 'head' })
        expect(inspectRevisionToken('v0.3.0..HEAD')).toMatchObject({ kind: 'head' })
        expect(inspectRevisionToken('f1b0b22..main')).toMatchObject({ kind: 'non-persistent' })
    })
})

describe('scanDocument 正例（必须命中）', () => {
    it.each([
        ['git show HEAD:docs/.vitepress/theme/motion.css', 'head-revision'],
        ['git log HEAD..@{u}', 'head-revision'],
        ['git diff HEAD~1 --numstat', 'head-revision'],
        ['git log f1b0b22..main', 'non-persistent-revision'],
        ['git log $(git rev-parse HEAD)', 'unverifiable-shape'],
    ])('命中：%s → %s', (command, type) => {
        const { violations } = scanInline(command)
        expect(violations).toHaveLength(1)
        expect(violations[0].type).toBe(type)
    })
})

describe('scanDocument 反例（合法取证命令不得误报）', () => {
    it.each([
        'git diff --cached --numstat',
        'git diff --cached --name-only --diff-filter=ACMR',
        'git show :<file>',
        'git diff src/',
        'git diff test/capture/baseline.json',
        'git diff',
        'git diff --stat',
        'git log -p',
        'git show',
        'git grep -nE "keydown|keyup" -- \':!node_modules\' | wc -l',
        'git diff 2f8dc00 --numstat | awk \'END{print n}\'',
        'git log --oneline v0.3.0..b1da270 | wc -l',
        'git log --oneline 64a45d8~1..e56ea2f | wc -l',
        'git diff <base>..<end> --numstat',
        'git show b1da270:test/capture/baseline.json | grep -c icon-only',
        'git show v0.3.0:src/components/select/select.vue',
        'git log --oneline --grep=\'^feat\' --grep=\'^fix\' v0.3.0..b1da270',
    ])('不误报：%s', (command) => {
        expect(scanInline(command).violations).toEqual([])
    })
})

describe('checkDocsGitRevision（合成受检面）', () => {
    it('发现 HEAD 违规并给出文件:行号', () => {
        const root = makeTree({ 'a.md': ['```sh', 'git show HEAD:x', '```'].join('\n') })
        const result = checkDocsGitRevision(root, { exemptions: [], bounds: tinyBounds })
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('a.md:2')
        expect(result.errors.join('\n')).toContain('[head-revision]')
    })

    it('豁免项不再命中即报错（防永久豁免），且以受检根相对路径匹配', () => {
        const root = makeTree({ 'a.md': '```sh\ngit diff --cached\n```\n' })
        const result = checkDocsGitRevision(root, {
            exemptions: [{ file: 'a.md', pattern: /^git log HEAD$/, reason: '测试用' }],
            bounds: tinyBounds,
        })
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('不再命中任何命令')
        expect(result.details.exemptions).toEqual([0])
    })

    it('豁免项命中时被真正放行（计数为 1，且不报 head-revision）', () => {
        const root = makeTree({ 'a.md': '```sh\ngit log HEAD\n```\n' })
        const result = checkDocsGitRevision(root, {
            exemptions: [{ file: 'a.md', pattern: /^git log HEAD$/, reason: '测试用' }],
            bounds: tinyBounds,
        })
        expect(result.errors).toEqual([])
        expect(result.details.exemptions).toEqual([1])
    })

    it('受检面低于下界即报错', () => {
        const root = makeTree({ 'a.md': '```sh\ngit diff 2f8dc00\n```\n' })
        const result = checkDocsGitRevision(root, { exemptions: [] })
        expect(result.errors.join('\n')).toContain('低于下界')
    })
})

describe('仓库不变量', () => {
    it('当前仓库零取证命令 revision 违规且受检面未收窄', () => {
        // 绝对下界：独立于代码常量 —— 常量被下调时本断言仍会红（防「下界被静默放宽」）
        expect(MIN_SCANNED_FILES).toBeGreaterThanOrEqual(200)
        expect(MIN_CODE_LINES).toBeGreaterThanOrEqual(3000)
        expect(MIN_COMMANDS).toBeGreaterThanOrEqual(50)
        const result = checkDocsGitRevision()
        expect(result.errors).toEqual([])
        expect(result.details.files).toBeGreaterThanOrEqual(MIN_SCANNED_FILES)
        expect(result.details.commands).toBeGreaterThanOrEqual(MIN_COMMANDS)
    })

    it('豁免清单为 2 条且均带理由', () => {
        expect(EXEMPT_COMMANDS).toHaveLength(2)
        for (const entry of EXEMPT_COMMANDS) {
            expect(entry.reason.length).toBeGreaterThan(0)
        }
    })
})

describe('scanDocument 新增边界（W1~W4 修复后）', () => {
    it.each([
        ['git show \'HEAD:x\'', 'head-revision'],
        ['git show "HEAD"', 'head-revision'],
        ['git log --no-pager HEAD', 'head-revision'],
        ['git -C /repo log HEAD', 'head-revision'],
        ['git -c x=y show HEAD', 'head-revision'],
        ['git log v0.3.0..', 'head-revision'],
        ['git log ..b1da270', 'head-revision'],
    ])('引号 / 全局选项 / 半开区间仍命中：%s', (command, type) => {
        const { violations } = scanInline(command)
        expect(violations).toHaveLength(1)
        expect(violations[0].type).toBe(type)
    })

    it.each(['git log origin/main', 'git log refs/heads/main', 'git log feature/foo'])(
        '含 `/` 的非持久 ref 命中（路径不存在）：%s',
        (command) => {
            const { violations } = scanInline(command, { pathExists: () => false })
            expect(violations).toHaveLength(1)
            expect(violations[0].type).toBe('non-persistent-revision')
        },
    )

    it.each(['git diff src/', 'git diff test/capture/baseline.json', 'git diff docs/x.md'])(
        '仓库内路径 / 带扩展名按 pathspec 放行：%s',
        (command) => {
            const { violations } = scanInline(command, { pathExists: () => true })
            expect(violations).toEqual([])
        },
    )

    it.each(['git log --grep \'fix\' HEAD', 'git log -S\'.caomei\' HEAD', 'git log --author \'x\' HEAD'])(
        '引号取值后的 revision 仍被检出（R2 W4 回归锁定）',
        (command) => {
            const { violations } = scanInline(command)
            expect(violations).toHaveLength(1)
            expect(violations[0].type).toBe('head-revision')
        },
    )

    it.each(['git log --grep=\'HEAD is banned\'', 'git grep -nE \'HEAD\'', 'git log --grep=\'HEAD\'', 'git log --grep=\'@\''])(
        '模式文本中的 HEAD 不误报（R2 W1 过度闭合 + R3 suggest 锁定）',
        (command) => {
            expect(scanInline(command).violations).toEqual([])
        },
    )

    it('引号内的 reflog 形态 HEAD@{n} 判 head-revision（R3 suggest 锁定）', () => {
        const { violations } = scanInline('git log \'HEAD@{1}\'')
        expect(violations).toHaveLength(1)
        expect(violations[0].type).toBe('head-revision')
    })

    it('引号内的命令替换判 unverifiable-shape（R2 suggest 7 锁定）', () => {
        const { violations } = scanInline('git log "$(git rev-parse HEAD)"')
        expect(violations).toHaveLength(1)
        expect(violations[0].type).toBe('unverifiable-shape')
    })

    it.each(['git log -n 5 b1da270', 'git diff -U 3 --cached', 'git log -S\'.caomei\' b1da270'])(
        '分离式 flag 取值不误报：%s',
        (command) => {
            expect(scanInline(command).violations).toEqual([])
        },
    )
})

describe('取证命令守卫扩面（rev-list 端点 / reflog 本地瞬态标注）', () => {
    it.each([
        ['git rev-list --count origin/master..4773f7e', 'non-persistent-revision'],
        ['git rev-list --count origin/master..HEAD', 'non-persistent-revision'],
        ['git rev-list --count origin/main..b1da270', 'non-persistent-revision'],
    ])('rev-list 区间端点非持久即命中：%s → %s', (command, type) => {
        const { violations } = scanInline(command, { pathExists: () => false })
        expect(violations).toHaveLength(1)
        expect(violations[0].type).toBe(type)
    })

    it.each([
        'git rev-list --count 4773f7e..4773f7e',
        'git rev-list --count 64a45d8~1..e56ea2f',
        'git rev-list -n 1 v0.2.0',
        'git rev-list --count <base>..<end>',
    ])('rev-list 合法形态不误报：%s', (command) => {
        expect(scanInline(command).violations).toEqual([])
    })

    it('reflog 的 ref 参数与子命令都不是 revision 候选', () => {
        expect(revisionCandidates('reflog', 'show origin/master --date=iso')).toEqual([])
        expect(revisionCandidates('reflog', '--all')).toEqual([])
    })

    it('无参 reflog 的 prose 提及同样须标注（该族不适用零 rev 边界）', () => {
        const { violations } = scanInline('git reflog')
        expect(violations).toHaveLength(1)
        expect(violations[0].type).toBe('unlabeled-transient')
    })

    it('紧邻否定前缀（非本地瞬态）不构成标注', () => {
        const { violations } = scanDocument('/repo/docs/x.md', '说明。`git reflog show origin/master`（非本地瞬态可复算）', { root: '/repo/docs' })
        expect(violations).toHaveLength(1)
        expect(violations[0].type).toBe('unlabeled-transient')
    })

    it('reflog 未标注本地瞬态即命中 unlabeled-transient', () => {
        const { violations } = scanInline('git reflog show origin/master --date=iso')
        expect(violations).toHaveLength(1)
        expect(violations[0].type).toBe('unlabeled-transient')
    })

    it.each([
        'git reflog show origin/master --date=iso',
        'git reflog -n 5',
        'git reflog show \'HEAD@{1}\'',
    ])('reflog 同行标注本地瞬态即放行（含 HEAD@{n} 原生语法）：%s', (command) => {
        expect(scanLabeled(command).violations).toEqual([])
    })
})

describe('CLI 负向对照（以引用名为端点的命令）', () => {
    it('以 origin/master 为端点的 rev-list 令 CLI exit 1', () => {
        const root = makeTree({
            'a.md': ['```sh', 'git rev-list --count origin/master..4773f7e', '```'].join('\n'),
        })
        const result = spawnSync('node', [SCRIPT, '--root', root], { encoding: 'utf8' })
        expect(result.status).toBe(1)
        expect(result.stderr).toContain('[non-persistent-revision]')
    })

    it('未标注的 reflog 令 CLI exit 1', () => {
        const root = makeTree({ 'a.md': ['```sh', 'git reflog show origin/master', '```'].join('\n') })
        const result = spawnSync('node', [SCRIPT, '--root', root], { encoding: 'utf8' })
        expect(result.status).toBe(1)
        expect(result.stderr).toContain('[unlabeled-transient]')
    })

    it('端点已钉哈希且 reflog 已标注时合成受检面判通过', () => {
        const root = makeTree({
            'a.md': [
                '```sh',
                'git rev-list --count 4773f7e..4773f7e',
                'git reflog show origin/master --date=iso  # 本地瞬态',
                '```',
            ].join('\n'),
        })
        const result = checkDocsGitRevision(root, { exemptions: [], bounds: tinyBounds })
        expect(result.errors).toEqual([])
        expect(result.ok).toBe(true)
    })

    it('默认受检根（仓库 docs/）exit 0', () => {
        expect(spawnSync('node', [SCRIPT], { encoding: 'utf8' }).status).toBe(0)
    })

    it('未知参数 / 目标不存在 / 目标是文件 / 尾随多余参数 exit 2', () => {
        const file = join(makeTree({ 'a.md': '# x\n' }), 'a.md')
        expect(spawnSync('node', [SCRIPT, '--bogus'], { encoding: 'utf8' }).status).toBe(2)
        expect(spawnSync('node', [SCRIPT, '--root', join(tmpdir(), 'nope-xyz')], { encoding: 'utf8' }).status).toBe(2)
        expect(spawnSync('node', [SCRIPT, '--root', file], { encoding: 'utf8' }).status).toBe(2)
        expect(spawnSync('node', [SCRIPT, '--root', tmpdir(), '--bogus'], { encoding: 'utf8' }).status).toBe(2)
    })
})
