import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    BASELINE_FILE,
    MIN_SUBPATH_LOCALES,
    MIN_UNION_LOCALES,
    checkLocaleKeys,
    compareLocaleKeys,
    extractPlaceholders,
    parseLocaleRegistry,
    parseLocaleSource,
    readSubpathRegistration,
    stripComments,
} from './check-locale-keys.mjs'

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

/** 构造符合仓库格式化形态的文案模块源码。 */
function buildSource(namespaces, constName = 'messages') {
    const lines = [
        'import type { CaomeiLocaleMessages } from \'./types\'',
        '',
        `const ${constName}: CaomeiLocaleMessages = {`,
    ]
    for (const [namespace, keys] of Object.entries(namespaces)) {
        lines.push(`    ${namespace}: {`)
        for (const [key, value] of Object.entries(keys)) {
            lines.push(`        ${key}: '${value}',`)
        }
        lines.push('    },')
    }
    lines.push('}', '', `export default ${constName}`)
    return lines.join('\n')
}

/** 语言标识 → 导入标识（`zh-CN` → `zhCN`）。 */
function importNameOf(id) {
    return id
        .split('-')
        .map((part, index) => (index === 0 ? part.toLowerCase() : part.toUpperCase()))
        .join('')
}

/**
 * 构造夹具仓库（`src/locale` 注册表 + 各语种文案文件 + 分发表）。
 *
 * 默认形态对齐仓库现状意图：`union` 为显式联合，`preRegistered` 随包根注册，
 * 其余成员须登记语言子路径（`package.json` 的 `exports` 与 `tsdown.config.ts` 的入口）。
 *
 * 默认值刻意**满足受检面下界**（5 语 / 3 子路径）：负向对照用例只应命中被测规则，
 * 不应被下界噪声污染；下界本身由专门的用例覆盖（传入更小的集合）。
 */
function createFixture({
    union = ['zh-CN', 'en-US', 'zh-TW', 'ja-JP', 'ko-KR'],
    preRegistered = ['zh-CN', 'en-US'],
    registryEntries,
    sources = {},
    namespaces = BASE_NAMESPACES,
    defaultLocale = 'zh-CN',
    extraFiles = {},
    omitFiles = [],
    subpathExports,
    subpathEntries,
} = {}) {
    const dir = mkdtempSync(join(tmpdir(), 'check-locale-keys-'))
    tempDirs.push(dir)
    const localeDir = join(dir, 'src', 'locale')
    mkdirSync(localeDir, { recursive: true })

    const entries = registryEntries ?? preRegistered.map((id) => ({
        id,
        importPath: `./${id.toLowerCase()}`,
        importName: importNameOf(id),
    }))

    const index = [
        ...entries.map((entry) => `import ${entry.importName} from '${entry.importPath}'`),
        'import type { CaomeiLocaleMessages } from \'./types\'',
        '',
        `export type CaomeiLocale = ${union.map((id) => `'${id}'`).join(' | ')}`,
        '',
        `export const PRE_REGISTERED_LOCALES = [${preRegistered.map((id) => `'${id}'`).join(', ')}] as const satisfies readonly CaomeiLocale[]`,
        '',
        'export const caomeiLocales: Partial<Record<CaomeiLocale, CaomeiLocaleMessages>> = {',
        ...entries.map((entry) => `    '${entry.id}': ${entry.importName},`),
        '}',
        '',
        `export const defaultLocale: CaomeiLocale = '${defaultLocale}'`,
        '',
    ].join('\n')

    writeFileSync(join(localeDir, 'index.ts'), index)

    // 未显式提供的语种按基准结构自动补源，避免用例被无关的「缺少文案文件」噪声污染。
    const fileContents = { ...sources, ...extraFiles }
    for (const id of union) {
        const file = `${id.toLowerCase()}.ts`
        if (omitFiles.includes(file)) {
            continue
        }
        if (!Object.prototype.hasOwnProperty.call(fileContents, file)) {
            fileContents[file] = buildSource(namespaces, importNameOf(id))
        }
    }
    for (const [file, text] of Object.entries(fileContents)) {
        writeFileSync(join(localeDir, file), text)
    }

    const required = union.filter((id) => !preRegistered.includes(id)).map((id) => id.toLowerCase())
    const exportsCodes = subpathExports ?? required
    const entryCodes = subpathEntries ?? required

    writeFileSync(join(dir, 'package.json'), JSON.stringify({
        name: 'locale-fixture',
        exports: Object.fromEntries([
            ['.', './dist/index.js'],
            ...exportsCodes.map((code) => [
                `./locale/${code}`,
                { types: `./dist/locale/${code}.d.ts`, import: `./dist/locale/${code}.js` },
            ]),
        ]),
    }, null, 2))

    writeFileSync(join(dir, 'tsdown.config.ts'), [
        'export default {',
        '    entry: {',
        '        index: \'src/index.ts\',',
        ...entryCodes.map((code) => `        'locale/${code}': 'src/locale/${code}.ts',`),
        '    },',
        '}',
        '',
    ].join('\n'))

    return dir
}

