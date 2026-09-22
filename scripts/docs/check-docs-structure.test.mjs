import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { createSlugResolver, findSlugSourceDivergence, collectNavigationLinks, resolveDocsPageTarget } from './vitepress-site.mjs'
import {
    COMPONENT_SIDEBAR_KEYS,
    MIN_COMPONENT_ENTRIES,
    checkComponentSidebar,
    collectAnchorIssues,
    extractComponentGroupSection,
    kebabCase,
    parseComponentGroupTable,
    resolveTargetRoot,
    runDocsStructureCheck,
} from './check-docs-structure.mjs'

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
const SCRIPT_PATH = join(PROJECT_ROOT, 'scripts/docs/check-docs-structure.mjs')

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

/** 构造最小夹具，返回根目录。 */
function createFixture(files) {
    const dir = mkdtempSync(join(tmpdir(), 'check-docs-structure-'))
    tempDirs.push(dir)
    for (const [relativePath, content] of Object.entries(files)) {
        const file = join(dir, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    return dir
}

describe('kebabCase', () => {
    it.each([
        ['Button', 'button'],
        ['ButtonGroup', 'button-group'],
        ['AutoComplete', 'auto-complete'],
        ['CheckboxGroup', 'checkbox-group'],
        ['DataTable', 'data-table'],
        ['ProgressSpinner', 'progress-spinner'],
        ['SplitButton', 'split-button'],
        ['ToggleButton', 'toggle-button'],
    ])('%s → %s', (input, expected) => {
        expect(kebabCase(input)).toBe(expected)
    })
})

/** §11 登记表样例（含下一节的其他表格，用于验证「只解析该节」）。 */
const DESIGN_SAMPLE = [
    '# 文档与演示站',
    '',
    '## 11. 组件分区与排序',
    '',
    '- 说明段落。',
    '',
    '| 分组 | Sidebar group（en-US） | 组件（组内按英文名字母序） |',
    '| --- | --- | --- |',
    '| 基础与布局 | Basics & Layout | Avatar、Badge、Button |',
    '| 表单输入 | Form Inputs | Checkbox、CheckboxGroup |',
    '',
    '## 12. 下一节',
    '',
    '| 别的表 | x | y |',
    '| --- | --- | --- |',
    '| 行 | 值 | 值 |',
].join('\n')

describe('parseComponentGroupTable', () => {
    it('解析 §11 的分组登记表，且不越出该节', () => {
        expect(parseComponentGroupTable(DESIGN_SAMPLE)).toEqual([
            { zh: '基础与布局', en: 'Basics & Layout', components: ['Avatar', 'Badge', 'Button'] },
            { zh: '表单输入', en: 'Form Inputs', components: ['Checkbox', 'CheckboxGroup'] },
        ])
    })

    it('§11 缺失时返回空表', () => {
        expect(extractComponentGroupSection('# 别的文档\n\n## 1. 章节\n')).toBe('')
        expect(parseComponentGroupTable('# 别的文档\n\n## 1. 章节\n')).toEqual([])
    })
})

const TABLE = [
    { zh: '基础与布局', en: 'Basics & Layout', components: ['Avatar', 'Button'] },
    { zh: '表单输入', en: 'Form Inputs', components: ['Checkbox', 'CheckboxGroup'] },
]

/**
 * 由登记表构造「一致」的 sidebar；`override` 可注入单点偏差。
 *
 * @param {{ zhGroupTexts?: string[], enGroupTexts?: string[], itemNames?: string[], headLink?: string, tailText?: string }} override 偏差注入
 * @returns {Record<string, unknown>} 已解析 sidebar
 */
function sidebarFor(override = {}) {
    const zhTexts = override.zhGroupTexts ?? TABLE.map((group) => group.zh)
    const enTexts = override.enGroupTexts ?? TABLE.map((group) => group.en)
    const itemNames = override.itemNames ?? TABLE.map((group) => group.components.map(kebabCase).join('|'))
    const groups = (texts, key) =>
        texts.map((text, index) => ({
            text,
            items: String(itemNames[index] ?? '')
                .split('|')
                .filter(Boolean)
                .map((name) => ({ text: name, link: `/${key}/components/${name}` })),
        }))
    return {
        [COMPONENT_SIDEBAR_KEYS.root]: [
            { text: '总览', link: override.headLink ?? '/components/' },
            ...groups(zhTexts, ''),
            { text: override.tailText ?? '能力说明', items: [{ text: '组合式 API', link: '/components/composables' }] },
        ],
        [COMPONENT_SIDEBAR_KEYS['en-US']]: [
            { text: 'Overview', link: '/en-US/components/' },
            ...groups(enTexts, 'en-US'),
            { text: 'Capabilities', items: [{ text: 'Composables', link: '/en-US/components/composables' }] },
        ],
    }
}

describe('checkComponentSidebar', () => {
    it('与 §11 登记表一致时零问题', () => {
        expect(checkComponentSidebar(sidebarFor(), TABLE)).toEqual([])
    })

    it('组序与登记表不一致时按位报出', () => {
        const sidebar = sidebarFor({ zhGroupTexts: ['表单输入', '基础与布局'], itemNames: ['checkbox|checkbox-group', 'avatar|button'] })
        const issues = checkComponentSidebar(sidebar, TABLE)
        expect(issues.map((issue) => issue.message).join('\n')).toContain('第 1 组应为「基础与布局」')
    })

    it('组内成员或顺序不一致时报出差异明细', () => {
        const sidebar = sidebarFor({ itemNames: ['avatar|button', 'checkbox-group|checkbox'] })
        const issues = checkComponentSidebar(sidebar, TABLE)
        expect(issues).toHaveLength(2)
        expect(issues[0].message).toContain('期望 checkbox、checkbox-group，实为 checkbox-group、checkbox')
    })

    it('缺组与中英分组数不一致时报出', () => {
        const sidebar = sidebarFor({ zhGroupTexts: ['基础与布局'], enGroupTexts: ['Basics & Layout', 'Form Inputs'] })
        const messages = checkComponentSidebar(sidebar, TABLE).map((issue) => issue.message).join('\n')
        expect(messages).toContain('组件分组数应为 2')
        expect(messages).toContain('中英组件分组数不一致')
    })

    it('首项 / 末项不符合 §11 的固定顺序时报出', () => {
        const sidebar = sidebarFor({ headLink: '/components/button', tailText: '其他' })
        const messages = checkComponentSidebar(sidebar, TABLE).map((issue) => issue.message).join('\n')
        expect(messages).toContain('首项应为「总览」')
        expect(messages).toContain('末项应为「能力说明」')
    })

    it('登记表为空与 sidebar 缺失时按失败报出（拒绝空扫描通过）', () => {
        expect(checkComponentSidebar(sidebarFor(), [])).toEqual([
            expect.objectContaining({ type: 'sidebar-order' }),
        ])
        const messages = checkComponentSidebar({}, TABLE).map((issue) => issue.message).join('\n')
        expect(messages).toContain('不存在或不是数组')
    })
})

describe('collectNavigationLinks / findSlugSourceDivergence', () => {
    it('展平 nav 与 sidebar 中的链接并保留来源', () => {
        const links = collectNavigationLinks({
            nav: {
                root: [{ text: '指南', link: '/guide/' }],
                'en-US': [{ text: 'Guide', items: [{ text: 'x', link: '/en-US/guide/' }] }],
            },
            sidebar: {
                '/components/': [
                    { text: '总览', link: '/components/' },
                    { text: '基础与布局', items: [{ text: 'Button', link: '/components/button' }] },
                ],
            },
        })
        expect(links.map((entry) => `${entry.locale}:${entry.source}:${entry.link}`)).toEqual([
            'root:nav:/guide/',
            'en-US:nav:/en-US/guide/',
            'root:sidebar(/components/):/components/',
            'root:sidebar(/components/):/components/button',
        ])
    })

    it('站点自定义 anchor.slugify 时报出分叉（不静默漂移）', () => {
        expect(findSlugSourceDivergence({})).toBeNull()
        expect(findSlugSourceDivergence({ anchor: {} })).toBeNull()
        expect(findSlugSourceDivergence({ anchor: { slugify: () => 'x' } })).toContain('slugify')
    })

    it('夹具站点带 anchor.slugify 时守卫按 slug-source-diverged 失败', async () => {
        const root = createFixture({
            'docs/index.md': '# 首页\n',
            'docs/design/documentation-site.md': '# 文档与演示站\n',
            'docs/.vitepress/config.mjs': 'export default { markdown: { anchor: { slugify: (value) => String(value) } } }\n',
        })
        const result = await runDocsStructureCheck(root)
        expect(result.sidebarIssues.map((issue) => issue.type)).toContain('slug-source-diverged')
    })
})

describe('resolveDocsPageTarget', () => {
    it('解析站点根 / 相对 / 省略 .md / 翻译物理路径，并拒绝外部与越界链接', () => {
        const root = createFixture({
            '.github/keep': '',
            'README.md': '# 根',
            'docs/guide/a.md': '# a\n',
            'docs/guide/index.md': '# guide\n',
            'docs/i18n/en-US/guide/a.md': '# a\n',
        })
        const docs = join(root, 'docs')
        const from = join(docs, 'guide/a.md')
        expect(resolveDocsPageTarget(from, '/guide/', docs)).toBe(join(docs, 'guide/index.md'))
        expect(resolveDocsPageTarget(from, './index.md', docs)).toBe(join(docs, 'guide/index.md'))
        expect(resolveDocsPageTarget(from, './index', docs)).toBe(join(docs, 'guide/index.md'))
        expect(resolveDocsPageTarget(from, '/en-US/guide/a', docs)).toBe(join(docs, 'i18n/en-US/guide/a.md'))
        expect(resolveDocsPageTarget(from, 'https://example.com/x.md', docs)).toBeNull()
        expect(resolveDocsPageTarget(from, '#anchor', docs)).toBeNull()
        expect(resolveDocsPageTarget(from, '/guide/missing', docs)).toBeNull()
        expect(resolveDocsPageTarget(from, '../../README.md', docs)).toBeNull()
    })
})

describe('collectAnchorIssues', () => {
    const CONTENT = [
        '# 页', // 1
        '', // 2
        '## 4. 阶段与条目命名', // 3
        '', // 4
        '## 附录 A 材料', // 5
        '', // 6
        '- 自锚正确：[自锚](#_4-阶段与条目命名)', // 7
        '- 自锚错误：[自锚](#4-阶段与条目命名)', // 8
        '- 全角标点正确：[附录](#附录-a-材料)', // 9
        '- 全角标点错误：[附录](#附录-a材料)', // 10
        '- 行号锚点：[L12](#L12)', // 11
        '- 外部链接：[x](https://example.com#y)', // 12
        '- 跨页正确：[其他](./other.md#标题)', // 13
        '- 跨页错误：[其他](./other.md#不存在)', // 14
    ].join('\n')

    it('只对未命中 VitePress 实算 slug 的锚点报错', async () => {
        const root = createFixture({
            '.github/keep': '',
            'docs/page.md': CONTENT,
            'docs/other.md': '# 其他\n\n## 标题\n',
        })
        const docs = join(root, 'docs')
        const { slugsOf } = await createSlugResolver(docs)
        const files = [join(docs, 'page.md'), join(docs, 'other.md')]
        const issues = collectAnchorIssues(files, slugsOf, docs)
        expect(issues.map((issue) => issue.line)).toEqual([8, 10, 14])
        expect(issues.every((issue) => issue.type === 'anchor-slug-mismatch')).toBe(true)
        expect(issues[0].file).toBe('docs/page.md')
    })
})

describe('resolveTargetRoot', () => {
    it('未传参时回退到默认根目录', () => {
        expect(resolveTargetRoot(undefined, '/repo')).toEqual({ root: '/repo', error: null })
    })

    it('未知参数与非仓库目录按错误返回', () => {
        expect(resolveTargetRoot('--verbose').error).toContain('不支持的参数')
        expect(resolveTargetRoot(join(tmpdir(), 'missing-root-xyz')).error).toContain('不是仓库根')
    })

    it('含 package.json 的目录被接受', () => {
        const root = createFixture({ '.github/keep': '', 'package.json': '{}' })
        expect(resolveTargetRoot(root, '/repo')).toEqual({ root, error: null })
    })
})

describe('CLI 退出码', () => {
    it('非法目标目录按失败退出', () => {
        const missing = spawnSync(process.execPath, [SCRIPT_PATH, join(tmpdir(), 'missing-root-xyz')], { encoding: 'utf8' })
        expect(missing.status).toBe(1)
        expect(missing.stderr).toContain('不是仓库根')

        const unknownFlag = spawnSync(process.execPath, [SCRIPT_PATH, '--verbose'], { encoding: 'utf8' })
        expect(unknownFlag.status).toBe(1)
        expect(unknownFlag.stderr).toContain('不支持的参数')
    })

    it('仓库自身通过时 exit 0 并打印受检面计数', () => {
        const result = spawnSync(process.execPath, [SCRIPT_PATH], { encoding: 'utf8' })
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('锚点与 VitePress slug 一致')
    })
})

describe('仓库不变量', () => {
    it('受检范围未被静默收窄，且当前仓库零问题', async () => {
        const result = await runDocsStructureCheck(PROJECT_ROOT)
        expect(result.pageCount).toBeGreaterThanOrEqual(150)
        expect(result.anchorLinks).toBeGreaterThanOrEqual(20)
        expect(result.tableGroups).toBe(6)
        expect(result.componentEntries).toBeGreaterThanOrEqual(MIN_COMPONENT_ENTRIES)
        expect(result.sidebarIssues).toEqual([])
        expect(result.anchorIssues).toEqual([])
    })
})
