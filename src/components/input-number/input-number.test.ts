import { flushPromises, mount, type DOMWrapper } from '@vue/test-utils'
import { computed } from 'vue'
import { describe, expect, it } from 'vitest'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
import type { InputNumberProps } from './types'
import { CaomeiInputNumber } from './index'

async function mountReady(
    props: InputNumberProps & { modelValue?: number | null },
): Promise<ReturnType<typeof mount>> {
    const wrapper = mount(CaomeiInputNumber, { props })
    await flushPromises()
    return wrapper
}

async function press(button: DOMWrapper<Element>): Promise<void> {
    await button.trigger('pointerdown')
    await button.trigger('pointerup')
}

describe('CaomeiInputNumber', () => {
    it('渲染 spinbutton、默认尺寸与增减按钮', () => {
        const wrapper = mount(CaomeiInputNumber, {
            props: { placeholder: '请输入' },
        })

        const input = wrapper.get('input')
        expect(input.attributes('type')).toBe('text')
        expect(input.attributes('role')).toBe('spinbutton')
        expect(input.attributes('placeholder')).toBe('请输入')
        expect(wrapper.get('.caomei-input-number').classes()).toContain('caomei-input-number--md')

        const buttons = wrapper.findAll('.caomei-input-number__button')
        expect(buttons).toHaveLength(2)
        expect(buttons[0].attributes('aria-label')).toBe('减少')
        expect(buttons[1].attributes('aria-label')).toBe('增加')
    })

    it('controls 为 false 时不渲染增减按钮', () => {
        const wrapper = mount(CaomeiInputNumber, { props: { controls: false } })
        expect(wrapper.findAll('.caomei-input-number__button')).toHaveLength(0)
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸样式 %s', (size) => {
        const wrapper = mount(CaomeiInputNumber, { props: { size } })
        expect(wrapper.get('.caomei-input-number').classes()).toContain(`caomei-input-number--${size}`)
    })

    it('默认使用分组分隔符', () => {
        const wrapper = mount(CaomeiInputNumber, { props: { modelValue: 1234567 } })
        expect(wrapper.get('input').element.value).toBe('1,234,567')
    })

    it('useGrouping 为 false 时不使用分组分隔符', () => {
        const wrapper = mount(CaomeiInputNumber, {
            props: { modelValue: 1234567, useGrouping: false },
        })
        expect(wrapper.get('input').element.value).toBe('1234567')
    })

    it('minFractionDigits 补足小数位展示', () => {
        const wrapper = mount(CaomeiInputNumber, { props: { modelValue: 10, minFractionDigits: 2 } })
        expect(wrapper.get('input').element.value).toBe('10.00')
    })

    it('maxFractionDigits 取整模型并限制展示小数位', async () => {
        const wrapper = mount(CaomeiInputNumber, {
            props: { modelValue: 1.239, maxFractionDigits: 2 },
        })
        expect(wrapper.get('input').element.value).toBe('1.24')

        await wrapper.get('input').trigger('blur')
        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1.24])
    })

    it('precision 优先于 maxFractionDigits 取整', async () => {
        const wrapper = mount(CaomeiInputNumber, {
            props: { modelValue: 1.239, precision: 1, maxFractionDigits: 3 },
        })
        await wrapper.get('input').trigger('blur')
        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1.2])
    })

    it('precision 大于 maxFractionDigits 时模型与展示都遵循 precision', async () => {
        const wrapper = mount(CaomeiInputNumber, {
            props: { modelValue: 1.2, precision: 3, maxFractionDigits: 1 },
        })
        expect(wrapper.get('input').element.value).toBe('1.2')

        await wrapper.get('input').setValue('1.2342')
        await wrapper.get('input').trigger('blur')

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1.234])
        expect(wrapper.get('input').element.value).toBe('1.234')
    })

    it('外部模型比 maxFractionDigits 更精确时展示按位数取整，模型不被改写', async () => {
        const wrapper = mount(CaomeiInputNumber, {
            props: { modelValue: 1.005, max: 1.005, maxFractionDigits: 2 },
        })

        expect(wrapper.get('input').element.value).toBe('1.01')

        await wrapper.get('input').trigger('blur')
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('分组输入可被解析回数值', async () => {
        const wrapper = mount(CaomeiInputNumber, { props: { modelValue: null } })
        await wrapper.get('input').setValue('1,234.5')
        await wrapper.get('input').trigger('blur')

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1234.5])
    })

    it('小数位参数非法或冲突时按未提供处理且不抛错', () => {
        const invalid = mount(CaomeiInputNumber, {
            props: { modelValue: 5, minFractionDigits: 25, maxFractionDigits: -1 },
        })
        expect(invalid.get('input').element.value).toBe('5')

        const conflict = mount(CaomeiInputNumber, {
            props: { modelValue: 1.2345, minFractionDigits: 3, maxFractionDigits: 2 },
        })
        expect(conflict.get('input').element.value).toBe('1.23')
    })

    it('冲突的小数位参数不影响模型取值', async () => {
        const wrapper = mount(CaomeiInputNumber, {
            props: { modelValue: 1.2345, minFractionDigits: 3, maxFractionDigits: 2 },
        })
        await wrapper.get('input').trigger('blur')

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1.23])
    })

    it('输入后失焦提交数值', async () => {
        const wrapper = mount(CaomeiInputNumber, { props: { modelValue: null } })
        await wrapper.get('input').setValue('5')
        await wrapper.get('input').trigger('blur')

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([5])
    })

    it('清空后失焦提交 null', async () => {
        const wrapper = mount(CaomeiInputNumber, { props: { modelValue: 5 } })
        await wrapper.get('input').setValue('')
        await wrapper.get('input').trigger('blur')

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null])
    })

    it('失焦时按 max 钳制并抛出 change', async () => {
        const wrapper = mount(CaomeiInputNumber, { props: { modelValue: 15, max: 10 } })
        await wrapper.get('input').trigger('blur')

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([10])
        expect(wrapper.emitted('change')?.at(-1)).toEqual([10])
    })

    it('失焦时按 min 钳制', async () => {
        const wrapper = mount(CaomeiInputNumber, { props: { modelValue: -5, min: 0 } })
        await wrapper.get('input').trigger('blur')

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
    })

    it('失焦时按 precision 取整', async () => {
        const wrapper = mount(CaomeiInputNumber, { props: { modelValue: 1.234, precision: 2 } })
        await wrapper.get('input').trigger('blur')

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1.23])
    })

    it('点击增加按钮按 step 步进并应用 precision', async () => {
        const wrapper = await mountReady({ modelValue: 1, step: 0.1, precision: 1 })

        await press(wrapper.findAll('.caomei-input-number__button')[1])

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1.1])
        expect(wrapper.emitted('change')?.at(-1)).toEqual([1.1])
    })

    it('点击减少按钮按 step 步进并钳制', async () => {
        const wrapper = await mountReady({ modelValue: 0.2, step: 0.5, min: 0 })

        await press(wrapper.findAll('.caomei-input-number__button')[0])

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
    })

    it('到达 min 时禁用减少按钮', () => {
        const wrapper = mount(CaomeiInputNumber, { props: { modelValue: 0, min: 0 } })
        expect(wrapper.findAll('.caomei-input-number__button')[0].attributes('disabled')).toBeDefined()
        expect(wrapper.findAll('.caomei-input-number__button')[1].attributes('disabled')).toBeUndefined()
    })

    it('到达 max 时禁用增加按钮', () => {
        const wrapper = mount(CaomeiInputNumber, { props: { modelValue: 10, max: 10 } })
        expect(wrapper.findAll('.caomei-input-number__button')[1].attributes('disabled')).toBeDefined()
        expect(wrapper.findAll('.caomei-input-number__button')[0].attributes('disabled')).toBeUndefined()
    })

    it('禁用时输入与按钮均不可交互', () => {
        const wrapper = mount(CaomeiInputNumber, { props: { disabled: true, modelValue: 1 } })

        expect(wrapper.get('input').attributes('disabled')).toBeDefined()
        expect(wrapper.findAll('.caomei-input-number__button')[0].attributes('disabled')).toBeDefined()
        expect(wrapper.findAll('.caomei-input-number__button')[1].attributes('disabled')).toBeDefined()
        expect(wrapper.get('.caomei-input-number').classes()).toContain('caomei-input-number--disabled')
    })

    it('只读时透传 readonly', () => {
        const wrapper = mount(CaomeiInputNumber, { props: { readonly: true, modelValue: 1 } })
        expect(wrapper.get('input').attributes('readonly')).toBeDefined()
    })

    it('invalid 时标注 aria-invalid 并应用错误样式', () => {
        const wrapper = mount(CaomeiInputNumber, { props: { invalid: true } })

        expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
        expect(wrapper.get('.caomei-input-number').classes()).toContain('caomei-input-number--invalid')
    })

    it('label 映射为 aria-label', () => {
        const wrapper = mount(CaomeiInputNumber, { props: { label: '数量' } })
        expect(wrapper.get('input').attributes('aria-label')).toBe('数量')
    })

    it('class 落在根元素，其余原生属性透传到 input', () => {
        const wrapper = mount(CaomeiInputNumber, {
            attrs: {
                class: 'custom-number',
                'data-test': 'number',
                required: true,
            },
        })

        const root = wrapper.get('.caomei-input-number')
        const input = wrapper.get('input')
        expect(root.classes()).toContain('custom-number')
        expect(root.attributes('data-test')).toBeUndefined()
        expect(input.attributes('data-test')).toBe('number')
        expect(input.attributes('required')).toBeDefined()
    })

    it('增减按钮可访问标签可被覆盖', () => {
        const wrapper = mount(CaomeiInputNumber, {
            props: { increaseLabel: '加一', decreaseLabel: '减一' },
        })

        const buttons = wrapper.findAll('.caomei-input-number__button')
        expect(buttons[0].attributes('aria-label')).toBe('减一')
        expect(buttons[1].attributes('aria-label')).toBe('加一')
    })

    it('step 非正时回退为 1', async () => {
        const wrapper = await mountReady({ modelValue: 1, step: 0 })

        await press(wrapper.findAll('.caomei-input-number__button')[1])

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])
    })

    it('precision 为负时忽略取整', async () => {
        const wrapper = mount(CaomeiInputNumber, { props: { modelValue: 1.234, precision: -1 } })
        await wrapper.get('input').trigger('blur')

        expect(wrapper.emitted('change')?.at(-1)).toEqual([1.234])
    })

    it('取整后不越过 max', async () => {
        const wrapper = mount(CaomeiInputNumber, { props: { modelValue: 100, max: 1.005, precision: 2 } })
        await wrapper.get('input').trigger('blur')

        const [value] = wrapper.emitted('change')?.at(-1) as [number]
        expect(value).toBeLessThanOrEqual(1.005)
        expect(value).toBe(1)
    })

    it('步进按 step 累加且不被吸附到 step 整数倍', async () => {
        const wrapper = await mountReady({ modelValue: 0.5, step: 1 })

        await press(wrapper.findAll('.caomei-input-number__button')[1])

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1.5])
    })

    it('按 Enter 提交并触发 change', async () => {
        const wrapper = mount(CaomeiInputNumber, { props: { modelValue: null } })
        await wrapper.get('input').setValue('7')
        await wrapper.get('input').trigger('keydown', { key: 'Enter' })

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([7])
        expect(wrapper.emitted('change')?.at(-1)).toEqual([7])
    })

    it('外部 v-model 变更即时回填输入框', async () => {
        const wrapper = mount(CaomeiInputNumber, { props: { modelValue: 1 } })
        await wrapper.setProps({ modelValue: 2 })

        expect((wrapper.get('input').element as HTMLInputElement).value).toBe('2')
    })

    it('在按钮外松开指针仍触发 change', async () => {
        const wrapper = await mountReady({ modelValue: 1 })
        const button = wrapper.findAll('.caomei-input-number__button')[1]

        await button.trigger('pointerdown')
        window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
        await flushPromises()

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])
        expect(wrapper.emitted('change')?.at(-1)).toEqual([2])
    })

    it('precision 超出范围时不取整且不报错', async () => {
        const wrapper = mount(CaomeiInputNumber, { props: { modelValue: 1.234, precision: 101 } })
        await wrapper.get('input').trigger('blur')

        expect(wrapper.emitted('change')?.at(-1)).toEqual([1.234])
    })

    it('暴露 focus / blur 方法', () => {
        const wrapper = mount(CaomeiInputNumber, { attachTo: document.body })
        const input = wrapper.get('input').element as HTMLInputElement

        wrapper.vm.focus()
        expect(document.activeElement).toBe(input)
        wrapper.vm.blur()
        expect(document.activeElement).not.toBe(input)

        wrapper.unmount()
    })

    it('有数值时输出 data-filled，清空后移除（含 0）', async () => {
        const wrapper = mount(CaomeiInputNumber, { props: { modelValue: null } })

        expect(wrapper.get('.caomei-input-number').attributes('data-filled')).toBeUndefined()

        await wrapper.setProps({ modelValue: 0 })
        expect(wrapper.get('.caomei-input-number').attributes('data-filled')).toBe('true')

        await wrapper.setProps({ modelValue: null })
        expect(wrapper.get('.caomei-input-number').attributes('data-filled')).toBeUndefined()
    })

    it('增减按钮使用注入 locale 的文案', () => {
        const wrapper = mount(CaomeiInputNumber, {
            global: {
                provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) },
            },
        })

        const buttons = wrapper.findAll('.caomei-input-number__button')
        expect(buttons[0].attributes('aria-label')).toBe('Decrease')
        expect(buttons[1].attributes('aria-label')).toBe('Increase')
    })
})
