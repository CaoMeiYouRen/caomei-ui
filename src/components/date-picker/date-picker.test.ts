import { DOMWrapper, mount } from '@vue/test-utils'
import { computed, nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
import { CaomeiDatePicker } from './index'

function mountPicker(props: Record<string, unknown> = {}) {
    return mount(CaomeiDatePicker, { props, attachTo: document.body })
}

function getContent(): DOMWrapper<Element> {
    const content = document.body.querySelector('.caomei-date-picker__content')
    expect(content).not.toBeNull()
    return new DOMWrapper(content as Element)
}

afterEach(() => {
    document.body.innerHTML = ''
})

describe('CaomeiDatePicker', () => {
    it('未选择时显示占位文本并渲染日历图标', () => {
        const wrapper = mountPicker({ placeholder: '请选择日期' })
        const trigger = wrapper.get('.caomei-date-picker')

        expect(trigger.text()).toContain('请选择日期')
        expect(trigger.find('.caomei-date-picker__icon').exists()).toBe(true)
        expect(trigger.attributes('aria-expanded')).toBe('false')

        wrapper.unmount()
    })

    it('按 dateFormat 展示已选日期', () => {
        const wrapper = mountPicker({ modelValue: new Date(2026, 8, 5), dateFormat: 'yy-mm-dd' })

        expect(wrapper.get('.caomei-date-picker').text()).toContain('26-09-05')

        wrapper.unmount()
    })

    it('关闭图标时不渲染图标', () => {
        const wrapper = mountPicker({ showIcon: false })
        expect(wrapper.find('.caomei-date-picker__icon').exists()).toBe(false)

        wrapper.unmount()
    })

    it('点击触发器展开面板并渲染日历', async () => {
        const wrapper = mountPicker({ modelValue: new Date(2026, 8, 15) })

        await wrapper.get('.caomei-date-picker').trigger('click')
        await nextTick()

        expect(wrapper.get('.caomei-date-picker').attributes('aria-expanded')).toBe('true')
        expect(getContent().find('.caomei-calendar__grid').exists()).toBe(true)

        wrapper.unmount()
    })

    it('面板内日历使用本地化可访问名', async () => {
        const wrapper = mountPicker({ modelValue: new Date(2026, 8, 15) })

        await wrapper.get('.caomei-date-picker').trigger('click')
        await nextTick()

        expect(getContent().get('.caomei-calendar').attributes('aria-label')).toContain('日历')

        wrapper.unmount()
    })

    it('选择日期后抛出原生 Date 并按默认收起面板', async () => {
        const wrapper = mountPicker({ modelValue: new Date(2026, 8, 15) })

        await wrapper.get('.caomei-date-picker').trigger('click')
        await nextTick()
        await getContent().find('[data-value=\'2026-09-20\']').trigger('click')
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')?.[0]?.[0] as Date
        expect(emitted).toBeInstanceOf(Date)
        expect(emitted.getDate()).toBe(20)
        expect(wrapper.get('.caomei-date-picker').attributes('aria-expanded')).toBe('false')

        wrapper.unmount()
    })

    it('closeOnSelect 为 false 时保持面板展开', async () => {
        const wrapper = mountPicker({ modelValue: new Date(2026, 8, 15), closeOnSelect: false })

        await wrapper.get('.caomei-date-picker').trigger('click')
        await nextTick()
        await getContent().find('[data-value=\'2026-09-20\']').trigger('click')
        await nextTick()

        expect(wrapper.get('.caomei-date-picker').attributes('aria-expanded')).toBe('true')

        wrapper.unmount()
    })

    it('disabled 时不展开', async () => {
        const wrapper = mountPicker({ modelValue: new Date(2026, 8, 15), disabled: true })

        await wrapper.get('.caomei-date-picker').trigger('click')
        await nextTick()

        expect(document.body.querySelector('.caomei-date-picker__content')).toBeNull()
        expect(wrapper.get('.caomei-date-picker').classes()).toContain('caomei-date-picker--disabled')

        wrapper.unmount()
    })

    it('invalid 时标注 aria-invalid 并应用错误样式', () => {
        const wrapper = mountPicker({ invalid: true })

        expect(wrapper.get('.caomei-date-picker').attributes('aria-invalid')).toBe('true')
        expect(wrapper.get('.caomei-date-picker').classes()).toContain('caomei-date-picker--invalid')

        wrapper.unmount()
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸样式 %s', (size) => {
        const wrapper = mountPicker({ size })
        expect(wrapper.get('.caomei-date-picker').classes()).toContain(`caomei-date-picker--${size}`)

        wrapper.unmount()
    })

    it('minValue / maxValue 之外的日期禁用', async () => {
        const wrapper = mountPicker({
            modelValue: new Date(2026, 8, 15),
            minValue: new Date(2026, 8, 10),
            maxValue: new Date(2026, 8, 20),
        })

        await wrapper.get('.caomei-date-picker').trigger('click')
        await nextTick()

        expect(getContent().find('[data-value=\'2026-09-09\']').attributes('data-disabled')).toBeDefined()
        expect(getContent().find('[data-value=\'2026-09-21\']').attributes('data-disabled')).toBeDefined()

        wrapper.unmount()
    })

    it('支持 v-model:open 受控展开', async () => {
        const wrapper = mountPicker({ modelValue: new Date(2026, 8, 15), open: false })

        await wrapper.setProps({ open: true })
        await nextTick()

        expect(wrapper.get('.caomei-date-picker').attributes('aria-expanded')).toBe('true')

        wrapper.unmount()
    })

    it('无可见文本时使用注入 locale 的可访问名', () => {
        const wrapper = mount(CaomeiDatePicker, {
            global: {
                provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) },
            },
        })

        expect(wrapper.get('.caomei-date-picker').attributes('aria-label')).toBe('Date')

        wrapper.unmount()
    })

    it('class / style / id 与原生属性落在触发器上', () => {
        const wrapper = mountPicker({
            id: 'start-date',
            placeholder: '选择日期',
        })
        const trigger = wrapper.get('.caomei-date-picker')
        expect(trigger.attributes('id')).toBe('start-date')
        expect(trigger.element.tagName).toBe('BUTTON')

        const styled = mount(CaomeiDatePicker, {
            props: { placeholder: '选择日期' },
            attrs: {
                class: 'custom-date',
                style: 'max-width: 320px',
                'data-test': 'date-picker',
            },
        })
        const styledTrigger = styled.get('.caomei-date-picker')
        expect(styledTrigger.classes()).toContain('custom-date')
        expect(styledTrigger.attributes('style')).toContain('max-width: 320px')
        expect(styledTrigger.attributes('data-test')).toBe('date-picker')

        wrapper.unmount()
        styled.unmount()
    })

    it('受控 open 展开时 aria-controls 指向面板', async () => {
        const wrapper = mountPicker({ modelValue: new Date(2026, 8, 15), open: true })
        await nextTick()

        const controls = wrapper.get('.caomei-date-picker').attributes('aria-controls')
        expect(controls).toBeTruthy()
        expect(document.getElementById(controls as string)).not.toBeNull()

        wrapper.unmount()
    })

    it('有可见文本时不附加 aria-label', () => {
        const wrapper = mountPicker({ placeholder: '选择日期' })
        expect(wrapper.get('.caomei-date-picker').attributes('aria-label')).toBeUndefined()

        wrapper.unmount()
    })
})
