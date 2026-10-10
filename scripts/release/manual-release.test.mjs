import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { CURRENT_VERSION_STATEMENTS, statementFiles } from '../shared/version-statements.mjs'
import {
    extractChangelogSection,
    parseArgs,
    planVersionStatementSync,
    readUnpackedPackage,
    replacePackageVersion,
    replaceVersionInStatement,
    sha1File,
    validateDate,
    validateVersion,
} from './manual-release.mjs'

const tempDirs = []

function tempDir(prefix) {
    const dir = mkdtempSync(join(tmpdir(), prefix))
    tempDirs.push(dir)
    return dir
}

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

// 直接使用**真实**登记表，锁定真实锚点形态（避免测试与实现静默分叉）
const STATEMENTS = CURRENT_VERSION_STATEMENTS

describe('manual-release parseArgs', () => {
    it('解析 step 与参数', () => {
        expect(parseArgs(['bump', '--version=0.7.0', '--date=2026-10-10', '--yes'])).toMatchObject({
            step: 'bump',
            version: '0.7.0',
            date: '2026-10-10',
            yes: true,
            dryRun: false,
            error: null,
        })
    })

    it('--dry-run 与 run step', () => {
        expect(parseArgs(['run', '--version=0.7.0', '--dry-run'])).toMatchObject({ step: 'run', dryRun: true })
    })

    it('拒绝未知参数 / 未知 step / 缺 step', () => {
        expect(parseArgs(['bump', '--version=0.7.0', '--nope']).error).toMatch(/不支持的参数/u)
        expect(parseArgs(['nope', '--version=0.7.0']).error).toMatch(/未知 step/u)
        expect(parseArgs(['--version=0.7.0']).error).toMatch(/缺少 step/u)
        expect(parseArgs(['bump', '--version=0.7.0', 'extra']).error).toMatch(/未知位置参数/u)
    })
})

describe('manual-release 校验', () => {
    it('validateVersion 接受 semver、拒绝空与非法', () => {
        expect(validateVersion('0.7.0')).toBe('0.7.0')
        expect(validateVersion('1.0.0-rc.1')).toBe('1.0.0-rc.1')
        expect(() => validateVersion(undefined)).toThrow(/缺少 --version/u)
        expect(() => validateVersion('0.7')).toThrow(/Invalid --version/u)
    })

    it('validateDate 接受 YYYY-MM-DD、拒绝其它形态', () => {
        expect(validateDate('2026-10-10')).toBe('2026-10-10')
        expect(validateDate(undefined)).toBeUndefined()
        expect(() => validateDate('2026/10/10')).toThrow(/Invalid --date/u)
    })
})

describe('manual-release extractChangelogSection', () => {
    const changelog = [
        '# caomei-ui',
        '',
        '# Unreleased (2026-10-10)',
        '',
        '* work in progress',
        '',
        '# [0.6.0](https://example.com/compare/v0.5.0...v0.6.0) (2026-10-08)',
        '',
        '### ✨ 新功能',
        '',
        '* **governance:** 某守卫',
        '',
        '# [0.5.0](https://example.com/compare/v0.4.0...v0.5.0) (2026-09-30)',
        '',
        '### 🐛 Bug 修复',
        '',
    ].join('\n')

    it('抽取目标版本段落正文，止于下一个版本标题', () => {
        const section = extractChangelogSection(changelog, '0.6.0')
        expect(section).toContain('### ✨ 新功能')
        expect(section).toContain('某守卫')
        expect(section).not.toContain('Bug 修复')
        expect(section).not.toContain('# [0.5.0]')
    })

    it('不把 Unreleased 或相邻版本误认为目标版本', () => {
        expect(extractChangelogSection(changelog, '0.5.0')).toContain('Bug 修复')
        expect(extractChangelogSection(changelog, '9.9.9')).toBeNull()
    })

    it('版本边界：0.6.0 不匹配 0.6.01 形态', () => {
        const weird = '# [0.6.01](x) (2026-10-08)\n\nbody\n'
        expect(extractChangelogSection(weird, '0.6.0')).toBeNull()
    })
})

