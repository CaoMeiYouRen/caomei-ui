import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import {
    CaomeiToolbar,
    CaomeiToolbarButton,
    CaomeiToolbarLink,
    CaomeiToolbarSeparator,
    CaomeiToolbarToggleGroup,
    CaomeiToolbarToggleItem,
} from './index'

function mountToolbar(props: Record<string, unknown> = {}) {
    return mount(CaomeiToolbar, {
        props,
        slots: {
            default: () => [
                h(CaomeiToolbarButton, { label: '加粗' }, { default: () => '加粗' }),
                h(CaomeiToolbarButton, { label: '斜体' }, { default: () => '斜体' }),
                h(CaomeiToolbarButton, { label: '禁用', disabled: true }, { default: () => '禁用' }),
                h(CaomeiToolbarSeparator),
                h(CaomeiToolbarLink, { href: 'https://example.com', label: '帮助' }, { default: () => '帮助' }),
            ],
        },
    })
}

function buttons(wrapper: ReturnType<typeof mount>) {
    return wrapper.findAll('.caomei-toolbar__button')
}

function mountToolbarWithToggleGroup(toggleProps: Record<string, unknown> = {}) {
    return mount(CaomeiToolbar, {
        slots: {
            default: () => [
                h(CaomeiToolbarButton, { label: '普通按钮' }, { default: () => '按钮' }),
                h(
                    CaomeiToolbarToggleGroup,
                    {
                        type: 'multiple',
                        modelValue: ['bold'],
                        'onUpdate:modelValue': vi.fn(),
                        label: '格式',
                        ...toggleProps,
                    },
                    {
                        default: () => [
                            h(CaomeiToolbarToggleItem, { value: 'bold', label: '加粗' }, { default: () => 'B' }),
                            h(CaomeiToolbarToggleItem, { value: 'italic', label: '斜体' }, { default: () => 'I' }),
                            h(CaomeiToolbarToggleItem, { value: 'strike', label: '删除线', disabled: true }, { default: () => 'S' }),
                        ],
                    },
                ),
            ],
        },
    })
}

describe('CaomeiToolbar', () => {
    it('默认渲染工具条角色与水平方向', () => {
        const wrapper = mountToolbar()

        const root = wrapper.get('.caomei-toolbar')
        expect(root.attributes('role')).toBe('toolbar')
        expect(root.attributes('aria-orientation')).toBe('horizontal')
        expect(root.classes()).toContain('caomei-toolbar--horizontal')
        expect(buttons(wrapper)).toHaveLength(3)
    })

    it('vertical 输出垂直方向', () => {
        const wrapper = mountToolbar({ orientation: 'vertical' })

        const root = wrapper.get('.caomei-toolbar')
        expect(root.attributes('aria-orientation')).toBe('vertical')
        expect(root.classes()).toContain('caomei-toolbar--vertical')
    })

    it('label 属性映射根部 aria-label', () => {
        const wrapper = mountToolbar({ label: '文本格式' })

        expect(wrapper.get('.caomei-toolbar').attributes('aria-label')).toBe('文本格式')
    })

    it('label 属性优先于透传的 aria-label', () => {
        const wrapper = mountToolbar({ label: '属性名', 'aria-label': '透传名' })

        expect(wrapper.get('.caomei-toolbar').attributes('aria-label')).toBe('属性名')
    })

    it('按钮渲染为原生 button 并支持禁用', () => {
        const wrapper = mountToolbar()

        const first = buttons(wrapper)[0]
        expect(first.element.tagName).toBe('BUTTON')
        expect(first.attributes('type')).toBe('button')
        expect(first.attributes('aria-label')).toBe('加粗')

        const disabled = buttons(wrapper)[2]
        expect(disabled.attributes('disabled')).toBeDefined()
    })

    it('禁用按钮移出焦点序列', () => {
        const wrapper = mountToolbar()

        const disabled = buttons(wrapper)[2]
        expect(disabled.attributes('tabindex')).toBe('-1')
        expect(disabled.attributes('data-disabled')).toBeDefined()
    })

    it('链接渲染为锚点并透传 href', () => {
        const wrapper = mountToolbar()

        const link = wrapper.get('.caomei-toolbar__link')
        expect(link.element.tagName).toBe('A')
        expect(link.attributes('href')).toBe('https://example.com')
        expect(link.attributes('aria-label')).toBe('帮助')
    })

    it('分隔线渲染为 separator 并携带方向', () => {
        const wrapper = mountToolbar()

        const separator = wrapper.get('.caomei-toolbar__separator')
        expect(separator.attributes('role')).toBe('separator')
        expect(separator.attributes('data-orientation')).toBe('horizontal')
    })

    it('垂直工具条的分隔线携带垂直方向', () => {
        const wrapper = mountToolbar({ orientation: 'vertical' })

        expect(wrapper.get('.caomei-toolbar__separator').attributes('data-orientation')).toBe('vertical')
    })

    it('按钮 label 优先于透传 aria-label', () => {
        const wrapper = mount(CaomeiToolbar, {
            slots: {
                default: () => [
                    h(CaomeiToolbarButton, { label: '属性名', 'aria-label': '透传名' }, { default: () => '按钮' }),
                ],
            },
        })

        expect(buttons(wrapper)[0].attributes('aria-label')).toBe('属性名')
    })

    it('class 留在根元素，其余属性透传到根元素', () => {
        const wrapper = mountToolbar({ class: 'custom', 'data-test': 'toolbar' })

        const root = wrapper.get('.caomei-toolbar')
        expect(root.classes()).toContain('custom')
        expect(root.attributes('data-test')).toBe('toolbar')
    })
})

