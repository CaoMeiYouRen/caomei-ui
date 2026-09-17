import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { computed, defineComponent, h, nextTick, type Component, type DefineComponent } from 'vue'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
import type { MultiSelectProps } from './types'
import { CaomeiMultiSelect } from './index'

afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
    document.body.style.pointerEvents = ''
    document.body.style.paddingRight = ''
    document.body.style.marginRight = ''
})

const options = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '樱桃', value: 'cherry', disabled: true },
]

async function open(wrapper: ReturnType<typeof mount>): Promise<void> {
    await wrapper.get('.caomei-multi-select__icon').trigger('click')
    await flushPromises()
    await nextTick()
}

/** 将组件挂载在真实 <form> 内，用于验证隐藏表单控件与原生校验 */
async function mountInForm(props: MultiSelectProps & Record<string, unknown> = {}) {
    /** 泛型组件在 `h()` 中无法推导 props，此处退化为通用组件类型 */
    const MultiSelect = CaomeiMultiSelect as unknown as Component
    const wrapper = mount(
        defineComponent({
            setup: () => () => h('form', { 'data-test': 'form' }, [h(MultiSelect, props)]),
        }),
        { attachTo: document.body },
    )
    await flushPromises()
    await nextTick()
    return wrapper as ReturnType<typeof mount>
}

function getForm(): HTMLFormElement {
    return document.querySelector('form') as HTMLFormElement
}

