import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
    collectComponentEntries,
    collectMetaWithChecker,
    createComponentMetaCollector,
    findComponentEntry,
    getComponentMetaFile,
    normalizeComponentMeta,
    pickEnDescription,
    projectRoot,
    writeComponentMetaFile,
} from './gen-component-meta.mjs'

const tempDirs = []

function makeTempDir() {
    const dir = mkdtempSync(join(tmpdir(), 'caomei-meta-'))
    tempDirs.push(dir)
    return dir
}

function makeComponentDir(files) {
    const dir = makeTempDir()
    for (const file of files) {
        writeFileSync(join(dir, file), '', 'utf8')
    }
    return dir
}

/** 构造 `root/src/components/<name>/<files>` 工作区。 */
function makeWorkspace(components) {
    const root = makeTempDir()
    const componentsDir = join(root, 'src', 'components')
    mkdirSync(componentsDir, { recursive: true })
    for (const [name, files] of Object.entries(components)) {
        mkdirSync(join(componentsDir, name), { recursive: true })
        for (const file of files) {
            writeFileSync(join(componentsDir, name, file), '', 'utf8')
        }
    }
    return root
}

afterEach(() => {
    while (tempDirs.length > 0) {
        rmSync(tempDirs.pop(), { recursive: true, force: true })
    }
})

describe('findComponentEntry', () => {
    it('优先返回与目录同名的 .vue 文件', () => {
        const dir = makeComponentDir(['switch.vue'])
        expect(findComponentEntry(dir, 'switch')).toBe(join(dir, 'switch.vue'))
    })

    it('无同名文件时回退到目录内唯一的 .vue 文件', () => {
        const dir = makeComponentDir(['Button.vue'])
        expect(findComponentEntry(dir, 'button')).toBe(join(dir, 'Button.vue'))
    })

    it('目录不存在时返回 undefined', () => {
        expect(findComponentEntry(join(tmpdir(), 'caomei-meta-not-exist'), 'button')).toBeUndefined()
    })

    it('存在多个 .vue 且无同名文件时返回 undefined', () => {
        const dir = makeComponentDir(['A.vue', 'B.vue'])
        expect(findComponentEntry(dir, 'button')).toBeUndefined()
    })
})

describe('collectComponentEntries', () => {
    it('仅返回含 SFC 入口的组件目录', () => {
        const root = makeWorkspace({
            button: ['button.vue', 'types.ts'],
            switch: ['switch.vue'],
            _shared: ['use-attr-forwarding.ts'],
            multi: ['A.vue', 'B.vue'],
        })

        expect(collectComponentEntries(root).map((entry) => entry.name).sort()).toEqual([
            'button',
            'switch',
        ])
    })

    it('组件目录不存在时抛错', () => {
        expect(() => collectComponentEntries(makeTempDir())).toThrow()
    })
})

describe('pickEnDescription', () => {
    it('取 @en tag 的文本', () => {
        expect(pickEnDescription([{ name: 'en', text: 'Visual variant' }])).toBe('Visual variant')
    })

    it('无 @en tag 时返回 undefined', () => {
        expect(pickEnDescription([{ name: 'deprecated', text: 'x' }])).toBeUndefined()
    })

    it('tags 为 undefined 时返回 undefined', () => {
        expect(pickEnDescription(undefined)).toBeUndefined()
    })

    it('@en 无文本时返回 undefined', () => {
        expect(pickEnDescription([{ name: 'en' }])).toBeUndefined()
    })

    it('@en 文本为空串时返回 undefined', () => {
        expect(pickEnDescription([{ name: 'en', text: '' }])).toBeUndefined()
    })
})

describe('normalizeComponentMeta', () => {
    it('过滤全局 props 并保留各字段', () => {
        const meta = normalizeComponentMeta({
            props: [
                {
                    name: 'size',
                    type: 'string',
                    default: 'md',
                    required: false,
                    description: '尺寸',
                    tags: [{ name: 'en', text: 'Size' }],
                    global: false,
                },
                {
                    name: 'class',
                    type: 'any',
                    default: '',
                    required: false,
                    description: '',
                    global: true,
                },
            ],
            events: [{ name: 'change', type: '[value: string]', description: '变化' }],
            slots: [{ name: 'default', type: 'any', description: '内容' }],
            exposed: [{ name: 'focus', type: '() => void', description: '聚焦' }],
        })

        expect(meta.props.map((prop) => prop.name)).toEqual(['size'])
        expect(meta.props[0].description).toBe('尺寸')
        expect(meta.props[0].descriptionEn).toBe('Size')
        expect(meta.events[0].name).toBe('change')
        expect(meta.events[0].descriptionEn).toBeUndefined()
        expect(meta.slots[0].name).toBe('default')
        expect(meta.exposed[0].name).toBe('focus')
        expect(meta.exposed[0].descriptionEn).toBeUndefined()
    })
})

describe('collectMetaWithChecker', () => {
    it('按组件目录抽取并归一化', () => {
        const root = makeWorkspace({ button: ['button.vue'], avatar: ['avatar.vue'] })
        const checker = {
            getComponentMeta: () => ({
                props: [
                    {
                        name: 'x',
                        type: 'string',
                        default: '',
                        required: false,
                        description: '',
                        global: false,
                    },
                ],
                events: [],
                slots: [],
                exposed: [],
            }),
        }

        const result = collectMetaWithChecker(checker, root)

        expect(Object.keys(result).sort()).toEqual(['avatar', 'button'])
        expect(result.button.props[0].name).toBe('x')
    })
})

describe('writeComponentMetaFile', () => {
    it('写入的路径与内容可复读', () => {
        const root = makeTempDir()
        const meta = { button: { props: [], events: [], slots: [], exposed: [] } }

        const outFile = writeComponentMetaFile(meta, root)

        expect(outFile).toBe(getComponentMetaFile(root))
        expect(JSON.parse(readFileSync(outFile, 'utf8'))).toEqual(meta)
    })

    it('缺少 meta 时抛错', () => {
        expect(() => writeComponentMetaFile(undefined, makeTempDir())).toThrow()
    })
})

describe('createComponentMetaCollector', () => {
    it('返回 collect / updateFile / reset', () => {
        const collector = createComponentMetaCollector(projectRoot)

        expect(typeof collector.collect).toBe('function')
        expect(typeof collector.updateFile).toBe('function')
        expect(typeof collector.reset).toBe('function')
    })
})
