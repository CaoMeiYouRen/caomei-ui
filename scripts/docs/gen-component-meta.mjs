#!/usr/bin/env node

/**
 * gen-component-meta：从组件 SFC 抽取 props / events / slots / exposed，生成文档站 API 数据。
 *
 * 用法：node scripts/docs/gen-component-meta.mjs
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

export function collectComponentMeta(root = projectRoot) {
    const componentsDir = join(root, 'src/components')
    if (!existsSync(componentsDir)) {
        throw new Error(`组件目录不存在：${componentsDir}`)
    }

    const checker = createChecker(join(root, 'tsconfig.json'))
    const result = {}

    for (const entry of readdirSync(componentsDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
            continue
        }
        const componentDir = join(componentsDir, entry.name)
        const vueFile = findComponentEntry(componentDir, entry.name)
        if (!vueFile) {
            continue
        }
        const meta = checker.getComponentMeta(vueFile)
        result[entry.name] = {
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

    return result
}

export function writeComponentMeta(root = projectRoot) {
    const outDir = join(root, 'docs/.vitepress/data')
    const outFile = join(outDir, 'component-meta.json')
    mkdirSync(outDir, { recursive: true })
    writeFileSync(outFile, `${JSON.stringify(collectComponentMeta(root), null, 2)}\n`, 'utf8')
    return outFile
}

if (isDirectExecution(import.meta.url)) {
    const outFile = writeComponentMeta()
    console.info(`[gen-component-meta] written: ${outFile}`)
}
