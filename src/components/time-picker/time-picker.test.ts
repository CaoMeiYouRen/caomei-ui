import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { CaomeiTimePicker } from './index'

const HOUR = 'input[aria-label="时"]'
const MINUTE = 'input[aria-label="分"]'
const SECOND = 'input[aria-label="秒"]'

/** 读取输入框当前值（happy-dom 下元素类型由测试工具推断，统一收窄）。 */
function inputValue(wrapper: ReturnType<typeof mount>, selector: string): string {
    return (wrapper.get(selector).element as HTMLInputElement).value
}

afterEach(() => {
    document.body.innerHTML = ''
})

describe('CaomeiTimePicker', () => {
    it('渲染标签、可访问名与时分输入（默认 24 小时制、不含秒）', () => {
        const wrapper = mount(CaomeiTimePicker, {
            props: { label: '时间', modelValue: new Date(2026, 0, 1, 9, 30, 0) },
        })
        expect(wrapper.find('[role="group"]').attributes('aria-label')).toBe('时间')
        expect(wrapper.findAll('input')).toHaveLength(2)
        expect(inputValue(wrapper, HOUR)).toBe('9')
        expect(inputValue(wrapper, MINUTE)).toBe('30')
        wrapper.unmount()
    })

    it('showSeconds 渲染秒输入并展示秒值', () => {
        const wrapper = mount(CaomeiTimePicker, {
            props: { label: '时间', showSeconds: true, modelValue: new Date(2026, 0, 1, 9, 30, 45) },
        })
        expect(wrapper.findAll('input')).toHaveLength(3)
        expect(inputValue(wrapper, SECOND)).toBe('45')
        wrapper.unmount()
    })

    it('hourFormat=12 显示 1–12 小时并提供本地化日序选择', () => {
        const wrapper = mount(CaomeiTimePicker, {
            props: { label: '时间', hourFormat: '12', modelValue: new Date(2026, 0, 1, 15, 30, 0) },
        })
        expect(inputValue(wrapper, HOUR), '15 点应显示为 3').toBe('3')
        expect(wrapper.get(HOUR).attributes('min')).toBe('1')
        expect(wrapper.get(HOUR).attributes('max')).toBe('12')
        const options = wrapper.findAll('select option')
        expect(options.map((option) => option.text())).toEqual(['上午', '下午'])
        expect((wrapper.get('select').element as HTMLSelectElement).value).toBe('pm')
        wrapper.unmount()
    })

    it('12 小时制切换日序：只改小时并抛出 Date', async () => {
        const wrapper = mount(CaomeiTimePicker, {
            props: { label: '时间', hourFormat: '12', modelValue: new Date(2026, 0, 1, 3, 30, 0) },
        })
        await wrapper.get('select').setValue('pm')
        const value = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Date
        expect(value.getHours()).toBe(15)
        expect(value.getMinutes()).toBe(30)
        wrapper.unmount()
    })

    it('编辑分钟抛出 Date 并保留日期部分', async () => {
        const wrapper = mount(CaomeiTimePicker, {
            props: { label: '时间', modelValue: new Date(2026, 4, 6, 9, 30, 0) },
        })
        const minute = wrapper.get(MINUTE)
        await minute.setValue('45')
        await minute.trigger('change')
        await nextTick()
        const value = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Date
        expect(value).toBeInstanceOf(Date)
        expect(value.getFullYear()).toBe(2026)
        expect(value.getMonth()).toBe(4)
        expect(value.getDate()).toBe(6)
        expect(value.getMinutes()).toBe(45)
        wrapper.unmount()
    })

    it('方向键按 step 调整（minute 步进 5、hour 步进 2）', async () => {
        const wrapper = mount(CaomeiTimePicker, {
            props: {
                label: '时间',
                modelValue: new Date(2026, 0, 1, 9, 30, 0),
                step: { minute: 5, hour: 2 },
            },
        })
        await wrapper.get(MINUTE).trigger('keydown', { key: 'ArrowUp' })
        expect((wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Date).getMinutes()).toBe(35)

        await wrapper.get(HOUR).trigger('keydown', { key: 'ArrowDown' })
        expect((wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Date).getHours()).toBe(7)
        wrapper.unmount()
    })

    it('min / max 把结果夹到区间内', async () => {
        const wrapper = mount(CaomeiTimePicker, {
            props: {
                label: '时间',
                modelValue: new Date(2026, 0, 1, 9, 30, 0),
                minValue: new Date(2026, 0, 1, 9, 0, 0),
                maxValue: new Date(2026, 0, 1, 18, 0, 0),
            },
        })
        const hour = wrapper.get(HOUR)
        await hour.setValue('8')
        await hour.trigger('change')
        expect((wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Date).getHours()).toBe(9)

        await hour.setValue('20')
        await hour.trigger('change')
        expect((wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Date).getHours()).toBe(18)
        wrapper.unmount()
    })

    it('disabled / readonly 作用在输入与日序选择上，且 readonly 下方向键不改值', async () => {
        const disabled = mount(CaomeiTimePicker, {
            props: { label: '时间', hourFormat: '12', disabled: true, modelValue: new Date(2026, 0, 1, 9, 0, 0) },
        })
        expect(disabled.get(HOUR).attributes('disabled')).toBeDefined()
        expect(disabled.get('select').attributes('disabled')).toBeDefined()
        disabled.unmount()

        const readonly = mount(CaomeiTimePicker, {
            props: { label: '时间', hourFormat: '12', readonly: true, modelValue: new Date(2026, 0, 1, 9, 0, 0) },
        })
        expect(readonly.get(HOUR).attributes('readonly')).toBeDefined()
        expect(readonly.get('select').attributes('aria-readonly')).toBe('true')
        await readonly.get(HOUR).trigger('keydown', { key: 'ArrowUp' })
        expect(readonly.emitted('update:modelValue'), 'readonly 下方向键不得改写值').toBeUndefined()
        readonly.unmount()
    })

    it('min > max 的跨日区间不夹取（保留编辑值）', async () => {
        const wrapper = mount(CaomeiTimePicker, {
            props: {
                label: '时间',
                modelValue: new Date(2026, 0, 1, 12, 0, 0),
                minValue: new Date(2026, 0, 1, 23, 0, 0),
                maxValue: new Date(2026, 0, 1, 1, 0, 0),
            },
        })
        const hour = wrapper.get(HOUR)
        await hour.setValue('5')
        await hour.trigger('change')
        expect((wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Date).getHours()).toBe(5)
        wrapper.unmount()
    })

    it('空值与非法日期显示为空（不把未填读成 0 点）', () => {
        const empty = mount(CaomeiTimePicker, { props: { label: '时间', modelValue: null } })
        expect(inputValue(empty, HOUR)).toBe('')
        expect(inputValue(empty, MINUTE)).toBe('')
        empty.unmount()

        const invalid = mount(CaomeiTimePicker, { props: { label: '时间', modelValue: new Date(Number.NaN) } })
        expect(inputValue(invalid, HOUR)).toBe('')
        invalid.unmount()
    })

    it('自定义 ariaLabel 覆盖可见标签作为可访问名（不再输出 aria-labelledby）', () => {
        const wrapper = mount(CaomeiTimePicker, {
            props: { label: '时间', ariaLabel: '会议开始时间', modelValue: null },
        })
        const group = wrapper.get('[role="group"]')
        expect(group.attributes('aria-label')).toBe('会议开始时间')
        expect(group.attributes('aria-labelledby')).toBeUndefined()
        wrapper.unmount()
    })
})
