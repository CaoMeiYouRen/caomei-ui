import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    MIN_NAMESPACES,
    MIN_ON_DEMAND_LOCALES,
    MIN_PRE_REGISTERED_LOCALES,
    MIN_SUBPATH_ROWS,
    checkLocaleLedger,
    parseLocaleLedger,
} from './check-locale-ledger.mjs'

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

const BASE_NAMESPACES = {
    autoComplete: ['empty', 'open'],
    table: ['empty', 'selectAll'],
}

const BASE_UNION = ['zh-CN', 'en-US', 'zh-TW', 'fr-FR']
const BASE_PRE_REGISTERED = ['zh-CN', 'en-US']
const BASE_ON_DEMAND = ['zh-TW', 'fr-FR']
const BASE_SUBPATHS = [
    ['zh-TW', 'caomei-ui/locale/zh-tw'],
    ['fr-FR', 'caomei-ui/locale/fr-fr'],
]

const OPTIONS = {
    minNamespaces: 2,
    minPreRegistered: 2,
    minOnDemand: 2,
    minSubpaths: 2,
}

function buildTypes(namespaces) {
    const blocks = Object.entries(namespaces).map(([namespace, keys]) => {
        const keyLines = keys.map((key) => `        ${key}: string`).join('\n')
        return `    ${namespace}: {\n${keyLines}\n    }`
    })
    return `export interface CaomeiLocaleMessages {\n${blocks.join('\n')}\n}\n`
}

function buildIndex({
    union = BASE_UNION,
    preRegistered = BASE_PRE_REGISTERED,
} = {}) {
    const importNames = { 'zh-CN': 'zhCN', 'en-US': 'enUS' }
    const imports = preRegistered
        .map((id) => `import ${importNames[id]} from './${id.toLowerCase()}'`)
        .join('\n')
    const registry = preRegistered
        .map((id) => `    '${id}': ${importNames[id]},`)
        .join('\n')
    return [
        imports,
        '',
        `export type CaomeiLocale = ${union.map((id) => `'${id}'`).join(' | ')}`,
        '',
        `export const PRE_REGISTERED_LOCALES = [${preRegistered.map((id) => `'${id}'`).join(', ')}] as const`,
        '',
        'export const caomeiLocales: Partial<Record<CaomeiLocale, CaomeiLocaleMessages>> = {',
        registry,
        '}',
        '',
        'export const defaultLocale: CaomeiLocale = \'zh-CN\'',
        '',
    ].join('\n')
}

function buildDoc({
    namespaces = BASE_NAMESPACES,
    preRegistered = BASE_PRE_REGISTERED,
    onDemand = BASE_ON_DEMAND,
    subpaths = BASE_SUBPATHS,
    lang = 'zh',
} = {}) {
    const isZh = lang === 'zh'
    const ledgerRows = Object.entries(namespaces)
        .map(([namespace, keys]) => {
            const components = namespace === 'table' ? 'DataTable' : 'AutoComplete'
            return `| \`${namespace}\` | ${keys.map((key) => `\`${key}\``).join(' ')} | ${components} |`
        })
        .join('\n')
    const languageHeader = isZh
        ? ['| 类别 | 语言 | 取用方式 |', '| --- | --- | --- |', `| 预注册（随包根可用） | ${preRegistered.map((id) => `\`${id}\``).join('、')} | 直接使用 |`, `| 按需引入 | ${onDemand.map((id) => `\`${id}\``).join('、')} | 经子路径引入 |`]
        : ['| Group | Locales | How to use |', '| --- | --- | --- |', `| Pre-registered (available from the package root) | ${preRegistered.map((id) => `\`${id}\``).join(', ')} | Use directly |`, `| On-demand | ${onDemand.map((id) => `\`${id}\``).join(', ')} | Import the subpath |`]
    const subpathHeader = isZh
        ? ['| 语言标识 | 子路径 |', '| --- | --- |']
        : ['| Locale id | Subpath |', '| --- | --- |']
    const subpathRows = subpaths.map(([id, path]) => `| \`${id}\` | \`${path}\` |`)

    return [
        isZh ? '# 内建文案与语言' : '# Built-in messages and locales',
        '',
        isZh ? '| 命名空间 | 文案键 | 消费组件 |' : '| Namespace | Keys | Consuming component |',
        '| --- | --- | --- |',
        ledgerRows,
        '',
        isZh ? '## 按需引入语言' : '## On-demand locales',
        '',
        ...languageHeader,
        '',
        ...subpathHeader,
        ...subpathRows,
        '',
    ].join('\n')
}

