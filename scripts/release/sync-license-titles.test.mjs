import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { syncLicenseTitles } from './sync-license-titles.mjs'

const tempDirs = []

function createFixture({ declaration, dependencies = {}, nodeModules = {} }) {
    const dir = mkdtempSync(join(tmpdir(), 'sync-license-titles-'))
    tempDirs.push(dir)
    writeFileSync(
        join(dir, 'package.json'),
        JSON.stringify({ name: 'fixture', version: '0.0.0', dependencies }, null, 2),
    )
    writeFileSync(join(dir, 'THIRD-PARTY-LICENSES'), declaration)
    for (const [name, content] of Object.entries(nodeModules)) {
        const pkgDir = join(dir, 'node_modules', name)
        mkdirSync(pkgDir, { recursive: true })
        writeFileSync(join(pkgDir, 'package.json'), JSON.stringify(content, null, 2))
    }
    return dir
}

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

describe('syncLicenseTitles', () => {
    it('把陈旧的标题版本同步到安装版本，正文不动', () => {
        const declaration = 'header\n\n## foo@1.0.0\n\nLicense: MIT\n\nbody\n\n## bar@2.0.0\n\nLicense: ISC\n'
        const dir = createFixture({
            declaration,
            dependencies: { foo: '1.2.0' },
            nodeModules: { foo: { name: 'foo', version: '1.2.0' } },
        })

        const result = syncLicenseTitles(dir)

        expect(result.updates).toEqual([{ name: 'foo', from: '1.0.0', to: '1.2.0' }])
        const content = readFileSync(join(dir, 'THIRD-PARTY-LICENSES'), 'utf8')
        expect(content).toContain('## foo@1.2.0')
        expect(content).not.toContain('## foo@1.0.0')
        expect(content).toContain('## bar@2.0.0')
        expect(content).toContain('License: MIT')
    })

    it('版本一致时不写文件', () => {
        const declaration = '## foo@1.2.0\n\nLicense: MIT\n'
        const dir = createFixture({
            declaration,
            dependencies: { foo: '1.2.0' },
            nodeModules: { foo: { name: 'foo', version: '1.2.0' } },
        })

        const result = syncLicenseTitles(dir)

        expect(result.changed).toBe(false)
        expect(readFileSync(join(dir, 'THIRD-PARTY-LICENSES'), 'utf8')).toBe(declaration)
    })

    it('声明文件缺失时抛出', () => {
        const dir = mkdtempSync(join(tmpdir(), 'sync-license-titles-missing-'))
        tempDirs.push(dir)
        writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: {} }))
        expect(() => syncLicenseTitles(dir)).toThrow('缺少第三方许可声明文件')
    })
})

describe('syncLicenseTitles 失败闭合', () => {
    it('声明缺少依赖条目时抛出', () => {
        const dir = createFixture({
            declaration: '## foo@1.0.0\n\nLicense: MIT\n',
            dependencies: { bar: '2.0.0' },
            nodeModules: { bar: { name: 'bar', version: '2.0.0' } },
        })
        expect(() => syncLicenseTitles(dir)).toThrow('缺少条目：bar')
    })

    it('重复条目时抛出', () => {
        const dir = createFixture({
            declaration: '## foo@1.0.0\n\nLicense: MIT\n\n## foo@1.1.0\n\nLicense: MIT\n',
            dependencies: { foo: '1.2.0' },
            nodeModules: { foo: { name: 'foo', version: '1.2.0' } },
        })
        expect(() => syncLicenseTitles(dir)).toThrow('存在重复条目：foo')
    })
})
