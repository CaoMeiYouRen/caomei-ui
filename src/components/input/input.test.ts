import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CaomeiInput } from './index'

describe('CaomeiInput', () => {
    it('渲染原生 input 并应用默认尺寸与占位文本', () => {
        const wrapper = mount(CaomeiInput, {
            props: { placeholder: '请输入' },
        })

        const input = wrapper.get('input')
        expect(input.attributes('type')).toBe('text')
        expect(input.attributes('placeholder')).toBe('请输入')
        expect(wrapper.get('.caomei-input').classes()).toContain('caomei-input--md')
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸样式 %s', (size) => {
        const wrapper = mount(CaomeiInput, { props: { size } })
        expect(wrapper.get('.caomei-input').classes()).toContain(`caomei-input--${size}`)
    })

    it.each(['text', 'password', 'email', 'search', 'tel', 'url'] as const)(
        '透传原生 type=%s',
        (type) => {
            const wrapper = mount(CaomeiInput, { props: { type } })
            expect(wrapper.get('input').attributes('type')).toBe(type)
        },
    )

    it('展示 props 传入的受控值', () => {
        const wrapper = mount(CaomeiInput, { props: { modelValue: '已输入' } })
        expect(wrapper.get('input').element).toHaveProperty('value', '已输入')
    })

    it('输入时抛出 update:modelValue 事件', async () => {
        const wrapper = mount(CaomeiInput, { props: { modelValue: '' } })
        await wrapper.get('input').setValue('新内容')

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['新内容'])
    })

    it('禁用时透传 disabled 并应用禁用样式', () => {
        const wrapper = mount(CaomeiInput, { props: { disabled: true } })

        expect(wrapper.get('input').attributes('disabled')).toBeDefined()
        expect(wrapper.get('.caomei-input').classes()).toContain('caomei-input--disabled')
    })

    it('只读时透传 readonly', () => {
        const wrapper = mount(CaomeiInput, { props: { readonly: true } })
        expect(wrapper.get('input').attributes('readonly')).toBeDefined()
    })

    it('invalid 时标注 aria-invalid 并应用错误样式', () => {
        const wrapper = mount(CaomeiInput, { props: { invalid: true } })

        expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
        expect(wrapper.get('.caomei-input').classes()).toContain('caomei-input--invalid')
    })

    it('label 映射为 aria-label', () => {
        const wrapper = mount(CaomeiInput, { props: { label: '搜索' } })
        expect(wrapper.get('input').attributes('aria-label')).toBe('搜索')
    })

    it('无值时不渲染清除按钮', () => {
        const wrapper = mount(CaomeiInput, { props: { clearable: true, modelValue: '' } })
        expect(wrapper.find('.caomei-input__clear').exists()).toBe(false)
    })

    it('clearable 且只读/禁用时不渲染清除按钮', () => {
        const readonly = mount(CaomeiInput, {
            props: { clearable: true, readonly: true, modelValue: 'abc' },
        })
        const disabled = mount(CaomeiInput, {
            props: { clearable: true, disabled: true, modelValue: 'abc' },
        })

        expect(readonly.find('.caomei-input__clear').exists()).toBe(false)
        expect(disabled.find('.caomei-input__clear').exists()).toBe(false)
    })

    it('点击清除按钮清空值并抛出 clear 事件', async () => {
        const wrapper = mount(CaomeiInput, {
            props: { clearable: true, modelValue: 'abc' },
        })

        await wrapper.get('.caomei-input__clear').trigger('click')

        expect(wrapper.emitted('clear')).toHaveLength(1)
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
    })

    it('渲染 prefix 与 suffix 插槽', () => {
        const wrapper = mount(CaomeiInput, {
            slots: {
                prefix: '<span data-test="prefix" />',
                suffix: '<span data-test="suffix" />',
            },
        })

        expect(wrapper.find('[data-test="prefix"]').exists()).toBe(true)
        expect(wrapper.find('[data-test="suffix"]').exists()).toBe(true)
    })

    it('聚焦与失焦时抛出对应事件', async () => {
        const wrapper = mount(CaomeiInput)
        const input = wrapper.get('input')

        await input.trigger('focus')
        await input.trigger('blur')

        expect(wrapper.emitted('focus')).toHaveLength(1)
        expect(wrapper.emitted('blur')).toHaveLength(1)
    })

    it('按下回车时抛出 enter 事件', async () => {
        const wrapper = mount(CaomeiInput)
        await wrapper.get('input').trigger('keydown.enter')

        expect(wrapper.emitted('enter')).toHaveLength(1)
    })

    it('暴露 focus / blur 方法', () => {
        const wrapper = mount(CaomeiInput, { attachTo: document.body })
        const input = wrapper.get('input').element as HTMLInputElement

        wrapper.vm.focus()
        expect(document.activeElement).toBe(input)
        wrapper.vm.blur()
        expect(document.activeElement).not.toBe(input)

        wrapper.unmount()
    })

    it('class 落在根元素，其余原生属性透传到 input', () => {
        const wrapper = mount(CaomeiInput, {
            attrs: {
                class: 'custom-input',
                'data-test': 'input',
                maxlength: 10,
                required: true,
                'aria-describedby': 'hint',
            },
        })

        const root = wrapper.get('.caomei-input')
        const input = wrapper.get('input')
        expect(root.classes()).toContain('caomei-input')
        expect(root.classes()).toContain('custom-input')
        expect(root.attributes('data-test')).toBeUndefined()
        expect(input.attributes('data-test')).toBe('input')
        expect(input.attributes('maxlength')).toBe('10')
        expect(input.attributes('required')).toBeDefined()
        expect(input.attributes('aria-describedby')).toBe('hint')
    })

    it('透传 name / id / autocomplete 到原生 input', () => {
        const wrapper = mount(CaomeiInput, {
            props: { name: 'keyword', id: 'keyword-input', autocomplete: 'off' },
        })

        const input = wrapper.get('input')
        expect(input.attributes('name')).toBe('keyword')
        expect(input.attributes('id')).toBe('keyword-input')
        expect(input.attributes('autocomplete')).toBe('off')
    })

    it('invalid 为 false 时不输出 aria-invalid', () => {
        const wrapper = mount(CaomeiInput)
        expect(wrapper.get('input').attributes('aria-invalid')).toBeUndefined()
    })

    it('clearable 为 false 时有值也不渲染清除按钮', () => {
        const wrapper = mount(CaomeiInput, { props: { clearable: false, modelValue: 'abc' } })
        expect(wrapper.find('.caomei-input__clear').exists()).toBe(false)
    })

    it('清除按钮使用默认可访问标签且可被 clearLabel 覆盖', () => {
        const fallback = mount(CaomeiInput, { props: { clearable: true, modelValue: 'abc' } })
        const custom = mount(CaomeiInput, {
            props: { clearable: true, modelValue: 'abc', clearLabel: '清空输入' },
        })

        expect(fallback.get('.caomei-input__clear').attributes('aria-label')).toBe('清除')
        expect(custom.get('.caomei-input__clear').attributes('aria-label')).toBe('清空输入')
    })

    it('有值时输出 data-filled，清空后移除', async () => {
        const wrapper = mount(CaomeiInput)

        expect(wrapper.get('.caomei-input').attributes('data-filled')).toBeUndefined()

        await wrapper.setProps({ modelValue: 'abc' })
        expect(wrapper.get('.caomei-input').attributes('data-filled')).toBe('true')

        await wrapper.setProps({ modelValue: '' })
        expect(wrapper.get('.caomei-input').attributes('data-filled')).toBeUndefined()
    })
})