describe('CaomeiMultiSelect', () => {
    it('无选择时显示占位文本', () => {
        const wrapper = mount(CaomeiMultiSelect, {
            props: { options, placeholder: '请选择' },
        })

        expect(wrapper.get('.caomei-multi-select__input').attributes('placeholder')).toBe('请选择')
        expect(wrapper.findAll('.caomei-multi-select__tag')).toHaveLength(0)
    })

    it('已有值时渲染已选项标签并隐藏占位', () => {
        const wrapper = mount(CaomeiMultiSelect, {
            props: { options, modelValue: ['apple', 'banana'], placeholder: '请选择' },
        })

        const tags = wrapper.findAll('.caomei-multi-select__tag')
        expect(tags).toHaveLength(2)
        expect(tags[0].text()).toContain('苹果')
        expect(tags[1].text()).toContain('香蕉')
        expect(wrapper.get('.caomei-multi-select__input').attributes('placeholder')).toBeUndefined()
    })

    it('模型含重复值时仅渲染一个标签', () => {
        const wrapper = mount(CaomeiMultiSelect, {
            props: { options, modelValue: ['apple', 'apple'] },
        })

        expect(wrapper.findAll('.caomei-multi-select__tag')).toHaveLength(1)
    })

    it('点击字段空白处聚焦搜索输入框', async () => {
        const wrapper = mount(CaomeiMultiSelect, { props: { options }, attachTo: document.body })

        await wrapper.get('.caomei-multi-select').trigger('click')

        const input = wrapper.get('.caomei-multi-select__input').element as HTMLInputElement
        expect(document.activeElement).toBe(input)

        wrapper.unmount()
    })

    it('值不在选项中时忽略该标签', () => {
        const wrapper = mount(CaomeiMultiSelect, {
            props: { options, modelValue: ['apple', 'unknown'] },
        })

        expect(wrapper.findAll('.caomei-multi-select__tag')).toHaveLength(1)
    })

    it('点击移除按钮按值过滤 model', async () => {
        const wrapper = mount(CaomeiMultiSelect, {
            props: { options, modelValue: ['apple', 'banana'] },
        })

        await wrapper.findAll('.caomei-multi-select__tag-remove')[0].trigger('click')

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['banana']])
    })

    it('移除按钮带选项级可访问名', () => {
        const wrapper = mount(CaomeiMultiSelect, {
            props: { options, modelValue: ['apple'] },
        })

        expect(wrapper.get('.caomei-multi-select__tag-remove').attributes('aria-label')).toBe(
            '移除 苹果',
        )
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸样式 %s', (size) => {
        const wrapper = mount(CaomeiMultiSelect, { props: { options, size } })
        expect(wrapper.get('.caomei-multi-select').classes()).toContain(
            `caomei-multi-select--${size}`,
        )
    })

    it('invalid 时标注 aria-invalid 并应用错误样式', () => {
        const wrapper = mount(CaomeiMultiSelect, { props: { options, invalid: true } })

        expect(wrapper.get('.caomei-multi-select__input').attributes('aria-invalid')).toBe('true')
        expect(wrapper.get('.caomei-multi-select').classes()).toContain(
            'caomei-multi-select--invalid',
        )
    })

    it('disabled 时禁用输入与触发器并应用禁用样式', () => {
        const wrapper = mount(CaomeiMultiSelect, { props: { options, disabled: true } })

        expect(wrapper.get('.caomei-multi-select__input').attributes('disabled')).toBeDefined()
        expect(wrapper.get('.caomei-multi-select__icon').attributes('disabled')).toBeDefined()
        expect(wrapper.get('.caomei-multi-select').classes()).toContain(
            'caomei-multi-select--disabled',
        )
    })

    it('label 映射为输入框 aria-label，id 落在输入框', () => {
        const wrapper = mount(CaomeiMultiSelect, {
            props: { options, label: '水果', id: 'fruit-select' },
        })

        const input = wrapper.get('.caomei-multi-select__input')
        expect(input.attributes('aria-label')).toBe('水果')
        expect(input.attributes('id')).toBe('fruit-select')
    })

    it('展开触发器使用本地化可访问名而非 Reka 默认英文', () => {
        const wrapper = mount(CaomeiMultiSelect, { props: { options } })
        expect(wrapper.get('.caomei-multi-select__icon').attributes('aria-label')).toBe('展开选项')

        const custom = mount(CaomeiMultiSelect, { props: { options, openLabel: '选择水果' } })
        expect(custom.get('.caomei-multi-select__icon').attributes('aria-label')).toBe('选择水果')
    })

    it('展开后渲染全部选项并标记禁用项', async () => {
        const wrapper = mount(CaomeiMultiSelect, { props: { options }, attachTo: document.body })

        await open(wrapper)

        const rendered = document.querySelectorAll('[role="option"]')
        expect(rendered).toHaveLength(3)
        expect(rendered[0].textContent).toContain('苹果')
        expect(rendered[2].hasAttribute('data-disabled')).toBe(true)

        wrapper.unmount()
    })

    it('点击选项抛出 update:modelValue 追加选中值', async () => {
        const wrapper = mount(CaomeiMultiSelect, {
            props: { options, modelValue: [] },
            attachTo: document.body,
        })

        await open(wrapper)
        ;(document.querySelectorAll('[role="option"]')[1] as HTMLElement).click()
        await flushPromises()

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['banana']])

        wrapper.unmount()
    })

    it('无匹配项时显示空提示', async () => {
        const wrapper = mount(CaomeiMultiSelect, { props: { options }, attachTo: document.body })

        await open(wrapper)
        await wrapper.get('.caomei-multi-select__input').setValue('不存在')
        await flushPromises()
        await nextTick()

        expect(document.querySelector('.caomei-multi-select__empty')?.textContent?.trim()).toBe(
            '无匹配选项',
        )

        wrapper.unmount()
    })

    it('空的空提示文案可覆盖', async () => {
        const wrapper = mount(CaomeiMultiSelect, {
            props: { options, emptyLabel: '没有结果' },
            attachTo: document.body,
        })

        await open(wrapper)
        await wrapper.get('.caomei-multi-select__input').setValue('不存在')
        await flushPromises()
        await nextTick()

        expect(document.querySelector('.caomei-multi-select__empty')?.textContent?.trim()).toBe(
            '没有结果',
        )

        wrapper.unmount()
    })

    it('表单项为每个选中值生成表单控件，表单可收集值', async () => {
        const wrapper = await mountInForm({
            options,
            name: 'fruits',
            modelValue: ['apple', 'banana'],
        })

        const first = document.querySelector('input[name="fruits[0]"]') as HTMLInputElement | null
        const second = document.querySelector('input[name="fruits[1]"]') as HTMLInputElement | null
        expect(first).not.toBeNull()
        expect(second).not.toBeNull()
        expect(first?.value).toBe('apple')
        expect(second?.value).toBe('banana')

        wrapper.unmount()
    })

    it('required 且未选择时原生表单校验失败', async () => {
        const wrapper = await mountInForm({
            options,
            name: 'fruits',
            required: true,
            modelValue: [],
        })

        expect(getForm().checkValidity()).toBe(false)

        wrapper.unmount()
    })

    it('required 且已选择时原生表单校验通过', async () => {
        const wrapper = await mountInForm({
            options,
            name: 'fruits',
            required: true,
            modelValue: ['apple'],
        })

        expect(getForm().checkValidity()).toBe(true)

        wrapper.unmount()
    })

    it('禁用选项不可被选中', async () => {
        const wrapper = mount(CaomeiMultiSelect, {
            props: { options, modelValue: [] },
            attachTo: document.body,
        })

        await open(wrapper)
        ;(document.querySelectorAll('[role="option"]')[2] as HTMLElement).click()
        await flushPromises()

        expect(wrapper.emitted('update:modelValue')).toBeUndefined()

        wrapper.unmount()
    })

    it('class 落在根元素，其余原生属性透传到输入框', () => {
        const wrapper = mount(CaomeiMultiSelect, {
            props: { options },
            attrs: {
                class: 'custom-multi',
                'data-test': 'multi',
                maxlength: 10,
                'aria-describedby': 'hint',
            },
        })

        const root = wrapper.get('.caomei-multi-select')
        const input = wrapper.get('.caomei-multi-select__input')
        expect(root.classes()).toContain('custom-multi')
        expect(root.attributes('data-test')).toBeUndefined()
        expect(input.attributes('data-test')).toBe('multi')
        expect(input.attributes('maxlength')).toBe('10')
        expect(input.attributes('aria-describedby')).toBe('hint')
    })

    it('展开时默认不锁定页面滚动', async () => {
        const wrapper = mount(CaomeiMultiSelect, { props: { options }, attachTo: document.body })

        await open(wrapper)

        expect(document.body.style.overflow).not.toBe('hidden')

        wrapper.unmount()
    })

    it('bodyLock 开启时锁定页面滚动', async () => {
        const wrapper = mount(CaomeiMultiSelect, {
            props: { options, bodyLock: true },
            attachTo: document.body,
        })

        await open(wrapper)

        expect(document.body.style.overflow).toBe('hidden')

        wrapper.unmount()
    })

    it('有选中项时输出 data-filled，清空后移除', async () => {
        const wrapper = mount(CaomeiMultiSelect, { props: { options, modelValue: [] } })

        expect(wrapper.get('.caomei-multi-select').attributes('data-filled')).toBeUndefined()

        await wrapper.setProps({ modelValue: ['apple'] })
        expect(wrapper.get('.caomei-multi-select').attributes('data-filled')).toBe('true')

        await wrapper.setProps({ modelValue: [] })
        expect(wrapper.get('.caomei-multi-select').attributes('data-filled')).toBeUndefined()
    })

    it('内建可访问名与空提示使用注入 locale 的文案', async () => {
        const wrapper = mount(CaomeiMultiSelect, {
            props: { options, modelValue: ['apple'] },
            attachTo: document.body,
            global: {
                provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) },
            },
        })

        expect(wrapper.get('.caomei-multi-select__icon').attributes('aria-label')).toBe(
            'Show options',
        )
        expect(wrapper.get('.caomei-multi-select__tag-remove').attributes('aria-label')).toBe(
            'Remove 苹果',
        )

        await open(wrapper)
        await wrapper.get('.caomei-multi-select__input').setValue('不存在')
        await flushPromises()
        await nextTick()

        expect(document.querySelector('.caomei-multi-select__empty')?.textContent?.trim()).toBe(
            'No matching options',
        )

        wrapper.unmount()
    })
})

