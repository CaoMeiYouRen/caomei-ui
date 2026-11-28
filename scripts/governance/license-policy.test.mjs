import { afterEach, describe, expect, it } from 'vitest'
import {
    EXTRA_ALLOWED_LICENSES,
    classifyIdentifier,
    evaluateLicense,
    levelName,
    parseExpression,
} from './license-policy.mjs'

describe('license-policy 阻断档', () => {
    it.each([
        ['GPL-3.0-only', 'GPL'],
        ['AGPL-3.0-or-later', 'AGPL'],
        ['SSPL-1.0', 'SSPL'],
        ['BUSL-1.1', 'BUSL'],
        ['Elastic-2.0', 'Elastic'],
        ['CC-BY-NC-4.0', 'CC-BY-NC'],
        ['UNLICENSED', 'UNLICENSED'],
        ['SEE LICENSE IN LICENSE.txt', 'SEE LICENSE IN'],
        ['LicenseRef-Proprietary', 'LicenseRef-'],
    ])('%s 判定为阻断', (license, label) => {
        const verdict = evaluateLicense(license)
        expect(verdict.level).toBe('blocked')
        expect(verdict.reason, label).toBeTruthy()
    })

    it('缺少 license 字段判定为阻断', () => {
        expect(evaluateLicense(undefined).level).toBe('blocked')
        expect(evaluateLicense('   ').level).toBe('blocked')
        expect(evaluateLicense(undefined).reason).toContain('未声明 license 字段')
    })

    it('未识别标识 fail-closed 为阻断，并点名人工确认', () => {
        const verdict = evaluateLicense('Totally-Made-Up-1.0')
        expect(verdict.level).toBe('blocked')
        expect(verdict.reason).toContain('未识别')
    })

    it('无法解析的表达式 fail-closed 为阻断', () => {
        expect(evaluateLicense('MIT AND').level).toBe('blocked')
        expect(evaluateLicense('(MIT').level).toBe('blocked')
    })
})

describe('license-policy 告警档与通过档', () => {
    it.each([
        ['MPL-2.0', 'warn'],
        ['LGPL-2.1-only', 'warn'],
        ['EPL-2.0', 'warn'],
        ['CC-BY-4.0', 'warn'],
        ['Artistic-2.0', 'warn'],
        ['Python-2.0', 'warn'],
        ['MIT', 'pass'],
        ['ISC', 'pass'],
        ['Apache-2.0', 'pass'],
        ['BSD-3-Clause', 'pass'],
        ['0BSD', 'pass'],
        ['CC0-1.0', 'pass'],
        ['BlueOak-1.0.0', 'pass'],
        ['Unlicense', 'pass'],
    ])('%s 判定为 %s', (license, level) => {
        expect(evaluateLicense(license).level).toBe(level)
    })

    it('CC-BY-NC 不被 CC-BY 前缀降级为告警（阻断优先）', () => {
        expect(classifyIdentifier('CC-BY-NC-4.0').level).toBe('blocked')
        expect(classifyIdentifier('CC-BY-4.0').level).toBe('warn')
    })
})

describe('license-policy SPDX 表达式求值', () => {
    it('OR 取最宽松分支：MIT OR GPL-2.0 通过', () => {
        expect(evaluateLicense('MIT OR GPL-2.0').level).toBe('pass')
    })

    it('AND 取最严格分支：MIT AND GPL-2.0 阻断', () => {
        expect(evaluateLicense('MIT AND GPL-2.0').level).toBe('blocked')
    })

    it('括号与优先级：MIT OR (GPL-2.0 AND Apache-2.0) 通过', () => {
        expect(evaluateLicense('MIT OR (GPL-2.0 AND Apache-2.0)').level).toBe('pass')
    })

    it('全告警的 OR 仍为告警', () => {
        expect(evaluateLicense('MPL-2.0 OR LGPL-2.1-only').level).toBe('warn')
    })

    it('WITH 子句按基础标识判定，不当作未知标识', () => {
        const verdict = evaluateLicense('GPL-2.0-only WITH Classpath-exception-2.0')
        expect(verdict.level).toBe('blocked')
        expect(parseExpression('GPL-2.0-only WITH Classpath-exception-2.0')).toMatchObject({
            type: 'ID',
            id: 'GPL-2.0-only',
            exception: 'Classpath-exception-2.0',
        })
        expect(evaluateLicense('Apache-2.0 WITH LLVM-exception').level).toBe('pass')
    })

    it('返回的标识清单可用于文案', () => {
        expect(evaluateLicense('MIT AND Apache-2.0').identifiers).toEqual(['MIT', 'Apache-2.0'])
    })
})

describe('license-policy 放行清单', () => {
    const original = [...EXTRA_ALLOWED_LICENSES]

    afterEach(() => {
        EXTRA_ALLOWED_LICENSES.length = 0
        EXTRA_ALLOWED_LICENSES.push(...original)
    })

    it('EXTRA_ALLOWED_LICENSES 先于阻断档匹配', () => {
        expect(evaluateLicense('LicenseRef-Proprietary').level).toBe('blocked')
        EXTRA_ALLOWED_LICENSES.push({ id: 'LicenseRef-Proprietary', reason: '测试放行' })
        const verdict = evaluateLicense('LicenseRef-Proprietary')
        expect(verdict.level).toBe('pass')
        expect(verdict.reason).toContain('测试放行')
    })

    it('放行清单同样作用于表达式分支', () => {
        EXTRA_ALLOWED_LICENSES.push({ id: 'GPL-3.0-only', reason: '测试放行' })
        expect(evaluateLicense('GPL-3.0-only AND MIT').level).toBe('pass')
    })
})

describe('license-policy 档位名', () => {
    it('levelName 回填档位字符串', () => {
        expect(levelName('blocked')).toBe('blocked')
        expect(levelName('warn')).toBe('warn')
        expect(levelName('pass')).toBe('pass')
    })
})
