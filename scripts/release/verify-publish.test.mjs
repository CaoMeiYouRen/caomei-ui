import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { assertExportCount, assertExportKeys, EXPECTED_EXPORTS, parseArgs, parseExportKeys, validateVersion, verifyPublishedPackage } from './verify-publish.mjs'

const LOCAL_KEYS = ['.', './theme.css', './locale/zh-tw', './locale/ja-jp', './locale/ko-kr', './locale/es-es', './locale/fr-fr', './locale/de-de', './locale/ru-ru', './locale/pt-br', './resolver', './nuxt', './package.json']
const exportJson = JSON.stringify(Object.fromEntries(LOCAL_KEYS.map((key) => [key, ''])))

describe('verify-publish', () => {
    it('解析 registry exports 键集合', () => {
        expect(parseExportKeys('{".":"./dist/index.js","./theme.css":"./dist/styles/index.css"}')).toEqual(['.', './theme.css'])
    })

    it('非对象 exports 判失败', () => {
        expect(() => parseExportKeys('[]')).toThrow(/不是对象/u)
    })

    it('exports 键数不等于 13 时 fail-closed', () => {
        expect(() => assertExportCount(['.'])).toThrow(/期望 13/u)
        expect(EXPECTED_EXPORTS).toBe(13)
        const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'))
        expect(Object.keys(pkg.exports)).toHaveLength(13)
    })

    it('exports 键集合与本地不一致时 fail-closed', () => {
        expect(() => assertExportKeys(['.', './extra'], ['.'])).toThrow(/不一致/u)
        expect(() => assertExportKeys(['.', './theme.css'], ['.', './theme.css'])).not.toThrow()
    })

    it('require-base 为布尔 flag，缺省不启用', () => {
        expect(parseArgs(['node', 'script', '--require-base']).requireBase).toBe(true)
        expect(parseArgs(['node', 'script', '--version=1.1.0']).requireBase).toBeUndefined()
    })

    it('版本校验接受预发布后缀', () => {
        expect(validateVersion('1.1.0-rc.1')).toBe('1.1.0-rc.1')
        expect(() => validateVersion('latest')).toThrow(/Invalid --version/u)
        expect(() => validateVersion()).toThrow(/缺少 --version/u)
    })

    it('requireBase 且无 base 时在 verify 后中止', () => {
        const calls = []
        expect(() => verifyPublishedPackage({
            version: '1.1.0',
            requireBase: true,
            localKeys: LOCAL_KEYS,
            runCommand: (...args) => calls.push(args),
            captureCommand: () => exportJson,
        })).toThrow(/缺少 API 差分基线/u)
        expect(calls).toHaveLength(1)
        expect(calls[0][1][1]).toBe('verify')
    })

    it('base 等于目标版本时拒绝', () => {
        expect(() => verifyPublishedPackage({
            version: '1.1.0',
            base: '1.1.0',
            localKeys: LOCAL_KEYS,
            runCommand: () => {},
            captureCommand: () => exportJson,
        })).toThrow(/基线不得等于目标版本/u)
    })

    it('正常路径依次执行 verify → exports → api-diff 并透传 --base', () => {
        const calls = []
        verifyPublishedPackage({
            version: '1.1.0',
            base: '1.0.0',
            localKeys: LOCAL_KEYS,
            runCommand: (...args) => calls.push(args),
            captureCommand: () => exportJson,
        })

        expect(calls).toHaveLength(2)
        expect(calls[0][1][1]).toBe('verify')
        expect(calls[1][1][1]).toBe('api-diff')
        expect(calls[1][1]).toContain('--base=1.0.0')
    })
})
