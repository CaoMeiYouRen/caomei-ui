import { enableAutoUnmount, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, type Component, type DefineComponent } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SelectButtonProps } from './types'
import { CaomeiSelectButton, type SelectButtonOption } from './index'

enableAutoUnmount(afterEach)

const options = [
    { label: '左对齐', value: 'left' },
    { label: '居中', value: 'center' },
    { label: '右对齐', value: 'right' },
]

/** 泛型组件在 `h()` 中无法推导 props，此处退化为通用组件类型 */
const FormSelectButton = CaomeiSelectButton as unknown as Component

function mountSelectButton(
    props: Record<string, unknown> = {},
    optionsOverride: Record<string, unknown> = {},
) {
    return mount(CaomeiSelectButton, {
        props: { options, ...props },
        attachTo: document.body,
        ...optionsOverride,
    })
}

function getItems(wrapper: ReturnType<typeof mountSelectButton>) {
    return wrapper.findAll('.caomei-select-button__item')
}

async function flush() {
    await nextTick()
    await nextTick()
}

describe('CaomeiSelectButton', () => {
    it('渲染 role=group 与选项按钮', () => {
        const wrapper = mountSelectButton({ label: '文本对齐' })

        const root = wrapper.get('.caomei-select-button')
        expect(root.attributes('role')).toBe('group')
        expect(root.attributes('aria-label')).toBe('文本对齐')

        const items = getItems(wrapper)
        expect(items).toHaveLength(3)
        expect(items[0].element.tagName).toBe('BUTTON')
        expect(items[0].text()).toBe('左对齐')
        expect(items[0].attributes('aria-pressed')).toBe('false')
        expect(items[0].attributes('data-state')).toBe('off')
    })

    it('非受控单选：点击选中，点击其他项切换', async () => {
        const wrapper = mountSelectButton()

        await getItems(wrapper)[0].trigger('click')
        await flush()
        expect(getItems(wrapper)[0].attributes('data-state')).toBe('on')

        await getItems(wrapper)[2].trigger('click')
        await flush()
        expect(getItems(wrapper)[0].attributes('data-state')).toBe('off')
        expect(getItems(wrapper)[2].attributes('data-state')).toBe('on')
    })

    it('单选点击已选项不解选且不抛出 undefined', async () => {
        const wrapper = mountSelectButton({ modelValue: 'center', 'onUpdate:modelValue': vi.fn() })
        await flush()

        await getItems(wrapper)[1].trigger('click')
        await flush()

        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
        expect(getItems(wrapper)[1].attributes('data-state')).toBe('on')
    })

    it('受控单选：点击其他项抛出 update:modelValue 且不自行切换', async () => {
        const wrapper = mountSelectButton({ modelValue: 'left', 'onUpdate:modelValue': vi.fn() })
        await flush()

        await getItems(wrapper)[1].trigger('click')
        await flush()

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['center'])
        expect(getItems(wrapper)[0].attributes('data-state')).toBe('on')
        expect(getItems(wrapper)[1].attributes('data-state')).toBe('off')
    })

    it('multiple 模式累加与取消选中', async () => {
        const wrapper = mountSelectButton({ multiple: true })
        await flush()

        await getItems(wrapper)[0].trigger('click')
        await flush()
        expect(getItems(wrapper)[0].attributes('data-state')).toBe('on')

        await getItems(wrapper)[1].trigger('click')
        await flush()
        expect(getItems(wrapper)[0].attributes('data-state')).toBe('on')
        expect(getItems(wrapper)[1].attributes('data-state')).toBe('on')

        await getItems(wrapper)[0].trigger('click')
        await flush()
        expect(getItems(wrapper)[0].attributes('data-state')).toBe('off')
        expect(getItems(wrapper)[1].attributes('data-state')).toBe('on')
    })

    it('multiple 受控抛出数组', async () => {
        const wrapper = mountSelectButton({
            multiple: true,
            modelValue: ['left'],
            'onUpdate:modelValue': vi.fn(),
        })
        await flush()

        await getItems(wrapper)[2].trigger('click')
        await flush()

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['left', 'right']])
    })

    it('整组禁用与单项禁用', async () => {
        const whole = mountSelectButton({ disabled: true })
        for (const item of getItems(whole)) {
            expect(item.attributes('disabled')).toBeDefined()
        }

        const single = mountSelectButton({ options: [options[0], { ...options[1], disabled: true }] })
        expect(getItems(single)[1].attributes('disabled')).toBeDefined()
        await getItems(single)[1].trigger('click')
        await flush()
        expect(getItems(single)[1].attributes('data-state')).toBe('off')
    })

    it('键盘方向键在选项间移动焦点', async () => {
        const wrapper = mountSelectButton()
        const items = getItems(wrapper)

        ;(items[0].element as HTMLElement).focus()
        await nextTick()
        await items[0].trigger('keydown', { key: 'ArrowRight' })
        await nextTick()

        expect(document.activeElement).toBe(items[1].element)

        await items[1].trigger('keydown', { key: 'End' })
        await nextTick()
        expect(document.activeElement).toBe(items[2].element)
    })

    it('尺寸与校验失败态映射到 class 与 aria-invalid', () => {
        const wrapper = mountSelectButton({ size: 'lg', invalid: true })

        const root = wrapper.get('.caomei-select-button')
        expect(root.classes()).toContain('caomei-select-button--lg')
        expect(root.classes()).toContain('caomei-select-button--invalid')
        expect(root.attributes('aria-invalid')).toBe('true')
    })

    it('表单内提供 name 时渲染隐藏输入', () => {
        const wrapper = mount(
            defineComponent({
                setup() {
                    return () => h('form', [
                        h(FormSelectButton, { options, name: 'align', modelValue: 'center' }),
                    ])
                },
            }),
            { attachTo: document.body },
        )

        const input = wrapper.get('input[name="align"]')
        expect(input.attributes('value')).toBe('center')
    })

    it('单选未选中时不渲染隐藏输入', () => {
        const wrapper = mount(
            defineComponent({
                setup() {
                    return () => h('form', [
                        h(FormSelectButton, { options, name: 'align' }),
                    ])
                },
            }),
            { attachTo: document.body },
        )

        expect(wrapper.find('input').exists()).toBe(false)
    })

    it('多选在表单内渲染索引隐藏输入', () => {
        const wrapper = mount(
            defineComponent({
                setup() {
                    return () => h('form', [
                        h(FormSelectButton, {
                            options,
                            name: 'align',
                            multiple: true,
                            modelValue: ['left', 'right'],
                        }),
                    ])
                },
            }),
            { attachTo: document.body },
        )

        const inputs = wrapper.findAll('input[name]')
        expect(inputs.map((input) => input.attributes('name'))).toEqual(['align[0]', 'align[1]'])
        expect(inputs.map((input) => input.attributes('value'))).toEqual(['left', 'right'])
    })

    it('数值型 value 正常工作', async () => {
        const numeric = [
            { label: '一', value: 1 },
            { label: '二', value: 2 },
        ]
        const wrapper = mount(CaomeiSelectButton, {
            props: { options: numeric },
            attachTo: document.body,
        })

        await wrapper.findAll('.caomei-select-button__item')[1].trigger('click')
        await flush()

        expect(wrapper.findAll('.caomei-select-button__item')[1].attributes('data-state')).toBe('on')
    })

    it('option 插槽可自定义选项内容', () => {
        const SlotSelectButton = CaomeiSelectButton as unknown as DefineComponent<
            SelectButtonProps<SelectButtonOption>
        >
        const wrapper = mount(SlotSelectButton, {
            props: { options },
            slots: {
                option: ({ option, selected }: { option: SelectButtonOption, selected: boolean }) =>
                    h('span', { class: 'custom-option' }, `${option.label}${selected ? '*' : ''}`),
            },
        })

        expect(wrapper.findAll('.custom-option')).toHaveLength(3)
        expect(wrapper.get('.custom-option').text()).toBe('左对齐')
    })

    it('class 透传到根元素', () => {
        const wrapper = mountSelectButton({ class: 'custom-select-button' })

        expect(wrapper.get('.caomei-select-button').classes()).toContain('custom-select-button')
    })
})

