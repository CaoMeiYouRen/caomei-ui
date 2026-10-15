import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * 可选 peer 依赖的引用形态契约。
 *
 * 本库把三个内核类依赖声明为**可选 peer**（`peerDependenciesMeta.<pkg>.optional = true`）：
 * 未使用对应组件的下游不必安装它们。该承诺成立的前提是：
 *
 * 1. 包根可达的模块图**不得静态引用**可选 peer——静态引用（含 `import type`）会让未安装
 *    peer 的下游在打包期报「无法解析」（Vite / Rolldown 实测，见富文本编辑器组件页），
 *    或让公共 `.d.ts` 无法解析；内核只能经**动态 `import()`** 在运行时按需加载；
 * 2. 可选 peer 不得出现在 `dependencies`（否则「可选」名不副实，安装本库即强制拉取）；
 * 3. 惰性加载路径必须真实存在（源码里确有对应动态导入），否则契约只是纸面承诺。
 *
 * 例外：`@nuxt/kit` 只在 `src/nuxt/**` 静态引用——该入口对应 `caomei-ui/nuxt` 子路径，
 * 消费方必然是 Nuxt 环境（`@nuxt/kit` 随 Nuxt 提供），不进入包根模块图。
 */

const REPO_ROOT = join(__dirname, '..', '..')
const SRC_DIR = join(REPO_ROOT, 'src')

/** 静态引用仅允许出现在这些路径前缀下（相对仓库根，POSIX 分隔符）。 */
const STATIC_IMPORT_ALLOWLIST: Record<string, string[]> = {
    '@nuxt/kit': ['src/nuxt/'],
}

/** 必须有动态 `import()` 加载路径的可选 peer（否则「按需加载」无从成立）。 */
const LAZY_PEERS = ['md-editor-v3', 'vue-echarts'] as const

interface PeerImports {
    /** 静态引用（含 `import type` / `export ... from` / `require`）所在行 */
    staticRefs: string[]
    /** 动态 `import()` 引用所在行 */
    dynamicRefs: string[]
}

/**
 * 剥离注释：注释里出现的 `from 'peer'` 只是说明文字，不是引用（本仓的加载器模块即在
 * 注释里示范「使用方如何注册内核」）。行注释的判定跳过 `://`，避免误伤 URL。
 */
