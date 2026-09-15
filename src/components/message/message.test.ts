import { mount } from '@vue/test-utils'
import { computed } from 'vue'
import { describe, expect, it } from 'vitest'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
import { CaomeiMessage } from './index'

function getRoot(wrapper: ReturnType<typeof mount>) {
    return wrapper.get('.caomei-message')
}

describe('CaomeiMessage', () => {
    it('默认渲染 neutral / soft 且带语义图标', () => {
        const wrapper = mount(CaomeiMessage, { props: { description: '提示内容' } })

        const root = getRoot(wrapper)
        expect(root.classes()).toContain('caomei-message--neutral')
        expect(root.classes()).toContain('caomei-message--soft')
        expect(wrapper.get('.caomei-message__body').attributes('role')).toBe('status')
        expect(wrapper.find('.caomei-message__icon').exists()).toBe(true)
        expect(wrapper.get('.caomei-message__content').text()).toBe('提示内容')
    })

    it.each(['primary', 'success', 'warning', 'danger', 'neutral'] as const)(
        '应用 tone 类 %s',
        (tone) => {
            const wrapper = mount(CaomeiMessage, { props: { tone } })

            expect(getRoot(wrapper).classes()).toContain(`caomei-message--${tone}`)
        },
    )

    it.each(['soft', 'solid', 'outline'] as const)('应用 variant 类 %s', (variant) => {
        const wrapper = mount(CaomeiMessage, { props: { variant } })

        expect(getRoot(wrapper).classes()).toContain(`caomei-message--${variant}`)
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸 %s', (size) => {
        const wrapper = mount(CaomeiMessage, { props: { size } })
        expect(wrapper.get('.caomei-message').classes()).toContain(`caomei-message--${size}`)
    })

    it('默认尺寸为 md', () => {
        const wrapper = mount(CaomeiMessage)
        expect(wrapper.get('.caomei-message').classes()).toContain('caomei-message--md')
    })

    it('simple 变体应用对应类并可叠加尺寸', () => {
        const wrapper = mount(CaomeiMessage, { props: { variant: 'simple', size: 'sm' } })
        const root = wrapper.get('.caomei-message')
        expect(root.classes()).toContain('caomei-message--simple')
        expect(root.classes()).toContain('caomei-message--sm')
    })

    it('title 与插槽内容分别渲染', () => {
        const wrapper = mount(CaomeiMessage, {
            props: { title: '标题' },
            slots: { default: '<span data-test="c">自定义内容</span>' },
        })

        expect(wrapper.get('.caomei-message__title').text()).toBe('标题')
        expect(wrapper.get('.caomei-message__content').find('[data-test="c"]').exists()).toBe(true)
    })

    it('icon 为 false 且无插槽时不渲染图标', () => {
        const wrapper = mount(CaomeiMessage, { props: { icon: false } })

        expect(wrapper.find('.caomei-message__icon').exists()).toBe(false)
    })

    it('icon 插槽覆盖默认图标', () => {
        const wrapper = mount(CaomeiMessage, {
            slots: { icon: '<span data-test="i">★</span>' },
        })

        expect(wrapper.get('.caomei-message__icon').find('[data-test="i"]').exists()).toBe(true)
    })

    it('actions 插槽渲染操作区', () => {
        const wrapper = mount(CaomeiMessage, {
            slots: { actions: '<button type="button">重试</button>' },
        })

        expect(wrapper.get('.caomei-message__actions').text()).toBe('重试')
    })

    it('closable 渲染关闭按钮并抛出 close', async () => {
        const wrapper = mount(CaomeiMessage, { props: { closable: true } })

        const close = wrapper.get('.caomei-message__close')
        expect(close.attributes('aria-label')).toBe('关闭')

        await close.trigger('click')
        expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('closeLabel 可覆盖', () => {
        const wrapper = mount(CaomeiMessage, {
            props: { closable: true, closeLabel: 'Dismiss' },
        })

        expect(wrapper.get('.caomei-message__close').attributes('aria-label')).toBe('Dismiss')
    })

    it('默认不渲染关闭按钮', () => {
        const wrapper = mount(CaomeiMessage)

        expect(wrapper.find('.caomei-message__close').exists()).toBe(false)
    })

    it('role 可改为 alert', () => {
        const wrapper = mount(CaomeiMessage, { props: { role: 'alert' } })

        expect(wrapper.get('.caomei-message__body').attributes('role')).toBe('alert')
    })

    it('交互内容位于 live region 之外', () => {
        const wrapper = mount(CaomeiMessage, {
            props: { closable: true },
            slots: { actions: '<button type="button">重试</button>' },
        })

        expect(getRoot(wrapper).attributes('role')).toBeUndefined()
        expect(
            wrapper.get('.caomei-message__close').element.closest('[role="status"]'),
        ).toBeNull()
        expect(wrapper.get('.caomei-message__actions').element.closest('[role="status"]')).toBeNull()
    })

    it('语义图标标记 aria-hidden', () => {
        const wrapper = mount(CaomeiMessage)

        expect(wrapper.get('.caomei-message__icon').attributes('aria-hidden')).toBe('true')
    })

    it('icon 为 false 但提供插槽时仍渲染图标', () => {
        const wrapper = mount(CaomeiMessage, {
            props: { icon: false },
            slots: { icon: '<span data-test="i">★</span>' },
        })

        expect(wrapper.get('.caomei-message__icon').find('[data-test="i"]').exists()).toBe(true)
    })

    it('默认插槽覆盖 description', () => {
        const wrapper = mount(CaomeiMessage, {
            props: { description: '属性文本' },
            slots: { default: '插槽文本' },
        })

        expect(wrapper.get('.caomei-message__content').text()).toBe('插槽文本')
    })

    it('class 与其余属性透传到根元素', () => {
        const wrapper = mount(CaomeiMessage, {
            attrs: { class: 'custom', 'data-test': 'message' },
        })

        const root = getRoot(wrapper)
        expect(root.classes()).toContain('custom')
        expect(root.attributes('data-test')).toBe('message')
    })

    it('关闭按钮使用注入 locale 的文案，且 props 优先', () => {
        const wrapper = mount(CaomeiMessage, {
            props: { closable: true },
            global: {
                provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) },
            },
        })

        expect(wrapper.get('.caomei-message__close').attributes('aria-label')).toBe('Close')

        const overridden = mount(CaomeiMessage, {
            props: { closable: true, closeLabel: 'Dismiss' },
            global: {
                provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) },
            },
        })

        expect(overridden.get('.caomei-message__close').attributes('aria-label')).toBe('Dismiss')
    })
})
