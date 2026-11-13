import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
    buildPackumentUrl,
    classifyUpdate,
    collectMajorItems,
    displayWidth,
    formatFailures,
    formatTable,
    parseOutdatedJson,
    parsePackumentLatest,
    parseVersion,
    readInstalledVersions,
    readOutdated,
    readRegistryOutdated,
    resolveCurrentVersion,
    resolveDirectDependencies,
    resolveExitCode,
    resolveRegistry,
    runRegistrySource,
    stripRange,
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

describe('stripRange', () => {
    it('取范围首段下界', () => {
        expect(stripRange('^1.2.3')).toBe('1.2.3')
        expect(stripRange('~0.23.0')).toBe('0.23.0')
        expect(stripRange('>=1.2.3 <2')).toBe('1.2.3')
        expect(stripRange('1.2.3 || 2.0.0')).toBe('1.2.3')
        expect(stripRange('=3.5.43')).toBe('3.5.43')
    })

    it('运算符与版本间有空格时仍取到下界', () => {
        expect(stripRange('>= 1.2.3')).toBe('1.2.3')
        expect(stripRange('1.2.3 - 2.0.0')).toBe('1.2.3')
    })

    it('单段与 x 通配补成下界', () => {
        expect(stripRange('1')).toBe('1.0.0')
        expect(stripRange('1.2')).toBe('1.2.0')
        expect(stripRange('1.x')).toBe('1.0.0')
        expect(stripRange('1.2.x')).toBe('1.2.0')
    })

    it('无法推出语义版本的声明返回 null', () => {
        expect(stripRange('workspace:*')).toBeNull()
        expect(stripRange('catalog:')).toBeNull()
        expect(stripRange('npm:foo@1.2.3')).toBeNull()
        expect(stripRange('latest')).toBeNull()
        expect(stripRange('*')).toBeNull()
        expect(stripRange(undefined)).toBeNull()
    })
})

describe('resolveDirectDependencies', () => {
    it('按依赖类型展开并去重，同名包优先取安装来源（开发依赖先于 peer）', () => {
        const dependencies = resolveDirectDependencies({
            dependencies: { react: '^18.0.0' },
            peerDependencies: { vue: '^3.5.0' },
            devDependencies: { vue: '^3.6.0', vitest: '^5.0.0' },
        })
        expect(dependencies.map((dependency) => dependency.name)).toEqual(['react', 'vue', 'vitest'])
        expect(dependencies[1]).toEqual({ name: 'vue', spec: '^3.6.0', dependencyType: 'devDependencies' })
    })

    it('缺字段或非对象时返回空数组', () => {
        expect(resolveDirectDependencies({})).toEqual([])
        expect(resolveDirectDependencies(undefined)).toEqual([])
    })
})

describe('resolveRegistry', () => {
    it('优先 npm_config_registry 并去掉尾斜杠', () => {
        expect(resolveRegistry({ env: { npm_config_registry: 'https://registry.npmmirror.com/' }, exec: () => {
            throw new Error('不应调用 pnpm config')
        } })).toBe('https://registry.npmmirror.com')
    })

    it('环境变量缺失时读取 pnpm config', () => {
        const registry = resolveRegistry({
            env: {},
            exec: () => ({ status: 0, stdout: 'https://registry.npmmirror.com/\n', stderr: '' }),
        })
        expect(registry).toBe('https://registry.npmmirror.com')
    })

    it('两者都不可用时退回官方端点（fail-safe 到默认值）', () => {
        expect(resolveRegistry({ env: {}, exec: () => ({ status: 1, stdout: '', stderr: 'ERR' }) })).toBe(
            'https://registry.npmjs.org',
        )
        expect(resolveRegistry({ env: { npm_config_registry: 'not-a-url' }, exec: () => ({ status: 1, stdout: '' }) })).toBe(
            'https://registry.npmjs.org',
        )
        // 半截地址过前缀正则但无法解析，必须回退而不是让后续 new URL 抛栈
        expect(resolveRegistry({ env: { npm_config_registry: 'https://' }, exec: () => ({ status: 1, stdout: '' }) })).toBe(
            'https://registry.npmjs.org',
        )
    })
})

describe('buildPackumentUrl', () => {
    it('scoped 包编码斜杠并兼容尾部斜杠', () => {
        expect(buildPackumentUrl('vue')).toBe('https://registry.npmjs.org/vue')
        expect(buildPackumentUrl('@nuxt/kit')).toBe('https://registry.npmjs.org/@nuxt%2fkit')
        expect(buildPackumentUrl('vue', 'https://registry.example.com/')).toBe(
            'https://registry.example.com/vue',
        )
    })
})

