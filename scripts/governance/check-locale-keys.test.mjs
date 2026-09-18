import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    BASELINE_FILE,
    checkLocaleKeys,
    compareLocaleKeys,
    extractPlaceholders,
    parseLocaleRegistry,
    parseLocaleSource,
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

/** 构造 `src/locale` 夹具目录（注册表 + 各语种文案文件）。 */
function createFixture({ registry, sources = {}, defaultLocale = 'zh-CN', extraFiles = {} }) {
    const dir = mkdtempSync(join(tmpdir(), 'check-locale-keys-'))
    tempDirs.push(dir)
    const localeDir = join(dir, 'src', 'locale')
    mkdirSync(localeDir, { recursive: true })

    const index = [
        ...registry.map((entry) => `import ${entry.importName} from '${entry.importPath}'`),
        'import type { CaomeiLocaleMessages } from \'./types\'',
        '',
        'export const caomeiLocales = {',
        ...registry.map((entry) => `    '${entry.id}': ${entry.importName},`),
        '} as const',
        '',
        'export type CaomeiLocale = keyof typeof caomeiLocales',
        '',
        `export const defaultLocale: CaomeiLocale = '${defaultLocale}'`,
        '',
    ].join('\n')

    writeFileSync(join(localeDir, 'index.ts'), index)
    for (const [file, text] of Object.entries({ ...sources, ...extraFiles })) {
        writeFileSync(join(localeDir, file), text)
    }
    return dir
}

const BASE_NAMESPACES = {
    input: { clear: '清除' },
    pagination: { label: '分页', page: '第 {page} 页' },
}

const BASE_REGISTRY = [
    { id: 'zh-CN', importPath: './zh-cn', importName: 'zhCN' },
    { id: 'zh-TW', importPath: './zh-tw', importName: 'zhTW' },
]

function createBaseFixture(overrides = {}) {
    return createFixture({
        registry: BASE_REGISTRY,
        sources: {
            'zh-cn.ts': buildSource(BASE_NAMESPACES, 'zhCN'),
            'zh-tw.ts': buildSource(BASE_NAMESPACES, 'zhTW'),
            ...overrides.sources,
        },
        defaultLocale: overrides.defaultLocale,
        extraFiles: overrides.extraFiles,
    })
}

describe('check-locale-keys 仓库不变量', () => {
    it('仓库当前通过全部结构校验', () => {
        const result = checkLocaleKeys()
        expect(result.errors).toEqual([])
        expect(result.ok).toBe(true)
    })

    it('基准语为 zh-CN，且注册语种均与基准结构一致', () => {
        const result = checkLocaleKeys()
        expect(BASELINE_FILE).toBe('zh-cn.ts')
        expect(result.details.baseline).toEqual({
            file: 'src/locale/zh-cn.ts',
            id: 'zh-CN',
            namespaces: 24,
            keys: 66,
        })

        const ids = result.details.locales.map((locale) => locale.id)
        expect(ids).toEqual(['zh-CN', 'en-US', 'zh-TW', 'ja-JP', 'ko-KR'])
        for (const locale of result.details.locales) {
            expect({ namespaces: locale.namespaces, keys: locale.keys }).toEqual({
                namespaces: 24,
                keys: 66,
            })
        }
    })

    it('注册表解析出 defaultLocale 与语种文件映射', () => {
        const { locales, defaultLocale } = parseLocaleRegistry(
            [
                'import zhTW from \'./zh-tw\'',
                'import zhCN from \'./zh-cn\'',
                '',
                'export const caomeiLocales = {',
                '    \'zh-CN\': zhCN,',
                '    \'zh-TW\': zhTW,',
                '} as const',
                '',
                'export type CaomeiLocale = keyof typeof caomeiLocales',
                '',
                'export const defaultLocale: CaomeiLocale = \'zh-CN\'',
            ].join('\n'),
        )

        expect(defaultLocale).toBe('zh-CN')
        expect(locales).toEqual([
            { id: 'zh-CN', file: 'zh-cn.ts' },
            { id: 'zh-TW', file: 'zh-tw.ts' },
        ])
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
            '} as const',
            'export const defaultLocale: CaomeiLocale = \'zh-CN\'',
        ].join('\n')
        expect(() => parseLocaleRegistry(source)).toThrow(/导入路径非法/)
    })
})

describe('check-locale-keys 失败路径', () => {
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

    it('注册语种缺少文案文件时报错', () => {
        const dir = createFixture({
            registry: BASE_REGISTRY,
            sources: { 'zh-cn.ts': buildSource(BASE_NAMESPACES, 'zhCN') },
        })
        const result = checkLocaleKeys(dir)
        expect(result.errors.join('\n')).toContain('缺少文案文件 src/locale/zh-tw.ts')
    })

    it('语种文件未注册时报错', () => {
        const dir = createBaseFixture({
            extraFiles: { 'fr-fr.ts': buildSource(BASE_NAMESPACES, 'frFR') },
        })
        const result = checkLocaleKeys(dir)
        expect(result.errors.join('\n')).toContain('未在 src/locale/index.ts 的 caomeiLocales 注册')
    })

    it('同目录测试文件不计入未注册文案', () => {
        const dir = createBaseFixture({
            extraFiles: { 'zh-cn.test.ts': buildSource(BASE_NAMESPACES, 'zhCN') },
        })
        const result = checkLocaleKeys(dir)
        expect(result.errors).toEqual([])
        expect(result.ok).toBe(true)
    })

    it('语言标识与文案文件名错配时报错', () => {
        const dir = createFixture({
            registry: [
                { id: 'zh-CN', importPath: './zh-cn', importName: 'zhCN' },
                { id: 'ja-JP', importPath: './ko-kr', importName: 'koKR' },
            ],
            sources: {
                'zh-cn.ts': buildSource(BASE_NAMESPACES, 'zhCN'),
                'ko-kr.ts': buildSource(BASE_NAMESPACES, 'koKR'),
            },
        })
        const result = checkLocaleKeys(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('应为 src/locale/ja-jp.ts')
    })

    it('基准语种文件未注册时报错', () => {
        const dir = createFixture({
            registry: [{ id: 'en-US', importPath: './en-us', importName: 'enUS' }],
            sources: {
                'zh-cn.ts': buildSource(BASE_NAMESPACES, 'zhCN'),
                'en-us.ts': buildSource(BASE_NAMESPACES, 'enUS'),
            },
            defaultLocale: 'en-US',
        })
        const result = checkLocaleKeys(dir)
        expect(result.errors.join('\n')).toContain('基准语种文件 src/locale/zh-cn.ts 未在 caomeiLocales 注册')
    })

    it('defaultLocale 未注册时报错', () => {
        const dir = createBaseFixture({ defaultLocale: 'fr-FR' })
        const result = checkLocaleKeys(dir)
        expect(result.errors.join('\n')).toContain('defaultLocale \'fr-FR\' 未在 caomeiLocales 注册')
    })

    it('缺少注册表时报错', () => {
        const dir = mkdtempSync(join(tmpdir(), 'check-locale-keys-'))
        tempDirs.push(dir)
        const result = checkLocaleKeys(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('缺少文案注册表')
    })
})
