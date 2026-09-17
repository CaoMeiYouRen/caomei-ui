import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { createSSRApp, h, nextTick, type DefineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
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

    it('未提供 label 时保留透传的 aria-label', () => {
        const wrapper = mount(CaomeiSelect, {
            props: { options },
            attrs: { 'aria-label': '透传名' },
        })
        expect(wrapper.get('.caomei-select').attributes('aria-label')).toBe('透传名')
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

        // reka-ui 的 SelectRoot 为泛型组件，`findComponent(SelectRoot)` 会命中 DOMWrapper 重载（无 `.vm`），
        // 故此处保留按 name 查找并对 `vm` 作显式签名断言；可解析的 primitive（如 DialogContent）用组件引用查找。
        const root = wrapper.findComponent({ name: 'SelectRoot' })
        ;(root.vm as { $emit: (event: string, value: string) => void }).$emit('update:modelValue', 'apple')
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

describe('CaomeiSelect 清除与自定义选项', () => {
    it('showClear 且有选中值时渲染清除按钮，无值时隐藏', async () => {
        const wrapper = mount(CaomeiSelect, {
            props: { options, modelValue: 'apple', showClear: true },
        })

        expect(wrapper.find('.caomei-select__clear').exists()).toBe(true)
        expect(wrapper.get('.caomei-select').classes()).toContain('caomei-select--clearable')

        await wrapper.setProps({ modelValue: '' })
        expect(wrapper.find('.caomei-select__clear').exists()).toBe(false)
        expect(wrapper.get('.caomei-select').classes()).not.toContain('caomei-select--clearable')
    })

    it('未开启 showClear 时不渲染清除按钮', () => {
        const wrapper = mount(CaomeiSelect, { props: { options, modelValue: 'apple' } })
        expect(wrapper.find('.caomei-select__clear').exists()).toBe(false)
    })

    it('点击清除按钮把模型置为 null 并把焦点交回触发器', async () => {
        const wrapper = mount(CaomeiSelect, {
            props: { options, modelValue: 'apple', showClear: true },
            attachTo: document.body,
        })

        await wrapper.get('.caomei-select__clear').trigger('click')
        await nextTick()

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null])
        expect(document.activeElement).toBe(wrapper.get('.caomei-select').element)

        wrapper.unmount()
    })

    it('清除按钮可访问名默认取当前语言，可被 clearLabel 覆盖', () => {
        const byLocale = mount(CaomeiSelect, {
            props: { options, modelValue: 'apple', showClear: true },
        })
        expect(byLocale.get('.caomei-select__clear').attributes('aria-label')).toBe('清除')

        const byProp = mount(CaomeiSelect, {
            props: { options, modelValue: 'apple', showClear: true, clearLabel: '重置' },
        })
        expect(byProp.get('.caomei-select__clear').attributes('aria-label')).toBe('重置')
    })

    it('disabled 时不渲染清除按钮', () => {
        const wrapper = mount(CaomeiSelect, {
            props: { options, modelValue: 'apple', showClear: true, disabled: true },
        })

        expect(wrapper.find('.caomei-select__clear').exists()).toBe(false)
    })

    it('SSR 输出中触发器为 button，清除按钮与其为兄弟节点且不嵌套 button', async () => {
        const app = createSSRApp({
            render: () =>
                h(CaomeiSelect, {
                    options,
                    modelValue: 'apple',
                    showClear: true,
                    placeholder: '请选择',
                }),
        })

        const html = await renderToString(app)
        const container = document.createElement('div')
        container.innerHTML = html

        const trigger = container.querySelector('.caomei-select')
        const clear = container.querySelector('.caomei-select__clear')

        expect(trigger?.tagName).toBe('BUTTON')
        expect(trigger?.getAttribute('role')).toBe('combobox')
        expect(clear).not.toBeNull()
        expect(clear?.parentElement).toBe(trigger?.parentElement)
        expect(trigger?.querySelector('button')).toBeNull()
        // closest 会命中自身，故检查其祖先链中是否存在 button
        expect(clear?.parentElement?.closest('button')).toBeNull()
    })

    it('option 插槽收到原始选项对象与选中状态', async () => {
        interface SlotOption {
            name: string
            id: number
            hint: string
        }

        const SlotSelect = CaomeiSelect as unknown as DefineComponent<SelectProps<SlotOption>>

        const wrapper = mount(SlotSelect, {
            props: {
                options: [
                    { name: '一', id: 1, hint: '第一项' },
                    { name: '二', id: 2, hint: '第二项' },
                ],
                optionLabel: 'name',
                optionValue: 'id',
                modelValue: 2,
                attachTo: document.body,
            },
            slots: {
                option: ({ option, selected }: { option: SlotOption, selected: boolean }) =>
                    h('span', { class: 'custom-option' }, `${option.hint}${selected ? '*' : ''}`),
            },
        })

        await wrapper.get('.caomei-select').trigger('keydown', { key: 'Enter' })
        await nextTick()

        const rendered = document.querySelectorAll('.custom-option')
        expect(rendered).toHaveLength(2)
        expect(rendered[0].textContent).toBe('第一项')
        expect(rendered[1].textContent).toBe('第二项*')

        wrapper.unmount()
    })
})

describe('CaomeiSelect 插槽与文本来源', () => {
    it('#option 插槽仅渲染图标时，触发器仍显示 optionLabel 文本', () => {
        interface SlotOption {
            name: string
            id: number
        }

        const SlotSelect = CaomeiSelect as unknown as DefineComponent<SelectProps<SlotOption>>

        const wrapper = mount(SlotSelect, {
            props: {
                options: [{ name: '已发布', id: 2 }],
                optionLabel: 'name',
                optionValue: 'id',
                modelValue: 2,
                attachTo: document.body,
            },
            slots: { option: () => h('span', { class: 'icon-only' }) },
        })

        expect(wrapper.get('.caomei-select').text()).toContain('已发布')

        wrapper.unmount()
    })
})
