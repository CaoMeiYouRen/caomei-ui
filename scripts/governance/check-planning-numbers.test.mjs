import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    CODE_EXTENSIONS,
    EXCLUDED_DIRS,
    PLANNING_NUMBER_RULES,
    collectCodeFiles,
    extractComments,
    extractTestNames,
    matchPlanningNumbers,
    resolveTargetRoot,
    scanContent,
    scanRepository,
} from './check-planning-numbers.mjs'

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
const SCRIPT_PATH = join(PROJECT_ROOT, 'scripts/governance/check-planning-numbers.mjs')

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

/** 构造最小仓库夹具，返回仓库根目录。 */
function createFixture(files) {
    const dir = mkdtempSync(join(tmpdir(), 'check-planning-numbers-'))
    tempDirs.push(dir)
    for (const [relativePath, content] of Object.entries(files)) {
        const file = join(dir, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    return dir
}

/**
 * 命中形态矩阵：按「条目形态 / 三位编号形态 / 审计编号形态 / 阶段形态」四类语料覆盖注释的三种载体
 * （行注释、块注释、模板注释）与测试名。新增形态时须同步扩充本矩阵，
 * 否则「形态覆盖」声明会失真。
 */
const ENTRY_FORMS = [
    '// 见 M3-1 记录',
    '/* 结构 T1-2 收敛 */',
    '<!-- M6-8 说明 -->',
    '// 条目 F5-3 已交付',
]

const SEQUENTIAL_FORMS = [
    '// 编号 T001 的处理',
    '// 编号 P001 与 F003',
]

const AUDIT_FORMS = [
    '// 待关闭 RG-B01 的修复点',
    '/* 沿用 RG-W01 的判定 */',
    '// 见 RG-S02 的建议',
]

const PHASE_FORMS = [
    '// Phase 12 登记',
    '// Phase 7 第二阶段',
]

/** 反例矩阵：真实常量、规范名、错误码、小写文档路径与普通编号不得命中。 */
const NON_PLANNING_FORMS = [
    '// 见 docs/design/governance/2026-09-21-m3-1-size-tier-normalization.md',
    '// TS2307 报错与 ES2023 规范',
    '// UTF-8 / ISO-8601 / GB2312 / W3C / H1',
    '// SHA-256 / RFC-9110 / ECMA-262',
    '// 渲染 404 页面与 v-model',
    '// caomei-ui/theme.css 子路径导出',
    '// CSS 变量 --caomei-color-primary',
]

describe('check-planning-numbers 形态矩阵', () => {
    it.each(ENTRY_FORMS)('条目形态命中：%s', (segment) => {
        expect(matchPlanningNumbers(segment).some((hit) => hit.id === 'entry')).toBe(true)
    })

    it.each(SEQUENTIAL_FORMS)('三位编号形态命中：%s', (segment) => {
        expect(matchPlanningNumbers(segment).some((hit) => hit.id === 'sequential')).toBe(true)
    })

    it.each(AUDIT_FORMS)('审计编号形态命中：%s', (segment) => {
        expect(matchPlanningNumbers(segment).some((hit) => hit.id === 'audit')).toBe(true)
    })

    it.each(PHASE_FORMS)('阶段形态命中：%s', (segment) => {
        expect(matchPlanningNumbers(segment).some((hit) => hit.id === 'phase')).toBe(true)
    })

    it.each(NON_PLANNING_FORMS)('非规划编号不误报：%s', (segment) => {
        expect(matchPlanningNumbers(segment)).toEqual([])
    })

    it('已知边界：字母 + `-` + 数字（`-` 后无字母）与标准号同形，不在规则面', () => {
        expect(matchPlanningNumbers('// 见 OBS-1 与 SW-01 的处置')).toEqual([])
    })
})

describe('tokenize 的引号边界', () => {
    it('正则字面量内的引号不吞掉其后的行注释', () => {
        const content = ['const re = /["\']/', '// 见 M3-1 记录'].join('\n')
        expect(scanContent(content)).toEqual([
            expect.objectContaining({ source: 'comment', id: 'entry', line: 2 }),
        ])
    })

    it('模板文本里的撇号不吞掉其后的模板注释', () => {
        const content = ['<template>', `  <p>It's ok</p>`, '  <!-- M6-8 说明 -->', '</template>'].join('\n')
        expect(scanContent(content)).toEqual([
            expect.objectContaining({ source: 'comment', id: 'entry', line: 3 }),
        ])
    })

    it('真正的字符串字面量仍被屏蔽', () => {
        const content = ['const a = "// M3-1"', `const b = '/** T001 */'`].join('\n')
        expect(scanContent(content)).toEqual([])
    })

    it('跨行模板字符串仍整体屏蔽', () => {
        const content = ['const tpl = `第一行', '第二行 M3-1', '`', '// 见 M3-1 记录'].join('\n')
        expect(scanContent(content)).toEqual([expect.objectContaining({ source: 'comment', line: 4 })])
    })
})

describe('extractComments', () => {
    it('提取行注释与块注释，跳过字符串字面量', () => {
        const content = [
            'const fake = "// 不是注释"',
            'const a = 1 // 真注释',
            '/**',
            ' * 块注释',
            ' */',
        ].join('\n')
        const comments = extractComments(content)
        expect(comments.map((comment) => comment.text.trim())).toEqual(['// 真注释', '/**\n * 块注释'])
    })

    it('提取模板注释并给出真实行号', () => {
        const content = ['<template>', '  <!-- 模板注释 -->', '</template>'].join('\n')
        const comments = extractComments(content)
        expect(comments).toHaveLength(1)
        expect(comments[0].line).toBe(2)
    })
})

describe('extractTestNames', () => {
    it('覆盖直接调用与修饰链（each / skip）', () => {
        expect(extractTestNames('it("渲染 404 页面", () => {})')).toEqual([{ line: 1, name: '渲染 404 页面' }])
        expect(extractTestNames('it.each([[1]])("用例 P1-1", () => {})')).toHaveLength(1)
        expect(extractTestNames('describe.skip("阶段说明", () => {})')).toHaveLength(1)
    })

    it('字符串字面量内书写的伪测试名不计入', () => {
        const content = 'const fixture = "it(\\"M3-1 假用例\\", () => {})"'
        expect(extractTestNames(content)).toEqual([])
        expect(scanContent(content)).toEqual([])
    })
})

describe('scanContent', () => {
    it('定位块注释内的命中行号与该行原文', () => {
        const content = ['/**', ' * 第一行', ' * M3-1 收敛', ' */'].join('\n')
        expect(scanContent(content)).toEqual([
            expect.objectContaining({ source: 'comment', id: 'entry', line: 3, snippet: '* M3-1 收敛' }),
        ])
    })

    it('区分注释命中与测试名命中', () => {
        const content = ['// 见 M3-1 记录', 'it("条目 P1-1 收敛", () => {})'].join('\n')
        const hits = scanContent(content)
        expect(hits.map((hit) => hit.source)).toEqual(['comment', 'test-name'])
        expect(hits.map((hit) => hit.line)).toEqual([1, 2])
    })

    it('代码字符串中的编号不被扫描（真实常量例外）', () => {
        const content = ['const label = "Phase 7 评估"', 'const id = "M3-1"'].join('\n')
        expect(scanContent(content)).toEqual([])
    })
})

describe('collectCodeFiles', () => {
    it('按扩展名收集，跳过排除目录与 VitePress 生成物', () => {
        const root = createFixture({
            '.github/keep': '',
            'src/a.ts': '',
            'src/b.vue': '',
            'src/c.scss': '',
            'scripts/d.mjs': '',
            'test/e.test.ts': '',
            'docs/.vitepress/theme/f.ts': '',
            'docs/.vitepress/dist/g.ts': '',
            'docs/.vitepress/cache/h.ts': '',
            'node_modules/pkg/i.ts': '',
            'dist/j.ts': '',
            'README.md': '',
        })
        const files = collectCodeFiles(root).map((file) => file.slice(root.length + 1))
        expect(files).toEqual([
            'docs/.vitepress/theme/f.ts',
            'scripts/d.mjs',
            'src/a.ts',
            'src/b.vue',
            'test/e.test.ts',
        ])
    })
})

describe('resolveTargetRoot', () => {
    it('未传参时回退到默认根目录', () => {
        expect(resolveTargetRoot(undefined, '/repo')).toEqual({ root: '/repo', error: null })
    })

    it('未知参数与非法目录按错误返回，不静默放行', () => {
        expect(resolveTargetRoot('--verbose').error).toContain('不支持的参数')
        expect(resolveTargetRoot(join(tmpdir(), 'missing-root-xyz')).error).toContain('不是仓库根')
    })

    it('含 .github/ 的目录被接受', () => {
        const repoRoot = createFixture({ '.github/agents/reviewer.agent.md': '# agent' })
        expect(resolveTargetRoot(repoRoot, '/repo')).toEqual({ root: repoRoot, error: null })
    })
})

describe('CLI 退出码', () => {
    it('非法目标目录与空扫描均按失败退出', () => {
        const missing = spawnSync(process.execPath, [SCRIPT_PATH, join(tmpdir(), 'missing-root-xyz')], { encoding: 'utf8' })
        expect(missing.status).toBe(1)
        expect(missing.stderr).toContain('不是仓库根')

        const unknownFlag = spawnSync(process.execPath, [SCRIPT_PATH, '--verbose'], { encoding: 'utf8' })
        expect(unknownFlag.status).toBe(1)
        expect(unknownFlag.stderr).toContain('不支持的参数')

        const emptyRepo = createFixture({ '.github/keep': '', 'README.md': '# 无代码文件' })
        const empty = spawnSync(process.execPath, [SCRIPT_PATH, emptyRepo], { encoding: 'utf8' })
        expect(empty.status).toBe(1)
        expect(empty.stderr).toContain('拒绝以空扫描通过')
    })

    it('存在违规时 exit 1，并在 stderr 报出规则与修复方向', () => {
        const repoRoot = createFixture({
            '.github/agents/reviewer.agent.md': '# agent',
            'src/a.ts': 'const a = 1 // 见 M3-1 记录\n',
        })
        const result = spawnSync(process.execPath, [SCRIPT_PATH, repoRoot], { encoding: 'utf8' })
        expect(result.status).toBe(1)
        expect(result.stderr).toContain('src/a.ts:1:comment:entry')
        expect(result.stderr).toContain('修复方向')
    })

    it('无违规时 exit 0 并打印通过信息', () => {
        const repoRoot = createFixture({
            '.github/agents/reviewer.agent.md': '# agent',
            'src/a.ts': 'const a = 1 // 见 docs/design/governance/2026-09-21-m3-1-size-tier-normalization.md\n',
        })
        const result = spawnSync(process.execPath, [SCRIPT_PATH, repoRoot], { encoding: 'utf8' })
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('0 处命中')
    })
})

describe('仓库不变量', () => {
    it('受检范围未被静默收窄', () => {
        const files = collectCodeFiles(PROJECT_ROOT).map((file) => file.slice(PROJECT_ROOT.length + 1))
        expect(files.length).toBeGreaterThanOrEqual(500)
        for (const required of ['src/', 'scripts/', 'test/', 'docs/.vitepress/']) {
            expect(files.some((file) => file.startsWith(required))).toBe(true)
        }
        expect(files).toContain('scripts/governance/check-planning-numbers.mjs')
        expect(EXCLUDED_DIRS.has('node_modules')).toBe(true)
        expect(CODE_EXTENSIONS).toContain('.vue')
        expect(PLANNING_NUMBER_RULES.map((rule) => rule.id)).toEqual(['entry', 'sequential', 'audit', 'phase'])
    })

    it('当前仓库的注释 / 测试名无规划编号', () => {
        expect(scanRepository(PROJECT_ROOT)).toEqual([])
    })
})