const BASE_NAMESPACES = {
    input: { clear: '清除' },
    pagination: { label: '分页', page: '第 {page} 页' },
}

function createBaseFixture(overrides = {}) {
    return createFixture({
        sources: {
            'zh-cn.ts': buildSource(BASE_NAMESPACES, 'zhCN'),
            'zh-tw.ts': buildSource(BASE_NAMESPACES, 'zhTW'),
            ...overrides.sources,
        },
        ...overrides,
    })
}

describe('check-locale-keys 仓库不变量', () => {
    it('仓库当前通过全部结构校验', () => {
        const result = checkLocaleKeys()
        expect(result.errors).toEqual([])
        expect(result.ok).toBe(true)
    })

    it('基准语为 zh-CN，且全部内建语种均与基准结构一致', () => {
        const result = checkLocaleKeys()
        expect(BASELINE_FILE).toBe('zh-cn.ts')
        expect(result.details.baseline).toEqual({
            file: 'src/locale/zh-cn.ts',
            id: 'zh-CN',
            namespaces: 28,
            keys: 80,
        })

        const ids = result.details.locales.map((locale) => locale.id)
        expect(ids).toEqual(['zh-CN', 'en-US', 'zh-TW', 'ja-JP', 'ko-KR'])
        for (const locale of result.details.locales) {
            expect({ namespaces: locale.namespaces, keys: locale.keys }).toEqual({
                namespaces: 28,
                keys: 80,
            })
        }
    })

    it('预注册集合与语言子路径登记与仓库现状一致', () => {
        const result = checkLocaleKeys()
        expect(result.details.preRegistered).toEqual(['zh-CN', 'en-US'])
        expect(result.details.locales.filter((locale) => locale.preRegistered).map((locale) => locale.id))
            .toEqual(['zh-CN', 'en-US'])
        expect(result.details.subpaths.exports).toEqual(['zh-tw', 'ja-jp', 'ko-kr'])
        expect(result.details.subpaths.entries).toEqual(['zh-tw', 'ja-jp', 'ko-kr'])
    })

    it('内建语言集合与受检面下界钉定（下界等于现状，且不得被下调）', () => {
        const result = checkLocaleKeys()
        expect(MIN_UNION_LOCALES).toBe(5)
        expect(MIN_SUBPATH_LOCALES).toBe(3)
        expect(result.details.union.length).toBe(MIN_UNION_LOCALES)
        expect(result.details.subpaths.exports.length).toBe(MIN_SUBPATH_LOCALES)
    })

    it('注册表解析出 defaultLocale、预注册集合、显式联合与语种文件映射', () => {
        const { locales, defaultLocale, preRegistered, union } = parseLocaleRegistry(
            [
                'import zhCN from \'./zh-cn\'',
                'import zhTW from \'./zh-tw\'',
                'import type { CaomeiLocaleMessages } from \'./types\'',
                '',
                'export type CaomeiLocale = \'zh-CN\' | \'zh-TW\'',
                '',
                'export const PRE_REGISTERED_LOCALES = [\'zh-CN\'] as const satisfies readonly CaomeiLocale[]',
                '',
                'export const caomeiLocales: Partial<Record<CaomeiLocale, CaomeiLocaleMessages>> = {',
                '    \'zh-CN\': zhCN,',
                '}',
                '',
                'export const defaultLocale: CaomeiLocale = \'zh-CN\'',
            ].join('\n'),
        )

        expect(defaultLocale).toBe('zh-CN')
        expect(preRegistered).toEqual(['zh-CN'])
        expect(union).toEqual(['zh-CN', 'zh-TW'])
        expect(locales).toEqual([{ id: 'zh-CN', file: 'zh-cn.ts' }])
    })
})

