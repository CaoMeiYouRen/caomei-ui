import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveEditorDark, useEditorTheme } from './use-editor-theme'

interface RootOptions {
    classes?: string[]
    theme?: string
    scheme?: string
}

function makeRoot(options: RootOptions = {}): HTMLElement {
    const root = document.createElement('div')
    for (const name of options.classes ?? []) {
        root.classList.add(name)
    }
    if (options.theme) {
        root.dataset.theme = options.theme
    }
    if (options.scheme) {
        root.dataset.scheme = options.scheme
    }
    return root
}

/** 读取 useEditorTheme 的探针组件 */
const ThemeProbe = defineComponent({
    name: 'EditorThemeProbe',
    setup() {
        const isDark = useEditorTheme()
        return () => h('span', isDark.value ? 'dark' : 'light')
    },
})

describe('resolveEditorDark', () => {
    it('未挂任何标记时按亮色处理，即使系统偏好暗色', () => {
        expect(resolveEditorDark(makeRoot(), true)).toBe(false)
        expect(resolveEditorDark(makeRoot(), false)).toBe(false)
    })

    it('.dark class 与 data-theme="dark" 判为暗色', () => {
        expect(resolveEditorDark(makeRoot({ classes: ['dark'] }), false)).toBe(true)
        expect(resolveEditorDark(makeRoot({ theme: 'dark' }), false)).toBe(true)
    })

    it('.light class 与 data-theme="light" 判为亮色，且优先于系统偏好', () => {
        expect(resolveEditorDark(makeRoot({ classes: ['light'] }), true)).toBe(false)
        expect(resolveEditorDark(makeRoot({ theme: 'light' }), true)).toBe(false)
    })

    it('data-scheme="auto" 跟随系统偏好', () => {
        expect(resolveEditorDark(makeRoot({ scheme: 'auto' }), true)).toBe(true)
        expect(resolveEditorDark(makeRoot({ scheme: 'auto' }), false)).toBe(false)
    })

    it('显式暗色标记优先于 data-scheme="auto"', () => {
        expect(resolveEditorDark(makeRoot({ classes: ['dark'], scheme: 'auto' }), false)).toBe(true)
        expect(resolveEditorDark(makeRoot({ theme: 'dark', scheme: 'auto' }), false)).toBe(true)
    })

    it('同时挂 .light 与 data-theme="dark" 时按暗色（对齐 CSS 选择器：data-theme 命中即暗）', () => {
        expect(resolveEditorDark(makeRoot({ classes: ['light'], theme: 'dark' }), true)).toBe(true)
    })
})

describe('useEditorTheme', () => {
    afterEach(() => {
        document.documentElement.className = ''
        delete document.documentElement.dataset.theme
        delete document.documentElement.dataset.scheme
    })

    it('挂载时观察到根元素，卸载时断开观察者', async () => {
        const observe = vi.fn()
        const disconnect = vi.fn()
        const Original = globalThis.MutationObserver

        class SpyObserver {
            observe = observe
            disconnect = disconnect
            takeRecords = (): MutationRecord[] => []
        }

        globalThis.MutationObserver = SpyObserver as unknown as typeof MutationObserver
        try {
            const wrapper = mount(ThemeProbe)
            expect(observe).toHaveBeenCalledWith(
                document.documentElement,
                expect.objectContaining({ attributes: true }),
            )
            expect(wrapper.text()).toBe('light')

            await nextTick()
            wrapper.unmount()
            expect(disconnect).toHaveBeenCalledTimes(1)
        } finally {
            globalThis.MutationObserver = Original
        }
    })

    it('matchMedia 生效时卸载会移除 change 监听', () => {
        const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'matchMedia')
        const removeEventListener = vi.fn()
        const listeners: ((event: MediaQueryListEvent) => void)[] = []
        const media = {
            matches: false,
            addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void): void => {
                listeners.push(listener)
            },
            removeEventListener: (...args: [string, (event: MediaQueryListEvent) => void]): void => {
                removeEventListener(...args)
            },
        }

        Object.defineProperty(window, 'matchMedia', {
            configurable: true,
            writable: true,
            value: () => media,
        })
        try {
            const wrapper = mount(ThemeProbe)
            expect(listeners).toHaveLength(1)

            wrapper.unmount()
            expect(removeEventListener).toHaveBeenCalledTimes(1)
            expect(removeEventListener).toHaveBeenCalledWith('change', listeners[0])
        } finally {
            if (originalDescriptor) {
                Object.defineProperty(window, 'matchMedia', originalDescriptor)
            } else {
                Reflect.deleteProperty(window, 'matchMedia')
            }
        }
    })
})
