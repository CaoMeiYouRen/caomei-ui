import { mount } from '@vue/test-utils'
import { computed } from 'vue'
import { describe, expect, it } from 'vitest'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
import { CaomeiPassword } from './index'

describe('CaomeiPassword', () => {
    it('默认渲染 password 类型的输入框', () => {
        const wrapper = mount(CaomeiPassword, { props: { placeholder: '请输入密码' } })

        expect(wrapper.get('input').attributes('type')).toBe('password')
        expect(wrapper.get('input').attributes('placeholder')).toBe('请输入密码')
        expect(wrapper.get('.caomei-input').classes()).toContain('caomei-input--md')
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸样式 %s', (size) => {
        const wrapper = mount(CaomeiPassword, { props: { size } })
        expect(wrapper.get('.caomei-input').classes()).toContain(`caomei-input--${size}`)
    })

    it('v-model 与内部输入双向绑定', async () => {
        const wrapper = mount(CaomeiPassword, { props: { modelValue: '' } })
        await wrapper.get('input').setValue('secret')

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['secret'])
    })

    it('点击切换按钮在明文与密文之间切换并同步 aria-pressed', async () => {
        const wrapper = mount(CaomeiPassword)
        const toggle = wrapper.get('.caomei-password__toggle')

        expect(toggle.attributes('aria-pressed')).toBe('false')
        expect(wrapper.get('input').attributes('type')).toBe('password')

        await toggle.trigger('click')

        expect(toggle.attributes('aria-pressed')).toBe('true')
        expect(wrapper.get('input').attributes('type')).toBe('text')
    })

    it('切换按钮可访问名随状态切换，且可被覆盖', async () => {
        const fallback = mount(CaomeiPassword)
        expect(fallback.get('.caomei-password__toggle').attributes('aria-label')).toBe('显示密码')

        await fallback.get('.caomei-password__toggle').trigger('click')
        expect(fallback.get('.caomei-password__toggle').attributes('aria-label')).toBe('隐藏密码')

        const custom = mount(CaomeiPassword, { props: { showLabel: '查看', hideLabel: '收起' } })
        expect(custom.get('.caomei-password__toggle').attributes('aria-label')).toBe('查看')
        await custom.get('.caomei-password__toggle').trigger('click')
        expect(custom.get('.caomei-password__toggle').attributes('aria-label')).toBe('收起')
    })

    it('切换明文不丢失输入值', async () => {
        const wrapper = mount(CaomeiPassword, { props: { modelValue: 'secret' } })

        await wrapper.get('.caomei-password__toggle').trigger('click')

        expect((wrapper.get('input').element as HTMLInputElement).value).toBe('secret')
    })

    it('外部传入的 type 不会覆盖内部密码/明文类型', async () => {
        const wrapper = mount(CaomeiPassword, { attrs: { type: 'text' } })

        expect(wrapper.get('input').attributes('type')).toBe('password')

        await wrapper.get('.caomei-password__toggle').trigger('click')
        expect(wrapper.get('input').attributes('type')).toBe('text')
    })

    it('autocomplete 默认为 current-password 且可覆盖', () => {
        const fallback = mount(CaomeiPassword)
        expect(fallback.get('input').attributes('autocomplete')).toBe('current-password')

        const custom = mount(CaomeiPassword, { props: { autocomplete: 'new-password' } })
        expect(custom.get('input').attributes('autocomplete')).toBe('new-password')
    })

    it('disabled 时禁用输入与切换按钮并应用禁用样式', () => {
        const wrapper = mount(CaomeiPassword, { props: { disabled: true } })

        expect(wrapper.get('input').attributes('disabled')).toBeDefined()
        expect(wrapper.get('.caomei-password__toggle').attributes('disabled')).toBeDefined()
        expect(wrapper.get('.caomei-input').classes()).toContain('caomei-input--disabled')
    })

    it('invalid 时标注 aria-invalid 并应用错误样式', () => {
        const wrapper = mount(CaomeiPassword, { props: { invalid: true } })

        expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
        expect(wrapper.get('.caomei-input').classes()).toContain('caomei-input--invalid')
    })

    it('label 映射为 aria-label', () => {
        const wrapper = mount(CaomeiPassword, { props: { label: '登录密码' } })
        expect(wrapper.get('input').attributes('aria-label')).toBe('登录密码')
    })

    it('clearable 时有值显示清除按钮并抛出 clear', async () => {
        const wrapper = mount(CaomeiPassword, {
            props: { clearable: true, modelValue: 'secret' },
        })

        await wrapper.get('.caomei-input__clear').trigger('click')

        expect(wrapper.emitted('clear')).toHaveLength(1)
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
    })

    it('转发 focus / blur / change / enter 事件', async () => {
        const wrapper = mount(CaomeiPassword)
        const input = wrapper.get('input')

        await input.trigger('focus')
        await input.trigger('blur')
        await input.trigger('change')
        await input.trigger('keydown.enter')

        expect(wrapper.emitted('focus')).toHaveLength(1)
        expect(wrapper.emitted('blur')).toHaveLength(1)
        expect(wrapper.emitted('change')).toHaveLength(1)
        expect(wrapper.emitted('enter')).toHaveLength(1)
    })

    it('class 落在根元素，原生属性透传到 input', () => {
        const wrapper = mount(CaomeiPassword, {
            attrs: {
                class: 'custom-password',
                'data-test': 'password',
                maxlength: 20,
                required: true,
                'aria-describedby': 'hint',
            },
        })

        const root = wrapper.get('.caomei-input')
        const input = wrapper.get('input')
        expect(root.classes()).toContain('custom-password')
        expect(root.attributes('data-test')).toBeUndefined()
        expect(input.attributes('data-test')).toBe('password')
        expect(input.attributes('maxlength')).toBe('20')
        expect(input.attributes('required')).toBeDefined()
        expect(input.attributes('aria-describedby')).toBe('hint')
    })

    it('暴露 focus / blur 方法', () => {
        const wrapper = mount(CaomeiPassword, { attachTo: document.body })
        const input = wrapper.get('input').element as HTMLInputElement

        wrapper.vm.focus()
        expect(document.activeElement).toBe(input)
        wrapper.vm.blur()
        expect(document.activeElement).not.toBe(input)

        wrapper.unmount()
    })

    it('显隐与清除按钮使用注入 locale 的文案', async () => {
        const wrapper = mount(CaomeiPassword, {
            props: { modelValue: 'abc', clearable: true },
            global: {
                provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) },
            },
        })

        const toggle = wrapper.get('.caomei-password__toggle')
        expect(toggle.attributes('aria-label')).toBe('Show password')
        expect(wrapper.get('.caomei-input__clear').attributes('aria-label')).toBe('Clear')

        await toggle.trigger('click')
        expect(toggle.attributes('aria-label')).toBe('Hide password')
    })
})
