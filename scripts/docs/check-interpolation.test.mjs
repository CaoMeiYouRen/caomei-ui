import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    INTERPOLATION_ALLOWLIST,
    LITERAL_INTERPOLATION_RE,
    MIN_SCANNED_FILES,
    REQUIRED_SCAN_PREFIXES,
    checkInterpolationAllowlist,
    checkScannedScope,
    findLiteralInterpolations,
    resolveTargetRoot,
    runInterpolationCheck,
    stripAllowedInterpolations,
} from './check-interpolation.mjs'
import { VERSION_SURFACES } from './check-site-version.mjs'

/** 自工作目录向上定位仓库根（以 `.github/skills` 为锚点）。 */
function resolveRepoRoot() {
    let dir = process.cwd()
    while (!existsSync(join(dir, '.github/skills'))) {
        const parent = dirname(dir)
        if (parent === dir) {
            throw new Error('未能定位仓库根目录')
        }
        dir = parent
    }
    return dir
}

const PROJECT_ROOT = resolveRepoRoot()
const SCRIPT_PATH = join(PROJECT_ROOT, 'scripts/docs/check-interpolation.mjs')

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

function createFixture(files) {
    const dir = mkdtempSync(join(tmpdir(), 'check-interpolation-'))
    tempDirs.push(dir)
    for (const [relativePath, content] of Object.entries(files)) {
        const file = join(dir, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    return dir
}

const VERSION_PAGE = { file: 'docs/guide/a.md', expect: /\{\{\s*theme\.version\s*\}\}/u }
const EN_VERSION_PAGE = { file: 'docs/i18n/en-US/guide/a.md', expect: /\{\{\s*theme\.version\s*\}\}/u }

describe('字面双花括号识别', () => {
    it('命中围栏外的字面双花括号并报出行号', () => {
        const issues = findLiteralInterpolations(
            [{ file: 'docs/a.md', content: '第一行\n描述插值：{{ theme.version }}\n' }],
            [],
        )
        expect(issues).toHaveLength(1)
        expect(issues[0]).toMatchObject({ type: 'literal-interpolation', file: 'docs/a.md', line: 2 })
        expect(issues[0].message).toContain('{{ theme.version }}')
    })

    it('行内代码不豁免（仍参与模板求值）', () => {
        const issues = findLiteralInterpolations(
            [{ file: 'docs/a.md', content: '写法：`{{ theme.version }}`\n' }],
            [],
        )
        expect(issues).toHaveLength(1)
    })

    it('围栏代码块（``` 与 ~~~）内的字面双花括号不命中', () => {
        const content = [
            '```vue',
            '当前：{{ mode }}',
            '```',
            '',
            '~~~',
            '值：{{ foo }}',
            '~~~',
            '',
        ].join('\n')
        expect(findLiteralInterpolations([{ file: 'docs/a.md', content }], [])).toEqual([])
    })

    it('单个花括号、模板占位以外的文本不误报', () => {
        const content = '对象：{ a: 1 }\nCSS：`{ color: red }`\n'
        expect(findLiteralInterpolations([{ file: 'docs/a.md', content }], [])).toEqual([])
    })

    it('未闭合围栏后的内容按围栏内处理（与完整性守卫同一围栏口径）', () => {
        const content = '```\n围栏内 {{ a }}\n未闭合，其后的 {{ b }} 亦视为围栏内\n'
        expect(findLiteralInterpolations([{ file: 'docs/a.md', content }], [])).toEqual([])
    })

    it('登记页的已声明插值形态放行，额外插值仍命中', () => {
        const okContent = '版本：**v{{ theme.version }}**\n'
        expect(findLiteralInterpolations([{ file: 'docs/guide/a.md', content: okContent }], [VERSION_PAGE])).toEqual([])

        const badContent = '版本：**v{{ theme.version }}**，另见 {{ other.value }}\n'
        const issues = findLiteralInterpolations([{ file: 'docs/guide/a.md', content: badContent }], [VERSION_PAGE])
        expect(issues).toHaveLength(1)
        expect(issues[0].message).toContain('{{ other.value }}')
    })

    it('CRLF 行尾与多行同现时逐行报出', () => {
        const content = 'a {{ x }}\r\n\r\nb {{ y }}\r\n'
        const issues = findLiteralInterpolations([{ file: 'docs/a.md', content }], [])
        expect(issues.map((issue) => issue.line)).toEqual([1, 3])
    })
})

describe('stripAllowedInterpolations', () => {
    it('剥离登记形态后保留其余文本', () => {
        const residue = stripAllowedInterpolations('v{{ theme.version }} 与 {{ other }}', [VERSION_PAGE])
        expect(residue).toContain('{{ other }}')
        expect(residue).not.toContain('theme.version')
    })

    it('同一行多次出现的登记形态全部剥离', () => {
        const residue = stripAllowedInterpolations('{{ theme.version }}{{ theme.version }}', [VERSION_PAGE])
        expect(residue.match(LITERAL_INTERPOLATION_RE)).toBeNull()
    })

    it('保留 expect 的原有 flag（仅追加 g，不丢弃 i / s / m）', () => {
        const entry = { file: 'docs/a.md', expect: /\{\{\s*theme\.version\s*\}\}/iu }
        expect(stripAllowedInterpolations('{{ THEME.VERSION }}', [entry])).toBe('')
    })
})

describe('checkInterpolationAllowlist', () => {
    it('空登记表判受检范围收窄', () => {
        expect(checkInterpolationAllowlist([], PROJECT_ROOT).map((issue) => issue.type)).toEqual(['allowlist-scope-narrowed'])
    })

    it('缺某语言前缀判受检范围收窄', () => {
        const root = createFixture({ 'docs/guide/a.md': '版本：**v{{ theme.version }}**\n' })
        expect(checkInterpolationAllowlist([VERSION_PAGE], root).map((issue) => issue.type)).toEqual(['allowlist-scope-narrowed'])
    })

    it('文件缺失与插值形态失效分别报出（反向校验）', () => {
        const root = createFixture({
            'docs/guide/a.md': '版本：**v{{ theme.version }}**\n',
            'docs/i18n/en-US/guide/a.md': '无插值的英文页\n',
        })
        const issues = checkInterpolationAllowlist(
            [VERSION_PAGE, EN_VERSION_PAGE, { ...VERSION_PAGE, file: 'docs/guide/gone.md' }],
            root,
        )
        expect(issues.map((issue) => `${issue.type}:${issue.file}`)).toEqual([
            'allowlist-stale:docs/i18n/en-US/guide/a.md',
            'allowlist-missing:docs/guide/gone.md',
        ])
    })

    it('登记齐备且形态命中时零问题', () => {
        const root = createFixture({
            'docs/guide/a.md': '版本：**v{{ theme.version }}**\n',
            'docs/i18n/en-US/guide/a.md': 'Version: **v{{ theme.version }}**\n',
        })
        expect(checkInterpolationAllowlist([VERSION_PAGE, EN_VERSION_PAGE], root)).toEqual([])
    })
})

describe('checkScannedScope', () => {
    it('文件数低于下界判受检范围收窄', () => {
        expect(checkScannedScope(['docs/guide/a.md', 'docs/i18n/en-US/guide/a.md'], MIN_SCANNED_FILES).map((issue) => issue.type))
            .toEqual(['scan-scope-narrowed'])
    })

    it('缺语言前缀判受检范围收窄', () => {
        const files = Array.from({ length: MIN_SCANNED_FILES }, (_value, index) => `docs/guide/page-${index}.md`)
        const issues = checkScannedScope(files, MIN_SCANNED_FILES)
        expect(issues.map((issue) => issue.message)).toEqual([expect.stringContaining('docs/i18n/en-US/')])
    })

    it('覆盖下界与前缀时零问题', () => {
        const files = [
            ...Array.from({ length: MIN_SCANNED_FILES }, (_value, index) => `docs/guide/page-${index}.md`),
            'docs/i18n/en-US/guide/a.md',
        ]
        expect(checkScannedScope(files, MIN_SCANNED_FILES)).toEqual([])
    })

    it('受检前缀声明未被静默收窄', () => {
        expect(REQUIRED_SCAN_PREFIXES).toEqual(['docs/guide/', 'docs/i18n/en-US/'])
    })
})

describe('runInterpolationCheck', () => {
    it('注入文件集时对围栏外插值判 literal-interpolation', async () => {
        const root = createFixture({
            'docs/guide/a.md': '版本：**v{{ theme.version }}**\n',
            'docs/i18n/en-US/guide/a.md': 'Version: **v{{ theme.version }}**\n',
            'docs/plan/note.md': '误写：{{ theme.version }}\n',
        })
        const result = await runInterpolationCheck(root, {
            files: ['docs/guide/a.md', 'docs/i18n/en-US/guide/a.md', 'docs/plan/note.md'],
            allowlist: [VERSION_PAGE, EN_VERSION_PAGE],
            minScannedFiles: 1,
        })
        const literal = result.issues.filter((issue) => issue.type === 'literal-interpolation')
        expect(literal).toHaveLength(1)
        expect(literal[0].file).toBe('docs/plan/note.md')
    })

    it('登记表失效时报 allowlist-stale（即便受检文件数不足）', async () => {
        const root = createFixture({
            'docs/guide/a.md': '已移除插值\n',
            'docs/i18n/en-US/guide/a.md': 'Version: **v{{ theme.version }}**\n',
        })
        const result = await runInterpolationCheck(root, {
            files: ['docs/guide/a.md', 'docs/i18n/en-US/guide/a.md'],
            allowlist: [VERSION_PAGE, EN_VERSION_PAGE],
            minScannedFiles: 1,
        })
        expect(result.issues.map((issue) => issue.type)).toContain('allowlist-stale')
    })
})

describe('resolveTargetRoot', () => {
    it('未知参数与非仓库目录按错误返回，含 package.json 者被接受', () => {
        expect(resolveTargetRoot('--verbose').error).toContain('不支持的参数')
        expect(resolveTargetRoot(join(tmpdir(), 'missing-root-xyz')).error).toContain('不是仓库根')
        const root = createFixture({ 'package.json': '{}' })
        expect(resolveTargetRoot(root, '/repo')).toEqual({ root, error: null })
    })
})

describe('CLI 退出码', () => {
    it('非法目标目录按失败退出', () => {
        const missing = spawnSync(process.execPath, [SCRIPT_PATH, join(tmpdir(), 'missing-root-xyz')], { encoding: 'utf8' })
        expect(missing.status).toBe(1)
        expect(missing.stderr).toContain('不是仓库根')
    })

    it('仓库自身通过时 exit 0 并打印受检面与登记页数', () => {
        const result = spawnSync(process.execPath, [SCRIPT_PATH], { encoding: 'utf8' })
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('围栏外无字面双花括号')
    })

    it('含 package.json 但非 git 仓库的目标目录给受控错误而非堆栈', () => {
        const root = createFixture({ 'package.json': '{}', 'docs/a.md': '内容\n' })
        const result = spawnSync(process.execPath, [SCRIPT_PATH, root], { encoding: 'utf8' })
        expect(result.status).toBe(1)
        expect(result.stderr).toContain('不是 git 仓库')
        expect(result.stderr).not.toContain('at ')
    })
})

describe('仓库不变量', () => {
    it('登记表结构未被静默收窄，且当前仓库零问题', async () => {
        expect(INTERPOLATION_ALLOWLIST.length).toBeGreaterThanOrEqual(4)
        expect(INTERPOLATION_ALLOWLIST.some((entry) => entry.file.startsWith('docs/guide/'))).toBe(true)
        expect(INTERPOLATION_ALLOWLIST.some((entry) => entry.file.startsWith('docs/i18n/en-US/'))).toBe(true)
        for (const entry of INTERPOLATION_ALLOWLIST) {
            expect(existsSync(join(PROJECT_ROOT, entry.file))).toBe(true)
        }

        const result = await runInterpolationCheck(PROJECT_ROOT)
        expect(result.scannedFiles).toBeGreaterThanOrEqual(MIN_SCANNED_FILES)
        expect(result.issues).toEqual([])
    })

    it('允许插值登记表与版本展示面（页面面）保持同集合（消除第二事实源漂移）', () => {
        const versionPages = VERSION_SURFACES.filter((surface) => surface.kind === 'page').map((surface) => surface.file).sort()
        const allowlistFiles = INTERPOLATION_ALLOWLIST.map((entry) => entry.file).sort()
        expect(allowlistFiles).toEqual(versionPages)
    })
})
