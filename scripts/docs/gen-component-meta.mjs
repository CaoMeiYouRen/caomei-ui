/**
 * gen-component-meta：从组件 SFC 抽取 props / events / slots / exposed，生成文档站 API 数据。
 *
 * 用法：node scripts/docs/gen-component-meta.mjs
 *
 * 同时导出可复用的 `createComponentMetaCollector()`：复用 checker 并在文件变更时
 * 通过 `updateFile` 增量刷新，供文档站开发服务器在组件变更时热更新 API 数据。
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createChecker } from 'vue-component-meta'
import { isDirectExecution } from '../shared/cli.mjs'

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

/**
 * 解析组件目录内的 SFC 入口文件。
 *
 * 约定：目录名与文件同名（如 `button/button.vue`）；否则回退到目录内唯一的 `.vue` 文件。
 */
export function findComponentEntry(componentDir, entryName) {
    if (!existsSync(componentDir)) {
        return undefined
    }
    const expected = join(componentDir, `${entryName}.vue`)
    if (existsSync(expected)) {
        return expected
    }
    const vueFiles = readdirSync(componentDir).filter((file) => file.endsWith('.vue'))
    return vueFiles.length === 1 ? join(componentDir, vueFiles[0]) : undefined
}

/** 扫描组件目录，返回 `{ name, dir, file }` 列表。 */
export function collectComponentEntries(root = projectRoot) {
    const componentsDir = join(root, 'src/components')
    if (!existsSync(componentsDir)) {
        throw new Error(`组件目录不存在：${componentsDir}`)
    }

    const entries = []
    for (const entry of readdirSync(componentsDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
            continue
        }
        const dir = join(componentsDir, entry.name)
        const file = findComponentEntry(dir, entry.name)
        if (file) {
            entries.push({ name: entry.name, dir, file })
        }
    }
    return entries
}

/** 将 vue-component-meta 的原始结果归一化为文档站数据结构。 */
export function normalizeComponentMeta(meta) {
    return {
        props: meta.props
            .filter((prop) => !prop.global)
            .map((prop) => ({
                name: prop.name,
                type: prop.type,
                default: prop.default,
                required: prop.required,
                description: prop.description,
            })),
        events: meta.events.map((event) => ({
            name: event.name,
            type: event.type,
            description: event.description,
        })),
        slots: meta.slots.map((slot) => ({
            name: slot.name,
            type: slot.type,
            description: slot.description,
        })),
        exposed: meta.exposed.map((item) => ({
            name: item.name,
            type: item.type,
            description: item.description,
        })),
    }
}

/** 用给定 checker 全量抽取组件元数据。 */
export function collectMetaWithChecker(checker, root = projectRoot) {
    const result = {}
    for (const { name, file } of collectComponentEntries(root)) {
        result[name] = normalizeComponentMeta(checker.getComponentMeta(file))
    }
    return result
}

/**
 * 创建可复用的元数据收集器。
 *
 * - `collect()`：全量抽取（复用 checker，热态约数百毫秒）
 * - `updateFile(fileName, text)`：把变更文件写入 checker 内存；未知路径会被自动纳入
 * - `reset()`：强制重建 checker（用于删除组件等 program 结构变化）
 */
export function createComponentMetaCollector(root = projectRoot) {
    const tsconfigPath = join(root, 'tsconfig.json')
    let checker = createChecker(tsconfigPath)

    return {
        collect() {
            return collectMetaWithChecker(checker, root)
        },
        updateFile(fileName, text) {
            checker.updateFile(fileName, text)
        },
        reset() {
            checker = createChecker(tsconfigPath)
        },
    }
}

export function getComponentMetaFile(root = projectRoot) {
    return join(root, 'docs/.vitepress/data/component-meta.json')
}

/** 将元数据写入文档站的 `component-meta.json`。 */
export function writeComponentMetaFile(meta, root = projectRoot) {
    if (!meta) {
        throw new Error('writeComponentMetaFile 需要 meta 参数')
    }
    const outFile = getComponentMetaFile(root)
    mkdirSync(dirname(outFile), { recursive: true })
    writeFileSync(outFile, `${JSON.stringify(meta, null, 2)}\n`, 'utf8')
    return outFile
}

export function collectComponentMeta(root = projectRoot) {
    return collectMetaWithChecker(createChecker(join(root, 'tsconfig.json')), root)
}

export function writeComponentMeta(root = projectRoot) {
    return writeComponentMetaFile(collectComponentMeta(root), root)
}

if (isDirectExecution(import.meta.url)) {
    const outFile = writeComponentMeta()
    console.info(`[gen-component-meta] written: ${outFile}`)
}
