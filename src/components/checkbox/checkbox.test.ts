import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import { CaomeiCheckbox } from './index'

function getControl(wrapper: ReturnType<typeof mount>) {
    return wrapper.get('.caomei-checkbox__control')
}

describe('CaomeiCheckbox', () => {
    it('默认渲染未选中状态且不显示指示器', () => {
        const wrapper = mount(CaomeiCheckbox)

        const control = getControl(wrapper)
        expect(control.element.tagName).toBe('BUTTON')
        expect(control.attributes('role')).toBe('checkbox')
        expect(control.attributes('type')).toBe('button')
        expect(control.attributes('aria-checked')).toBe('false')
        expect(control.attributes('data-state')).toBe('unchecked')
        expect(wrapper.find('.caomei-checkbox__indicator').exists()).toBe(false)
        expect(wrapper.get('.caomei-checkbox').classes()).toContain('caomei-checkbox--md')
    })

    it('未绑定 v-model 时点击可切换到选中态', async () => {
        const wrapper = mount(CaomeiCheckbox)

        await getControl(wrapper).trigger('click')
        await nextTick()

        const control = getControl(wrapper)
        expect(control.attributes('aria-checked')).toBe('true')
        expect(control.attributes('data-state')).toBe('checked')
        expect(wrapper.get('.caomei-checkbox__indicator').attributes('data-state')).toBe('checked')
    })

    it('受控时点击抛出 update:modelValue', async () => {
        const wrapper = mount(CaomeiCheckbox, { props: { modelValue: false } })

        await getControl(wrapper).trigger('click')

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    })

    it('半选态映射 aria-checked=mixed 并显示对应指示器', async () => {
        const wrapper = mount(CaomeiCheckbox, { props: { modelValue: 'indeterminate' } })

        const control = getControl(wrapper)
        expect(control.attributes('aria-checked')).toBe('mixed')
        expect(control.attributes('data-state')).toBe('indeterminate')
        expect(wrapper.get('.caomei-checkbox__indicator').attributes('data-state')).toBe(
            'indeterminate',
        )

        await control.trigger('click')
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    })

    it('选中态渲染指示器', () => {
        const wrapper = mount(CaomeiCheckbox, { props: { modelValue: true } })

        expect(getControl(wrapper).attributes('aria-checked')).toBe('true')
        expect(getControl(wrapper).attributes('data-state')).toBe('checked')
        expect(wrapper.find('.caomei-checkbox__indicator').exists()).toBe(true)
    })

    it('禁用时设置 disabled 与状态类', () => {
        const wrapper = mount(CaomeiCheckbox, { props: { disabled: true } })

        expect(getControl(wrapper).attributes('disabled')).toBeDefined()
        expect(wrapper.get('.caomei-checkbox').classes()).toContain('caomei-checkbox--disabled')
    })

    it('invalid 时设置 aria-invalid 与校验类', () => {
        const wrapper = mount(CaomeiCheckbox, { props: { invalid: true } })

        expect(getControl(wrapper).attributes('aria-invalid')).toBe('true')
        expect(wrapper.get('.caomei-checkbox').classes()).toContain('caomei-checkbox--invalid')
    })

    it('required 映射 aria-required', () => {
        const wrapper = mount(CaomeiCheckbox, { props: { required: true } })

        expect(getControl(wrapper).attributes('aria-required')).toBe('true')
    })

    it('默认不输出 aria-required', () => {
        const wrapper = mount(CaomeiCheckbox)

        expect(getControl(wrapper).attributes('aria-required')).toBeUndefined()
    })

    it('text 属性渲染可见标签并关联到控件', () => {
        const wrapper = mount(CaomeiCheckbox, { props: { text: '同意条款' } })

        const controlId = getControl(wrapper).attributes('id')
        const label = wrapper.get('.caomei-checkbox__label')
        expect(controlId).toBeTruthy()
        expect(label.attributes('for')).toBe(controlId)
        expect(label.text()).toBe('同意条款')
    })

    it('label 属性映射控件 aria-label', () => {
        const wrapper = mount(CaomeiCheckbox, { props: { label: '订阅通知' } })

        expect(getControl(wrapper).attributes('aria-label')).toBe('订阅通知')
    })

    it('label 属性优先于透传的 aria-label', () => {
        const wrapper = mount(CaomeiCheckbox, {
            props: { label: '属性名' },
            attrs: { 'aria-label': '透传名' },
        })

        expect(getControl(wrapper).attributes('aria-label')).toBe('属性名')
    })

    it('仅 label 时不渲染可见标签元素', () => {
        const wrapper = mount(CaomeiCheckbox, { props: { label: '仅可访问名' } })

        expect(wrapper.find('.caomei-checkbox__label').exists()).toBe(false)
        expect(getControl(wrapper).attributes('aria-label')).toBe('仅可访问名')
    })

    it('默认插槽自定义标签内容', () => {
        const wrapper = mount(CaomeiCheckbox, {
            slots: { default: '<span data-test="label">自定义标签</span>' },
        })

        expect(wrapper.get('.caomei-checkbox__label').find('[data-test="label"]').exists()).toBe(true)
    })

    it('无标签时不渲染 label 元素', () => {
        const wrapper = mount(CaomeiCheckbox)

        expect(wrapper.find('.caomei-checkbox__label').exists()).toBe(false)
    })

    it('自定义 id 同时用于控件与 label', () => {
        const wrapper = mount(CaomeiCheckbox, { props: { id: 'agree', text: '同意' } })

        expect(getControl(wrapper).attributes('id')).toBe('agree')
        expect(wrapper.get('.caomei-checkbox__label').attributes('for')).toBe('agree')
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸类 %s', (size) => {
        const wrapper = mount(CaomeiCheckbox, { props: { size } })

        expect(wrapper.get('.caomei-checkbox').classes()).toContain(`caomei-checkbox--${size}`)
    })

    it('位于表单内时渲染同名隐藏输入', () => {
        const wrapper = mount(
            defineComponent({
                setup() {
                    return () =>
                        h('form', [
                            h(CaomeiCheckbox, {
                                name: 'agree',
                                value: 'yes',
                                required: true,
                                modelValue: true,
                            }),
                        ])
                },
            }),
        )

        const input = wrapper.get('input[type="checkbox"]')
        expect(input.attributes('name')).toBe('agree')
        expect(input.attributes('value')).toBe('yes')
        expect(input.attributes('required')).toBeDefined()
    })

    it('表单内 value 缺省为 on', () => {
        const wrapper = mount(
            defineComponent({
                setup() {
                    return () => h('form', [h(CaomeiCheckbox, { name: 'agree' })])
                },
            }),
        )

        expect(wrapper.get('input[type="checkbox"]').attributes('value')).toBe('on')
    })

    it('无 name 或不在表单内时不渲染隐藏输入', async () => {
        const withoutName = mount(
            defineComponent({
                setup() {
                    return () => h('form', [h(CaomeiCheckbox)])
                },
            }),
        )
        expect(withoutName.find('input[type="checkbox"]').exists()).toBe(false)

        const outsideForm = mount(CaomeiCheckbox, { props: { name: 'agree' } })
        await nextTick()
        expect(outsideForm.find('input[type="checkbox"]').exists()).toBe(false)
    })

    it('class 留在根元素，其余属性透传到控件', () => {
        const wrapper = mount(CaomeiCheckbox, {
            attrs: { class: 'custom', 'aria-label': '选择', 'data-test': 'checkbox' },
        })

        const root = wrapper.get('.caomei-checkbox')
        expect(root.classes()).toContain('custom')
        expect(root.attributes('aria-label')).toBeUndefined()

        const control = getControl(wrapper)
        expect(control.attributes('aria-label')).toBe('选择')
        expect(control.attributes('data-test')).toBe('checkbox')
    })
})

