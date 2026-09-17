import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import { CaomeiSwitch } from './index'

function getControl(wrapper: ReturnType<typeof mount>) {
    return wrapper.get('.caomei-switch')
}

describe('CaomeiSwitch', () => {
    it('默认渲染未开启状态', () => {
        const wrapper = mount(CaomeiSwitch)

        const control = getControl(wrapper)
        expect(control.element.tagName).toBe('BUTTON')
        expect(control.attributes('role')).toBe('switch')
        expect(control.attributes('type')).toBe('button')
        expect(control.attributes('aria-checked')).toBe('false')
        expect(control.attributes('data-state')).toBe('unchecked')
        expect(wrapper.find('.caomei-switch__thumb').exists()).toBe(true)
    })

    it('未绑定 v-model 时点击可切换到开启态', async () => {
        const wrapper = mount(CaomeiSwitch)

        await getControl(wrapper).trigger('click')
        await nextTick()

        const control = getControl(wrapper)
        expect(control.attributes('aria-checked')).toBe('true')
        expect(control.attributes('data-state')).toBe('checked')
        expect(wrapper.get('.caomei-switch__thumb').attributes('data-state')).toBe('checked')
    })

    it('受控时点击抛出 update:modelValue', async () => {
        const wrapper = mount(CaomeiSwitch, { props: { modelValue: false } })

        await getControl(wrapper).trigger('click')

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    })

    it('已开启受控时点击抛出 update:modelValue false', async () => {
        const wrapper = mount(CaomeiSwitch, { props: { modelValue: true } })

        await getControl(wrapper).trigger('click')

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    })

    it('已开启时不显示未开启态', () => {
        const wrapper = mount(CaomeiSwitch, { props: { modelValue: true } })

        const control = getControl(wrapper)
        expect(control.attributes('aria-checked')).toBe('true')
        expect(control.attributes('data-state')).toBe('checked')
    })

    it('禁用时设置 disabled 与状态类，且点击不切换', async () => {
        const wrapper = mount(CaomeiSwitch, { props: { disabled: true } })

        const control = getControl(wrapper)
        expect(control.attributes('disabled')).toBeDefined()
        expect(control.classes()).toContain('caomei-switch--disabled')
        expect(wrapper.get('.caomei-switch__thumb').attributes('data-disabled')).toBeDefined()

        await control.trigger('click')
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
        expect(getControl(wrapper).attributes('aria-checked')).toBe('false')
    })

    it('required 映射 aria-required', () => {
        const wrapper = mount(CaomeiSwitch, { props: { required: true } })

        expect(getControl(wrapper).attributes('aria-required')).toBe('true')
    })

    it('默认不输出 aria-required', () => {
        const wrapper = mount(CaomeiSwitch)

        expect(getControl(wrapper).attributes('aria-required')).toBeUndefined()
    })

    it('label 属性映射控件 aria-label', () => {
        const wrapper = mount(CaomeiSwitch, { props: { label: '推送通知' } })

        expect(getControl(wrapper).attributes('aria-label')).toBe('推送通知')
    })

    it('label 属性优先于透传的 aria-label', () => {
        const wrapper = mount(CaomeiSwitch, {
            props: { label: '属性名' },
            attrs: { 'aria-label': '透传名' },
        })

        expect(getControl(wrapper).attributes('aria-label')).toBe('属性名')
    })

    it('自定义 id 落在控件上', () => {
        const wrapper = mount(CaomeiSwitch, { props: { id: 'notify' } })

        expect(getControl(wrapper).attributes('id')).toBe('notify')
    })

    it('class 留在控件根元素，其余属性透传到控件', () => {
        const wrapper = mount(CaomeiSwitch, {
            attrs: { class: 'custom', 'data-test': 'switch' },
        })

        const control = getControl(wrapper)
        expect(control.classes()).toContain('custom')
        expect(control.attributes('data-test')).toBe('switch')
    })

    it('style 透传到控件根元素', () => {
        const wrapper = mount(CaomeiSwitch, { attrs: { style: 'margin: 4px' } })

        expect(getControl(wrapper).attributes('style')).toContain('margin: 4px')
    })

    it('位于表单内时渲染同名隐藏输入', () => {
        const wrapper = mount(
            defineComponent({
                setup() {
                    return () =>
                        h('form', [
                            h(CaomeiSwitch, {
                                name: 'notify',
                                value: 'yes',
                                required: true,
                                modelValue: true,
                            }),
                        ])
                },
            }),
        )

        const input = wrapper.get('input[type="checkbox"]')
        expect(input.attributes('name')).toBe('notify')
        expect(input.attributes('value')).toBe('yes')
        expect(input.attributes('required')).toBeDefined()
    })

    it('表单内 value 缺省为 on', () => {
        const wrapper = mount(
            defineComponent({
                setup() {
                    return () => h('form', [h(CaomeiSwitch, { name: 'notify' })])
                },
            }),
        )

        expect(wrapper.get('input[type="checkbox"]').attributes('value')).toBe('on')
    })

    it('无 name 或不在表单内时不渲染隐藏输入', async () => {
        const withoutName = mount(
            defineComponent({
                setup() {
                    return () => h('form', [h(CaomeiSwitch)])
                },
            }),
        )
        expect(withoutName.find('input[type="checkbox"]').exists()).toBe(false)

        const outsideForm = mount(CaomeiSwitch, { props: { name: 'notify' } })
        await nextTick()
        expect(outsideForm.find('input[type="checkbox"]').exists()).toBe(false)
    })

    it('用户点击切换时抛出 change 并携带新值', async () => {
        const wrapper = mount(CaomeiSwitch, { props: { modelValue: false } })

        await getControl(wrapper).trigger('click')

        expect(wrapper.emitted('change')?.[0]).toEqual([true])
    })

    it('用户关闭时 change 携带 false', async () => {
        const wrapper = mount(CaomeiSwitch, { props: { modelValue: true } })

        await getControl(wrapper).trigger('click')

        expect(wrapper.emitted('change')?.[0]).toEqual([false])
    })

    it('程序化改值不触发 change', async () => {
        const wrapper = mount(CaomeiSwitch, { props: { modelValue: false } })

        await wrapper.setProps({ modelValue: true })
        await nextTick()

        expect(wrapper.emitted('change')).toBeUndefined()
        expect(getControl(wrapper).attributes('aria-checked')).toBe('true')
    })

    it('禁用时点击不触发 change', async () => {
        const wrapper = mount(CaomeiSwitch, { props: { disabled: true } })

        await getControl(wrapper).trigger('click')

        expect(wrapper.emitted('change')).toBeUndefined()
    })
})
