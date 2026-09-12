import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { useAttrForwarding } from './use-attr-forwarding'

const Host = defineComponent({
    name: 'AttrForwardingHost',
    inheritAttrs: false,
    setup() {
        const { rootAttrs, controlAttrs } = useAttrForwarding()
        return () => [
            h('div', { ...rootAttrs.value, 'data-test': 'root' }),
            h('input', { ...controlAttrs.value, 'data-test': 'control' }),
        ]
    },
})

const Wrapper = defineComponent({
    name: 'AttrForwardingWrapper',
    props: {
        rootClass: { type: String, default: '' },
        required: { type: Boolean, default: false },
    },
    setup(props) {
        return () => h(Host, { class: props.rootClass, required: props.required })
    },
})

describe('useAttrForwarding', () => {
    it('class 与 style 落在根元素且不泄漏到控件', () => {
        const wrapper = mount(Host, {
            attrs: { class: 'root-class', style: 'color: red' },
        })

        const root = wrapper.get('[data-test="root"]')
        const control = wrapper.get('[data-test="control"]')
        expect(root.classes()).toContain('root-class')
        expect(root.attributes('style')).toContain('color: red')
        expect(control.classes()).not.toContain('root-class')
        expect(control.attributes('style')).toBeUndefined()
    })

    it('其余原生属性透传到控件', () => {
        const wrapper = mount(Host, {
            attrs: { required: true, 'data-x': 'y', maxlength: 5 },
        })

        const root = wrapper.get('[data-test="root"]')
        const control = wrapper.get('[data-test="control"]')
        expect(control.attributes('required')).toBeDefined()
        expect(control.attributes('data-x')).toBe('y')
        expect(control.attributes('maxlength')).toBe('5')
        expect(root.attributes('data-x')).toBeUndefined()
        expect(root.attributes('required')).toBeUndefined()
    })

    it('attrs 变化后两路 computed 同步更新', async () => {
        const wrapper = mount(Wrapper, {
            props: { rootClass: 'class-a', required: true },
        })

        expect(wrapper.get('[data-test="root"]').classes()).toContain('class-a')
        expect(wrapper.get('[data-test="control"]').attributes('required')).toBeDefined()

        await wrapper.setProps({ rootClass: 'class-b', required: false })

        expect(wrapper.get('[data-test="root"]').classes()).toContain('class-b')
        expect(wrapper.get('[data-test="root"]').classes()).not.toContain('class-a')
        expect(wrapper.get('[data-test="control"]').attributes('required')).toBeUndefined()
    })
})
