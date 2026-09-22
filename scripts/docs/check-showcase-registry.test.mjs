import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    MIN_SHOWCASE_GROUPS,
    MIN_SHOWCASE_ITEMS,
    SHOWCASE_REGISTRY,
    checkExampleShape,
    checkRegistryAgainstSite,
    checkRegistryEntryShape,
    checkShowcaseWiring,
    loadShowcaseRegistry,
    runShowcaseRegistryCheck,
} from './check-showcase-registry.mjs'

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
const SCRIPT_PATH = join(PROJECT_ROOT, 'scripts/docs/check-showcase-registry.mjs')

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

function createFixture(files) {
    const dir = mkdtempSync(join(tmpdir(), 'check-showcase-registry-'))
    tempDirs.push(dir)
    for (const [relativePath, content] of Object.entries(files)) {
        const file = join(dir, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    return dir
}

/** 夹具 §11 登记表：4 个分组 / 9 个组件（组内字母序）。 */
const FIXTURE_GROUPS = [
    { zh: '基础与布局', en: 'Basics & Layout', components: ['Avatar', 'Button', 'Card', 'Tag'] },
    { zh: '表单输入', en: 'Form Inputs', components: ['Input', 'Switch'] },
    { zh: '数据展示', en: 'Data Display', components: ['ProgressBar', 'ProgressSpinner'] },
    { zh: '导航与操作', en: 'Navigation & Actions', components: ['Tabs'] },
]

const FIXTURE_DESIGN_DOC = [
    '# 文档与演示站设计',
    '',
    '## 11. 组件分区与排序',
    '',
    '| 分组 | Sidebar group（en-US） | 组件（组内按英文名字母序） |',
    '| --- | --- | --- |',
    ...FIXTURE_GROUPS.map((group) => `| ${group.zh} | ${group.en} | ${group.components.join('、')} |`),
    '',
    '## 12. 演示动画的诊断与覆盖约定',
    '',
].join('\n')

function toKebab(name) {
    return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/** 生成一项合法登记。 */
function makeItem(name, group) {
    const kebab = toKebab(name)
    return {
        name,
        group: { zh: group.zh, en: group.en },
        example: `${kebab}/basic.vue`,
        description: { zh: `${name} 的中文说明`, en: `${name} description` },
    }
}

/** 全部 9 项（按 §11 分组顺序 + 组内字母序）。 */
const VALID_ITEMS = FIXTURE_GROUPS.flatMap((group) => group.components.map((name) => makeItem(name, group)))

const WIDGET_PAGE = '# 组件画廊\n\n<ShowcaseGrid />\n'

/**
 * 站点夹具：§11 登记表 + 全部组件页 / 中英示例 + 中英画廊页 + 登记表。
 *
 * @param {object} [overrides] 覆盖项
 * @param {object[]} [overrides.items] 登记项（默认全部 9 项）
 * @param {string} [overrides.registry] 直接写入的登记表原文（默认由 items 序列化）
 * @param {string} [overrides.zhPage] 中文画廊页内容
 * @param {string} [overrides.enPage] 英文画廊页内容
 * @param {object} [overrides.extraFiles] 追加文件
 * @param {string[]} [overrides.omit] 省略的组件（不写其页面与示例）
 * @returns {string} 夹具根目录
 */
function createSiteFixture(overrides = {}) {
    const { items = VALID_ITEMS, registry, zhPage = WIDGET_PAGE, enPage = WIDGET_PAGE, extraFiles = {}, omit = [] } = overrides
    const files = {
        'package.json': '{}',
        'docs/design/documentation-site.md': FIXTURE_DESIGN_DOC,
        'docs/components/showcase.md': zhPage,
        'docs/i18n/en-US/components/showcase.md': enPage,
        [SHOWCASE_REGISTRY]: registry ?? JSON.stringify(items, null, 4),
        ...extraFiles,
    }
    for (const group of FIXTURE_GROUPS) {
        for (const name of group.components) {
            if (omit.includes(name)) {
                continue
            }
            const kebab = toKebab(name)
            files[`docs/components/${kebab}.md`] = `# ${name}\n`
            files[`docs/i18n/en-US/components/${kebab}.md`] = `# ${name}\n`
            files[`docs/examples/${kebab}/basic.vue`] = '<template><div /></template>\n'
            files[`docs/i18n/en-US/examples/${kebab}/basic.vue`] = '<template><div /></template>\n'
        }
    }
    return createFixture(files)
}

function issueTypes(issues) {
    return issues.map((issue) => issue.type)
}

describe('loadShowcaseRegistry', () => {
    it('缺文件 / 非法 JSON / 顶层非数组各按错误返回，不静默通过', () => {
        expect(loadShowcaseRegistry(createFixture({})).error).toContain('不可读')
        expect(loadShowcaseRegistry(createFixture({ [SHOWCASE_REGISTRY]: '{ ' })).error).toContain('不是合法 JSON')
        expect(loadShowcaseRegistry(createFixture({ [SHOWCASE_REGISTRY]: '{}' })).error).toContain('顶层必须是数组')
    })

    it('合法登记表被解析为数组', () => {
        const root = createSiteFixture()
        const { items, error } = loadShowcaseRegistry(root)
        expect(error).toBeNull()
        expect(items).toHaveLength(VALID_ITEMS.length)
    })
})

describe('checkExampleShape', () => {
    it('合法形态放行', () => {
        expect(checkExampleShape('button/basic.vue', 'button')).toBeNull()
    })

    it('逐类非法形态报出', () => {
        expect(checkExampleShape('/abs/basic.vue', 'abs')).toContain('相对路径')
        expect(checkExampleShape('button\\basic.vue', 'button')).toContain('相对路径')
        expect(checkExampleShape('../button/basic.vue', 'button')).toContain('路径段')
        expect(checkExampleShape('button/sub/basic.vue', 'button')).toContain('两级')
        expect(checkExampleShape('button/basic.vuex', 'button')).toContain('两级')
        expect(checkExampleShape('tag/basic.vue', 'button')).toContain('kebab-case')
        expect(checkExampleShape('', 'button')).toContain('非空字符串')
    })
})

describe('checkRegistryEntryShape', () => {
    it('字段齐全时无问题', () => {
        expect(checkRegistryEntryShape(makeItem('Button', FIXTURE_GROUPS[0]), 0)).toEqual([])
    })

    it('缺 name / 双语描述时报出', () => {
        expect(issueTypes(checkRegistryEntryShape({ group: { zh: 'a', en: 'b' }, description: { zh: 'a', en: 'b' } }, 0))).toEqual(['showcase-entry-invalid'])
        expect(issueTypes(checkRegistryEntryShape({ name: 'Button', group: { zh: 'a' }, description: { zh: 'a' } }, 0))).toEqual(['showcase-entry-invalid', 'showcase-entry-invalid'])
        expect(issueTypes(checkRegistryEntryShape(null, 0))).toEqual(['showcase-entry-invalid'])
    })
})

describe('checkRegistryAgainstSite', () => {
    it('夹具站点零问题', () => {
        const root = createSiteFixture()
        const result = checkRegistryAgainstSite(VALID_ITEMS, FIXTURE_GROUPS.map((group) => ({ ...group })), root)
        expect(result).toEqual([])
    })

    it('§11 解析为空时拒绝以空扫描通过', () => {
        const root = createSiteFixture()
        expect(issueTypes(checkRegistryAgainstSite(VALID_ITEMS, [], root))).toEqual(['showcase-groups-unparsed'])
    })

    it('分组不在 §11 / 英文分组名不一致 / 组件不属于该分组，逐类报出', () => {
        const root = createSiteFixture()
        const unknown = [{ ...makeItem('Button', { zh: '不存在的分组', en: 'Nope' }) }]
        expect(issueTypes(checkRegistryAgainstSite(unknown, FIXTURE_GROUPS, root))).toEqual(['showcase-unknown-group'])

        const mismatch = [{ ...makeItem('Button', { zh: '基础与布局', en: 'Basics' }) }]
        expect(issueTypes(checkRegistryAgainstSite(mismatch, FIXTURE_GROUPS, root))).toEqual(['showcase-group-label-mismatch'])

        const wrongGroup = [{ ...makeItem('Button', { zh: '导航与操作', en: 'Navigation & Actions' }) }]
        expect(issueTypes(checkRegistryAgainstSite(wrongGroup, FIXTURE_GROUPS, root))).toEqual(['showcase-name-not-in-group'])
    })

    it('重复登记 / 分组顺序倒置 / 组内顺序倒置，逐类报出', () => {
        const root = createSiteFixture()
        const duplicated = [{ ...VALID_ITEMS[0] }, { ...VALID_ITEMS[0] }]
        expect(issueTypes(checkRegistryAgainstSite(duplicated, FIXTURE_GROUPS, root))).toContain('showcase-duplicate-item')

        const groupOrder = [
            makeItem('Input', FIXTURE_GROUPS[1]),
            makeItem('Button', FIXTURE_GROUPS[0]),
        ]
        expect(issueTypes(checkRegistryAgainstSite(groupOrder, FIXTURE_GROUPS, root))).toContain('showcase-group-order')

        const itemOrder = [
            makeItem('Tag', FIXTURE_GROUPS[0]),
            makeItem('Button', FIXTURE_GROUPS[0]),
        ]
        expect(issueTypes(checkRegistryAgainstSite(itemOrder, FIXTURE_GROUPS, root))).toContain('showcase-item-order')
    })

    it('组件页 / 中英示例缺失与示例形态非法，逐类报出', () => {
        const root = createSiteFixture({ omit: ['Card'] })
        const issues = checkRegistryAgainstSite([makeItem('Card', FIXTURE_GROUPS[0])], FIXTURE_GROUPS, root)
        expect(issueTypes(issues)).toEqual([
            'showcase-example-missing',
            'showcase-example-missing',
            'showcase-component-page-missing',
            'showcase-component-page-missing',
        ])

        const invalidExample = [{ ...makeItem('Button', FIXTURE_GROUPS[0]), example: 'tag/basic.vue' }]
        expect(issueTypes(checkRegistryAgainstSite(invalidExample, FIXTURE_GROUPS, root))).toEqual(['showcase-example-invalid'])
    })
})

describe('checkShowcaseWiring', () => {
    it('挂载点缺失 / 页面缺失 / 空登记 / 项数与分组数低于下界，逐类报出', () => {
        const widgetless = createSiteFixture({ zhPage: '# 组件画廊\n', enPage: '# 组件画廊\n' })
        expect(issueTypes(checkShowcaseWiring(VALID_ITEMS, widgetless))).toEqual(['showcase-widget-missing', 'showcase-widget-missing'])

        // 挂载点匹配带边界：同前缀的其它组件名不得被判为命中
        const lookalike = createSiteFixture({ zhPage: '# 组件画廊\n\n<ShowcaseGridLegacy />\n', enPage: '# 组件画廊\n\n<ShowcaseGridLegacy />\n' })
        expect(issueTypes(checkShowcaseWiring(VALID_ITEMS, lookalike))).toEqual(['showcase-widget-missing', 'showcase-widget-missing'])

        const missingPage = createSiteFixture()
        rmSync(join(missingPage, 'docs/components/showcase.md'))
        expect(issueTypes(checkShowcaseWiring(VALID_ITEMS, missingPage))).toEqual(['showcase-page-missing'])

        const root = createSiteFixture()
        expect(issueTypes(checkShowcaseWiring([], root))).toEqual(['showcase-empty-registry'])
        expect(issueTypes(checkShowcaseWiring(VALID_ITEMS.slice(0, MIN_SHOWCASE_ITEMS - 1), root))).toEqual(['showcase-scope-narrowed'])
        const oneGroup = VALID_ITEMS.filter((item) => item.group.zh === '基础与布局')
        expect(issueTypes(checkShowcaseWiring(oneGroup, root)).sort()).toEqual(['showcase-scope-narrowed', 'showcase-scope-narrowed'].sort())
    })
})

describe('runShowcaseRegistryCheck', () => {
    it('登记表不可读时按失败返回（不静默通过）', async () => {
        const result = await runShowcaseRegistryCheck(createFixture({ 'package.json': '{}' }))
        expect(issueTypes(result.issues)).toEqual(['showcase-registry-unreadable'])
    })

    it('设计文档缺失时按失败返回', async () => {
        const root = createSiteFixture({ omit: [] })
        rmSync(join(root, 'docs/design/documentation-site.md'))
        const result = await runShowcaseRegistryCheck(root)
        expect(issueTypes(result.issues)).toEqual(['showcase-design-doc-unreadable'])
    })

    it('夹具站点整体通过并回报受检面计数', async () => {
        const result = await runShowcaseRegistryCheck(createSiteFixture())
        expect(result.issues).toEqual([])
        expect(result.itemCount).toBe(VALID_ITEMS.length)
        expect(result.groupCount).toBe(FIXTURE_GROUPS.length)
        expect(result.tableGroups).toBe(FIXTURE_GROUPS.length)
    })
})

describe('resolveTargetRoot 与 CLI 退出码', () => {
    it('非法目标目录按失败退出', () => {
        const missing = spawnSync(process.execPath, [SCRIPT_PATH, join(tmpdir(), 'missing-root-xyz')], { encoding: 'utf8' })
        expect(missing.status).toBe(1)
        expect(missing.stderr).toContain('不是仓库根')
    })

    it('夹具站点通过时 exit 0 并打印受检面计数', () => {
        const root = createSiteFixture()
        const result = spawnSync(process.execPath, [SCRIPT_PATH, root], { encoding: 'utf8' })
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('均可对账')
    })

    it('注入不存在的组件名 → exit 1 且消息精确（负向对照）', () => {
        const root = createSiteFixture({ items: [...VALID_ITEMS.slice(0, -1), { ...VALID_ITEMS.at(-1), name: 'Toolbar' }] })
        const result = spawnSync(process.execPath, [SCRIPT_PATH, root], { encoding: 'utf8' })
        expect(result.status).toBe(1)
        expect(result.stderr).toContain('showcase-name-not-in-group')
    })
})

describe('仓库不变量', () => {
    it('受检范围未被静默收窄，且当前仓库零问题', async () => {
        const result = await runShowcaseRegistryCheck(PROJECT_ROOT)
        expect(result.issues).toEqual([])
        expect(result.itemCount).toBeGreaterThanOrEqual(MIN_SHOWCASE_ITEMS)
        expect(result.groupCount).toBeGreaterThanOrEqual(MIN_SHOWCASE_GROUPS)
        // 6 = §11 登记的分组数：该断言与设计文档 §11 硬耦合，§11 新增分组时须同步更新（不是 flaky）
        expect(result.tableGroups).toBe(6)
    })

    it('仓库登记表可被 CLI 对账且 exit 0', () => {
        const result = spawnSync(process.execPath, [SCRIPT_PATH], { encoding: 'utf8' })
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('均可对账')
    })
})
