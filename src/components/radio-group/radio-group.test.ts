import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import { CaomeiRadioButton, CaomeiRadioGroup } from './index'

interface Option {
    value: string | number
    text: string
    disabled?: boolean
    label?: string
}

const DEFAULT_OPTIONS: Option[] = [
    { value: 'a', text: '选项 A' },
    { value: 'b', text: '选项 B' },
    { value: 'c', text: '选项 C', disabled: true },
]

function mountGroup(
    props: Record<string, unknown> = {},
    options: Option[] = DEFAULT_OPTIONS,
) {
    return mount(CaomeiRadioGroup, {
        props,
        slots: {
            default: () => options.map((option) => h(CaomeiRadioButton, {
                value: option.value,
                text: option.text,
                disabled: option.disabled,
                label: option.label,
            })),
        },
    })
}

function radios(wrapper: ReturnType<typeof mount>) {
    return wrapper.findAll('[role="radio"]')
}

describe('CaomeiRadioGroup', () => {
    it('默认渲染群组角色、垂直方向与中号尺寸', () => {
        const wrapper = mountGroup()

        const root = wrapper.get('.caomei-radio-group')
        expect(root.attributes('role')).toBe('radiogroup')
        expect(root.classes()).toContain('caomei-radio-group--vertical')
        expect(root.classes()).toContain('caomei-radio-group--md')
        expect(radios(wrapper)).toHaveLength(3)
    })

    it('未选中时所有条目 aria-checked 为 false', () => {
        const wrapper = mountGroup()

        for (const radio of radios(wrapper)) {
            expect(radio.attributes('aria-checked')).toBe('false')
            expect(radio.attributes('data-state')).toBe('unchecked')
        }
    })

    it('受控时点击更新 v-model', async () => {
        const wrapper = mountGroup({ modelValue: 'a' })

        await radios(wrapper)[1].trigger('click')

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b'])
    })

    it('未绑定 v-model 时点击切换到选中态', async () => {
        const wrapper = mountGroup()

        await radios(wrapper)[1].trigger('click')
        await nextTick()

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b'])
        expect(radios(wrapper)[1].attributes('aria-checked')).toBe('true')
        expect(radios(wrapper)[1].attributes('data-state')).toBe('checked')
    })

    it('defaultValue 提供非受控初始选中值', () => {
        const wrapper = mountGroup({ defaultValue: 'b' })

        expect(radios(wrapper)[1].attributes('aria-checked')).toBe('true')
    })

    it('禁用条目设置 disabled 且点击不更新', async () => {
        const wrapper = mountGroup({ modelValue: 'a' })

        const disabled = radios(wrapper)[2]
        expect(disabled.attributes('data-disabled')).toBeDefined()
        expect(disabled.attributes('disabled')).toBeDefined()

        await disabled.trigger('click')
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('整组禁用时全部条目禁用', () => {
        const wrapper = mountGroup({ disabled: true })

        const root = wrapper.get('.caomei-radio-group')
        expect(root.attributes('data-disabled')).toBeDefined()
        for (const radio of radios(wrapper)) {
            expect(radio.attributes('data-disabled')).toBeDefined()
        }
    })

    it('invalid 映射 aria-invalid 并应用校验类', () => {
        const wrapper = mountGroup({ invalid: true })

        const root = wrapper.get('.caomei-radio-group')
        expect(root.attributes('aria-invalid')).toBe('true')
        expect(root.classes()).toContain('caomei-radio-group--invalid')
    })

    it('默认不输出 aria-invalid', () => {
        const wrapper = mountGroup()

        expect(wrapper.get('.caomei-radio-group').attributes('aria-invalid')).toBeUndefined()
    })

    it('label 属性映射根元素 aria-label', () => {
        const wrapper = mountGroup({ label: '订阅方案' })

        expect(wrapper.get('.caomei-radio-group').attributes('aria-label')).toBe('订阅方案')
    })

    it('label 属性优先于透传的 aria-label', () => {
        const wrapper = mountGroup({
            label: '属性名',
            'aria-label': '透传名',
        })

        expect(wrapper.get('.caomei-radio-group').attributes('aria-label')).toBe('属性名')
    })

    it('class 留在根元素，其余属性透传到根元素', () => {
        const wrapper = mountGroup({
            class: 'custom',
            'data-test': 'radio-group',
        })

        const root = wrapper.get('.caomei-radio-group')
        expect(root.classes()).toContain('custom')
        expect(root.attributes('data-test')).toBe('radio-group')
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸类 %s', (size) => {
        const wrapper = mountGroup({ size })

        expect(wrapper.get('.caomei-radio-group').classes()).toContain(`caomei-radio-group--${size}`)
    })

    it('horizontal 应用水平方向类', () => {
        const wrapper = mountGroup({ orientation: 'horizontal' })

        expect(wrapper.get('.caomei-radio-group').classes()).toContain('caomei-radio-group--horizontal')
    })

    it('根元素输出 aria-orientation', () => {
        expect(mountGroup().get('.caomei-radio-group').attributes('aria-orientation')).toBe('vertical')
        expect(mountGroup({ orientation: 'horizontal' }).get('.caomei-radio-group').attributes('aria-orientation')).toBe('horizontal')
    })

    it('required 映射根元素 aria-required', () => {
        expect(mountGroup({ required: true }).get('.caomei-radio-group').attributes('aria-required')).toBe('true')
    })

    it('选中项渲染指示器', () => {
        const wrapper = mountGroup({ modelValue: 'a' })

        const indicator = wrapper.get('.caomei-radio-button__indicator')
        expect(indicator.attributes('aria-hidden')).toBe('true')
        expect(radios(wrapper)[0].find('.caomei-radio-button__indicator').exists()).toBe(true)
    })

    it('位于表单内时输出携带选中值的同名隐藏输入', () => {
        const wrapper = mount(defineComponent({
            setup() {
                return () => h('form', [
                    h(CaomeiRadioGroup, { name: 'plan', required: true, modelValue: 'pro' }, {
                        default: () => [
                            h(CaomeiRadioButton, { value: 'free', text: '免费' }),
                            h(CaomeiRadioButton, { value: 'pro', text: '专业' }),
                        ],
                    }),
                ])
            },
        }))

        const input = wrapper.get('input[name="plan"]')
        expect((input.element as HTMLInputElement).value).toBe('pro')
        expect(input.attributes('required')).toBeDefined()
        expect(wrapper.findAll('input[name="plan"]')).toHaveLength(1)
    })

    it('无 name 时不输出隐藏输入', () => {
        const wrapper = mount(defineComponent({
            setup() {
                return () => h('form', [
                    h(CaomeiRadioGroup, null, {
                        default: () => [h(CaomeiRadioButton, { value: 'a', text: 'A' })],
                    }),
                ])
            },
        }))

        expect(wrapper.find('input').exists()).toBe(false)
    })
})

describe('CaomeiRadioButton', () => {
    it('text 渲染可见标签', () => {
        const wrapper = mountGroup()

        expect(wrapper.findAll('.caomei-radio-button__label')[0].text()).toBe('选项 A')
    })

    it('label 属性映射 aria-label', () => {
        const wrapper = mountGroup({}, [{ value: 'a', text: '', label: '选项 A' }])

        expect(radios(wrapper)[0].attributes('aria-label')).toBe('选项 A')
    })

    it('仅可访问名时不渲染可见标签', () => {
        const wrapper = mountGroup({}, [{ value: 'a', text: '', label: '选项 A' }])

        expect(wrapper.find('.caomei-radio-button__label').exists()).toBe(false)
        expect(radios(wrapper)[0].attributes('aria-label')).toBe('选项 A')
    })

    it('id 缺省自动生成且可用于外部 label', () => {
        const wrapper = mountGroup()

        const id = radios(wrapper)[0].attributes('id')
        expect(id).toBeTruthy()
        expect(id).toMatch(/^caomei-radio-/)
    })
})
