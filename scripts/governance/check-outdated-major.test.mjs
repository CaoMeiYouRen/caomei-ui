import { describe, expect, it } from 'vitest'
import {
    classifyUpdate,
    collectMajorItems,
    displayWidth,
    formatTable,
    parseOutdatedJson,
    parseVersion,
    readOutdated,
    resolveExitCode,
} from './check-outdated-major.mjs'

describe('parseVersion', () => {
    it('解析常规版本、v 前缀与预发布后缀', () => {
        expect(parseVersion('1.2.3')).toEqual({ major: 1, minor: 2, patch: 3 })
        expect(parseVersion('v2.0.0')).toEqual({ major: 2, minor: 0, patch: 0 })
        expect(parseVersion('5.1.0-rc.1')).toEqual({ major: 5, minor: 1, patch: 0 })
    })

    it('缺 minor 或非数字时返回 null', () => {
        expect(parseVersion('1')).toBeNull()
        expect(parseVersion('latest')).toBeNull()
        expect(parseVersion(undefined)).toBeNull()
    })
})

describe('classifyUpdate', () => {
    it('major 不同时判为 major', () => {
        expect(classifyUpdate('9.39.2', '10.14.0')).toBe('major')
        expect(classifyUpdate('6.0.3', '7.0.2')).toBe('major')
    })

    it('0.x 之间 minor 变化判为 breaking-zero', () => {
        expect(classifyUpdate('0.6.0', '0.7.0')).toBe('breaking-zero')
        expect(classifyUpdate('0.9.9', '0.10.0')).toBe('breaking-zero')
    })

    it('patch / minor 不视为破坏性变更', () => {
        expect(classifyUpdate('1.2.3', '1.2.4')).toBeNull()
        expect(classifyUpdate('1.2.3', '1.9.0')).toBeNull()
        expect(classifyUpdate('0.1.0', '0.1.9')).toBeNull()
    })

    it('非法版本按不判定处理', () => {
        expect(classifyUpdate('abc', '1.0.0')).toBeNull()
    })
})

describe('parseOutdatedJson', () => {
    it('空输出视为无落后项', () => {
        expect(parseOutdatedJson('')).toEqual({})
        expect(parseOutdatedJson('  \n')).toEqual({})
    })

    it('JSON 前有提示行时从第一个 { 起解析', () => {
        const stdout = '[WARN] Skip unsupported workspace\n{"eslint":{"current":"9.0.0","latest":"10.0.0"}}'
        expect(parseOutdatedJson(stdout)).toEqual({
            eslint: { current: '9.0.0', latest: '10.0.0' },
        })
    })

    it('非空但没有 JSON 时抛错（不把异常输出当通过）', () => {
        expect(() => parseOutdatedJson('[WARN] something went wrong')).toThrow(TypeError)
    })

    it('数组或非法 JSON 抛错', () => {
        expect(() => parseOutdatedJson('[]')).toThrow(TypeError)
        expect(() => parseOutdatedJson('{oops')).toThrow()
    })
})

describe('collectMajorItems', () => {
    const outdated = {
        vitest: { current: '4.1.12', latest: '5.1.0', dependencyType: 'devDependencies' },
        eslint: { current: '9.39.2', latest: '10.14.0', dependencyType: 'devDependencies' },
        '@nuxt/kit': { current: '4.6.3', latest: '4.6.4', dependencyType: 'devDependencies' },
        'zero-lib': { current: '0.6.0', latest: '0.7.0', dependencyType: 'dependencies' },
        'no-range': { current: undefined, latest: '1.0.0', dependencyType: 'dependencies' },
    }

    it('只保留破坏性变更，运行时依赖排在开发依赖之前', () => {
        const items = collectMajorItems(outdated)
        expect(items.map((item) => item.name)).toEqual(['zero-lib', 'eslint', 'vitest'])
        expect(items[0]).toMatchObject({ kind: 'breaking-zero', dependencyType: 'dependencies' })
        expect(items[1]).toMatchObject({ kind: 'major' })
    })

    it('全为 patch / minor 时返回空数组', () => {
        expect(
            collectMajorItems({
                a: { current: '1.0.0', latest: '1.0.1', dependencyType: 'dependencies' },
            }),
        ).toEqual([])
    })
})