describe('CaomeiSelectButton 对象选项映射', () => {
    interface MappedOption {
        name: string
        id?: number | null
        disabled?: boolean
    }

    /** VTU 无法从 props 推断泛型组件参数，测试内具体化选项类型 */
    const MappedSelectButton = CaomeiSelectButton as unknown as DefineComponent<SelectButtonProps<MappedOption>>

    const objectOptions: MappedOption[] = [
        { name: '分类一', id: 1 },
        { name: '分类二', id: 2 },
        { name: '分类三', id: 3, disabled: true },
    ]

    it('通过 optionLabel / optionValue 映射字段并以数字值标记选中', () => {
        const wrapper = mount(MappedSelectButton, {
            props: {
                options: objectOptions,
                optionLabel: 'name',
                optionValue: 'id',
                modelValue: 2,
            },
            attachTo: document.body,
        })

        const items = wrapper.findAll('.caomei-select-button__item')
        expect(items.map((item) => item.text())).toEqual(['分类一', '分类二', '分类三'])
        expect(items[1].attributes('data-state')).toBe('on')
        expect(items[2].attributes('disabled')).toBeDefined()
    })

    it('optionLabel 传函数时按函数结果渲染', () => {
        const wrapper = mount(MappedSelectButton, {
            props: {
                options: objectOptions,
                optionLabel: (option) => `#${option.id ?? '?'}`,
                optionValue: 'id',
            },
            attachTo: document.body,
        })

        expect(wrapper.get('.caomei-select-button__item').text()).toBe('#1')
    })

    it('受控单选下点击映射选项回传数字值', async () => {
        const wrapper = mount(MappedSelectButton, {
            props: {
                options: objectOptions,
                optionLabel: 'name',
                optionValue: 'id',
                modelValue: 1,
            },
            attachTo: document.body,
        })
        await flush()

        await wrapper.findAll('.caomei-select-button__item')[1].trigger('click')
        await flush()

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2])
    })

    it('optionValue 传函数时按函数结果标记选中', async () => {
        const wrapper = mount(MappedSelectButton, {
            props: {
                options: objectOptions,
                optionLabel: 'name',
                optionValue: (option) => option.id ?? 0,
                modelValue: 2,
            },
            attachTo: document.body,
        })
        await flush()

        expect(wrapper.findAll('.caomei-select-button__item')[1].attributes('data-state')).toBe('on')
    })

    it('解析不到 optionValue 的选项不渲染', () => {
        const wrapper = mount(MappedSelectButton, {
            props: {
                options: [{ name: '无值选项' }, { name: '全部', id: null }, ...objectOptions],
                optionLabel: 'name',
                optionValue: 'id',
            },
            attachTo: document.body,
        })

        expect(wrapper.findAll('.caomei-select-button__item')).toHaveLength(3)
    })

    it('#option 插槽收到原始选项对象', () => {
        interface SlotOption extends MappedOption {
            hint: string
        }

        const SlotSelectButton = CaomeiSelectButton as unknown as DefineComponent<SelectButtonProps<SlotOption>>

        const wrapper = mount(SlotSelectButton, {
            props: {
                options: [{ name: '分类一', id: 1, hint: '第一项' }],
                optionLabel: 'name',
                optionValue: 'id',
            },
            slots: {
                option: ({ option }: { option: SlotOption }) =>
                    h('span', { class: 'custom-option' }, option.hint),
            },
            attachTo: document.body,
        })

        expect(wrapper.get('.custom-option').text()).toBe('第一项')
    })
})
