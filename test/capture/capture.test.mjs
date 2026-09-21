import { describe, expect, it, vi } from 'vitest'
import { chromiumArgs, declaredKeys, main, verifyCoverage } from './capture.mjs'
import { diffEntries, formatDiffs } from './diff.mjs'

/** 受检面基线规模：新增 / 删除采样项必须同步此值，使「收窄受检范围」在 diff 中显式可见。 */
const DECLARED_KEY_BUDGET = 239

describe('采样面声明', () => {
    it('样本键唯一且与预算一致', () => {
        const keys = declaredKeys()
        expect(new Set(keys).size).toBe(keys.length)
        expect(keys).toHaveLength(DECLARED_KEY_BUDGET)
    })

    it('覆盖各采样段的前缀', () => {
        const keys = declaredKeys()
        for (const prefix of ['size.', 'tier.', 'state.', 'trigger.', 'variant.', 'button.', 'button-focus.', 'z.', 'drawer.', 'dialog.', 'radio-group-invalid.']) {
            expect(keys.some((key) => key.startsWith(prefix))).toBe(true)
        }
    })
})

describe('verifyCoverage', () => {
    const entriesOf = (keys) => Object.fromEntries(keys.map((key) => [key, { height: '32px' }]))

    it('全部采样命中时通过', () => {
        const result = verifyCoverage(entriesOf(['a', 'b']), ['a', 'b'])
        expect(result).toEqual({ ok: true, missing: [], unmatched: [] })
    })

    it('缺少采样键时失败并列出键名', () => {
        const result = verifyCoverage({ a: { height: '32px' } }, ['a', 'b'])
        expect(result.ok).toBe(false)
        expect(result.missing).toEqual(['b'])
    })

    it('选择器未命中时失败并列出键名', () => {
        const result = verifyCoverage({ a: { __missing: '.caomei-x' } }, ['a'])
        expect(result.ok).toBe(false)
        expect(result.unmatched).toEqual(['a'])
    })
})

describe('diffEntries', () => {
    it('完全一致时返回空数组', () => {
        const snapshot = { 'a.b': { height: '32px', 'font-size': '14px' } }
        expect(diffEntries(snapshot, { 'a.b': { height: '32px', 'font-size': '14px' } })).toEqual([])
    })

    it('属性取值不同时逐项列出', () => {
        const diffs = diffEntries({ 'a.b': { height: '32px' } }, { 'a.b': { height: '36px' } })
        expect(diffs).toEqual([{ key: 'a.b', prop: 'height', baseline: '32px', current: '36px' }])
    })

    it('任一侧缺少属性时也算差异', () => {
        const diffs = diffEntries({ 'a.b': { height: '32px' } }, { 'a.b': { height: '32px', color: 'red' } })
        expect(diffs).toEqual([{ key: 'a.b', prop: 'color', baseline: '(无)', current: 'red' }])
    })

    it('键仅存在于单侧时标记为受检面变化', () => {
        const removed = diffEntries({ 'a.b': { height: '32px' } }, {})
        expect(removed[0]).toMatchObject({ key: 'a.b', prop: '*', note: '键仅存在于基线（受检面被收窄？）' })

        const added = diffEntries({}, { 'a.b': { height: '32px' } })
        expect(added[0]).toMatchObject({ key: 'a.b', prop: '*', note: '键仅存在于当前快照' })
    })

    it('选择器未命中与命中状态不同时判为差异', () => {
        const diffs = diffEntries({ 'a.b': { __missing: '.caomei-x' } }, { 'a.b': { height: '32px' } })
        expect(diffs).toEqual([{ key: 'a.b', prop: '__missing', baseline: '未命中 .caomei-x', current: '(命中)', note: '选择器未命中' }])
    })

    it('键按字典序输出，便于稳定比对文本', () => {
        const diffs = diffEntries({ 'b.x': { height: '1px' }, 'a.x': { height: '1px' } }, { 'b.x': { height: '2px' }, 'a.x': { height: '2px' } })
        expect(diffs.map((item) => item.key)).toEqual(['a.x', 'b.x'])
    })
})

describe('formatDiffs', () => {
    it('逐行输出键 / 属性 / 两侧取值', () => {
        const lines = formatDiffs([{ key: 'a.b', prop: 'height', baseline: '32px', current: '36px' }])
        expect(lines).toEqual(['  a.b | height | 基线=32px | 当前=36px'])
    })

    it('带说明时在行尾括注', () => {
        const lines = formatDiffs([{ key: 'a.b', prop: '*', baseline: '(存在)', current: '(缺失)', note: '键仅存在于基线（受检面被收窄？）' }])
        expect(lines[0]).toContain('(键仅存在于基线（受检面被收窄？）)')
    })
})

describe('main 参数解析', () => {
    it('未知参数即失败，不静默落入比对模式', async () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
        expect(await main(['--frezee'])).toBe(1)
        // 直接断言失败原因，避免「非空转」只靠落到采集路径后超时来间接成立
        expect(spy).toHaveBeenCalledWith(expect.stringContaining('Unsupported argument: --frezee'))
        spy.mockRestore()
    })
})

describe('chromiumArgs', () => {
    it('非 root 本地环境保留沙箱', () => {
        expect(chromiumArgs({ isRoot: false, isCI: false })).toEqual(['--disable-dev-shm-usage'])
    })

    it('root 容器关闭沙箱与 zygote', () => {
        expect(chromiumArgs({ isRoot: true, isCI: false })).toEqual(['--disable-dev-shm-usage', '--no-sandbox', '--no-zygote'])
    })

    it('CI 环境关闭沙箱', () => {
        expect(chromiumArgs({ isRoot: false, isCI: true })).toEqual(['--disable-dev-shm-usage', '--no-sandbox'])
    })
})
