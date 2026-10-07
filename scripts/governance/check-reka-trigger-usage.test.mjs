import { describe, expect, it } from 'vitest'
import {
    extractRekaImports,
    findRegistryRot,
    findScopeIssues,
    scan,
    scanDirectUsage,
    SCOPE_FLOOR,
    WRAPPED_REKA_TRIGGERS,
} from './check-reka-trigger-usage.mjs'

const WRAPPED = [{ reka: 'PopoverTrigger', wrapper: 'popover/popover-trigger.vue' }]

function file(path, text) {
    return { file: path, text }
}

describe('extractRekaImports', () => {
    it('解析多行具名导入', () => {
        const names = extractRekaImports(`import {\n  PopoverTrigger,\n  PopoverRoot as PR,\n} from 'reka-ui'`)
        expect([...names].sort()).toEqual(['PopoverRoot', 'PopoverTrigger'])
    })

    it('忽略非 reka-ui 导入', () => {
        expect([...extractRekaImports(`import { PopoverTrigger } from './local'`)]).toEqual([])
    })
})

describe('scanDirectUsage', () => {
    it('非包装文件直连被包装触发器即违规', () => {
        const violations = scanDirectUsage([file('image/image.vue', `import { PopoverTrigger } from 'reka-ui'`)], { wrapped: WRAPPED })
        expect(violations).toEqual([{ file: 'image/image.vue', reka: 'PopoverTrigger', wrapper: 'popover/popover-trigger.vue' }])
    })

    it('包装文件自身直连不违规', () => {
        const violations = scanDirectUsage([file('popover/popover-trigger.vue', `import { PopoverTrigger } from 'reka-ui'`)], { wrapped: WRAPPED })
        expect(violations).toEqual([])
    })

    it('未被包装的触发器不判', () => {
        const violations = scanDirectUsage([file('image/image.vue', `import { DialogTrigger } from 'reka-ui'`)], { wrapped: WRAPPED })
        expect(violations).toEqual([])
    })

    it('已登记例外被豁免', () => {
        const violations = scanDirectUsage(
            [file('x/x.vue', `import { PopoverTrigger } from 'reka-ui'`)],
            { wrapped: WRAPPED, allowed: [{ reka: 'PopoverTrigger', file: 'x/x.vue', reason: 'test' }] },
        )
        expect(violations).toEqual([])
    })
})

describe('findRegistryRot', () => {
    it('包装文件缺失时报 mapping-missing-wrapper', () => {
        const issues = findRegistryRot([], [], { wrapped: WRAPPED })
        expect(issues[0].code).toBe('mapping-missing-wrapper')
    })

    it('包装文件未再导入 primitive 时报 mapping-rot', () => {
        const issues = findRegistryRot([file('popover/popover-trigger.vue', 'const a = 1')], [], { wrapped: WRAPPED })
        expect(issues[0].code).toBe('mapping-rot')
    })

    it('例外未被实际豁免时报 allowlist-rot', () => {
        const files = [file('popover/popover-trigger.vue', `import { PopoverTrigger } from 'reka-ui'`)]
        const issues = findRegistryRot(files, [], { wrapped: WRAPPED, allowed: [{ reka: 'PopoverTrigger', file: 'x/x.vue', reason: 'test' }] })
        expect(issues[0].code).toBe('allowlist-rot')
    })
})

describe('findScopeIssues', () => {
    it('文件数低于下界报 scope-narrowed', () => {
        const issues = findScopeIssues([], { wrapped: WRAPPED, floor: { files: 10, rekaImporters: 1 } })
        expect(issues.some((issue) => issue.code === 'scope-narrowed')).toBe(true)
    })

    it('哨兵包装不在受检面报 sentinel-missing', () => {
        const files = Array.from({ length: SCOPE_FLOOR.files + 1 }, (_, index) => file(`f${index}.vue`, `import { PopoverTrigger } from 'reka-ui'`))
        const issues = findScopeIssues(files, { wrapped: WRAPPED })
        expect(issues.some((issue) => issue.code === 'sentinel-missing')).toBe(true)
    })

    it('文件数达标但无 reka 导入时报 scope-narrowed（rekaImporters 分支）', () => {
        const files = Array.from({ length: 3 }, (_, index) => file(`f${index}.ts`, 'export const a = 1'))
        const issues = findScopeIssues(files, { wrapped: WRAPPED, floor: { files: 2, rekaImporters: 5 } })
        expect(issues.some((issue) => issue.code === 'scope-narrowed' && issue.detail.includes('导入 reka-ui'))).toBe(true)
    })
})

describe('仓库不变量', () => {
    it('当前 src/components 直连 Reka 同型触发器 0 处', () => {
        const result = scan()
        expect(result.violations).toEqual([])
        expect(result.registry).toEqual([])
        expect(result.scope).toEqual([])
        expect(result.files.length).toBeGreaterThanOrEqual(SCOPE_FLOOR.files)
    })

    it('映射条目均含 reka 与 wrapper', () => {
        for (const entry of WRAPPED_REKA_TRIGGERS) {
            expect(entry.reka).toMatch(/^[A-Z][A-Za-z]+Trigger$/)
            expect(entry.wrapper).toMatch(/\.vue$/)
        }
    })
})
