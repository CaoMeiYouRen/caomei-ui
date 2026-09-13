import { enableAutoUnmount, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CaomeiSelectButton, type SelectButtonOption } from './index'

enableAutoUnmount(afterEach)

const options = [
    { label: '左对齐', value: 'left' },
    { label: '居中', value: 'center' },
    { label: '右对齐', value: 'right' },
]

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
                        h(CaomeiSelectButton, { options, name: 'align', modelValue: 'center' }),
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
                        h(CaomeiSelectButton, { options, name: 'align' }),
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
                        h(CaomeiSelectButton, {
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
        const wrapper = mount(CaomeiSelectButton, {
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