describe('CaomeiToolbarToggleGroup', () => {
    it('渲染分组与开关条目且选中项输出 aria-pressed', () => {
        const wrapper = mountToolbarWithToggleGroup()

        expect(wrapper.find('.caomei-toolbar__toggle-group').exists()).toBe(true)

        const items = wrapper.findAll('[aria-pressed]')
        expect(items).toHaveLength(3)
        expect(items[0].attributes('aria-pressed')).toBe('true')
        expect(items[0].attributes('data-state')).toBe('on')
        expect(items[1].attributes('aria-pressed')).toBe('false')
    })

    it('条目纳入工具条 roving focus（共享单一 Tab 停靠点）', async () => {
        const wrapper = mountToolbarWithToggleGroup()
        await nextTick()

        // 工具条容器持有唯一 Tab 停靠点，条目初始为 -1，由方向键在组内移动
        expect(wrapper.get('.caomei-toolbar').attributes('tabindex')).toBe('0')
        for (const item of wrapper.findAll('[aria-pressed]')) {
            expect(item.attributes('tabindex')).toBe('-1')
        }
    })

    it('点击切换抛出 update:modelValue', async () => {
        const wrapper = mountToolbarWithToggleGroup()

        await wrapper.findAll('[aria-pressed]')[1].trigger('click')

        expect(wrapper.findComponent(CaomeiToolbarToggleGroup).emitted('update:modelValue')?.[0]).toEqual([
            ['bold', 'italic'],
        ])
    })

    it('禁用条目设置 disabled 并移出焦点序列', () => {
        const wrapper = mountToolbarWithToggleGroup()

        const disabled = wrapper.findAll('[aria-pressed]')[2]
        expect(disabled.attributes('disabled')).toBeDefined()
        expect(disabled.attributes('data-disabled')).toBeDefined()
        expect(disabled.attributes('tabindex')).toBe('-1')
    })

    it('label 映射分组可访问名', () => {
        const wrapper = mountToolbarWithToggleGroup()

        expect(wrapper.get('.caomei-toolbar__toggle-group').attributes('aria-label')).toBe('格式')
    })
})
