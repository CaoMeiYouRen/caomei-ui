import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    DECLARATION_FILE,
    REPO_ROOT,
    checkLicenses,
    collectRequiredPackages,
    extractSection,
    extractLicenseBody,
    findDeclarationSection,
    normalizeText,
    readLicenseText,
} from './check-licenses.mjs'

const tempDirs = []

function createFixture({ files = [], declaration, dependencies = {}, nodeModules = {} } = {}) {
    const dir = mkdtempSync(join(tmpdir(), 'check-licenses-'))
    tempDirs.push(dir)
    writeFileSync(
        join(dir, 'package.json'),
        JSON.stringify({ name: 'fixture', version: '0.0.0', files, dependencies }, null, 2),
    )
    if (declaration !== undefined) {
        writeFileSync(join(dir, DECLARATION_FILE), declaration)
    }
    for (const [name, content] of Object.entries(nodeModules)) {
        const pkgDir = join(dir, 'node_modules', name)
        mkdirSync(pkgDir, { recursive: true })
        if (content.packageJson) {
            writeFileSync(join(pkgDir, 'package.json'), JSON.stringify(content.packageJson, null, 2))
        }
        if (content.license) {
            writeFileSync(join(pkgDir, 'LICENSE'), content.license)
        }
    }
    return dir
}

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

describe('check-licenses 仓库不变量', () => {
    it('仓库当前通过全部检查', () => {
        const result = checkLicenses()
        expect(result.errors).toEqual([])
        expect(result.ok).toBe(true)
    })

    it('覆盖全部运行时依赖与 peer 依赖', () => {
        const names = collectRequiredPackages().map((item) => item.name)
        expect(names).toEqual(
            expect.arrayContaining(['@lucide/vue', '@tanstack/vue-table', 'reka-ui', 'vue']),
        )
    })

    it('已安装依赖均可读取 license 与许可证全文', () => {
        for (const item of collectRequiredPackages()) {
            expect(item.installed).toBe(true)
            expect(typeof item.license).toBe('string')
            expect(typeof readLicenseText(REPO_ROOT, item.name)).toBe('string')
        }
    })
})

describe('check-licenses 辅助函数', () => {
    it('normalizeText 统一换行并去除行尾空白', () => {
        expect(normalizeText('a  \r\n b \r\n')).toBe('a\n b')
        expect(normalizeText('\n\nMIT\n\n')).toBe('MIT')
    })

    it('extractSection 截取到下一个二级标题前', () => {
        const declaration = '## a@1\nLicense: MIT\n\n## b@2\nLicense: ISC'
        expect(extractSection(declaration, '## a@1')).toBe('## a@1\nLicense: MIT\n')
        expect(extractSection(declaration, '## b@2')).toBe('## b@2\nLicense: ISC')
        expect(extractSection(declaration, '## c@3')).toBeUndefined()
    })
})

