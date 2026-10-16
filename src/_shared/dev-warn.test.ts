import { afterEach, describe, expect, it, vi } from 'vitest'
import { warnDev } from './dev-warn'

/** 空实现：替代内联空箭头，避免 `no-empty-function` 告警。 */
const noop = (): undefined => undefined

/** 替换 `globalThis.process`，并在用例后恢复。 */
function withProcess(value: unknown, run: () => void): void {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'process')
    if (value === undefined) {
        Reflect.deleteProperty(globalThis, 'process')
    } else {
        Object.defineProperty(globalThis, 'process', { value, configurable: true, writable: true })
    }
    try {
        run()
    } finally {
        if (descriptor) {
            Object.defineProperty(globalThis, 'process', descriptor)
        } else {
            Reflect.deleteProperty(globalThis, 'process')
        }
    }
}

afterEach(() => {
    vi.restoreAllMocks()
})

describe('warnDev', () => {
    it('非生产环境下输出告警', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(noop)
        withProcess({ env: { NODE_ENV: 'development' } }, () => {
            warnDev('示例告警')
        })
        expect(warn).toHaveBeenCalledWith('示例告警')
    })

    it('生产环境下静默', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(noop)
        withProcess({ env: { NODE_ENV: 'production' } }, () => {
            warnDev('示例告警')
        })
        expect(warn).not.toHaveBeenCalled()
    })

    it('env 在位但 NODE_ENV 非 production 时照常输出', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(noop)
        withProcess({ env: { NODE_ENV: 'test' } }, () => {
            warnDev('示例告警')
        })
        expect(warn).toHaveBeenCalledWith('示例告警')
    })

    it('消费者注入了不含 env 的 process shim 时不抛错且照常输出', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(noop)
        withProcess({}, () => {
            warnDev('示例告警')
        })
        expect(warn).toHaveBeenCalledWith('示例告警')
    })

    it('未定义 globalThis.process 时不抛错且照常输出', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(noop)
        withProcess(undefined, () => {
            warnDev('示例告警')
        })
        expect(warn).toHaveBeenCalledWith('示例告警')
    })
})