describe('check-locale-keys 辅助函数', () => {
    it('parseLocaleSource 提取命名空间与键值', () => {
        expect(parseLocaleSource(buildSource(BASE_NAMESPACES))).toEqual(BASE_NAMESPACES)
    })

    it('parseLocaleSource 还原转义字符', () => {
        const source = buildSource({ demo: { text: 'It\\\'s ok' } })
        expect(parseLocaleSource(source).demo.text).toBe('It\'s ok')
    })

    it('parseLocaleSource 遇到无法解析的行时抛错', () => {
        expect(() => parseLocaleSource('const a: CaomeiLocaleMessages = {\n  bad\n}')).toThrow(
            /无法解析的文案行/,
        )
    })

    it('extractPlaceholders 去重并排序', () => {
        expect(extractPlaceholders('第 {page} 页 / {page}')).toEqual(['page'])
        expect(extractPlaceholders('通知 ({hotkey})')).toEqual(['hotkey'])
        expect(extractPlaceholders('普通文案')).toEqual([])
    })

    it('compareLocaleKeys 结构一致时返回空数组', () => {
        expect(compareLocaleKeys('zh-TW', 'zh-tw.ts', BASE_NAMESPACES, BASE_NAMESPACES)).toEqual([])
    })

    it('parseLocaleRegistry 拒绝路径穿越的导入', () => {
        const source = [
            'import evil from \'./../evil\'',
            'export const caomeiLocales = {',
            '    \'zh-CN\': evil,',
            '}',
            'export const defaultLocale: CaomeiLocale = \'zh-CN\'',
        ].join('\n')
        expect(() => parseLocaleRegistry(source)).toThrow(/导入路径非法/)
    })

    it('readSubpathRegistration 读取 exports 与构建入口，并识别不同源的入口键', () => {
        const dir = createFixture({ subpathEntries: ['zh-tw'] })
        writeFileSync(join(dir, 'tsdown.config.ts'), [
            'export default {',
            '    entry: {',
            '        \'locale/ja-jp\': \'src/locale/ko-kr.ts\',',
            '    },',
            '}',
            '',
        ].join('\n'))
        const registration = readSubpathRegistration(dir)
        expect(registration.errors.join('\n')).toContain('不同源')
        expect(registration.entries).toEqual([])
    })
})