describe('CaomeiMultiSelect 对象选项映射', () => {
    interface MappedOption {
        name: string
        id?: number | null
        disabled?: boolean
    }

    /** VTU 无法从 props 推断泛型组件参数，测试内具体化选项类型 */
    const MappedMultiSelect = CaomeiMultiSelect as unknown as DefineComponent<MultiSelectProps<MappedOption>>

    const objectOptions: MappedOption[] = [
        { name: '分类一', id: 1 },
        { name: '分类二', id: 2 },
        { name: '分类三', id: 3, disabled: true },
    ]

    it('通过 optionLabel / optionValue 映射字段并以数字值渲染标签', () => {
        const wrapper = mount(MappedMultiSelect, {
            props: {
                options: objectOptions,
                optionLabel: 'name',
                optionValue: 'id',
                modelValue: [2, 1],
                placeholder: '请选择',
            },
        })

        expect(wrapper.findAll('.caomei-multi-select__tag-label').map((tag) => tag.text())).toEqual([
            '分类二',
            '分类一',
        ])
    })

    it('移除标签时按映射的值更新模型', async () => {
        const wrapper = mount(MappedMultiSelect, {
            props: {
                options: objectOptions,
                optionLabel: 'name',
                optionValue: 'id',
                modelValue: [1, 2],
            },
        })

        await wrapper.get('.caomei-multi-select__tag-remove').trigger('click')

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[2]])
    })

    it('optionLabel 传函数时按函数结果渲染', () => {
        const wrapper = mount(MappedMultiSelect, {
            props: {
                options: objectOptions,
                optionLabel: (option) => `#${option.id ?? '?'}`,
                optionValue: 'id',
                modelValue: [3],
            },
        })

        expect(wrapper.get('.caomei-multi-select__tag-label').text()).toBe('#3')
    })

    it('optionValue 传函数时按函数结果匹配已选项', () => {
        const wrapper = mount(MappedMultiSelect, {
            props: {
                options: objectOptions,
                optionLabel: 'name',
                optionValue: (option) => option.id ?? 0,
                modelValue: [2],
            },
        })

        expect(wrapper.get('.caomei-multi-select__tag-label').text()).toBe('分类二')
    })

    it('面板点击映射选项后按数字值追加选中', async () => {
        const wrapper = mount(MappedMultiSelect, {
            props: {
                options: objectOptions,
                optionLabel: 'name',
                optionValue: 'id',
            },
            attachTo: document.body,
        })

        await open(wrapper)
        ;(document.querySelectorAll('[role="option"]')[1] as HTMLElement).click()
        await flushPromises()

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[2]])

        wrapper.unmount()
    })

    it('解析不到 optionValue 的选项不渲染且在面板中标记禁用项', async () => {
        const wrapper = mount(MappedMultiSelect, {
            props: {
                options: [{ name: '无值选项' }, { name: '全部', id: null }, ...objectOptions],
                optionLabel: 'name',
                optionValue: 'id',
            },
            attachTo: document.body,
        })

        await open(wrapper)

        const rendered = document.querySelectorAll('[role="option"]')
        expect(rendered).toHaveLength(3)
        expect(rendered[2].hasAttribute('data-disabled')).toBe(true)

        wrapper.unmount()
    })
})

