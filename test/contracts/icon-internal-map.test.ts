import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { internalIcons } from '../../src/icons/internal-icons'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const COMPONENTS_DIR = join(REPO_ROOT, 'src', 'components')

/** 迁移下界：25 个导入文件（22 个图标）；新增组件应同步上调。 */
const MIN_MAPPED_COMPONENTS = 25

function collectVueFiles(dir: string): string[] {
    const files: string[] = []
    for (const entry of readdirSync(dir)) {
        const path = join(dir, entry)
        if (statSync(path).isDirectory()) {
            files.push(...collectVueFiles(path))
        } else if (entry.endsWith('.vue')) {
            files.push(path)
        }
    }
    return files
}

const files = collectVueFiles(COMPONENTS_DIR)

describe('内置图标映射迁移', () => {
    it('组件层不再直接 import @lucide/vue', () => {
        const importRe = /(?:from\s+|import\()\s*['"]@lucide\/vue['"]/
        const offenders = files
            .filter((file) => importRe.test(readFileSync(file, 'utf8')))
            .map((file) => relative(REPO_ROOT, file))
        expect(offenders).toEqual([])
    })

    it('至少 25 个组件通过 useInternalIcons 消费映射表', () => {
        const mapped = files.filter((file) => readFileSync(file, 'utf8').includes('useInternalIcons'))
        expect(mapped.length).toBeGreaterThanOrEqual(MIN_MAPPED_COMPONENTS)
    })

    it('组件引用的语义名均在映射表中登记', () => {
        const known = new Set(Object.keys(internalIcons))
        const unknown = new Set<string>()
        const mapped = files.filter((file) => readFileSync(file, 'utf8').includes('useInternalIcons'))
        for (const file of mapped) {
            const source = readFileSync(file, 'utf8')
            for (const match of source.matchAll(/icons(?:\.value)?\.([a-zA-Z]+)/g)) {
                const name = match[1]
                if (name !== 'value' && !known.has(name)) {
                    unknown.add(`${relative(REPO_ROOT, file)}: icons.${name}`)
                }
            }
        }
        expect([...unknown]).toEqual([])
    })
})
