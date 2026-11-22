import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { DOMWrapper, mount } from '@vue/test-utils'
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

/** Portal 内容不在 wrapper 内，按文档查询后包装。 */
function getWheelContent(): DOMWrapper<Element> {
    const content = document.body.querySelector('.caomei-time-picker__content')
    expect(content).not.toBeNull()
    return new DOMWrapper(content as Element)
}

function optionByText(column: { element: Element }, text: string): DOMWrapper<Element> {
    const option = [...column.element.querySelectorAll('[role="option"]')]
        .find((element) => element.textContent?.trim() === text)
    expect(option, `未找到选项「${text}」`).toBeDefined()
    return new DOMWrapper(option as Element)
}

afterEach(() => {
    document.body.innerHTML = ''
})

describe('CaomeiTimePicker', () => {
    it('默认 24 小时制、保留秒并补 0 展示', () => {
        const wrapper = mount(CaomeiTimePicker, {
            props: { label: '时间', modelValue: new Date(2026, 0, 1, 9, 30, 5) },
        })
        expect(wrapper.find('[role="group"]').attributes('aria-label')).toBe('时间')
        expect(wrapper.findAll('input')).toHaveLength(3)
        expect(inputValue(wrapper, HOUR)).toBe('09')
        expect(inputValue(wrapper, MINUTE)).toBe('30')
        expect(inputValue(wrapper, SECOND)).toBe('05')
        wrapper.unmount()
    })

    it('showSeconds=false 回退到分钟精度，pad=false 关闭补 0', () => {
        const minuteOnly = mount(CaomeiTimePicker, {
            props: { label: '时间', showSeconds: false, modelValue: new Date(2026, 0, 1, 9, 30, 45) },
        })
        expect(minuteOnly.findAll('input')).toHaveLength(2)
        expect(inputValue(minuteOnly, HOUR)).toBe('09')
        minuteOnly.unmount()

        const unpadded = mount(CaomeiTimePicker, {
            props: { label: '时间', pad: false, modelValue: new Date(2026, 0, 1, 9, 30, 5) },
        })
        expect(inputValue(unpadded, HOUR)).toBe('9')
        expect(inputValue(unpadded, SECOND)).toBe('5')
        unpadded.unmount()
    })

    it('hourFormat=12 显示 1–12 小时并提供本地化日序选择', () => {
        const wrapper = mount(CaomeiTimePicker, {
            props: { label: '时间', hourFormat: '12', modelValue: new Date(2026, 0, 1, 15, 30, 0) },
        })
        expect(inputValue(wrapper, HOUR), '15 点应显示为 03').toBe('03')
        expect(wrapper.get(HOUR).attributes('inputmode'), '数字键盘提示应保留').toBe('numeric')
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

describe('CaomeiTimePicker 选择模式', () => {
    it('默认 input 模式不渲染滚轮入口', () => {
        const wrapper = mount(CaomeiTimePicker, {
            props: { label: '时间', modelValue: new Date(2026, 0, 1, 9, 30, 0) },
            attachTo: document.body,
        })
        expect(wrapper.find('.caomei-time-picker__wheel-trigger').exists()).toBe(false)
        expect(wrapper.findAll('input')).toHaveLength(3)
        wrapper.unmount()
    })

    it('wheel 模式只读展示，弹层内提供时 / 分两列并回写选择', async () => {
        const wrapper = mount(CaomeiTimePicker, {
            props: { label: '时间', mode: 'wheel', modelValue: new Date(2026, 0, 1, 9, 30, 0) },
            attachTo: document.body,
        })
        expect(wrapper.findAll('input')).toHaveLength(0)
        expect(wrapper.get('.caomei-time-picker__wheel-text').text()).toBe('09:30:00')

        await wrapper.get('.caomei-time-picker__trigger--fill').trigger('click')
        await nextTick()
        const content = getWheelContent()
        expect(content.findAll('[role="listbox"]')).toHaveLength(3)

        const minuteColumn = content.get('[role="listbox"][aria-label="分"]')
        await optionByText(minuteColumn, '45').trigger('click')
        expect((wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Date).getMinutes()).toBe(45)
        wrapper.unmount()
    })

    it('both 模式保留输入并增加滚轮入口', async () => {
        const wrapper = mount(CaomeiTimePicker, {
            props: { label: '时间', mode: 'both', modelValue: new Date(2026, 0, 1, 9, 30, 0) },
            attachTo: document.body,
        })
        expect(wrapper.findAll('input')).toHaveLength(3)
        await wrapper.get('.caomei-time-picker__wheel-trigger').trigger('click')
        await nextTick()

        const hourColumn = getWheelContent().get('[role="listbox"][aria-label="时"]')
        await optionByText(hourColumn, '10').trigger('click')
        const value = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Date
        expect(value.getHours()).toBe(10)
        expect(value.getMinutes()).toBe(30)
        wrapper.unmount()
    })

    it('12 小时制滚轮提供本地化日序列，切换后按 24 小时回写', async () => {
        const wrapper = mount(CaomeiTimePicker, {
            props: {
                label: '时间',
                mode: 'wheel',
                hourFormat: '12',
                modelValue: new Date(2026, 0, 1, 15, 30, 0),
            },
            attachTo: document.body,
        })
        await wrapper.get('.caomei-time-picker__trigger--fill').trigger('click')
        await nextTick()
        const content = getWheelContent()
        const columns = content.findAll('[role="listbox"]')
        expect(columns).toHaveLength(4)

        await optionByText(columns.at(-1) as { element: Element }, '上午').trigger('click')
        expect((wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Date).getHours()).toBe(3)
        wrapper.unmount()
    })

    it('wheel 模式把非法日期按空值处理，不回写 NaN', async () => {
        const wrapper = mount(CaomeiTimePicker, {
            props: { label: '时间', mode: 'wheel', modelValue: new Date(Number.NaN) },
            attachTo: document.body,
        })
        await wrapper.get('.caomei-time-picker__trigger--fill').trigger('click')
        await nextTick()
        const minuteColumn = getWheelContent().get('[role="listbox"][aria-label="分"]')
        await optionByText(minuteColumn, '45').trigger('click')

        const value = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Date
        expect(Number.isNaN(value.getTime())).toBe(false)
        expect(value.getHours()).toBe(0)
        expect(value.getMinutes()).toBe(45)
        wrapper.unmount()
    })

    it('空值展示占位；disabled 入口不可用，readonly 可打开只读面板', async () => {
        const empty = mount(CaomeiTimePicker, {
            props: { label: '时间', mode: 'wheel', modelValue: null },
            attachTo: document.body,
        })
        expect(empty.get('.caomei-time-picker__wheel-text').text()).toBe('--:--:--')
        empty.unmount()

        const disabled = mount(CaomeiTimePicker, {
            props: { label: '时间', mode: 'wheel', disabled: true, modelValue: new Date(2026, 0, 1, 9, 0, 0) },
            attachTo: document.body,
        })
        expect(disabled.get('.caomei-time-picker__trigger--fill').attributes('disabled')).toBeDefined()
        disabled.unmount()

        const readonly = mount(CaomeiTimePicker, {
            props: { label: '时间', mode: 'wheel', readonly: true, modelValue: new Date(2026, 0, 1, 9, 0, 0) },
            attachTo: document.body,
        })
        expect(readonly.get('.caomei-time-picker__trigger--fill').attributes('disabled')).toBeUndefined()
        await readonly.get('.caomei-time-picker__trigger--fill').trigger('click')
        await nextTick()
        const column = getWheelContent().get('[role="listbox"][aria-label="时"]')
        expect(column.attributes('aria-readonly')).toBe('true')
        expect(column.attributes('tabindex')).toBe('-1')
        readonly.unmount()
    })
})

describe('TimePicker 滚轮列可访问名', () => {
    it('非空标签经 labelAttrs 落为 aria-label，空标签不输出该属性', async () => {
        const { default: WheelColumn } = await import('./wheel-column.vue')
        const labeled = mount(WheelColumn, {
            props: {
                label: '小时',
                options: [{ label: '00', value: 0 }, { label: '01', value: 1 }],
                modelValue: 0,
            },
        })
        expect(labeled.get('[role="listbox"]').attributes('aria-label')).toBe('小时')
        labeled.unmount()

        const unlabeled = mount(WheelColumn, {
            props: {
                label: '',
                options: [{ label: '00', value: 0 }],
                modelValue: 0,
            },
        })
        expect(unlabeled.get('[role="listbox"]').attributes('aria-label')).toBeUndefined()
        unlabeled.unmount()
    })

    it('模板中不再直接绑定 :aria-label（回归守卫）', () => {
        const source = readFileSync(join(process.cwd(), 'src/components/time-picker/wheel-column.vue'), 'utf8')
        expect(source).not.toContain(':aria-label="label"')
        expect(source).toContain('labelAttrs(label)')
    })
})