describe('CaomeiMultiSelect 清除与自定义选项', () => {
    it('showClear 且有选中项时渲染清除按钮，无值时隐藏', async () => {
        const wrapper = mount(CaomeiMultiSelect, {
            props: { options, modelValue: ['apple'], showClear: true },
        })

        expect(wrapper.find('.caomei-multi-select__clear').exists()).toBe(true)

        await wrapper.setProps({ modelValue: [] })
        expect(wrapper.find('.caomei-multi-select__clear').exists()).toBe(false)
    })

    it('未开启 showClear 时不渲染清除按钮', () => {
        const wrapper = mount(CaomeiMultiSelect, {
            props: { options, modelValue: ['apple'] },
        })

        expect(wrapper.find('.caomei-multi-select__clear').exists()).toBe(false)
    })

    it('点击清除按钮把模型置为空数组并把焦点交回输入框', async () => {
        const wrapper = mount(CaomeiMultiSelect, {
            props: { options, modelValue: ['apple', 'banana'], showClear: true },
            attachTo: document.body,
        })

        await wrapper.get('.caomei-multi-select__clear').trigger('click')
        await flushPromises()
        await nextTick()

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]])
        expect(document.activeElement).toBe(wrapper.get('.caomei-multi-select__input').element)

        wrapper.unmount()
    })

    it('清除按钮可访问名默认取当前语言，可被 clearLabel 覆盖', () => {
        const byLocale = mount(CaomeiMultiSelect, {
            props: { options, modelValue: ['apple'], showClear: true },
        })
        expect(byLocale.get('.caomei-multi-select__clear').attributes('aria-label')).toBe('清除')

        const byProp = mount(CaomeiMultiSelect, {
            props: { options, modelValue: ['apple'], showClear: true, clearLabel: '重置' },
        })
        expect(byProp.get('.caomei-multi-select__clear').attributes('aria-label')).toBe('重置')
    })

    it('disabled 时不渲染清除按钮', () => {
        const wrapper = mount(CaomeiMultiSelect, {
            props: { options, modelValue: ['apple'], showClear: true, disabled: true },
        })

        expect(wrapper.find('.caomei-multi-select__clear').exists()).toBe(false)
    })

    it('option 插槽收到原始选项对象与选中状态', async () => {
        interface SlotOption {
            name: string
            id: number
            hint: string
        }

        const SlotMultiSelect = CaomeiMultiSelect as unknown as DefineComponent<MultiSelectProps<SlotOption>>

        const wrapper = mount(SlotMultiSelect, {
            props: {
                options: [
                    { name: '一', id: 1, hint: '第一项' },
                    { name: '二', id: 2, hint: '第二项' },
                ],
                optionLabel: 'name',
                optionValue: 'id',
                modelValue: [2],
            },
            slots: {
                option: ({ option, selected }: { option: SlotOption, selected: boolean }) =>
                    h('span', { class: 'custom-option' }, `${option.hint}${selected ? '*' : ''}`),
            },
            attachTo: document.body,
        })

        await open(wrapper)

        const rendered = document.querySelectorAll('.custom-option')
        expect(rendered).toHaveLength(2)
        expect(rendered[0].textContent).toBe('第一项')
        expect(rendered[1].textContent).toBe('第二项*')

        wrapper.unmount()
    })

    it('受控父级拒绝更新时保留清除按钮，不把焦点抢到输入框', async () => {
        const emittedValues: unknown[] = []
        const Host = defineComponent({
            setup() {
                return () => h(CaomeiMultiSelect, {
                    options,
                    modelValue: ['apple'],
                    showClear: true,
                    // 刻意不回写：模拟受控父级拒绝更新
                    'onUpdate:modelValue': (value: unknown) => {
                        emittedValues.push(value)
                    },
                })
            },
        })
        const wrapper = mount(Host, { attachTo: document.body })

        await wrapper.get('.caomei-multi-select__clear').trigger('click')
        await flushPromises()
        await nextTick()

        expect(emittedValues).toEqual([[]])
        expect(wrapper.find('.caomei-multi-select__clear').exists()).toBe(true)
        expect(document.activeElement).not.toBe(wrapper.get('.caomei-multi-select__input').element)

        wrapper.unmount()
    })

    it('未提供 option 插槽时回退渲染映射文本', async () => {
        const wrapper = mount(CaomeiMultiSelect, {
            props: { options, modelValue: [] },
            attachTo: document.body,
        })

        await open(wrapper)

        const rendered = document.querySelectorAll('[role="option"]')
        expect(rendered[0].textContent).toContain('苹果')

        wrapper.unmount()
    })
})