describe('CaomeiCheckbox 数组模型', () => {
    it('点击把 value 追加进数组模型', async () => {
        const wrapper = mount(CaomeiCheckbox, {
            props: { modelValue: ['apple'], value: 'banana', text: '香蕉' },
        })

        await getControl(wrapper).trigger('click')

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['apple', 'banana']])
    })

    it('点击把已含的 value 移出数组模型', async () => {
        const wrapper = mount(CaomeiCheckbox, {
            props: { modelValue: ['apple', 'banana'], value: 'banana', text: '香蕉' },
        })

        await getControl(wrapper).trigger('click')

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['apple']])
    })

    it('数组模型含该值时渲染选中态，数字值按严格相等匹配', () => {
        const checked = mount(CaomeiCheckbox, { props: { modelValue: [2], value: 2 } })
        expect(getControl(checked).attributes('aria-checked')).toBe('true')

        const unchecked = mount(CaomeiCheckbox, { props: { modelValue: [2], value: 1 } })
        expect(getControl(unchecked).attributes('aria-checked')).toBe('false')
    })

    it('数组模型缺少 value 时点击不改写模型', async () => {
        const wrapper = mount(CaomeiCheckbox, { props: { modelValue: [] } })

        await getControl(wrapper).trigger('click')

        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('单值模型行为不受影响', async () => {
        const wrapper = mount(CaomeiCheckbox, { props: { modelValue: false, value: 'yes' } })

        await getControl(wrapper).trigger('click')

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    })
})
