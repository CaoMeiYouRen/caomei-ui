import { describe, expect, it } from 'vitest'
import { ensureAllowedValue, getCliArgs, parseCliOptions } from './cli.mjs'

describe('getCliArgs', () => {
    it('纯选项数组原样返回（便于单测 / 复用）', () => {
        expect(getCliArgs(['--x=1'])).toEqual(['--x=1'])
        expect(getCliArgs(['--x=1', '--y'])).toEqual(['--x=1', '--y'])
    })

    it('完整 process.argv 形态切掉 node 与脚本路径', () => {
        expect(getCliArgs(['node', 'script.mjs', '--x=1'])).toEqual(['--x=1'])
    })

    it('空数组返回空', () => {
        expect(getCliArgs([])).toEqual([])
    })
})

describe('parseCliOptions', () => {
    const config = {
        defaults: { mode: 'error' },
        flags: { '--verbose': { key: 'verbose' } },
        values: {
            '--count': { key: 'count', type: 'number' },
            '--raw': { key: 'raw', type: 'number', parse: (value) => `raw:${value}` },
            '--mode': { key: 'mode', allowedValues: ['error', 'warn'] },
        },
    }

    it('默认值与 flag', () => {
        expect(parseCliOptions([], config)).toEqual({ mode: 'error' })
        expect(parseCliOptions(['--verbose'], config)).toEqual({ mode: 'error', verbose: true })
    })

    it('number 类型转为数字', () => {
        expect(parseCliOptions(['--count=3'], config)).toEqual({ mode: 'error', count: 3 })
    })

    it('显式 parse 优先于 type', () => {
        expect(parseCliOptions(['--raw=3'], config)).toEqual({ mode: 'error', raw: 'raw:3' })
    })

    it('number 非法值 fail-closed', () => {
        for (const raw of ['', 'abc', 'Infinity']) {
            expect(() => parseCliOptions([`--count=${raw}`], config)).toThrow(/期望有限数字/)
        }
    })

    it('allowedValues 拒绝非法值', () => {
        expect(parseCliOptions(['--mode=warn'], config)).toEqual({ mode: 'warn' })
        expect(() => parseCliOptions(['--mode=loud'], config)).toThrow(/Unsupported value/)
    })

    it('未知选项默认抛错，allowUnknown 时忽略', () => {
        expect(() => parseCliOptions(['--unknown=1'], config)).toThrow(/Unsupported argument/)
        expect(() => parseCliOptions(['node', 'script.mjs', 'positional'], config)).toThrow(/Unsupported argument/)
        expect(parseCliOptions(['--unknown=1'], { ...config, allowUnknown: true })).toEqual({ mode: 'error' })
        expect(parseCliOptions(['node', 'script.mjs', 'positional'], { ...config, allowUnknown: true })).toEqual({ mode: 'error' })
    })

    it('ensureAllowedValue 返回合法值', () => {
        expect(ensureAllowedValue('a', ['a', 'b'], 'bad')).toBe('a')
        expect(() => ensureAllowedValue('c', ['a', 'b'], 'bad')).toThrow('bad')
    })
})
