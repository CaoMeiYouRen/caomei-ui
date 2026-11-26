import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
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


/**
 * 解析 `parent` 实际安装的 `dependency` 版本。
 *
 * pnpm 把同源依赖放在 `.pnpm/<pkg>@<ver>/node_modules/` 同层，必须从真实路径建解析器，
 * 否则从工作区软链路径出发会找不到兄弟包。
 */
function resolveInstalledVersion(parent, dependency) {
    try {
        const base = realpathSync(join(REPO_ROOT, 'node_modules', parent))
        const requireFrom = createRequire(join(base, 'package.json'))
        return JSON.parse(readFileSync(requireFrom.resolve(`${dependency}/package.json`), 'utf8')).version
    } catch {
        return undefined
    }
}

describe('check-licenses 仓库不变量', () => {
    /**
     * 上游未随包提供 LICENSE 文件的依赖：其许可证全文取自源码仓库的 `LICENSE`
     * （条目内以 `Source:` 标注），无法按 `node_modules/<pkg>/LICENSE` 核对。
     * 例外自失效：包一旦随包附带 LICENSE，对应用例会失败并要求移除本表登记。
     */
    const PACKAGES_WITHOUT_BUNDLED_LICENSE = new Map([
        ['embla-carousel-vue', 'embla 三包均不随包提供 LICENSE，仅在 package.json 声明 MIT、README 链接仓库 LICENSE'],
    ])

    const declaration = normalizeText(readFileSync(join(REPO_ROOT, DECLARATION_FILE), 'utf8'))

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
            const text = readLicenseText(REPO_ROOT, item.name)
            const exceptionReason = PACKAGES_WITHOUT_BUNDLED_LICENSE.get(item.name)
            if (exceptionReason !== undefined) {
                expect(text, `${item.name} 已随包提供 LICENSE（${exceptionReason}），应移除例外登记`).toBeUndefined()
                continue
            }
            expect(typeof text).toBe('string')
        }
    })

    it('声明文件中每个条目都带许可证正文', () => {
        const headings = [...declaration.matchAll(/^## (.+@\S+)$/gmu)].map((match) => match[1])
        expect(headings.length).toBeGreaterThan(0)
        const empty = headings.filter((heading) => {
            const section = extractSection(declaration, `## ${heading}`) ?? ''
            return normalizeText(extractLicenseBody(section)).length < 40
        })
        expect(empty).toEqual([])
    })

    it('Source 行指向不可变的完整 commit', () => {
        const sources = [...declaration.matchAll(/^Source: (.+)$/gmu)].map((match) => match[1].trim())
        expect(sources.length).toBeGreaterThan(0)
        for (const source of sources) {
            expect(source, `${source} 应指向 40 位 commit`).toMatch(/\/blob\/[0-9a-f]{40}\//u)
        }
    })

    it('未随包提供 LICENSE 的例外登记均仍在受检范围内', () => {
        const names = new Set(collectRequiredPackages().map((item) => item.name))
        for (const name of PACKAGES_WITHOUT_BUNDLED_LICENSE.keys()) {
            expect(names.has(name), `${name} 已不在 dependencies / peerDependencies，应移除例外登记`).toBe(true)
        }
    })

    it('例外包在声明文件中仍保有正文与取文出处', () => {
        for (const [name, reason] of PACKAGES_WITHOUT_BUNDLED_LICENSE) {
            const entry = findDeclarationSection(declaration, name)
            expect(entry, `${name} 缺少声明条目（${reason}）`).toBeDefined()
            const body = normalizeText(extractLicenseBody(entry?.section ?? ''))
            expect(body, `${name} 条目只剩头部行，缺少许可证正文`).toMatch(/Permission is hereby granted/)
            expect(entry?.section ?? '').toMatch(/^Source: https:\/\//mu)
        }
    })

    it('例外包的同源传递依赖在声明文件中登记且版本一致', () => {
        const problems = []
        for (const name of PACKAGES_WITHOUT_BUNDLED_LICENSE.keys()) {
            const pkgFile = join(REPO_ROOT, 'node_modules', name, 'package.json')
            if (!existsSync(pkgFile)) {
                problems.push(`${name} 未安装，无法核对传递依赖`)
                continue
            }
            const installed = JSON.parse(readFileSync(pkgFile, 'utf8'))
            for (const dependency of Object.keys(installed.dependencies ?? {})) {
                const entry = findDeclarationSection(declaration, dependency)
                if (!entry) {
                    problems.push(`传递依赖 ${dependency} 未在 ${DECLARATION_FILE} 登记`)
                    continue
                }
                const installedVersion = resolveInstalledVersion(name, dependency)
                if (installedVersion === undefined) {
                    problems.push(`传递依赖 ${dependency} 未随 ${name} 安装`)
                    continue
                }
                if (entry.version !== installedVersion) {
                    problems.push(`传递依赖 ${dependency} 标题版本 ${entry.version} 与安装版本 ${installedVersion} 不一致（licenses:sync 不覆盖传递依赖）`)
                }
            }
        }
        expect(problems).toEqual([])
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