describe('parsePackumentLatest', () => {
    it('读取 dist-tags.latest', () => {
        expect(parsePackumentLatest({ 'dist-tags': { latest: '5.1.0' } })).toBe('5.1.0')
    })

    it('缺失或非法时抛错', () => {
        expect(() => parsePackumentLatest({})).toThrow('dist-tags.latest')
        expect(() => parsePackumentLatest({ 'dist-tags': { latest: 'latest' } })).toThrow('dist-tags.latest')
    })
})

describe('readInstalledVersions', () => {
    it('读取已安装版本，读取失败按未安装跳过', () => {
        const installedPath = (name) => path.join('/repo', 'node_modules', ...name.split('/'), 'package.json')
        const files = {
            [installedPath('@nuxt/kit')]: '{"version":"4.6.4"}',
            [installedPath('vue')]: '{"version":"3.5.43"}',
        }
        const versions = readInstalledVersions(['@nuxt/kit', 'vue', 'missing'], '/repo', (file) => {
            if (!(file in files)) {
                throw new Error('ENOENT')
            }
            return files[file]
        })
        expect(versions).toEqual({ '@nuxt/kit': '4.6.4', vue: '3.5.43' })
    })
})

describe('resolveCurrentVersion', () => {
    it('已安装版本优先于版本范围下界', () => {
        expect(resolveCurrentVersion('vue', { spec: '^3.5.0' }, { vue: '3.5.43' })).toBe('3.5.43')
    })

    it('未安装时退回首段范围下界，无法解析时返回 null', () => {
        expect(resolveCurrentVersion('vue', { spec: '^3.5.0' }, {})).toBe('3.5.0')
        expect(resolveCurrentVersion('vue', { spec: 'workspace:*' }, {})).toBeNull()
    })
})

describe('readRegistryOutdated', () => {
    const dependencies = [
        { name: 'eslint', spec: '^9.34.0', dependencyType: 'devDependencies' },
        { name: '@nuxt/kit', spec: '^4.6.3', dependencyType: 'devDependencies' },
    ]
    const packument = (latest) => ({ ok: true, status: 200, json: async () => ({ 'dist-tags': { latest } }) })

    it('scoped 包走编码地址，只收录版本有差异的项', async () => {
        const urls = []
        const { outdated, failures } = await readRegistryOutdated({
            dependencies,
            installed: { eslint: '9.34.0', '@nuxt/kit': '4.6.4' },
            fetchImpl: async (url) => {
                urls.push(url)
                return packument(url.includes('eslint') ? '10.14.0' : '4.6.4')
            },
        })
        expect(urls).toContain('https://registry.npmjs.org/@nuxt%2fkit')
        expect(Object.keys(outdated)).toEqual(['eslint'])
        expect(outdated.eslint).toEqual({ current: '9.34.0', latest: '10.14.0', dependencyType: 'devDependencies' })
        expect(failures).toEqual([])
    })

    it('未安装的依赖用版本范围下界作为当前版本', async () => {
        const { outdated } = await readRegistryOutdated({
            dependencies: [dependencies[0]],
            installed: {},
            fetchImpl: async () => packument('10.14.0'),
        })
        expect(outdated.eslint?.current).toBe('9.34.0')
    })

    it('单个依赖失败不影响其它依赖取数，失败项单独返回', async () => {
        const { outdated, failures } = await readRegistryOutdated({
            dependencies,
            installed: { eslint: '9.34.0', '@nuxt/kit': '4.6.4' },
            fetchImpl: async (url) => {
                if (url.includes('eslint')) {
                    return { ok: false, status: 404, json: async () => ({}) }
                }
                return packument('4.6.5')
            },
        })
        expect(Object.keys(outdated)).toEqual(['@nuxt/kit'])
        expect(failures).toEqual([{ name: 'eslint', reason: 'HTTP 404' }])
    })

    it('超时映射为明确原因而不是空结果', async () => {
        const { failures } = await readRegistryOutdated({
            dependencies: [dependencies[0]],
            installed: { eslint: '9.34.0' },
            fetchImpl: async () => {
                throw Object.assign(new Error('This operation was aborted'), { name: 'TimeoutError' })
            },
        })
        expect(failures[0]?.reason).toContain('超时')
    })

    it('并发不超过声明上限，且每个受检项都被请求一次', async () => {
        let active = 0
        let peak = 0
        let fetched = 0
        const many = Array.from({ length: 6 }, (_, index) => ({
            name: `pkg-${index}`,
            spec: '^1.0.0',
            dependencyType: 'dependencies',
        }))
        await readRegistryOutdated({
            dependencies: many,
            installed: Object.fromEntries(many.map((dependency) => [dependency.name, '1.0.0'])),
            concurrency: 2,
            fetchImpl: async () => {
                active += 1
                peak = Math.max(peak, active)
                fetched += 1
                await Promise.resolve()
                active -= 1
                return packument('1.0.0')
            },
        })
        expect(peak).toBeLessThanOrEqual(2)
        expect(fetched).toBe(6)
    })

    it('非法并发值退回默认上限而不是产出空结果', async () => {
        let fetched = 0
        const dependencies = [
            { name: 'vue', spec: '^3.5.0', dependencyType: 'devDependencies' },
            { name: 'vitest', spec: '^4.0.0', dependencyType: 'devDependencies' },
        ]
        const { failures } = await readRegistryOutdated({
            dependencies,
            installed: { vue: '3.5.43', vitest: '4.1.12' },
            concurrency: Number.NaN,
            fetchImpl: async () => {
                fetched += 1
                return packument('3.5.43')
            },
        })
        expect(failures).toEqual([])
        expect(fetched).toBe(2)
    })

    it('全部失败时失败清单覆盖受检项（调用方据此 fail-closed）', async () => {
        const { outdated, failures } = await readRegistryOutdated({
            dependencies,
            installed: { eslint: '9.34.0', '@nuxt/kit': '4.6.4' },
            fetchImpl: async () => {
                throw new Error('getaddrinfo ENOTFOUND registry.npmjs.org')
            },
        })
        expect(outdated).toEqual({})
        expect(failures.map((failure) => failure.name).sort()).toEqual(['@nuxt/kit', 'eslint'])
    })
})

