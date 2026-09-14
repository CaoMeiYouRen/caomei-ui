import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CaomeiTextarea } from './index'

describe('CaomeiTextarea', () => {
    it('渲染原生 textarea 并应用默认尺寸', () => {
        const wrapper = mount(CaomeiTextarea, {
            props: { placeholder: '请输入' },
        })

        const textarea = wrapper.get('textarea')
        expect(textarea.attributes('placeholder')).toBe('请输入')
        expect(wrapper.get('.caomei-textarea').classes()).toContain('caomei-textarea--md')
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸样式 %s', (size) => {
        const wrapper = mount(CaomeiTextarea, { props: { size } })
        expect(wrapper.get('.caomei-textarea').classes()).toContain(`caomei-textarea--${size}`)
    })

    it('透传 rows', () => {
        const wrapper = mount(CaomeiTextarea, { props: { rows: 6 } })
        expect(wrapper.get('textarea').attributes('rows')).toBe('6')
    })

    it('应用 resize 样式', () => {
        const wrapper = mount(CaomeiTextarea, { props: { resize: 'none' } })
        expect(wrapper.get('textarea').attributes('style')).toContain('resize: none')
    })

    it('输入时抛出 update:modelValue 事件', async () => {
        const wrapper = mount(CaomeiTextarea, { props: { modelValue: '' } })
        await wrapper.get('textarea').setValue('多行内容')

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['多行内容'])
    })

    it('禁用时透传 disabled 并应用禁用样式', () => {
        const wrapper = mount(CaomeiTextarea, { props: { disabled: true } })

        expect(wrapper.get('textarea').attributes('disabled')).toBeDefined()
        expect(wrapper.get('.caomei-textarea').classes()).toContain('caomei-textarea--disabled')
    })

    it('只读时透传 readonly 并应用只读样式', () => {
        const wrapper = mount(CaomeiTextarea, { props: { readonly: true } })

        expect(wrapper.get('textarea').attributes('readonly')).toBeDefined()
        expect(wrapper.get('.caomei-textarea').classes()).toContain('caomei-textarea--readonly')
    })

    it('invalid 时标注 aria-invalid 并应用错误样式', () => {
        const wrapper = mount(CaomeiTextarea, { props: { invalid: true } })

        expect(wrapper.get('textarea').attributes('aria-invalid')).toBe('true')
        expect(wrapper.get('.caomei-textarea').classes()).toContain('caomei-textarea--invalid')
    })

    it('label 映射为 aria-label', () => {
        const wrapper = mount(CaomeiTextarea, { props: { label: '备注' } })
        expect(wrapper.get('textarea').attributes('aria-label')).toBe('备注')
    })

    it('透传 name / id / autocomplete 到原生 textarea', () => {
        const wrapper = mount(CaomeiTextarea, {
            props: { name: 'remark', id: 'remark-input', autocomplete: 'off' },
        })

        const textarea = wrapper.get('textarea')
        expect(textarea.attributes('name')).toBe('remark')
        expect(textarea.attributes('id')).toBe('remark-input')
        expect(textarea.attributes('autocomplete')).toBe('off')
    })

    it('invalid 为 false 时不输出 aria-invalid', () => {
        const wrapper = mount(CaomeiTextarea)
        expect(wrapper.get('textarea').attributes('aria-invalid')).toBeUndefined()
    })

    it('值变更后 change 事件被抛出', async () => {
        const wrapper = mount(CaomeiTextarea)

        await wrapper.get('textarea').setValue('内容')

        expect(wrapper.emitted('change')).toHaveLength(1)
    })

    it('style 落在根元素且不泄漏到内部 textarea', () => {
        const wrapper = mount(CaomeiTextarea, {
            attrs: { style: 'max-width: 320px' },
        })

        expect(wrapper.get('.caomei-textarea').attributes('style')).toContain('max-width: 320px')
        expect(wrapper.get('textarea').attributes('style')).not.toContain('max-width: 320px')
    })

    it('class 落在根元素，其余原生属性透传到 textarea', () => {
        const wrapper = mount(CaomeiTextarea, {
            attrs: {
                class: 'custom-textarea',
                'data-test': 'textarea',
                maxlength: 200,
                required: true,
            },
        })

        const root = wrapper.get('.caomei-textarea')
        const textarea = wrapper.get('textarea')
        expect(root.classes()).toContain('custom-textarea')
        expect(root.attributes('data-test')).toBeUndefined()
        expect(textarea.attributes('data-test')).toBe('textarea')
        expect(textarea.attributes('maxlength')).toBe('200')
        expect(textarea.attributes('required')).toBeDefined()
    })

    it('聚焦与失焦时抛出对应事件', async () => {
        const wrapper = mount(CaomeiTextarea)
        const textarea = wrapper.get('textarea')

        await textarea.trigger('focus')
        await textarea.trigger('blur')

        expect(wrapper.emitted('focus')).toHaveLength(1)
        expect(wrapper.emitted('blur')).toHaveLength(1)
    })

    it('暴露 focus / blur 方法', () => {
        const wrapper = mount(CaomeiTextarea, { attachTo: document.body })
        const textarea = wrapper.get('textarea').element as HTMLTextAreaElement

        wrapper.vm.focus()
        expect(document.activeElement).toBe(textarea)
        wrapper.vm.blur()
        expect(document.activeElement).not.toBe(textarea)

        wrapper.unmount()
    })

    it('有值时输出 data-filled，清空后移除', async () => {
        const wrapper = mount(CaomeiTextarea)

        expect(wrapper.get('.caomei-textarea').attributes('data-filled')).toBeUndefined()

        await wrapper.setProps({ modelValue: '多行内容' })
        expect(wrapper.get('.caomei-textarea').attributes('data-filled')).toBe('true')

        await wrapper.setProps({ modelValue: '' })
        expect(wrapper.get('.caomei-textarea').attributes('data-filled')).toBeUndefined()
    })
})
