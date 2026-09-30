import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    CURRENT_VERSION_STATEMENTS,
    SERIES_LITERAL_RE,
    SERIES_LITERAL_SURFACES,
    VERSION_LITERAL_RE,
    VERSION_SURFACES,
    checkVersionSurfaces,
    findCurrentVersionDrift,
    findHardcodedVersions,
    findSeriesLiterals,
    resolveTargetRoot,
    runSiteVersionCheck,
} from './check-site-version.mjs'

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
const SCRIPT_PATH = join(PROJECT_ROOT, 'scripts/docs/check-site-version.mjs')

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

function createFixture(files) {
    const dir = mkdtempSync(join(tmpdir(), 'check-site-version-'))
    tempDirs.push(dir)
    for (const [relativePath, content] of Object.entries(files)) {
        const file = join(dir, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    return dir
}

describe('三段式版本字面量识别', () => {
    it('命中三段式版本（含 v 前缀与前后缀文本）', () => {
        for (const line of ['当前版本 0.2.0', 'v1.2.3', '核心版本 10.20.30', '见 0.2.0 的 BREAKING']) {
            expect([...line.matchAll(VERSION_LITERAL_RE)].map((match) => match[0])).toEqual([line.match(/\d+\.\d+\.\d+/)[0]])
        }
    })

    it('不误报两段式版本、日期与带加号的运行时要求', () => {
        for (const line of ['VitePress 1.6 的 themeConfig', '2026-09-22 发布', '0.2 阶段', 'Vue 3.5+ 作为 peer', 'reka-ui 2.10']) {
            expect([...line.matchAll(VERSION_LITERAL_RE)]).toEqual([])
        }
    })

    it('findHardcodedVersions 逐行报出行号', () => {
        const issues = findHardcodedVersions([{ file: 'docs/a.md', content: '第一行\n手写 0.9.9 探针\n' }])
        expect(issues).toHaveLength(1)
        expect(issues[0]).toMatchObject({ type: 'hardcoded-version', file: 'docs/a.md', line: 2 })
    })
})

describe('checkVersionSurfaces', () => {
    const configSurface = { file: 'docs/.vitepress/config.ts', kind: 'config', expect: /package\.json/ }
    const zhPage = { file: 'docs/guide/a.md', kind: 'page', expect: /\{\{\s*theme\.version\s*\}\}/ }
    const enPage = { file: 'docs/i18n/en-US/guide/a.md', kind: 'page', expect: /\{\{\s*theme\.version\s*\}\}/ }

    function createSurfaceFixture() {
        return createFixture({
            'docs/.vitepress/config.ts': `import pkg from '../../package.json'
export default { themeConfig: { version: pkg.version } }
`,
            'docs/guide/a.md': '版本：**v{{ theme.version }}**\n',
            'docs/i18n/en-US/guide/a.md': 'Version: **v{{ theme.version }}**\n',
        })
    }

    it('登记面齐备且接线正确时零问题', () => {
        const root = createSurfaceFixture()
        expect(checkVersionSurfaces([configSurface, zhPage, enPage], root)).toEqual([])
    })

    it('登记表为空、缺配置面或缺某语言页面时判受检范围收窄', () => {
        const root = createSurfaceFixture()
        expect(checkVersionSurfaces([], root).map((issue) => issue.type)).toEqual(['surface-scope-narrowed'])
        expect(checkVersionSurfaces([zhPage, enPage], root).map((issue) => issue.type)).toEqual(['surface-scope-narrowed'])
        expect(checkVersionSurfaces([configSurface, zhPage], root).map((issue) => issue.type)).toEqual(['surface-scope-narrowed'])
    })

    it('文件缺失与接线缺失分别报出', () => {
        const root = createFixture({
            'docs/.vitepress/config.ts': 'export default {}\n',
            'docs/guide/a.md': '无插值的页面\n',
            'docs/i18n/en-US/guide/a.md': 'Version: **v{{ theme.version }}**\n',
        })
        const issues = checkVersionSurfaces([configSurface, zhPage, enPage, { ...zhPage, file: 'docs/guide/gone.md' }], root)
        expect(issues.map((issue) => `${issue.type}:${issue.file}`)).toEqual([
            'surface-not-wired:docs/.vitepress/config.ts',
            'surface-not-wired:docs/guide/a.md',
            'surface-missing:docs/guide/gone.md',
        ])
    })
})

describe('runSiteVersionCheck', () => {
    it('已解析配置的版本与 package.json 不一致时判 version-mismatch', async () => {
        const root = createFixture({
            'package.json': '{ "version": "1.0.0" }\n',
            'docs/.vitepress/config.mjs': 'export default { themeConfig: { version: "9.9.9" } }\n',
        })
        const result = await runSiteVersionCheck(root, { surfaces: [] })
        const kinds = result.issues.map((issue) => issue.type)
        expect(kinds).toContain('surface-scope-narrowed')
        expect(kinds).toContain('version-mismatch')
        expect(result.issues.find((issue) => issue.type === 'version-mismatch').message).toContain('9.9.9')
    })

    it('某 locale 未显式声明版本时判 locale-version-mismatch（不依赖合并语义）', async () => {
        const root = createFixture({
            'package.json': '{ "version": "1.0.0" }\n',
            'docs/.vitepress/config.mjs': `export default {
  themeConfig: { version: '1.0.0' },
  locales: { 'en-US': { label: 'English', lang: 'en-US', themeConfig: { nav: [] } } },
}
`,
        })
        const result = await runSiteVersionCheck(root, { surfaces: [] })
        const issue = result.issues.find((entry) => entry.type === 'locale-version-mismatch')
        expect(issue).toBeDefined()
        expect(issue.message).toContain('en-US')
    })

    it('未暴露 themeConfig.version 时报 version-mismatch', async () => {
        const root = createFixture({
            'package.json': '{ "version": "1.0.0" }\n',
            'docs/.vitepress/config.mjs': 'export default {}\n',
        })
        const result = await runSiteVersionCheck(root, { surfaces: [] })
        expect(result.issues.map((issue) => issue.type)).toContain('version-mismatch')
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

    it('仓库自身通过时 exit 0 并打印版本与受检面数', () => {
        const result = spawnSync(process.execPath, [SCRIPT_PATH], { encoding: 'utf8' })
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('版本展示面均派生自 package.json')
    })
})

describe('仓库不变量', () => {
    it('登记表结构未被静默收窄，且当前仓库零问题', async () => {
        expect(VERSION_SURFACES.length).toBeGreaterThanOrEqual(5)
        expect(VERSION_SURFACES.some((surface) => surface.kind === 'config')).toBe(true)
        expect(VERSION_SURFACES.some((surface) => surface.file.startsWith('docs/guide/'))).toBe(true)
        expect(VERSION_SURFACES.some((surface) => surface.file.startsWith('docs/i18n/en-US/'))).toBe(true)
        for (const surface of VERSION_SURFACES) {
            expect(existsSync(join(PROJECT_ROOT, surface.file))).toBe(true)
        }

        const result = await runSiteVersionCheck(PROJECT_ROOT)
        expect(result.version).toBe(result.exposedVersion)
        expect(result.issues).toEqual([])
    })
})

describe('系列字面量识别（弱守卫）', () => {
    it('命中两段式系列（0.3.x / 1.2.x，大小写不敏感）', () => {
        for (const line of ['即 0.3.x 系列', 'the 0.3.x line', 'v10.20.x', '写成 0.3.X']) {
            expect([...line.matchAll(SERIES_LITERAL_RE)].map((match) => match[0])).toEqual([
                line.match(/\d+\.\d+\.x/i)[0],
            ])
        }
    })

    it('不误报仅 major 的 0.x（概念区间）、三段式、两段式非 x 与后缀文本', () => {
        for (const line of ['0.x 兼容策略', '0.4.0', '0.3.xlsx', '版本 1.6', '0.4']) {
            expect([...line.matchAll(SERIES_LITERAL_RE)]).toEqual([])
        }
    })

    it('findSeriesLiterals 逐行报出行号', () => {
        const issues = findSeriesLiterals([{ file: 'docs/guide/version-policy.md', content: '首行\n即 0.3.x 系列\n' }])
        expect(issues).toHaveLength(1)
        expect(issues[0]).toMatchObject({ type: 'series-literal', line: 2 })
    })

    it('受检面登记为版本策略页中英两页', () => {
        expect(SERIES_LITERAL_SURFACES).toEqual([
            'docs/guide/version-policy.md',
            'docs/i18n/en-US/guide/version-policy.md',
        ])
    })
})

describe('「当前版本」句弱守卫（README + roadmap 同一套窄锚策略）', () => {
    const statements = [
        { file: 'README.md', pattern: /当前版本[：:]\s*`([^`\s]+)`/u, label: 'zh' },
        { file: 'README.en-US.md', pattern: /Current version is\s*`([^`\s]+)`/u, label: 'en' },
        { file: 'docs/plan/roadmap.md', pattern: /`latest`\s*=\s*`?([0-9]+\.[0-9]+(?:\.[0-9]+)?)`?/u, label: 'roadmap' },
    ]

    const clean = {
        'README.md': '- 当前版本：`1.2.3`（npm latest）',
        'README.en-US.md': 'Current version is `1.2.3` (style entry: x)',
        'docs/plan/roadmap.md': '均已发布到 npm（`latest` = 1.2.3）',
    }

    it('三面版本一致时零问题', () => {
        expect(findCurrentVersionDrift(createFixture(clean), '1.2.3', statements)).toEqual([])
    })

    it('README 版本漂移时报 current-version-drift 并给出行号', () => {
        const root = createFixture({ ...clean, 'README.md': '首行\n- 当前版本：`0.3.0`（npm latest）' })
        const issues = findCurrentVersionDrift(root, '1.2.3', statements)
        expect(issues).toHaveLength(1)
        expect(issues[0]).toMatchObject({ type: 'current-version-drift', line: 2 })
    })

    it('roadmap `latest` 句漂移同样命中（与 README 同族）', () => {
        const root = createFixture({ ...clean, 'docs/plan/roadmap.md': '均已发布到 npm（`latest` = 1.1.0）' })
        const issues = findCurrentVersionDrift(root, '1.2.3', statements)
        expect(issues).toHaveLength(1)
        expect(issues[0]).toMatchObject({ type: 'current-version-drift', file: 'docs/plan/roadmap.md' })
    })

    it('句式被改写时报 statement-missing 并回显期望句式', () => {
        const root = createFixture({ ...clean, 'README.md': '- 版本：`1.2.3`' })
        const issues = findCurrentVersionDrift(root, '1.2.3', statements)
        expect(issues).toHaveLength(1)
        expect(issues[0]).toMatchObject({ type: 'statement-missing' })
        expect(issues[0].message).toContain('期望')
    })

    it('文件缺失时报 statement-missing', () => {
        const root = createFixture({ 'README.en-US.md': 'Current version is `1.2.3`' })
        expect(findCurrentVersionDrift(root, '1.2.3', statements)[0]).toMatchObject({ type: 'statement-missing' })
    })

    it('仓库登记表覆盖中英 README 与 roadmap 三面', () => {
        const files = new Set(CURRENT_VERSION_STATEMENTS.map((entry) => entry.file))
        expect(files).toEqual(new Set(['README.md', 'README.en-US.md', 'docs/plan/roadmap.md']))
        expect(CURRENT_VERSION_STATEMENTS.filter((entry) => entry.file === 'README.md')).toHaveLength(2)
    })
})

describe('runSiteVersionCheck 新规则接线（W1：防接线被静默拆除）', () => {
    it('系列字面量与当前版本句漂移经 runner 汇总', async () => {
        const root = createFixture({
            'package.json': '{ "version": "1.2.3" }\n',
            'docs/.vitepress/config.mjs': 'export default { themeConfig: { version: "1.2.3" } }\n',
            'docs/guide/version-policy.md': '# 版本\n\n> 即 0.9.x 系列\n',
            'README.md': '- 当前版本：`1.1.0`（npm latest）\n',
            'docs/plan/roadmap.md': '（`latest` = 1.1.0）\n',
        })
        const result = await runSiteVersionCheck(root, { surfaces: [] })
        const kinds = result.issues.map((issue) => issue.type)
        expect(kinds).toContain('series-literal')
        expect(kinds).toContain('current-version-drift')
    })
})