describe('runRegistrySource', () => {
    const dependencies = [{ name: 'eslint', spec: '^9.34.0', dependencyType: 'devDependencies' }]
    const behind = {
        eslint: { current: '9.39.2', latest: '10.14.0', dependencyType: 'devDependencies' },
    }

    it('全部成功且无落后项时 exit 0', async () => {
        const result = await runRegistrySource({
            dependencies,
            readRegistry: async () => ({ outdated: {}, failures: [] }),
        })
        expect(result.exitCode).toBe(0)
        expect(result.infoLines.join('\n')).toContain('无落后大版本的直接依赖')
        expect(result.errorLines).toEqual([])
    })

    it('部分失败即使非 strict 也 exit 1，并输出失败清单', async () => {
        const result = await runRegistrySource({
            dependencies,
            readRegistry: async () => ({ outdated: {}, failures: [{ name: 'eslint', reason: 'HTTP 404' }] }),
        })
        expect(result.exitCode).toBe(1)
        expect(result.infoLines.join('\n')).toContain('已知项中无落后大版本')
        expect(result.errorLines.join('\n')).toContain('取值失败')
        expect(result.errorLines.join('\n')).toContain('eslint：HTTP 404')
    })

    it('strict 命中落后项 exit 1，非 strict 仍 exit 0', async () => {
        const readRegistry = async () => ({ outdated: behind, failures: [] })
        expect((await runRegistrySource({ dependencies, readRegistry })).exitCode).toBe(0)
        expect((await runRegistrySource({ dependencies, readRegistry, strict: true })).exitCode).toBe(1)
    })

    it('空依赖声明 exit 1', async () => {
        const result = await runRegistrySource({ dependencies: [] })
        expect(result.exitCode).toBe(1)
        expect(result.errorLines.join('\n')).toContain('没有可检查的直接依赖')
    })

    it('取数整体抛错时 exit 1，不当作无落后项', async () => {
        const result = await runRegistrySource({
            dependencies,
            readRegistry: async () => {
                throw new Error('受检项未全部处理（1/2）')
            },
        })
        expect(result.exitCode).toBe(1)
        expect(result.infoLines).toEqual([])
        expect(result.errorLines.join('\n')).toContain('受检项未全部处理')
    })
})

describe('formatFailures', () => {
    it('逐条列出包名与原因', () => {
        const text = formatFailures([
            { name: 'eslint', reason: 'HTTP 404' },
            { name: 'vue-tsc', reason: '超时（15s）' },
        ])
        expect(text.split('\n')).toHaveLength(2)
        expect(text).toContain('eslint：HTTP 404')
        expect(text).toContain('vue-tsc：超时（15s）')
    })
})
