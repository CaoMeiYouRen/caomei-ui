import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { computed, defineComponent, h, ref } from 'vue'
import { useLabelAttrs } from './use-label-attrs'

const Host = defineComponent({
    name: 'LabelAttrsHost',
    inheritAttrs: false,
    props: {
        label: { type: String, default: '' },
    },
    setup(props) {
        const forwardedAttrs = useLabelAttrs(() => props.label)
        return () => h('button', forwardedAttrs.value)
    },
})

const ComputedLabelHost = defineComponent({
    name: 'LabelAttrsComputedHost',
    inheritAttrs: false,
    props: {
        label: { type: String, default: '' },
    },
    setup(props) {
        const label = computed(() => props.label || undefined)
        const forwardedAttrs = useLabelAttrs(label)
        return () => h('button', forwardedAttrs.value)
    },
})

const Wrapper = defineComponent({
    name: 'LabelAttrsWrapper',
    props: {
        label: { type: String, default: '' },
        passedAriaLabel: { type: String, default: '' },
    },
    setup(props) {
        return () =>
            h(Host, {
                label: props.label,
                'aria-label': props.passedAriaLabel || undefined,
            })
    },
})

const BaseHost = defineComponent({
    name: 'LabelAttrsBaseHost',
    inheritAttrs: false,
    props: {
        label: { type: String, default: '' },
    },
    setup(props) {
        const base = computed<Record<string, unknown>>(() => ({
            'aria-label': 'passed-in',
            'data-x': 'base',
        }))
        const forwardedAttrs = useLabelAttrs(() => props.label, base)
        return () => h('button', forwardedAttrs.value)
    },
})

describe('useLabelAttrs', () => {
    it('传入基座时以基座为准，组件自身透传属性不参与', async () => {
        const wrapper = mount(BaseHost, { attrs: { 'data-y': 'ignored' } })

        const button = wrapper.get('button')
        expect(button.attributes('aria-label')).toBe('passed-in')
        expect(button.attributes('data-x')).toBe('base')
        expect(button.attributes('data-y')).toBeUndefined()

        await wrapper.setProps({ label: 'explicit' })
        expect(wrapper.get('button').attributes('aria-label')).toBe('explicit')
    })

    it('无 label 时保留透传的 aria-label 与其余属性', () => {
        const wrapper = mount(Host, {
            attrs: { 'aria-label': 'passed-in', disabled: true, 'data-x': 'y' },
        })

        const button = wrapper.get('button')
        expect(button.attributes('aria-label')).toBe('passed-in')
        expect(button.attributes('disabled')).toBe('')
        expect(button.attributes('data-x')).toBe('y')
    })

    it('label 有值时覆盖透传的 aria-label 且其余属性不受影响', () => {
        const wrapper = mount(Host, {
            props: { label: 'explicit' },
            attrs: { 'aria-label': 'passed-in', 'data-x': 'y' },
        })

        const button = wrapper.get('button')
        expect(button.attributes('aria-label')).toBe('explicit')
        expect(button.attributes('data-x')).toBe('y')
    })

    it('class 与 style 原样透传（不做根 / 控件分流）', () => {
        const wrapper = mount(Host, {
            attrs: { class: 'forwarded-class', style: 'color: red' },
        })

        const button = wrapper.get('button')
        expect(button.classes()).toContain('forwarded-class')
        expect(button.attributes('style')).toContain('color: red')
    })

    it('label 与透传 attrs 变化后同步更新', async () => {
        const wrapper = mount(Wrapper, { props: { passedAriaLabel: 'passed-in' } })

        expect(wrapper.get('button').attributes('aria-label')).toBe('passed-in')

        await wrapper.setProps({ label: 'first' })
        expect(wrapper.get('button').attributes('aria-label')).toBe('first')

        await wrapper.setProps({ label: '', passedAriaLabel: 'changed' })
        expect(wrapper.get('button').attributes('aria-label')).toBe('changed')
    })

    it('支持 computed 形式的可访问名（等价形态）', async () => {
        const wrapper = mount(ComputedLabelHost, {
            attrs: { 'aria-label': 'passed-in' },
        })

        expect(wrapper.get('button').attributes('aria-label')).toBe('passed-in')

        await wrapper.setProps({ label: 'computed-value' })
        expect(wrapper.get('button').attributes('aria-label')).toBe('computed-value')
    })

    it('支持 ref 形式的可访问名', async () => {
        const label = ref<string | undefined>(undefined)
        const RefHost = defineComponent({
            name: 'LabelAttrsRefHost',
            inheritAttrs: false,
            setup() {
                const forwardedAttrs = useLabelAttrs(label)
                return () => h('button', forwardedAttrs.value)
            },
        })

        const wrapper = mount(RefHost, { attrs: { 'aria-label': 'passed-in' } })
        expect(wrapper.get('button').attributes('aria-label')).toBe('passed-in')

        label.value = 'ref-value'
        await wrapper.vm.$nextTick()
        expect(wrapper.get('button').attributes('aria-label')).toBe('ref-value')
    })
})
