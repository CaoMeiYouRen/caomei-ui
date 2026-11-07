import { DOMWrapper, mount } from '@vue/test-utils'
import { computed, defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
import { expectSettled } from '../../../test/helpers/settle'
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
        // 触发器经本库 CaomeiPopoverTrigger + `unstyled`：内建外观类不得合并到自持 button
        // （开合接线由其它用例的 aria-expanded 断言覆盖）
        expect(trigger.classes()).not.toContain('caomei-popover__trigger')

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
        expect(wrapper.get('.caomei-date-picker').attributes('disabled')).toBeDefined()

        wrapper.unmount()
    })

    it('未禁用时触发按钮不带 disabled', () => {
        const wrapper = mountPicker({ modelValue: new Date(2026, 8, 15) })

        expect(wrapper.get('.caomei-date-picker').attributes('disabled')).toBeUndefined()

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

    it('显式 id 且初始展开时面板引用指向真实存在的触发器', async () => {
        const wrapper = mountPicker({ id: 'start-date', open: true })
        await expectSettled(() => {
            expect(getContent().attributes('aria-labelledby')).toBe('start-date')
        })

        expect(wrapper.get('.caomei-date-picker').attributes('id')).toBe('start-date')
        expect(document.getElementById('start-date')).not.toBeNull()

        wrapper.unmount()
    })

    it('运行时切换显式 id 后 DOM id 与面板引用同步更新', async () => {
        const wrapper = mountPicker({ id: 'first-date', open: true })
        await expectSettled(() => {
            expect(getContent().attributes('aria-labelledby')).toBe('first-date')
        })

        await wrapper.setProps({ id: 'second-date' })
        await expectSettled(() => {
            expect(wrapper.get('.caomei-date-picker').attributes('id')).toBe('second-date')
            expect(getContent().attributes('aria-labelledby')).toBe('second-date')
        })

        wrapper.unmount()
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

describe('CaomeiDatePicker selectionMode="range"', () => {
    const range = [new Date(2026, 8, 10), new Date(2026, 8, 20)] as [Date, Date]
    // 面板默认显示「今天」所在月；交互类用例以 9 月锚点区间把面板定位到受检月份
    const anchor = [new Date(2026, 8, 1), new Date(2026, 8, 2)] as [Date, Date]

    async function openPanel(trigger: () => Promise<unknown>): Promise<void> {
        await trigger()
        await expectSettled(() => {
            expect(getContent().findAll('.caomei-calendar__day').length).toBeGreaterThan(0)
        })
    }

    function cell(day: string): DOMWrapper<Element> {
        return getContent().find(`[data-value='${day}']`)
    }

    /** 先聚焦 / hover 再点击：Reka 以 focusedValue 判定第二次点击是「确定终点」而非「重设起点」 */
    async function pick(day: string): Promise<void> {
        await cell(day).trigger('focusin')
        await cell(day).trigger('mouseenter')
        await nextTick()
        await cell(day).trigger('click')
    }

    /** 选定起点后等待选择态提交（`startValue` 派生），避免并行负载下第二次点击落到未提交的起点 */
    async function pickStart(day: string): Promise<void> {
        await pick(day)
        await expectSettled(() => {
            expect(cell(day).attributes('data-selection-start')).toBeDefined()
        })
    }

    function emittedRange(wrapper: ReturnType<typeof mountPicker>, index = 0): [Date, Date] {
        return wrapper.emitted('update:modelValue')?.[index]?.[0] as [Date, Date]
    }

    it('按 dateFormat 展示闭区间文本', () => {
        const wrapper = mountPicker({
            selectionMode: 'range',
            modelValue: range,
            dateFormat: 'yy-mm-dd',
        })

        expect(wrapper.get('.caomei-date-picker').text()).toContain('26-09-10 – 26-09-20')

        wrapper.unmount()
    })

    it('未选择时使用「日期范围」兜底可访问名', () => {
        const wrapper = mountPicker({ selectionMode: 'range' })

        expect(wrapper.get('.caomei-date-picker').attributes('aria-label')).toBe('日期范围')

        wrapper.unmount()
    })

    it('已选区间时可访问名保留可见文本并补开始 / 结束语义', () => {
        const wrapper = mountPicker({
            selectionMode: 'range',
            modelValue: range,
            dateFormat: 'yy-mm-dd',
        })
        const trigger = wrapper.get('.caomei-date-picker')

        // Label in Name（WCAG 2.5.3）：不得用 aria-label 覆盖可见区间文本
        expect(trigger.attributes('aria-label')).toBeUndefined()
        expect(trigger.text()).toContain('26-09-10 – 26-09-20')
        expect(trigger.text()).toContain('开始 / 结束')

        wrapper.unmount()
    })

    it('显式 label 与透传 aria-label 仍优先于区间兜底名', () => {
        const labeled = mountPicker({ selectionMode: 'range', modelValue: range, label: '筛选区间' })
        expect(labeled.get('.caomei-date-picker').attributes('aria-label')).toBe('筛选区间')
        labeled.unmount()

        const forwarded = mount(CaomeiDatePicker, {
            props: { selectionMode: 'range' as const, modelValue: range },
            attrs: { 'aria-label': '透传区间名' },
            attachTo: document.body,
        })
        expect(forwarded.get('.caomei-date-picker').attributes('aria-label')).toBe('透传区间名')
        forwarded.unmount()
    })

    it('依次点击起点与终点后抛出原生 Date 二元组并收起面板', async () => {
        const wrapper = mountPicker({ selectionMode: 'range', modelValue: anchor })
        await openPanel(() => wrapper.get('.caomei-date-picker').trigger('click'))

        await pickStart('2026-09-10')
        // 只选到起点时不得写回模型（半开区间不对外），面板保持展开
        await expectSettled(() => {
            expect(wrapper.emitted('update:modelValue')).toBeUndefined()
            expect(wrapper.get('.caomei-date-picker').attributes('aria-expanded')).toBe('true')
        })

        await pick('2026-09-20')
        await expectSettled(() => {
            expect(wrapper.get('.caomei-date-picker').attributes('aria-expanded')).toBe('false')
        })
        const emitted = emittedRange(wrapper)
        expect(Array.isArray(emitted)).toBe(true)
        expect(emitted[0]).toBeInstanceOf(Date)
        expect(emitted[1]).toBeInstanceOf(Date)
        expect([emitted[0].getDate(), emitted[1].getDate()]).toEqual([10, 20])

        wrapper.unmount()
    })

    it('受控 v-model 回写后区间保持', async () => {
        const wrapper = mount(defineComponent({
            components: { CaomeiDatePicker },
            setup() {
                const value = ref<[Date, Date] | null>(anchor)
                return { value }
            },
            template: '<CaomeiDatePicker v-model="value" selection-mode="range" date-format="yy-mm-dd" />',
        }), { attachTo: document.body })

        await openPanel(() => wrapper.get('.caomei-date-picker').trigger('click'))
        await pickStart('2026-09-10')
        await pick('2026-09-20')
        await expectSettled(() => {
            expect(wrapper.get('.caomei-date-picker').text()).toContain('26-09-10 – 26-09-20')
        })
        expect(wrapper.get('.caomei-date-picker').attributes('aria-expanded')).toBe('false')

        // 回写后再次展开：端点仍按区间渲染（受控写回未把 Reka 内部起点清空）
        await openPanel(() => wrapper.get('.caomei-date-picker').trigger('click'))
        expect(cell('2026-09-10').attributes('data-selection-start')).toBeDefined()
        expect(cell('2026-09-20').attributes('data-selection-end')).toBeDefined()

        wrapper.unmount()
    })

    it('非受控（不传 modelValue）可完成区间选择', async () => {
        const wrapper = mountPicker({ selectionMode: 'range', dateFormat: 'yy-mm-dd' })
        await openPanel(() => wrapper.get('.caomei-date-picker').trigger('click'))

        // 面板初始显示「今天」所在月；取当月前几个非跨月日期，避免依赖系统时钟
        const days = getContent().findAll('.caomei-calendar__day:not([data-outside-view])')
        const startValue = String(days[0].attributes('data-value'))
        const endValue = String(days[4].attributes('data-value'))

        await pickStart(startValue)
        await pick(endValue)
        await expectSettled(() => {
            expect(wrapper.get('.caomei-date-picker').attributes('aria-expanded')).toBe('false')
        })
        expect(wrapper.get('.caomei-date-picker').text()).toContain(' – ')
        expect(wrapper.get('.caomei-date-picker').text()).toContain(startValue.slice(5))

        wrapper.unmount()
    })

    it('反向点击（先终点后起点）归一化为升序闭区间', async () => {
        const wrapper = mountPicker({ selectionMode: 'range', modelValue: anchor })
        await openPanel(() => wrapper.get('.caomei-date-picker').trigger('click'))

        await pickStart('2026-09-20')
        await pick('2026-09-10')
        await expectSettled(() => {
            expect(wrapper.emitted('update:modelValue')).toBeDefined()
        })
        const emitted = emittedRange(wrapper)
        expect([emitted[0].getDate(), emitted[1].getDate()]).toEqual([10, 20])

        wrapper.unmount()
    })

    it('已选同一闭区间时再次点击同一天取消并抛出 null', async () => {
        const wrapper = mountPicker({ selectionMode: 'range', modelValue: anchor, closeOnSelect: false })
        await openPanel(() => wrapper.get('.caomei-date-picker').trigger('click'))

        // 同一天既作起点又作终点：两次点击生成单日闭区间
        await pickStart('2026-09-15')
        await pick('2026-09-15')
        await expectSettled(() => {
            expect(wrapper.emitted('update:modelValue')).toBeDefined()
        })
        const singleDay = emittedRange(wrapper)
        expect([singleDay[0].getDate(), singleDay[1].getDate()]).toEqual([15, 15])

        // 已存在完整区间时再次点击同一天 → 取消整个区间
        await cell('2026-09-15').trigger('click')
        await expectSettled(() => {
            expect(wrapper.emitted('update:modelValue')?.[1]?.[0]).toBeNull()
        })

        wrapper.unmount()
    })

    it('closeOnSelect 为 false 时保持面板展开', async () => {
        const wrapper = mountPicker({ selectionMode: 'range', modelValue: anchor, closeOnSelect: false })
        await openPanel(() => wrapper.get('.caomei-date-picker').trigger('click'))

        await pickStart('2026-09-10')
        await pick('2026-09-20')
        await expectSettled(() => {
            expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBeInstanceOf(Array)
        })
        expect(wrapper.get('.caomei-date-picker').attributes('aria-expanded')).toBe('true')

        wrapper.unmount()
    })

    it('受控模型在面板中显示为已选区间', async () => {
        const wrapper = mountPicker({ selectionMode: 'range', modelValue: range, open: true })
        await expectSettled(() => {
            expect(getContent().findAll('.caomei-calendar__day').length).toBeGreaterThan(0)
        })

        expect(cell('2026-09-10').attributes('data-selection-start')).toBeDefined()
        expect(cell('2026-09-20').attributes('data-selection-end')).toBeDefined()
        expect(cell('2026-09-15').attributes('data-selected')).toBeDefined()

        wrapper.unmount()
    })

    it('minValue / maxValue 之外的日期禁用', async () => {
        const wrapper = mountPicker({
            selectionMode: 'range',
            modelValue: anchor,
            minValue: new Date(2026, 8, 10),
            maxValue: new Date(2026, 8, 20),
        })
        await openPanel(() => wrapper.get('.caomei-date-picker').trigger('click'))

        expect(cell('2026-09-09').attributes('data-disabled')).toBeDefined()
        expect(cell('2026-09-21').attributes('data-disabled')).toBeDefined()

        wrapper.unmount()
    })

    it('键盘可用方向键移动焦点并用 Enter 确定两端', async () => {
        const wrapper = mountPicker({ selectionMode: 'range', modelValue: anchor, open: true })
        await expectSettled(() => {
            expect(getContent().findAll('.caomei-calendar__day').length).toBeGreaterThan(0)
        })

        await cell('2026-09-10').trigger('focusin')
        await cell('2026-09-10').trigger('keydown', { code: 'ArrowRight', key: 'ArrowRight' })
        await cell('2026-09-10').trigger('keydown', { code: 'Enter', key: 'Enter' })
        await cell('2026-09-15').trigger('focusin')
        await cell('2026-09-15').trigger('keydown', { code: 'Enter', key: 'Enter' })

        await expectSettled(() => {
            expect(wrapper.emitted('update:modelValue')).toBeDefined()
        })
        const emitted = emittedRange(wrapper)
        expect([emitted[0].getDate(), emitted[1].getDate()]).toEqual([10, 15])

        wrapper.unmount()
    })

    it('面板使用本地化可访问名', async () => {
        const wrapper = mountPicker({ selectionMode: 'range', modelValue: anchor, open: true })
        await expectSettled(() => {
            expect(getContent().get('.caomei-calendar').attributes('aria-label')).toContain('日历')
        })

        wrapper.unmount()
    })

    it('range 模式忽略 showTime 并给出开发期告警', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
        const wrapper = mountPicker({
            selectionMode: 'range',
            modelValue: range,
            showTime: true,
        })

        expect(document.body.querySelector('.caomei-date-picker__time')).toBeNull()
        expect(warn.mock.calls.some(([message]) => String(message).includes('不支持 showTime'))).toBe(true)

        wrapper.unmount()
        warn.mockRestore()
    })

    it('single 模式模型不受区间值污染', () => {
        const wrapper = mountPicker({ modelValue: range, dateFormat: 'yy-mm-dd' })

        expect(wrapper.get('.caomei-date-picker').text()).not.toContain('26-09-10')

        wrapper.unmount()
    })
})