describe('check-locale-keys 失败路径：结构一致性', () => {
    it('缺少键时报错', () => {
        const dir = createBaseFixture({
            sources: {
                'zh-tw.ts': buildSource({
                    input: { clear: '清除' },
                    pagination: { label: '分頁' },
                }, 'zhTW'),
            },
        })
        const result = checkLocaleKeys(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('命名空间 pagination 缺少键 page')
    })

    it('多出键时报错', () => {
        const dir = createBaseFixture({
            sources: {
                'zh-tw.ts': buildSource({
                    input: { clear: '清除', reset: '重設' },
                    pagination: { label: '分頁', page: '第 {page} 頁' },
                }, 'zhTW'),
            },
        })
        const result = checkLocaleKeys(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('命名空间 input 多出键 reset')
    })

    it('命名空间缺失时报错', () => {
        const dir = createBaseFixture({
            sources: { 'zh-tw.ts': buildSource({ input: { clear: '清除' } }, 'zhTW') },
        })
        const result = checkLocaleKeys(dir)
        expect(result.errors.join('\n')).toContain('缺少命名空间 pagination')
    })

    it('占位符不一致时报错', () => {
        const dir = createBaseFixture({
            sources: {
                'zh-tw.ts': buildSource({
                    input: { clear: '清除' },
                    pagination: { label: '分頁', page: '第 {p} 頁' },
                }, 'zhTW'),
            },
        })
        const result = checkLocaleKeys(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('占位符与基准不一致')
    })

    it('空白文案时报错', () => {
        const dir = createBaseFixture({
            sources: {
                'zh-tw.ts': buildSource({
                    input: { clear: '   ' },
                    pagination: { label: '分頁', page: '第 {page} 頁' },
                }, 'zhTW'),
            },
        })
        const result = checkLocaleKeys(dir)
        expect(result.errors.join('\n')).toContain('为空白字符串')
    })

    it('按需引入的语种退出注册表后仍逐条比对基准（受检面不随注册表收窄）', () => {
        const dir = createBaseFixture({
            sources: {
                'zh-tw.ts': buildSource({
                    input: { clear: '清除' },
                    pagination: { label: '分頁' },
                }, 'zhTW'),
            },
        })
        const result = checkLocaleKeys(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('zh-TW（src/locale/zh-tw.ts）命名空间 pagination 缺少键 page')
    })

    it('内建语言缺少文案文件时报错', () => {
        const dir = createFixture({ omitFiles: ['zh-tw.ts'] })
        const result = checkLocaleKeys(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('内建语言 zh-TW 缺少文案文件 src/locale/zh-tw.ts')
    })

    it('语言文件不在联合中时报错', () => {
        const dir = createBaseFixture({
            extraFiles: { 'fr-fr.ts': buildSource(BASE_NAMESPACES, 'frFR') },
        })
        const result = checkLocaleKeys(dir)
        expect(result.errors.join('\n')).toContain(
            'src/locale/fr-fr.ts 未在 src/locale/index.ts 的 CaomeiLocale 联合中声明',
        )
    })

    it('同目录测试文件不计入未声明文案', () => {
        const dir = createBaseFixture({
            extraFiles: { 'zh-cn.test.ts': buildSource(BASE_NAMESPACES, 'zhCN') },
        })
        const result = checkLocaleKeys(dir)
        expect(result.errors).toEqual([])
        expect(result.ok).toBe(true)
    })

    it('语言标识与文案文件名错配时报错', () => {
        const dir = createFixture({
            union: ['zh-CN', 'ja-JP'],
            preRegistered: ['zh-CN', 'ja-JP'],
            registryEntries: [
                { id: 'zh-CN', importPath: './zh-cn', importName: 'zhCN' },
                { id: 'ja-JP', importPath: './ko-kr', importName: 'koKR' },
            ],
            sources: {
                'zh-cn.ts': buildSource(BASE_NAMESPACES, 'zhCN'),
                'ko-kr.ts': buildSource(BASE_NAMESPACES, 'koKR'),
                'ja-jp.ts': buildSource(BASE_NAMESPACES, 'jaJP'),
            },
        })
        const result = checkLocaleKeys(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('应为 src/locale/ja-jp.ts')
    })

    it('基准语种文件未注册时报错', () => {
        const dir = createFixture({
            union: ['zh-CN', 'en-US'],
            preRegistered: ['en-US'],
            sources: {
                'zh-cn.ts': buildSource(BASE_NAMESPACES, 'zhCN'),
                'en-us.ts': buildSource(BASE_NAMESPACES, 'enUS'),
            },
            defaultLocale: 'en-US',
        })
        const result = checkLocaleKeys(dir)
        expect(result.errors.join('\n')).toContain('基准语种文件 src/locale/zh-cn.ts 未在 caomeiLocales 注册')
    })

    it('defaultLocale 不在预注册集合时报错', () => {
        const dir = createBaseFixture({ defaultLocale: 'fr-FR' })
        const result = checkLocaleKeys(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('defaultLocale \'fr-FR\' 不在 PRE_REGISTERED_LOCALES 内')
    })

    it('缺少注册表时报错', () => {
        const dir = mkdtempSync(join(tmpdir(), 'check-locale-keys-'))
        tempDirs.push(dir)
        const result = checkLocaleKeys(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('缺少文案注册表')
    })
})

describe('check-locale-keys 失败路径：预注册集合与分发登记（负向对照）', () => {
    it('注册表多出预注册集合之外的语种时报错（按需引入收益不得被静默归零）', () => {
        const dir = createBaseFixture({
            registryEntries: [
                { id: 'zh-CN', importPath: './zh-cn', importName: 'zhCN' },
                { id: 'zh-TW', importPath: './zh-tw', importName: 'zhTW' },
            ],
            subpathExports: [],
            subpathEntries: [],
        })
        const result = checkLocaleKeys(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('注册表字面量多出预注册集合之外的语种 zh-TW')
    })

    it('预注册集合声明的语种未在注册表登记时报错', () => {
        const dir = createBaseFixture({
            preRegistered: ['zh-CN', 'zh-TW'],
            registryEntries: [{ id: 'zh-CN', importPath: './zh-cn', importName: 'zhCN' }],
            subpathExports: [],
            subpathEntries: [],
        })
        const result = checkLocaleKeys(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('预注册语言 zh-TW 未在 caomeiLocales 注册表字面量中登记')
    })

    it('非预注册语言缺少 package.json 子路径时报错', () => {
        const dir = createBaseFixture({ subpathExports: [] })
        const result = checkLocaleKeys(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('未在 package.json 的 exports 中登记子路径 ./locale/zh-tw')
    })

    it('非预注册语言缺少构建入口时报错', () => {
        const dir = createBaseFixture({ subpathEntries: [] })
        const result = checkLocaleKeys(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('未在 tsdown.config.ts 的构建入口中登记')
    })

    it('悬空的 exports 子路径时报错', () => {
        const dir = createBaseFixture({ subpathExports: ['zh-tw', 'fr-fr'] })
        const result = checkLocaleKeys(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('exports 子路径 ./locale/fr-fr 不在「非预注册内建语言」集合内')
    })

    it('内建语言集合低于下界时报错', () => {
        const dir = createFixture({
            union: ['zh-CN', 'zh-TW'],
            preRegistered: ['zh-CN'],
            sources: {
                'zh-cn.ts': buildSource(BASE_NAMESPACES, 'zhCN'),
                'zh-tw.ts': buildSource(BASE_NAMESPACES, 'zhTW'),
            },
        })
        const result = checkLocaleKeys(dir)
        expect(MIN_UNION_LOCALES).toBe(5)
        expect(result.errors.join('\n')).toContain('低于受检面下界')
    })

    it('语言子路径登记低于下界时报错', () => {
        const dir = createBaseFixture({ subpathExports: [], subpathEntries: [] })
        const result = checkLocaleKeys(dir)
        expect(MIN_SUBPATH_LOCALES).toBe(3)
        expect(result.errors.join('\n')).toContain('语言子路径登记仅 0 项，低于受检面下界')
    })
})

describe('check-locale-keys 失败路径：登记面健壮性与唯一性', () => {
    it('被注释掉的构建入口不计为已登记', () => {
        const dir = createBaseFixture({ subpathEntries: ['ja-jp', 'ko-kr'] })
        writeFileSync(join(dir, 'tsdown.config.ts'), [
            'export default {',
            '    entry: {',
            '        index: \'src/index.ts\',',
            '        // \'locale/zh-tw\': \'src/locale/zh-tw.ts\',',
            '        \'locale/ja-jp\': \'src/locale/ja-jp.ts\',',
            '        \'locale/ko-kr\': \'src/locale/ko-kr.ts\',',
            '    },',
            '}',
            '',
        ].join('\n'))
        const result = checkLocaleKeys(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('内建语言 zh-tw 未在 tsdown.config.ts 的构建入口中登记')
    })

    it('缺少 package.json 时响亮失败', () => {
        const dir = createBaseFixture()
        rmSync(join(dir, 'package.json'))
        const result = checkLocaleKeys(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('缺少 package.json')
    })

    it('缺少 tsdown.config.ts 时响亮失败', () => {
        const dir = createBaseFixture()
        rmSync(join(dir, 'tsdown.config.ts'))
        const result = checkLocaleKeys(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('缺少 tsdown.config.ts')
    })

    it('联合 / 预注册集合 / 注册表存在重复成员时报错', () => {
        const dir = createFixture({
            union: ['zh-CN', 'en-US', 'zh-TW', 'ja-JP', 'ko-KR', 'zh-TW'],
            preRegistered: ['zh-CN', 'en-US', 'zh-CN'],
            registryEntries: [
                { id: 'zh-CN', importPath: './zh-cn', importName: 'zhCN' },
                { id: 'zh-CN', importPath: './zh-cn', importName: 'zhCN' },
            ],
        })
        const result = checkLocaleKeys(dir)
        expect(result.ok).toBe(false)
        const joined = result.errors.join('\n')
        expect(joined).toContain('CaomeiLocale 联合存在重复成员：zh-TW')
        expect(joined).toContain('PRE_REGISTERED_LOCALES 存在重复成员：zh-CN')
        expect(joined).toContain('caomeiLocales 注册表存在重复键：zh-CN')
    })
})

describe('stripComments', () => {
    it('保留单引号字符串内的 // 与 /* */', () => {
        expect(stripComments('a: \'x // y /* z */\',')).toBe('a: \'x // y /* z */\',')
    })

    it('移除行注释与块注释', () => {
        expect(stripComments('a // c\n/* d */b')).toBe('a \nb')
    })
})

describe('parseLocaleSource 注释容忍', () => {
    it('容忍缩进 //、行尾 // 与块注释，并保留字符串内的 //', () => {
        const source = [
            '// 文件头说明（顶格）',
            'import type { CaomeiLocaleMessages } from \'./types\'',
            '',
            'const messages: CaomeiLocaleMessages = {',
            '    input: {',
            '        // 缩进行注释',
            '        clear: \'清除\', // 行尾注释',
            '        /* 块注释 */',
            '        placeholder: \'请输入 https://example.com 地址\',',
            '    },',
            '}',
            '',
            'export default messages',
        ].join('\n')
        expect(parseLocaleSource(source)).toEqual({
            input: {
                clear: '清除',
                placeholder: '请输入 https://example.com 地址',
            },
        })
    })

    it('多行块注释内的键不产生条目', () => {
        const source = [
            'const messages: CaomeiLocaleMessages = {',
            '    /*',
            '     多行块注释',
            '     key: \'fake\',',
            '    */',
            '    input: {',
            '        clear: \'清除\',',
            '    },',
            '}',
            'export default messages',
        ].join('\n')
        expect(parseLocaleSource(source)).toEqual({ input: { clear: '清除' } })
    })

    it('无法识别的行仍抛错（响亮失败）', () => {
        const source = [
            'const messages: CaomeiLocaleMessages = {',
            '    input: {',
            '        clear: 清除,',
            '    },',
            '}',
            'export default messages',
        ].join('\n')
        expect(() => parseLocaleSource(source, 'zh-cn.ts')).toThrow(/无法解析的文案行/)
    })

    it('未闭合的块注释抛错', () => {
        const source = [
            'const messages: CaomeiLocaleMessages = {',
            '    input: {',
            '        /* 未闭合',
            '        clear: \'清除\',',
            '    },',
            '}',
            'export default messages',
        ].join('\n')
        expect(() => parseLocaleSource(source, 'zh-cn.ts')).toThrow(/未闭合的块注释/)
    })

    it('文案键出现在命名空间之外时报错', () => {
        const source = [
            'const messages: CaomeiLocaleMessages = {',
            '        clear: \'清除\',',
            '    input: {',
            '        clear: \'清除\',',
            '    },',
            '}',
            'export default messages',
        ].join('\n')
        expect(() => parseLocaleSource(source, 'zh-cn.ts')).toThrow(/命名空间之外/)
    })
})
