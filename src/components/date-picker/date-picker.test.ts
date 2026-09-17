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

    describe('showTime', () => {
        it('渲染时 / 分输入并展示时间', async () => {
            const wrapper = mountPicker({
                modelValue: new Date(2026, 8, 5, 14, 30),
                showTime: true,
                dateFormat: 'yy-mm-dd',
            })

            expect(wrapper.get('.caomei-date-picker').text()).toContain('26-09-05 14:30')

            await wrapper.get('.caomei-date-picker').trigger('click')
            await nextTick()

            const fields = getContent().findAll('.caomei-time-input__field')
            expect(fields).toHaveLength(2)
            expect((fields[0].element as HTMLInputElement).value).toBe('14')
            expect((fields[1].element as HTMLInputElement).value).toBe('30')
            expect(getContent().get('.caomei-time-input').attributes('aria-label')).toBe('时间')

            wrapper.unmount()
        })

        it('showSeconds 增加秒输入', async () => {
            const wrapper = mountPicker({
                modelValue: new Date(2026, 8, 5, 14, 30, 9),
                showTime: true,
                showSeconds: true,
            })

            await wrapper.get('.caomei-date-picker').trigger('click')
            await nextTick()

            const fields = getContent().findAll('.caomei-time-input__field')
            expect(fields).toHaveLength(3)
            expect((fields[2].element as HTMLInputElement).value).toBe('9')

            wrapper.unmount()
        })

        it('编辑时间同步回模型且保留日期', async () => {
            const wrapper = mountPicker({
                modelValue: new Date(2026, 8, 5, 14, 30),
                showTime: true,
            })

            await wrapper.get('.caomei-date-picker').trigger('click')
            await nextTick()
            await getContent().findAll('.caomei-time-input__field')[0].setValue('9')
            await nextTick()

            const emitted = wrapper.emitted('update:modelValue')?.[0]?.[0] as Date
            expect(emitted.getDate()).toBe(5)
            expect(emitted.getHours()).toBe(9)
            expect(emitted.getMinutes()).toBe(30)

            wrapper.unmount()
        })

        it('hourFormat 为 12 时按日序换算小时', async () => {
            const wrapper = mountPicker({
                modelValue: new Date(2026, 8, 5, 14, 30),
                showTime: true,
                hourFormat: '12',
            })

            await wrapper.get('.caomei-date-picker').trigger('click')
            await nextTick()

            const field = getContent().get('.caomei-time-input__field')
            const period = getContent().get('.caomei-time-input__period')
            expect((field.element as HTMLInputElement).value).toBe('2')
            expect((period.element as HTMLSelectElement).value).toBe('pm')
            expect(wrapper.get('.caomei-date-picker').text()).toContain('02:30')

            // 切到上午应把 14 点换算为 2 点
            await period.setValue('am')
            await nextTick()
            const afternoon = wrapper.emitted('update:modelValue')?.[0]?.[0] as Date
            expect(afternoon.getHours()).toBe(2)

            wrapper.unmount()
        })

        it('选日期时保留已选时间且面板保持展开', async () => {
            const wrapper = mountPicker({
                modelValue: new Date(2026, 8, 15, 14, 30),
                showTime: true,
            })

            await wrapper.get('.caomei-date-picker').trigger('click')
            await nextTick()
            await getContent().find('[data-value=\'2026-09-20\']').trigger('click')
            await nextTick()

            const emitted = wrapper.emitted('update:modelValue')?.[0]?.[0] as Date
            expect(emitted.getDate()).toBe(20)
            expect(emitted.getHours()).toBe(14)
            expect(emitted.getMinutes()).toBe(30)
            expect(wrapper.get('.caomei-date-picker').attributes('aria-expanded')).toBe('true')

            wrapper.unmount()
        })

        it('readonly 时脚本改值不生效且 DOM 回滚', async () => {
            const wrapper = mountPicker({
                modelValue: new Date(2026, 8, 5, 14, 30),
                showTime: true,
                hourFormat: '12',
                readonly: true,
            })

            await wrapper.get('.caomei-date-picker').trigger('click')
            await nextTick()
            const field = getContent().get('.caomei-time-input__field')
            await field.setValue('9')
            await nextTick()

            expect(wrapper.emitted('update:modelValue')).toBeUndefined()
            expect((field.element as HTMLInputElement).value).toBe('2')

            const period = getContent().get('.caomei-time-input__period')
            expect(period.attributes('aria-readonly')).toBe('true')
            await period.setValue('am')
            await nextTick()
            expect((period.element as HTMLSelectElement).value).toBe('pm')

            wrapper.unmount()
        })

        it('未选日期时时间输入禁用，选中后启用', async () => {
            const wrapper = mountPicker({ modelValue: null, showTime: true })

            await wrapper.get('.caomei-date-picker').trigger('click')
            await nextTick()
            expect(getContent().get('.caomei-time-input__field').attributes('disabled')).toBeDefined()

            await wrapper.setProps({ modelValue: new Date(2026, 8, 5, 14, 30) })
            await nextTick()
            expect(getContent().get('.caomei-time-input__field').attributes('disabled')).toBeUndefined()

            wrapper.unmount()
        })

        it('超出范围的时间输入被钳位，空输入不改写模型', async () => {
            const wrapper = mountPicker({
                modelValue: new Date(2026, 8, 5, 14, 30, 9),
                showTime: true,
                showSeconds: true,
            })

            await wrapper.get('.caomei-date-picker').trigger('click')
            await nextTick()

            const fields = getContent().findAll('.caomei-time-input__field')
            await fields[0].setValue('99')
            await nextTick()
            expect((wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Date).getHours()).toBe(23)

            await fields[1].setValue('99')
            await nextTick()
            expect((wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Date).getMinutes()).toBe(59)

            const emissions = wrapper.emitted('update:modelValue')?.length
            await fields[0].setValue('')
            await nextTick()
            expect(wrapper.emitted('update:modelValue')?.length).toBe(emissions)
            expect((fields[0].element as HTMLInputElement).value).toBe('23')

            wrapper.unmount()
        })

        it('未开启 showTime 时不渲染时间字段', async () => {
            const wrapper = mountPicker({ modelValue: new Date(2026, 8, 15) })

            await wrapper.get('.caomei-date-picker').trigger('click')
            await nextTick()

            expect(document.body.querySelector('.caomei-date-picker__time')).toBeNull()

            wrapper.unmount()
        })
    })

    it('纯日期模式下再次点击已选日期取消选择并收起面板', async () => {
        const wrapper = mountPicker({ modelValue: new Date(2026, 8, 15) })

        await wrapper.get('.caomei-date-picker').trigger('click')
        await nextTick()
        await getContent().find('[data-value=\'2026-09-15\']').trigger('click')
        await nextTick()

        expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBeNull()
        expect(wrapper.get('.caomei-date-picker').attributes('aria-expanded')).toBe('false')

        wrapper.unmount()
    })

    it('有可见文本时不附加 aria-label', () => {
        const wrapper = mountPicker({ placeholder: '选择日期' })
        expect(wrapper.get('.caomei-date-picker').attributes('aria-label')).toBeUndefined()

        wrapper.unmount()
    })

    it('label 优先于透传的 aria-label，缺省时透传值优先于内建文案', () => {
        const explicit = mount(CaomeiDatePicker, {
            props: { label: '显式名' },
            attrs: { 'aria-label': '透传名' },
            attachTo: document.body,
        })
        expect(explicit.get('.caomei-date-picker').attributes('aria-label')).toBe('显式名')
        explicit.unmount()

        const forwarded = mount(CaomeiDatePicker, {
            attrs: { 'aria-label': '透传名' },
            attachTo: document.body,
        })
        expect(forwarded.get('.caomei-date-picker').attributes('aria-label')).toBe('透传名')
        forwarded.unmount()
    })
})
