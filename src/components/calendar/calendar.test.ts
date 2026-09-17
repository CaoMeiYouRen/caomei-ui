import { mount } from '@vue/test-utils'
import { computed, defineComponent, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
import { CaomeiCalendar } from './index'

function mountCalendar(props: Record<string, unknown> = {}) {
    return mount(CaomeiCalendar, { props, attachTo: document.body })
}

describe('CaomeiCalendar', () => {
    it('label 覆盖面板可访问名，且优先于透传的 aria-label', () => {
        const custom = mountCalendar({ label: '预约日历' })
        expect(custom.get('.caomei-calendar').attributes('aria-label')).toBe('预约日历')
        custom.unmount()

        const explicit = mount(CaomeiCalendar, {
            props: { label: '预约日历' },
            attrs: { 'aria-label': '透传名' },
            attachTo: document.body,
        })
        expect(explicit.get('.caomei-calendar').attributes('aria-label')).toBe('预约日历')
        explicit.unmount()

        const forwarded = mount(CaomeiCalendar, {
            attrs: { 'aria-label': '透传名' },
            attachTo: document.body,
        })
        expect(forwarded.get('.caomei-calendar').attributes('aria-label')).toBe('透传名')
        forwarded.unmount()
    })

    it('未显式提供可访问名时保留日历的月份上下文', () => {
        const wrapper = mountCalendar({ modelValue: new Date(2026, 8, 15) })
        const name = wrapper.get('.caomei-calendar').attributes('aria-label') ?? ''

        expect(name.startsWith('日历')).toBe(true)
        expect(name).not.toBe('日历')

        wrapper.unmount()
    })

    it('渲染当前月份网格与星期表头', () => {
        const wrapper = mountCalendar({ modelValue: new Date(2026, 8, 15) })

        expect(wrapper.get('.caomei-calendar').attributes('aria-label')).toContain('日历')
        expect(wrapper.findAll('.caomei-calendar__weekday').length).toBe(7)
        expect(wrapper.findAll('.caomei-calendar__day').length).toBeGreaterThanOrEqual(28)
        expect(wrapper.get('.caomei-calendar__heading').text()).toContain('2026年')

        wrapper.unmount()
    })

    it('选中日期输出 data-selected', () => {
        const wrapper = mountCalendar({ modelValue: new Date(2026, 8, 15) })

        const selected = wrapper.get('[data-value=\'2026-09-15\']')
        expect(selected.attributes('data-selected')).toBeDefined()

        wrapper.unmount()
    })

    it('v-model 受控时选择结果同步回父级并保持选中', async () => {
        const Host = defineComponent({
            components: { CaomeiCalendar },
            setup() {
                const value = ref<Date | null>(new Date(2026, 8, 15))
                return { value }
            },
            template: '<CaomeiCalendar v-model="value" />',
        })
        const wrapper = mount(Host, { attachTo: document.body })

        await wrapper.get('[data-value=\'2026-09-20\']').trigger('click')

        expect(wrapper.get('[data-value=\'2026-09-20\']').attributes('data-selected')).toBeDefined()
        expect(wrapper.get('.caomei-calendar__heading').text()).toContain('2026年')

        wrapper.unmount()
    })

    it('defaultValue 作为非受控初始选中日期', () => {
        const wrapper = mountCalendar({ defaultValue: new Date(2026, 8, 10) })

        expect(wrapper.get('[data-value=\'2026-09-10\']').attributes('data-selected')).toBeDefined()
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()

        wrapper.unmount()
    })

    it('点击日期抛出原生 Date', async () => {
        const wrapper = mountCalendar({ modelValue: new Date(2026, 8, 15) })

        await wrapper.get('[data-value=\'2026-09-20\']').trigger('click')

        const emitted = wrapper.emitted('update:modelValue')?.[0]?.[0] as Date
        expect(emitted).toBeInstanceOf(Date)
        expect(emitted.getFullYear()).toBe(2026)
        expect(emitted.getMonth()).toBe(8)
        expect(emitted.getDate()).toBe(20)

        // 父级未回写（半受控）时也必须跟随选择，守卫 v-model 不被 props.modelValue 覆盖
        expect(wrapper.get('[data-value=\'2026-09-20\']').attributes('data-selected')).toBeDefined()

        wrapper.unmount()
    })

    it('minValue / maxValue 之外的日期禁用', () => {
        const wrapper = mountCalendar({
            modelValue: new Date(2026, 8, 15),
            minValue: new Date(2026, 8, 10),
            maxValue: new Date(2026, 8, 20),
        })

        expect(wrapper.get('[data-value=\'2026-09-09\']').attributes('data-disabled')).toBeDefined()
        expect(wrapper.get('[data-value=\'2026-09-21\']').attributes('data-disabled')).toBeDefined()
        expect(wrapper.get('[data-value=\'2026-09-15\']').attributes('data-disabled')).toBeUndefined()

        wrapper.unmount()
    })

    it('翻页切换月份', async () => {
        const wrapper = mountCalendar({ modelValue: new Date(2026, 8, 15) })

        await wrapper.get('.caomei-calendar__nav[aria-label="上个月"]').trigger('click')
        expect(wrapper.find('[data-value=\'2026-08-15\']').exists()).toBe(true)

        await wrapper.get('.caomei-calendar__nav[aria-label="下个月"]').trigger('click')
        expect(wrapper.find('[data-value=\'2026-09-15\']').exists()).toBe(true)

        wrapper.unmount()
    })

    it('disabled 时不可选并输出 data-disabled', async () => {
        const wrapper = mountCalendar({ modelValue: new Date(2026, 8, 15), disabled: true })

        expect(wrapper.get('.caomei-calendar').attributes('data-disabled')).toBeDefined()

        await wrapper.get('[data-value=\'2026-09-20\']').trigger('click')
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()

        wrapper.unmount()
    })

    it('使用注入 locale 的导航文案', () => {
        const wrapper = mount(CaomeiCalendar, {
            props: { modelValue: new Date(2026, 8, 15) },
            global: {
                provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) },
            },
        })

        expect(wrapper.get('.caomei-calendar').attributes('aria-label')).toContain('Calendar')
        expect(wrapper.find('[aria-label=\'Previous month\']').exists()).toBe(true)

        wrapper.unmount()
    })

    it('preventDeselect 时再次点击已选日期不清空', async () => {
        const wrapper = mountCalendar({
            modelValue: new Date(2026, 8, 15),
            preventDeselect: true,
        })

        await wrapper.get('[data-value=\'2026-09-15\']').trigger('click')

        const last = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Date
        expect(last.getDate()).toBe(15)

        wrapper.unmount()
    })
})
