import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { caomeiComponents, resolveComponentName } from './components'

const sourceRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

const COMPONENT_EXPORT_RE = /export \{ default as (Caomei\w+) \} from '\.\/.+\.vue'/g

/** 从组件 / 图标源码的 barrel 文件提取实际导出名。 */
function collectSourceComponentNames(): string[] {
    const barrels = [
        ...readdirSync(join(sourceRoot, 'components'), { withFileTypes: true })
            .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
            .map((entry) => join(sourceRoot, 'components', entry.name, 'index.ts')),
        join(sourceRoot, 'icons', 'index.ts'),
    ].filter((barrel) => existsSync(barrel))

    const names = new Set<string>()
    for (const barrel of barrels) {
        const content = readFileSync(barrel, 'utf8')
        for (const match of content.matchAll(COMPONENT_EXPORT_RE)) {
            names.add(match[1])
        }
    }

    return [...names].sort()
}

describe('caomeiComponents', () => {
    it('与源码导出的组件名保持零漂移', () => {
        expect([...caomeiComponents].sort()).toEqual(collectSourceComponentNames())
    })

    it('导出名唯一且均带组件前缀', () => {
        expect(new Set(caomeiComponents).size).toBe(caomeiComponents.length)
        expect(caomeiComponents.every((name) => name.startsWith('Caomei'))).toBe(true)
    })
})

describe('resolveComponentName', () => {
    it('默认前缀下保持导出名', () => {
        expect(resolveComponentName('Caomei', 'CaomeiButton')).toBe('CaomeiButton')
    })

    it('自定义前缀替换组件前缀部分', () => {
        expect(resolveComponentName('Ui', 'CaomeiButton')).toBe('UiButton')
        expect(resolveComponentName('', 'CaomeiDataTable')).toBe('DataTable')
    })

    it('无组件前缀的导出名原样拼接', () => {
        expect(resolveComponentName('Ui', 'Widget')).toBe('UiWidget')
    })
})