describe('manual-release 版本句同步', () => {
    it('replaceVersionInStatement 替换句内版本且保留句式', () => {
        const content = '项目当前版本：`0.6.0`，其余历史 0.5.0。'
        const result = replaceVersionInStatement(content, STATEMENTS[0].pattern, '0.7.0')
        expect(result.changed).toBe(true)
        expect(result.matched).toBe(true)
        expect(result.content).toBe('项目当前版本：`0.7.0`，其余历史 0.5.0。')
    })

    it('已是目标版本时不改内容', () => {
        const result = replaceVersionInStatement('当前版本：`0.7.0`', STATEMENTS[0].pattern, '0.7.0')
        expect(result).toMatchObject({ changed: false, matched: true })
    })

    it('planVersionStatementSync 处理同文件多锚点，且不触碰历史版本', () => {
        const entries = [
            { file: 'README.md', content: '当前版本：`0.6.0`\n当前最新版本为 `0.6.0`\n历史：0.1.0 / 0.2.0' },
            { file: 'README.en-US.md', content: 'Current version is `0.6.0`' },
            { file: 'docs/plan/roadmap.md', content: '`latest` = 0.6.0；0.1.0 起' },
        ]
        const planned = planVersionStatementSync(entries, '0.7.0', STATEMENTS)
        const readme = planned.find((item) => item.file === 'README.md')
        const en = planned.find((item) => item.file === 'README.en-US.md')
        const roadmap = planned.find((item) => item.file === 'docs/plan/roadmap.md')
        expect(readme.content).toBe('当前版本：`0.7.0`\n当前最新版本为 `0.7.0`\n历史：0.1.0 / 0.2.0')
        expect(readme.changed).toBe(true)
        expect(readme.matched).toBe(true)
        expect(en.content).toBe('Current version is `0.7.0`')
        expect(roadmap.content).toBe('`latest` = 0.7.0；0.1.0 起')
    })

    it('未匹配锚点时标记 matched=false（不改内容）', () => {
        const planned = planVersionStatementSync([{ file: 'README.md', content: '没有版本句' }], '0.7.0', STATEMENTS)
        expect(planned[0]).toMatchObject({ matched: false, changed: false })
    })

    it('statementFiles 由登记表去重派生同步文件清单', () => {
        expect(statementFiles()).toEqual(['README.md', 'README.en-US.md', 'docs/plan/roadmap.md'])
    })
})

describe('manual-release replacePackageVersion', () => {
    it('保持格式与末尾换行', () => {
        const raw = '{\n  "name": "x",\n  "version": "0.6.0",\n  "type": "module"\n}\n'
        const { content, changed } = replacePackageVersion(raw, '0.7.0')
        expect(changed).toBe(true)
        expect(content).toBe('{\n  "name": "x",\n  "version": "0.7.0",\n  "type": "module"\n}\n')
        expect(content.endsWith('\n')).toBe(true)
    })

    it('同版本不改；缺 version 字段抛错', () => {
        expect(replacePackageVersion('{\n  "version": "0.7.0"\n}\n', '0.7.0').changed).toBe(false)
        expect(() => replacePackageVersion('{\n  "name": "x"\n}\n', '0.7.0')).toThrow(/未找到 "version" 字段/u)
    })
})

describe('manual-release 发布后校验工具', () => {
    it('sha1File 与 readUnpackedPackage 读取解包产物', () => {
        const dir = tempDir('caomei-unpack-')
        writeFileSync(join(dir, 'a.txt'), 'hello')
        expect(sha1File(join(dir, 'a.txt'))).toMatch(/^[0-9a-f]{40}$/u)

        const unpack = tempDir('caomei-pkg-')
        const packageDir = join(unpack, 'package')
        mkdirSync(packageDir)
        writeFileSync(
            join(packageDir, 'package.json'),
            JSON.stringify({ name: 'caomei-ui', version: '0.7.0', exports: { '.': './dist/index.js', './theme.css': './dist/x.css' } }),
        )
        expect(readUnpackedPackage(unpack)).toEqual({
            name: 'caomei-ui',
            version: '0.7.0',
            exports: ['.', './theme.css'],
        })
    })
})
