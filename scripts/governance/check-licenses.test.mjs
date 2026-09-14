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
