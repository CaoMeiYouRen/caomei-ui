import { flushPromises, mount } from '@vue/test-utils'
import { computed, defineComponent, h, nextTick, type Component } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
import { CaomeiCheckbox } from '../checkbox'
import type { CheckboxGroupProps } from './types'
import { CaomeiCheckboxGroup } from './index'

afterEach(() => {
    document.body.innerHTML = ''
})

const options = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '樱桃', value: 'cherry', disabled: true },
]

function controls(wrapper: ReturnType<typeof mount>) {
    return wrapper.findAll('.caomei-checkbox__control')
}

/** 将组件挂载在真实 <form> 内，用于验证分组隐藏表单控件 */
async function mountInForm(props: CheckboxGroupProps & Record<string, unknown> = {}) {
    const Group = CaomeiCheckboxGroup as unknown as Component
    const wrapper = mount(
        defineComponent({
            setup: () => () => h('form', { 'data-test': 'form' }, [h(Group, props)]),
        }),
        { attachTo: document.body },
    )
    await flushPromises()
    await nextTick()
    return wrapper
}

describe('CaomeiCheckboxGroup', () => {
    it('按 options 渲染子项并映射字段', () => {
        const wrapper = mount(CaomeiCheckboxGroup, { props: { options } })

        expect(controls(wrapper)).toHaveLength(3)
        expect(wrapper.get('.caomei-checkbox-group').attributes('role')).toBe('group')
        expect(wrapper.text()).toContain('苹果')
        expect(wrapper.text()).toContain('樱桃')
    })

    it('受控 modelValue 决定子项选中态', () => {
        const wrapper = mount(CaomeiCheckboxGroup, {
            props: { options, modelValue: ['apple', 'cherry'] },
        })

        expect(controls(wrapper)[0].attributes('aria-checked')).toBe('true')
        expect(controls(wrapper)[1].attributes('aria-checked')).toBe('false')
        expect(controls(wrapper)[2].attributes('aria-checked')).toBe('true')
    })

    it('点击子项把值追加进数组模型', async () => {
        const wrapper = mount(CaomeiCheckboxGroup, {
            props: { options, modelValue: ['apple'] },
        })

        await controls(wrapper)[1].trigger('click')

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['apple', 'banana']])
    })

    it('点击已选中的子项把值移出数组模型', async () => {
        const wrapper = mount(CaomeiCheckboxGroup, {
            props: { options, modelValue: ['apple', 'banana'] },
        })

        await controls(wrapper)[0].trigger('click')

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['banana']])
    })

    it('禁用选项不可交互', async () => {
        const wrapper = mount(CaomeiCheckboxGroup, {
            props: { options, modelValue: [] },
        })

        await controls(wrapper)[2].trigger('click')

        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('解析不到 optionValue 的选项不渲染', () => {
        const wrapper = mount(CaomeiCheckboxGroup, {
            props: {
                options: [{ name: '无值选项' }, { name: '苹果', id: 'apple' }],
                optionLabel: 'name',
                optionValue: 'id',
            },
        })

        expect(controls(wrapper)).toHaveLength(1)
        expect(wrapper.text()).toContain('苹果')
    })

    it('全选项在部分选中时渲染半选，点击后全选可选项', async () => {
        const wrapper = mount(CaomeiCheckboxGroup, {
            props: { options, selectAll: true, modelValue: ['apple'] },
        })

        expect(controls(wrapper)[0].attributes('aria-checked')).toBe('mixed')

        await controls(wrapper)[0].trigger('click')

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['apple', 'banana']])
    })

    it('全部选中时全选项为选中，点击后清空可选项', async () => {
        const wrapper = mount(CaomeiCheckboxGroup, {
            props: { options, selectAll: true, modelValue: ['apple', 'banana'] },
        })

        expect(controls(wrapper)[0].attributes('aria-checked')).toBe('true')

        await controls(wrapper)[0].trigger('click')

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]])
    })

    it('未选中任何可选项时全选项为未选中', () => {
        const wrapper = mount(CaomeiCheckboxGroup, {
            props: { options, selectAll: true, modelValue: [] },
        })

        expect(controls(wrapper)[0].attributes('aria-checked')).toBe('false')
    })

    it('全选只覆盖可选项，禁用项的已选值保持不变', async () => {
        const wrapper = mount(CaomeiCheckboxGroup, {
            props: { options, selectAll: true, modelValue: ['cherry'] },
        })

        await controls(wrapper)[0].trigger('click')

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['cherry', 'apple', 'banana']])
    })

    it('全选项可按 selectAllText 覆盖文案，默认取当前语言', () => {
        const byLocale = mount(CaomeiCheckboxGroup, { props: { options, selectAll: true } })
        expect(byLocale.text()).toContain('全选')

        const byProp = mount(CaomeiCheckboxGroup, {
            props: { options, selectAll: true, selectAllText: '全部勾选' },
        })
        expect(byProp.text()).toContain('全部勾选')
    })

    it('注入 locale 时全选项文案本地化', () => {
        const wrapper = mount(CaomeiCheckboxGroup, {
            props: { options, selectAll: true },
            global: {
                provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) },
            },
        })

        expect(wrapper.text()).toContain('Select all')
    })

    it('name 在分组隐藏表单控件上为每个选中值生成控件', async () => {
        const wrapper = await mountInForm({ options, modelValue: ['apple', 'banana'], name: 'fruits' })

        const collected = wrapper.findAll('form input').map((input) => input.attributes('name'))
        expect(collected).toEqual(['fruits[0]', 'fruits[1]'])
        expect(wrapper.get('input[name="fruits[0]"]').attributes('value')).toBe('apple')
    })

    it('label 映射为分组的可访问名，invalid 映射 aria-invalid 并下发子项', () => {
        const wrapper = mount(CaomeiCheckboxGroup, {
            props: { options, label: '水果', invalid: true },
        })

        expect(wrapper.get('.caomei-checkbox-group').attributes('aria-label')).toBe('水果')
        expect(wrapper.get('.caomei-checkbox-group').attributes('aria-invalid')).toBe('true')
        expect(controls(wrapper)[0].attributes('aria-invalid')).toBe('true')
    })

    it('size 与 disabled 下发给渲染的选项', () => {
        const wrapper = mount(CaomeiCheckboxGroup, {
            props: { options, size: 'lg', disabled: true },
        })

        expect(wrapper.get('.caomei-checkbox').classes()).toContain('caomei-checkbox--lg')
        expect(controls(wrapper)[0].attributes('disabled')).toBeDefined()
    })

    it('默认插槽自定义子项与 options 叠加，并共享分组模型', async () => {
        const wrapper = mount(CaomeiCheckboxGroup, {
            props: { options: [options[0]], modelValue: [] },
            slots: {
                default: () => h(CaomeiCheckbox, { value: 'custom', text: '自定义子项' }),
            },
        })

        expect(controls(wrapper)).toHaveLength(2)

        await controls(wrapper)[1].trigger('click')

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['custom']])
    })

    it('可选项全部禁用时全选项禁用且不改变模型', async () => {
        const wrapper = mount(CaomeiCheckboxGroup, {
            props: {
                options: [{ label: '樱桃', value: 'cherry', disabled: true }],
                selectAll: true,
                modelValue: [],
            },
        })

        const selectAll = controls(wrapper)[0]
        expect(selectAll.attributes('disabled')).toBeDefined()

        await selectAll.trigger('click')

        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })
})
