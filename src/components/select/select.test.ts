import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick, type DefineComponent } from 'vue'
import type { SelectProps } from './types'
import { CaomeiSelect } from './index'

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

describe('CaomeiSelect', () => {
    it('无值时显示占位文本', () => {
        const wrapper = mount(CaomeiSelect, {
            props: { options, placeholder: '请选择' },
        })

        expect(wrapper.get('.caomei-select').text()).toContain('请选择')
    })

    it('有值时显示对应选项文本', () => {
        const wrapper = mount(CaomeiSelect, {
            props: { options, modelValue: 'banana', placeholder: '请选择' },
        })

        expect(wrapper.get('.caomei-select').text()).toContain('香蕉')
    })

    it('值不在选项中时回退到占位文本', () => {
        const wrapper = mount(CaomeiSelect, {
            props: { options, modelValue: 'unknown', placeholder: '请选择' },
        })

        expect(wrapper.get('.caomei-select').text()).toContain('请选择')
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸样式 %s', (size) => {
        const wrapper = mount(CaomeiSelect, { props: { options, size } })
        expect(wrapper.get('.caomei-select').classes()).toContain(`caomei-select--${size}`)
    })

    it('invalid 时标注 aria-invalid 并应用错误样式', () => {
        const wrapper = mount(CaomeiSelect, { props: { options, invalid: true } })

        const trigger = wrapper.get('.caomei-select')
        expect(trigger.attributes('aria-invalid')).toBe('true')
        expect(trigger.classes()).toContain('caomei-select--invalid')
    })

    it('disabled 时禁用触发器并应用禁用样式', () => {
        const wrapper = mount(CaomeiSelect, { props: { options, disabled: true } })

        const trigger = wrapper.get('.caomei-select')
        expect(trigger.attributes('disabled')).toBeDefined()
        expect(trigger.classes()).toContain('caomei-select--disabled')
    })

    it('label 映射为 aria-label', () => {
        const wrapper = mount(CaomeiSelect, { props: { options, label: '水果' } })
        expect(wrapper.get('.caomei-select').attributes('aria-label')).toBe('水果')
    })

    it('透传 id 与原生属性', () => {
        const wrapper = mount(CaomeiSelect, {
            props: { options, id: 'fruit-select' },
            attrs: { 'data-test': 'select' },
        })

        const trigger = wrapper.get('.caomei-select')
        expect(trigger.attributes('id')).toBe('fruit-select')
        expect(trigger.attributes('data-test')).toBe('select')
    })

    it('合并透传的 class', () => {
        const wrapper = mount(CaomeiSelect, {
            props: { options },
            attrs: { class: 'custom-select' },
        })

        expect(wrapper.get('.caomei-select').classes()).toContain('custom-select')
    })

    it('options 为空时不渲染任何选项且不报错', () => {
        const wrapper = mount(CaomeiSelect, { props: { options: [] } })
        expect(wrapper.find('[role="option"]').exists()).toBe(false)
    })

    it('透传 name 生成用于表单提交的原生 select', () => {
        const wrapper = mount(CaomeiSelect, { props: { options, name: 'fruit' } })
        expect(wrapper.find('select[name="fruit"]').exists()).toBe(true)
    })

    it('展开后渲染选项并标记禁用项', async () => {
        const wrapper = mount(CaomeiSelect, {
            props: { options },
            attachTo: document.body,
        })

        await wrapper.get('.caomei-select').trigger('keydown', { key: 'Enter' })
        await nextTick()

        const rendered = document.querySelectorAll('[role="option"]')
        expect(rendered).toHaveLength(3)
        expect(rendered[0].textContent).toContain('苹果')
        expect(rendered[2].hasAttribute('data-disabled')).toBe(true)

        wrapper.unmount()
    })

    it('展开时默认不锁定页面滚动', async () => {
        const wrapper = mount(CaomeiSelect, {
            props: { options },
            attachTo: document.body,
        })

        await wrapper.get('.caomei-select').trigger('keydown', { key: 'Enter' })
        await nextTick()
        await nextTick()

        expect(document.body.style.overflow).not.toBe('hidden')

        wrapper.unmount()
    })

    it('bodyLock 开启时锁定页面滚动', async () => {
        const wrapper = mount(CaomeiSelect, {
            props: { options, bodyLock: true },
            attachTo: document.body,
        })

        await wrapper.get('.caomei-select').trigger('keydown', { key: 'Enter' })
        await nextTick()
        await nextTick()

        expect(document.body.style.overflow).toBe('hidden')

        wrapper.unmount()
    })

    it('v-model 与 SelectRoot 双向绑定', async () => {
        const wrapper = mount(CaomeiSelect, { props: { options } })

        wrapper.findComponent({ name: 'SelectRoot' }).vm.$emit('update:modelValue', 'apple')
        await nextTick()

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['apple'])
    })

    it('有选中值时输出 data-filled，清空后移除', async () => {
        const wrapper = mount(CaomeiSelect, { props: { options, modelValue: '' } })

        expect(wrapper.get('.caomei-select').attributes('data-filled')).toBeUndefined()

        await wrapper.setProps({ modelValue: 'apple' })
        expect(wrapper.get('.caomei-select').attributes('data-filled')).toBe('true')

        await wrapper.setProps({ modelValue: '' })
        expect(wrapper.get('.caomei-select').attributes('data-filled')).toBeUndefined()
    })

    it('有 placeholder 时输出 data-has-placeholder，未设置时不输出', () => {
        const withPlaceholder = mount(CaomeiSelect, { props: { options, placeholder: '请选择' } })
        expect(withPlaceholder.get('.caomei-select').attributes('data-has-placeholder')).toBe('true')

        const withoutPlaceholder = mount(CaomeiSelect, { props: { options } })
        expect(withoutPlaceholder.get('.caomei-select').attributes('data-has-placeholder')).toBeUndefined()
    })
})

