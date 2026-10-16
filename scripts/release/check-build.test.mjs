import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { collectExportFiles, findInvalidFiles, findLocaleSubpathProblems, findMissingCssImports, findMissingExports } from './check-build.mjs'

const tempDirs = []

function createFixture(files = {}) {
    const dir = mkdtempSync(join(tmpdir(), 'check-build-'))
    tempDirs.push(dir)

    for (const [relative, content] of Object.entries(files)) {
        const absolute = join(dir, relative)
        mkdirSync(join(absolute, '..'), { recursive: true })
        writeFileSync(absolute, content)
    }

    return dir
}

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

describe('collectExportFiles', () => {
    it('收集字符串、条件对象与数组中的文件路径并排序去重', () => {
        const files = collectExportFiles({
            '.': { types: './dist/index.d.ts', import: './dist/index.js' },
            './theme.css': './dist/styles/index.css',
            './fallback': ['./dist/a.js', './dist/b.js'],
            './package.json': './package.json',
        })

        expect(files).toEqual([
            './dist/a.js',
            './dist/b.js',
            './dist/index.d.ts',
            './dist/index.js',
            './dist/styles/index.css',
            './package.json',
        ])
    })

    it('忽略空值节点，缺失 exports 时返回空数组', () => {
        expect(collectExportFiles({ '.': { import: './dist/index.js', default: null } })).toEqual([
            './dist/index.js',
        ])
        expect(collectExportFiles(undefined)).toEqual([])
    })
})

describe('findMissingCssImports', () => {
    it('产物 JS 保留 CSS import 时通过', () => {
        const root = createFixture({
            'dist/index.js': 'import "./styles/index.css";\nexport {}\n',
            'dist/components/button/button.js': 'import "./button.css";\nexport default {}\n',
        })

        expect(findMissingCssImports(root)).toEqual([])
    })

    it('入口丢失 CSS import 时报错（css.inject 失效）', () => {
        const root = createFixture({
            'dist/index.js': 'export {}\n',
            'dist/components/button/button.js': 'import "./button.css";\nexport default {}\n',
        })

        expect(findMissingCssImports(root)).toContain('dist/index.js 未保留 CSS import（css.inject 未生效？）')
    })

    it('组件级 CSS import 数量不足时报错', () => {
        const root = createFixture({
            'dist/index.js': 'import "./styles/index.css";\nexport {}\n',
            'dist/components/button/button.js': 'export default {}\n',
        })

        const problems = findMissingCssImports(root)
        expect(problems.some((item) => item.startsWith('组件级 CSS import 数量不足'))).toBe(true)
    })
})

/** 构造含语言子路径导出的产物夹具。 */
function createLocaleFixture({
    subpaths = ['zh-tw', 'ja-jp', 'ko-kr'],
    registryImports = [],
    defaultExport = true,
    exportTargets,
    registrySource,
} = {}) {
    const files = {
        'package.json': JSON.stringify({
            name: 'fixture',
            exports: Object.fromEntries(subpaths.map((code) => [
                `./locale/${code}`,
                exportTargets?.[code]
                    ? { import: exportTargets[code] }
                    : { types: `./dist/locale/${code}.d.ts`, import: `./dist/locale/${code}.js` },
            ])),
        }),
        'dist/locale/index.js': registrySource ?? [
            'import zhCN from "./zh-cn.js";',
            ...registryImports.map((code) => `import v from "./${code}.js";`),
            'export { zhCN };',
        ].join('\n'),
    }
    for (const code of subpaths) {
        files[`dist/locale/${code}.js`] = defaultExport
            ? 'const messages = {};\nexport { messages as default };'
            : 'export const messages = {};'
    }
    return createFixture(files)
}

describe('findLocaleSubpathProblems', () => {
    it('子路径齐全、带默认导出且注册表未静态引入时通过', () => {
        const dir = createLocaleFixture()
        expect(findLocaleSubpathProblems(dir)).toEqual([])
    })

    it('子路径数量低于下界时报错', () => {
        const dir = createLocaleFixture({ subpaths: ['zh-tw'] })
        expect(findLocaleSubpathProblems(dir).join('\n')).toContain('语言子路径导出数量不足')
    })

    it('缺少默认导出时报错', () => {
        const dir = createLocaleFixture({ defaultExport: false })
        const problems = findLocaleSubpathProblems(dir).join('\n')
        expect(problems).toContain('语言子路径产物缺少默认导出')
    })

    it('注册表静态引入按需语言时报错（按需收益失效）', () => {
        const dir = createLocaleFixture({ registryImports: ['ja-jp'] })
        expect(findLocaleSubpathProblems(dir).join('\n')).toContain('注册表静态引入了按需语言')
    })

    it('子路径产物缺失时报错', () => {
        const dir = createFixture({
            'package.json': JSON.stringify({
                exports: Object.fromEntries(['zh-tw', 'ja-jp', 'ko-kr'].map((code) => [
                    `./locale/${code}`,
                    { import: `./dist/locale/${code}.js` },
                ])),
            }),
            'dist/locale/index.js': 'export {};',
        })
        expect(findLocaleSubpathProblems(dir).join('\n')).toContain('语言子路径产物缺失')
    })

    it('导出目标与语言标识不同源时报错（按键名判定会漏判）', () => {
        const dir = createLocaleFixture({ exportTargets: { 'ja-jp': './dist/locale/ko-kr.js' } })
        expect(findLocaleSubpathProblems(dir).join('\n')).toContain('产物目标与语言标识不同源')
    })

    it('注释中的引入示例不算静态引入（语句级匹配）', () => {
        const dir = createLocaleFixture({
            registrySource: [
                '// 反例：import jaJP from "./ja-jp.js";',
                'import zhCN from "./zh-cn.js";',
                'export { zhCN };',
            ].join('\n'),
        })
        expect(findLocaleSubpathProblems(dir)).toEqual([])
    })

    it('孤儿语言产物时报错（既未注册、也无子路径登记）', () => {
        const dir = createLocaleFixture()
        writeFileSync(join(dir, 'dist/locale/fr-fr.js'), 'export default {};\n')
        expect(findLocaleSubpathProblems(dir).join('\n')).toContain('孤儿语言产物')
    })
})

describe('findInvalidFiles', () => {
    it('区分缺失文件与空文件', () => {
        const dir = createFixture({
            'dist/index.js': 'export const a = 1\n',
            'dist/empty.js': '',
        })

        const result = findInvalidFiles(dir, ['./dist/index.js', './dist/empty.js', './dist/missing.js'])

        expect(result.missing).toEqual(['./dist/missing.js'])
        expect(result.empty).toEqual(['./dist/empty.js'])
    })
})

describe('findMissingExports', () => {
    it('筛出缺失的导出名', () => {
        expect(findMissingExports(['foo', 'bar'], ['foo', 'baz'])).toEqual(['baz'])
        expect(findMissingExports([], [])).toEqual([])
    })
})
