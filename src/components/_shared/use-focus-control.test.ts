import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { useFocusControl } from './use-focus-control'

const Host = defineComponent({
    name: 'FocusControlHost',
    setup(_, { expose }) {
        const inputRef = ref<HTMLInputElement | null>(null)
        const { focus, blur } = useFocusControl(inputRef)
        expose({ focus, blur })
        return () => h('input', { ref: inputRef })
    },
})

describe('useFocusControl', () => {
    it('focus / blur 委托给内部可聚焦元素', () => {
        const wrapper = mount(Host, { attachTo: document.body })
        const exposed = wrapper.vm as unknown as { focus: () => void, blur: () => void }

        exposed.focus()
        expect(document.activeElement).toBe(wrapper.get('input').element)

        exposed.blur()
        expect(document.activeElement).not.toBe(wrapper.get('input').element)

        wrapper.unmount()
    })

    it('目标未挂载时静默跳过而不抛错', () => {
        const target = ref<HTMLInputElement | null>(null)
        const { focus, blur } = useFocusControl(target)

        expect(() => {
            focus()
            blur()
        }).not.toThrow()
    })

    it('支持子组件实例（自身暴露 focus / blur）', () => {
        const child = { focus: vi.fn(), blur: vi.fn() }
        const target = ref<{ focus: () => void, blur: () => void } | null>(child)
        const { focus, blur } = useFocusControl(target)

        focus()
        blur()

        expect(child.focus).toHaveBeenCalledTimes(1)
        expect(child.blur).toHaveBeenCalledTimes(1)
    })
})