export function stripComments(source: string): string {
    return source
        .replace(/\/\*[\s\S]*?\*\//gu, '')
        .replace(/(^|[^:])\/\/[^\n]*/gu, '$1')
}

/**
 * 扫描单份源码，区分「静态引用」与「动态 `import()`」。
 *
 * 判定手法：先剥离注释，再把 `import(` 替换为占位串，最后在剩余文本中匹配静态形态——
 * 避免把 `await import('peer')` 误判为静态引用（`import('peer')` 与 `import 'peer'` 仅差括号）。
 */
export function scanPeerImports(source: string, peer: string): PeerImports {
    const specifier = `['"]${peer}(?:/|['"])`
    const code = stripComments(source)
    const dynamicOnly = code.replace(/import\s*\(/gu, '__DYNAMIC_IMPORT__(')
    const staticPattern = new RegExp(
        `(?:from\\s*${specifier}|import\\s*${specifier}|require\\(\\s*${specifier})`,
        'u',
    )

    const collect = (text: string, pattern: RegExp): string[] =>
        text
            .split('\n')
            .map((line, index) => ({ line, index }))
            .filter(({ line }) => pattern.test(line))
            .map(({ line, index }) => `${index + 1}: ${line.trim()}`)

    return {
        staticRefs: collect(dynamicOnly, staticPattern),
        dynamicRefs: collect(code, new RegExp(`import\\s*\\(\\s*${specifier}`, 'u')),
    }
}

/** 递归收集 `src/**` 下的 `.ts` / `.vue` 源文件（相对仓库根的 POSIX 路径）。 */
function collectSources(): string[] {
    const files: string[] = []
    const walk = (dir: string): void => {
        for (const entry of readdirSync(dir)) {
            const full = join(dir, entry)
            if (statSync(full).isDirectory()) {
                walk(full)
                continue
            }
            if (/\.(?:ts|vue)$/u.test(entry)) {
                files.push(relative(REPO_ROOT, full).split('\\').join('/'))
            }
        }
    }
    walk(SRC_DIR)
    return files.sort()
}

const packageJson = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf-8')) as {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
    peerDependencies?: Record<string, string>
    peerDependenciesMeta?: Record<string, { optional?: boolean }>
}

const optionalPeers = Object.entries(packageJson.peerDependenciesMeta ?? {})
    .filter(([, meta]) => meta?.optional === true)
    .map(([name]) => name)
    .sort()

const sources = collectSources()

describe('可选 peer 依赖的引用形态', () => {
    it('扫描器的判别力：静态与动态引用可被区分', () => {
        const source = [
            'import { use } from "echarts/core"',
            'import type { EChartsOption } from "echarts"',
            'export { default as VChart } from "vue-echarts"',
            'const module = await import("vue-echarts")',
            'import "vue-echarts/style.css"',
            'const config = { lazy: () => import("md-editor-v3") }',
            '// 说明文字里的 from "vue-echarts" 不算引用',
            '/*',
            ' * **不静态引用**：使用方自行 `import { use } from "echarts/core"`',
            ' */',
        ].join('\n')

        const vueEcharts = scanPeerImports(source, 'vue-echarts')
        expect(vueEcharts.staticRefs).toHaveLength(2)
        expect(vueEcharts.dynamicRefs).toHaveLength(1)

        const echarts = scanPeerImports(source, 'echarts')
        expect(echarts.staticRefs).toHaveLength(2)
        expect(echarts.dynamicRefs).toHaveLength(0)

        // 负向对照：前缀相同的兄弟包不得被误判
        expect(scanPeerImports(source, 'vue-echarts-extra').staticRefs).toHaveLength(0)
    })

    it('可选 peer 清单与声明的可选口径一致', () => {
        expect(optionalPeers).toContain('md-editor-v3')
        expect(optionalPeers).toContain('vue-echarts')
        expect(optionalPeers).toContain('echarts')
    })

    it('可选 peer 不出现在 dependencies（「可选」须名副其实）', () => {
        const runtimeDependencies = Object.keys(packageJson.dependencies ?? {})
        expect(runtimeDependencies.filter((name) => optionalPeers.includes(name))).toEqual([])
    })

    it.each(optionalPeers)('可选 peer %s 的静态引用只出现在允许清单内', (peer) => {
        const allowed = STATIC_IMPORT_ALLOWLIST[peer] ?? []
        const offenders = sources
            .filter((file) => !allowed.some((prefix) => file.startsWith(prefix)))
            .flatMap((file) =>
                scanPeerImports(readFileSync(join(REPO_ROOT, file), 'utf-8'), peer).staticRefs.map(
                    (hit) => `${file} ${hit}`,
                ),
            )

        expect(offenders, `${peer} 被静态引用（未安装该 peer 的下游将无法构建）`).toEqual([])
    })

    it.each(LAZY_PEERS)('惰性 peer %s 存在真实的动态加载路径', (peer) => {
        const hits = sources.flatMap((file) =>
            scanPeerImports(readFileSync(join(REPO_ROOT, file), 'utf-8'), peer).dynamicRefs.map(
                (hit) => `${file} ${hit}`,
            ),
        )

        expect(hits.length, `${peer} 没有任何动态 import() 路径`).toBeGreaterThan(0)
    })

    it('可选 peer 已装为 devDependency（本仓测试与文档站依赖其存在）', () => {
        const devDependencies = Object.keys(packageJson.devDependencies ?? {})
        for (const peer of optionalPeers) {
            if (peer === '@nuxt/kit') {
                continue
            }
            expect(devDependencies, `${peer} 缺少 devDependency`).toContain(peer)
        }
    })
})