function createFixture({
    namespaces = BASE_NAMESPACES,
    union = BASE_UNION,
    preRegistered = BASE_PRE_REGISTERED,
    onDemand = BASE_ON_DEMAND,
    subpaths = BASE_SUBPATHS,
    zhDoc,
    enDoc,
} = {}) {
    const dir = mkdtempSync(join(tmpdir(), 'caomei-locale-ledger-'))
    tempDirs.push(dir)
    const files = {
        'src/locale/types.ts': buildTypes(namespaces),
        'src/locale/index.ts': buildIndex({ union, preRegistered }),
        'docs/components/locale.md': zhDoc ?? buildDoc({ namespaces, preRegistered, onDemand, subpaths, lang: 'zh' }),
        'docs/i18n/en-US/components/locale.md': enDoc ?? buildDoc({ namespaces, preRegistered, onDemand, subpaths, lang: 'en' }),
    }
    for (const [relativePath, content] of Object.entries(files)) {
        const absolutePath = join(dir, relativePath)
        mkdirSync(dirname(absolutePath), { recursive: true })
        writeFileSync(absolutePath, content)
    }
    return dir
}

function check(dir, options = OPTIONS) {
    return checkLocaleLedger(dir, options)
}

describe('checkLocaleLedger', () => {
    it('台账与语言清单一致时通过', () => {
        const result = check(createFixture())
        expect(result.ok).toBe(true)
        expect(result.details.namespaces).toBe(2)
        expect(result.details.preRegistered).toEqual(BASE_PRE_REGISTERED)
        expect(result.details.onDemand).toEqual(BASE_ON_DEMAND)
        expect(result.details.subpaths).toEqual(BASE_SUBPATHS.map(([, path]) => path))
    })

    it('中文台账缺少命名空间时报错', () => {
        const zhDoc = buildDoc().replace('| `table` | `empty` `selectAll` | DataTable |\n', '')
        const result = check(createFixture({ zhDoc }))
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('中文台账表 缺少命名空间 table')
    })

    it('英文台账多出键时报错', () => {
        const enDoc = buildDoc({ lang: 'en' }).replace('`selectAll`', '`selectAll` `extra`')
        const result = check(createFixture({ enDoc }))
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('英文台账表 命名空间 table 多出键 extra')
    })

    it('消费组件为空时报错', () => {
        const zhDoc = buildDoc().replace('| DataTable |', '|  |')
        const result = check(createFixture({ zhDoc }))
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('命名空间 table 的消费组件为空')
    })

    it('中文台账少列键时报错', () => {
        const namespaces = { input: ['clear', 'reset'] }
        const zhDoc = buildDoc({ namespaces }).replace('`clear` `reset`', '`clear`')
        const result = check(createFixture({ namespaces, zhDoc }))
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('中文台账表 命名空间 input 缺少键 reset')
    })

    it('命名空间数低于下界时报错', () => {
        const result = check(createFixture(), { ...OPTIONS, minNamespaces: 3 })
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('低于下界 3')
    })

    it('预注册语言数低于下界时报错', () => {
        const dir = createFixture({
            union: ['zh-CN', 'fr-FR'],
            preRegistered: ['zh-CN'],
            onDemand: ['fr-FR'],
            subpaths: [['fr-FR', 'caomei-ui/locale/fr-fr']],
        })
        const result = check(dir, { ...OPTIONS, minPreRegistered: 2, minOnDemand: 1, minSubpaths: 1 })
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('中文文档预注册语言仅 1 项，低于下界 2')
    })

    it('按需语言数低于下界时报错', () => {
        const dir = createFixture({
            union: ['zh-CN', 'en-US', 'fr-FR'],
            preRegistered: ['zh-CN', 'en-US'],
            onDemand: ['fr-FR'],
            subpaths: [['fr-FR', 'caomei-ui/locale/fr-fr']],
        })
        const result = check(dir, { ...OPTIONS, minOnDemand: 2, minSubpaths: 1 })
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('中文文档按需语言仅 1 项，低于下界 2')
    })

    it('文档预注册集合与代码不一致时报错', () => {
        const zhDoc = buildDoc().replace('`zh-CN`、`en-US`', '`zh-CN`、`en-US`、`fr-FR`')
        const result = check(createFixture({ zhDoc }))
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('中文文档 预注册集合多出 fr-FR')
    })

    it('文档按需集合缺少语言时报错', () => {
        const zhDoc = buildDoc().replace('`zh-TW`、`fr-FR`', '`zh-TW`')
        const result = check(createFixture({ zhDoc }))
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('中文文档 按需引入集合缺少 fr-FR')
    })

    it('子路径与语言标识不同源时报错', () => {
        const zhDoc = buildDoc().replace('`caomei-ui/locale/fr-fr`', '`caomei-ui/locale/de-de`')
        const result = check(createFixture({ zhDoc }))
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('中文文档 子路径表 fr-FR 指向 caomei-ui/locale/de-de')
    })

    it('子路径表缺少语言时报错', () => {
        const zhDoc = buildDoc().replace('| `fr-FR` | `caomei-ui/locale/fr-fr` |\n', '')
        const result = check(createFixture({ zhDoc }))
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('中文文档 子路径表缺少 fr-FR')
    })

    it('缺少台账表时报错', () => {
        const zhDoc = buildDoc().split('## 按需引入语言')[1]
        const result = check(createFixture({ zhDoc }))
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('未找到「命名空间 / 文案键 / 消费组件」索引表')
    })

    it('台账表为空时报错', () => {
        const zhDoc = buildDoc().replace('| `autoComplete` | `empty` `open` | AutoComplete |\n| `table` | `empty` `selectAll` | DataTable |\n', '')
        const result = check(createFixture({ zhDoc }))
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('「命名空间 / 文案键 / 消费组件」索引表为空')
    })

    it('空台账表不会吞入下一张表', () => {
        const content = [
            '| 命名空间 | 文案键 | 消费组件 |',
            '| --- | --- | --- |',
            '',
            '| 类别 | 语言 | 取用方式 |',
            '| --- | --- | --- |',
            '| 预注册（随包根可用） | `zh-CN`、`en-US` | 直接使用 |',
        ].join('\n')
        expect(parseLocaleLedger(content)).toEqual({})
    })

    it('缺少按需引入语言表时报错', () => {
        const zhDoc = buildDoc().split('## 按需引入语言')[0]
        const result = check(createFixture({ zhDoc }))
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('未找到「预注册 / 按需引入」语言表')
    })

    it('语言表缺少预注册行时报错', () => {
        const zhDoc = buildDoc().replace('| 预注册（随包根可用） | `zh-CN`、`en-US` | 直接使用 |\n', '')
        const result = check(createFixture({ zhDoc }))
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('语言表缺少「预注册」行')
    })

    it('子路径行数低于下界时报错', () => {
        const result = check(createFixture(), { ...OPTIONS, minSubpaths: 3 })
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('子路径表仅 2 行，低于下界 3')
    })

    it('受检面下界常量钉定', () => {
        expect(MIN_NAMESPACES).toBe(28)
        expect(MIN_PRE_REGISTERED_LOCALES).toBe(2)
        expect(MIN_ON_DEMAND_LOCALES).toBe(8)
        expect(MIN_SUBPATH_ROWS).toBe(8)
    })
})