describe('check-licenses 失败路径', () => {
    it('缺少声明文件时报错', () => {
        const dir = createFixture({ files: [] })
        const result = checkLicenses(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('缺少第三方许可声明文件')
    })

    it('files 未包含声明时报错', () => {
        const dir = createFixture({
            files: ['dist'],
            declaration: '占位声明\n',
        })
        const result = checkLicenses(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('files 未包含')
    })

    it('依赖既无 license 元数据也无 LICENSE 文件时报错', () => {
        const dir = createFixture({
            files: ['dist', DECLARATION_FILE],
            declaration: '## foo@1.0.0\nLicense: UNKNOWN\n',
            dependencies: { foo: '1.0.0' },
            nodeModules: { foo: { packageJson: { name: 'foo', version: '1.0.0' } } },
        })
        const result = checkLicenses(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('既无 license 元数据也无 LICENSE 文件')
    })
})

describe('check-licenses 标题版本容忍（自动合并路径）', () => {
    const files = ['dist', DECLARATION_FILE]

    it('标题版本滞后但许可证未变时通过并给出 warning', () => {
        const dir = createFixture({
            files,
            declaration: '## foo@1.0.0\n\nLicense: MIT\n\nMIT text\n',
            dependencies: { foo: '1.2.0' },
            nodeModules: { foo: { packageJson: { name: 'foo', version: '1.2.0', license: 'MIT' }, license: 'MIT text' } },
        })
        const result = checkLicenses(dir)
        expect(result.ok).toBe(true)
        expect(result.warnings.join('\n')).toContain('标题版本 1.0.0 与安装版本 1.2.0')
    })

    it('标题版本滞后且许可证全文变化时报错', () => {
        const dir = createFixture({
            files,
            declaration: '## foo@1.0.0\n\nLicense: MIT\n\nOLD text\n',
            dependencies: { foo: '1.2.0' },
            nodeModules: { foo: { packageJson: { name: 'foo', version: '1.2.0', license: 'MIT' }, license: 'NEW text' } },
        })
        const result = checkLicenses(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('归一化后不相等')
    })

    it('同名条目重复时报错', () => {
        const dir = createFixture({
            files,
            declaration: '## foo@1.0.0\n\nLicense: MIT\n\nMIT text\n\n## foo@1.1.0\n\nLicense: MIT\n\nMIT text\n',
            dependencies: { foo: '1.2.0' },
            nodeModules: { foo: { packageJson: { name: 'foo', version: '1.2.0', license: 'MIT' }, license: 'MIT text' } },
        })
        const result = checkLicenses(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('存在 2 个 foo 条目')
    })
})

describe('check-licenses 全文相等校验', () => {
    const files = ['dist', DECLARATION_FILE]

    it('安装包文本变短（旧文本超集）时报错，不再被子串匹配放过', () => {
        const dir = createFixture({
            files,
            declaration: '## foo@1.0.0\n\nLicense: MIT\n\nMIT text\n\nADDITIONAL RESTRICTION\n',
            dependencies: { foo: '1.2.0' },
            nodeModules: { foo: { packageJson: { name: 'foo', version: '1.2.0', license: 'MIT' }, license: 'MIT text' } },
        })
        const result = checkLicenses(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('归一化后不相等')
    })

    it('文件级说明块不参与正文比较', () => {
        const dir = createFixture({
            files,
            declaration: '## foo@1.2.0\n\nLicense: MIT\n\nMIT text\n\n---\n\n说明：以上仅列出 caomei-ui 的直接运行时依赖。\n',
            dependencies: { foo: '1.2.0' },
            nodeModules: { foo: { packageJson: { name: 'foo', version: '1.2.0', license: 'MIT' }, license: 'MIT text' } },
        })
        expect(checkLicenses(dir).ok).toBe(true)
    })
})

describe('findDeclarationSection 名称匹配', () => {
    const declaration = '## vue@3.5.44\n\nLicense: MIT\n\n## vue-echarts@8.3.2\n\nLicense: Apache-2.0\n\n## @lucide/vue@1.70.0\n\nLicense: ISC\n'

    it('vue 不会串到 vue-echarts', () => {
        expect(findDeclarationSection(declaration, 'vue')?.heading).toBe('## vue@3.5.44')
    })

    it('scope 包名正常命中', () => {
        expect(findDeclarationSection(declaration, '@lucide/vue')?.heading).toBe('## @lucide/vue@1.70.0')
    })
})

describe('check-licenses 头部对称剥离', () => {
    it('安装包 LICENSE 以 Copyright: 开头时不误报', () => {
        const dir = createFixture({
            files: ['dist', DECLARATION_FILE],
            declaration: '## foo@1.2.0\n\nLicense: MIT\n\nCopyright: Example Inc.\nMIT text\n',
            dependencies: { foo: '1.2.0' },
            nodeModules: { foo: { packageJson: { name: 'foo', version: '1.2.0', license: 'MIT' }, license: 'Copyright: Example Inc.\nMIT text' } },
        })
        expect(checkLicenses(dir).ok).toBe(true)
    })
})

describe('check-licenses 空正文', () => {
    it('条目与安装包都只有头部行时报错', () => {
        const dir = createFixture({
            files: ['dist', DECLARATION_FILE],
            declaration: '## foo@1.2.0\n\nLicense: MIT\n',
            dependencies: { foo: '1.2.0' },
            nodeModules: { foo: { packageJson: { name: 'foo', version: '1.2.0', license: 'MIT' }, license: 'License: MIT' } },
        })
        const result = checkLicenses(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('只有头部行')
    })
})