describe('formatTable', () => {
    it('输出表头与 0.x 标记', () => {
        const table = formatTable(collectMajorItems({
            'zero-lib': { current: '0.6.0', latest: '0.7.0', dependencyType: 'dependencies' },
            eslint: { current: '9.39.2', latest: '10.14.0', dependencyType: 'devDependencies' },
        }))
        const lines = table.split('\n')
        expect(lines).toHaveLength(3)
        expect(lines[0]).toContain('依赖')
        expect(table).toContain('0.x（需人工确认）')
        expect(table).toContain('major')
    })

    it('中英文混排按显示宽度对齐', () => {
        const table = formatTable(collectMajorItems({
            eslint: { current: '9.39.2', latest: '10.14.0', dependencyType: 'devDependencies' },
        }))
        const widths = table.split('\n').map((line) => displayWidth(line))
        expect(new Set(widths).size).toBe(1)
    })
})

describe('resolveExitCode', () => {
    it('默认有落后项也不阻断', () => {
        expect(resolveExitCode(3, false)).toBe(0)
    })

    it('--strict 有落后项时退出 1', () => {
        expect(resolveExitCode(3, true)).toBe(1)
        expect(resolveExitCode(0, true)).toBe(0)
    })
})

describe('readOutdated', () => {
    it('exit 1 但没有任何落后项时抛错（参数 / 配置错误的形态）', () => {
        expect(() =>
            readOutdated(() => ({ status: 1, stdout: '', stderr: '[ERROR] Unknown option: \'registry\'' })),
        ).toThrow('未返回可用的落后项')
    })

    it('exit 1 但条目缺 current / latest 时同样抛错', () => {
        expect(() =>
            readOutdated(() => ({ status: 1, stdout: '{"foo":{"wanted":"1.0.0"}}', stderr: '' })),
        ).toThrow('未返回可用的落后项')
    })

    it('patch-only 的 exit 1 正常返回，不计入落后项（防止回归把合法形态打成故障）', () => {
        const outdated = readOutdated(() => ({
            status: 1,
            stdout: '{"foo":{"current":"1.0.0","latest":"1.0.1","dependencyType":"dependencies"}}',
            stderr: '',
        }))
        expect(collectMajorItems(outdated)).toEqual([])
    })

    it('exit 1 且返回落后项时正常解析', () => {
        const outdated = readOutdated(() => ({
            status: 1,
            stdout: '{"eslint":{"current":"9.0.0","latest":"10.0.0","dependencyType":"devDependencies"}}',
            stderr: '',
        }))
        expect(Object.keys(outdated)).toEqual(['eslint'])
    })

    it('其它退出码与执行失败都抛错（fail-closed）', () => {
        expect(() => readOutdated(() => ({ status: 2, stdout: '', stderr: 'ERR_PNPM_NO_IMPORTER' }))).toThrow(
            '异常退出',
        )
        expect(() => readOutdated(() => ({ error: new Error('spawn pnpm ENOENT') }))).toThrow(
            '无法执行 pnpm outdated',
        )
    })

    it('超时给出明确的网络提示', () => {
        const timeoutError = Object.assign(new Error('spawnSync pnpm ETIMEDOUT'), { code: 'ETIMEDOUT' })
        expect(() => readOutdated(() => ({ error: timeoutError }))).toThrow('超时')
    })

    it('无落后项时 pnpm 输出空串', () => {
        expect(readOutdated(() => ({ status: 0, stdout: '', stderr: '' }))).toEqual({})
    })
})