describe('CaomeiSelect 对象选项映射', () => {
    interface MappedOption {
        name: string
        id?: number | null
        disabled?: boolean
    }

    /** VTU 无法从 props 推断泛型组件参数，测试内具体化选项类型 */
    const MappedSelect = CaomeiSelect as unknown as DefineComponent<SelectProps<MappedOption>>

    const objectOptions: MappedOption[] = [
        { name: '分类一', id: 1 },
        { name: '分类二', id: 2 },
    ]

    it('通过 optionLabel / optionValue 映射字段并支持数字值', () => {
        const wrapper = mount(MappedSelect, {
            props: {
                options: objectOptions,
                optionLabel: 'name',
                optionValue: 'id',
                modelValue: 2,
                placeholder: '请选择',
            },
        })

        expect(wrapper.get('.caomei-select').text()).toContain('分类二')
    })

    it('映射后的选项面板按 label 渲染', async () => {
        const wrapper = mount(MappedSelect, {
            props: {
                options: objectOptions,
                optionLabel: 'name',
                optionValue: 'id',
                attachTo: document.body,
            },
        })

        await wrapper.get('.caomei-select').trigger('keydown', { key: 'Enter' })
        await nextTick()

        const rendered = document.querySelectorAll('[role="option"]')
        expect(rendered).toHaveLength(2)
        expect(rendered[0].textContent).toContain('分类一')

        wrapper.unmount()
    })

    it('optionLabel 传函数时按函数结果渲染', () => {
        const wrapper = mount(MappedSelect, {
            props: {
                options: objectOptions,
                optionLabel: (option) => `#${option.id ?? '?'}`,
                optionValue: 'id',
                modelValue: 1,
            },
        })

        expect(wrapper.get('.caomei-select').text()).toContain('#1')
    })

    it('解析不到 optionValue 的选项不渲染', async () => {
        const wrapper = mount(MappedSelect, {
            props: {
                options: [{ name: '无值选项' }, ...objectOptions],
                optionLabel: 'name',
                optionValue: 'id',
                attachTo: document.body,
            },
        })

        await wrapper.get('.caomei-select').trigger('keydown', { key: 'Enter' })
        await nextTick()

        expect(document.querySelectorAll('[role="option"]')).toHaveLength(2)

        wrapper.unmount()
    })

    it('映射的 label 字段缺省时回退占位文本', () => {
        const wrapper = mount(MappedSelect, {
            props: {
                options: objectOptions,
                optionLabel: 'missing',
                optionValue: 'id',
                modelValue: 1,
                placeholder: '请选择',
            },
        })

        expect(wrapper.get('.caomei-select').text()).toContain('请选择')
    })

    it('映射的选项禁用字段生效', async () => {
        const wrapper = mount(MappedSelect, {
            props: {
                options: [{ name: '分类一', id: 1 }, { name: '分类二', id: 2, disabled: true }],
                optionLabel: 'name',
                optionValue: 'id',
                attachTo: document.body,
            },
        })

        await wrapper.get('.caomei-select').trigger('keydown', { key: 'Enter' })
        await nextTick()

        const rendered = document.querySelectorAll('[role="option"]')
        expect(rendered[1].hasAttribute('data-disabled')).toBe(true)

        wrapper.unmount()
    })

    it('选中映射后的选项后回传数字值', async () => {
        const wrapper = mount(MappedSelect, {
            props: {
                options: objectOptions,
                optionLabel: 'name',
                optionValue: 'id',
                attachTo: document.body,
            },
        })

        await wrapper.get('.caomei-select').trigger('keydown', { key: 'Enter' })
        await nextTick()

        // Reka SelectItem 以 pointerup 提交选中（见 SelectItem 的 onPointerup）
        const option = document.querySelectorAll<HTMLElement>('[role="option"]')[1]
        option.dispatchEvent(new Event('pointerup', { bubbles: true }))
        await nextTick()
        await nextTick()

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])

        wrapper.unmount()
    })

    it('optionValue 传函数时按函数结果取值', () => {
        const wrapper = mount(MappedSelect, {
            props: {
                options: objectOptions,
                optionLabel: 'name',
                optionValue: (option) => option.id ?? 0,
                modelValue: 2,
            },
        })

        expect(wrapper.get('.caomei-select').text()).toContain('分类二')
    })

    it('optionValue 解析出契约外取值（如 null）的选项不渲染', async () => {
        const wrapper = mount(MappedSelect, {
            props: {
                options: [{ name: '全部', id: null }, ...objectOptions],
                optionLabel: 'name',
                optionValue: 'id',
                attachTo: document.body,
            },
        })

        await wrapper.get('.caomei-select').trigger('keydown', { key: 'Enter' })
        await nextTick()

        expect(document.querySelectorAll('[role="option"]')).toHaveLength(2)

        wrapper.unmount()
    })
})
