import { DOMWrapper, mount } from '@vue/test-utils'
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

    it('未使用分区插槽时保持默认单区渲染', () => {
        const wrapper = mountToolbar()

        expect(wrapper.find('.caomei-toolbar__start').exists()).toBe(false)
        expect(wrapper.find('.caomei-toolbar__center').exists()).toBe(false)
        expect(wrapper.find('.caomei-toolbar__end').exists()).toBe(false)
        // 成员仍是根元素的直接子节点，DOM 与改造前一致
        const root = wrapper.get('.caomei-toolbar').element
        expect(root.children).toHaveLength(5)
        expect(Array.from(root.children).every((child) => child.classList.contains('caomei-toolbar__button')
            || child.classList.contains('caomei-toolbar__separator')
            || child.tagName === 'A')).toBe(true)
    })

    it('同时传默认插槽与分区插槽时默认内容不渲染', () => {
        const wrapper = mount(CaomeiToolbar, {
            slots: {
                default: () => h(CaomeiToolbarButton, { label: '默认' }, { default: () => '默认内容' }),
                center: () => h(CaomeiToolbarButton, { label: '中' }, { default: () => '中区内容' }),
            },
        })

        expect(wrapper.get('.caomei-toolbar__center').text()).toBe('中区内容')
        // 三分区容器齐备，但默认插槽内容被丢弃
        expect(wrapper.find('.caomei-toolbar__start').exists()).toBe(true)
        expect(wrapper.find('.caomei-toolbar__end').exists()).toBe(true)
        expect(wrapper.text()).not.toContain('默认内容')
        expect(wrapper.findAll('.caomei-toolbar__button')).toHaveLength(1)
    })

    it('使用任一分区插槽时渲染 start / center / end 三分区', () => {
        const wrapper = mount(CaomeiToolbar, {
            slots: {
                start: () => h(CaomeiToolbarButton, { label: '左' }, { default: () => '左' }),
                center: () => h(CaomeiToolbarButton, { label: '中' }, { default: () => '中' }),
                end: () => h(CaomeiToolbarButton, { label: '右' }, { default: () => '右' }),
            },
        })

        const start = wrapper.get('.caomei-toolbar__start')
        const center = wrapper.get('.caomei-toolbar__center')
        const end = wrapper.get('.caomei-toolbar__end')

        expect(start.text()).toBe('左')
        expect(center.text()).toBe('中')
        expect(end.text()).toBe('右')
        // 三分区容器在根内按 start → center → end 顺序渲染
        expect(
            Array.from(wrapper.get('.caomei-toolbar').element.children).map((child) => child.className),
        ).toEqual(['caomei-toolbar__start', 'caomei-toolbar__center', 'caomei-toolbar__end'])
    })

    it('仅使用 #start 时仍渲染三分区容器且内容落在 start 区', () => {
        const wrapper = mount(CaomeiToolbar, {
            slots: {
                start: () => h(CaomeiToolbarButton, { label: '仅左' }, { default: () => '仅左' }),
            },
        })

        expect(wrapper.get('.caomei-toolbar__start').text()).toBe('仅左')
        expect(wrapper.get('.caomei-toolbar__center').text()).toBe('')
        expect(wrapper.get('.caomei-toolbar__end').text()).toBe('')
    })

    it('分区包裹层不改变方向键漫游顺序（可跨分区移动）', async () => {
        const wrapper = mount(CaomeiToolbar, {
            attachTo: document.body,
            slots: {
                start: () => [
                    h(CaomeiToolbarButton, { label: 'A' }, { default: () => 'A' }),
                    h(CaomeiToolbarButton, { label: 'B' }, { default: () => 'B' }),
                ],
                end: () => h(CaomeiToolbarButton, { label: 'C' }, { default: () => 'C' }),
            },
        })
        await nextTick()

        const controls = wrapper.findAll('.caomei-toolbar__button')
        expect(controls).toHaveLength(3)
        expect(wrapper.get('.caomei-toolbar').attributes('tabindex')).toBe('0')

        try {
            ;(controls[0].element as HTMLElement).focus()
            await nextTick()
            expect(document.activeElement).toBe(controls[0].element)

            // start 区内右移
            await controls[0].trigger('keydown', { key: 'ArrowRight' })
            await nextTick()
            expect(document.activeElement).toBe(controls[1].element)

            // 跨越 end 分区包裹层继续右移：顺序仍按 DOM，未被包裹层打断
            await new DOMWrapper(document.activeElement as Element).trigger('keydown', { key: 'ArrowRight' })
            await nextTick()
            expect(document.activeElement).toBe(controls[2].element)
        } finally {
            wrapper.unmount()
        }
    })

    it('垂直工具条渲染分区容器并携带垂直方向类（布局由浏览器验证）', () => {
        const wrapper = mount(CaomeiToolbar, {
            props: { orientation: 'vertical' },
            slots: {
                start: () => h(CaomeiToolbarButton, { label: '上' }, { default: () => '上' }),
                end: () => h(CaomeiToolbarButton, { label: '下' }, { default: () => '下' }),
            },
        })

        expect(wrapper.get('.caomei-toolbar').classes()).toContain('caomei-toolbar--vertical')
        expect(wrapper.get('.caomei-toolbar__start').text()).toBe('上')
        expect(wrapper.get('.caomei-toolbar__end').text()).toBe('下')
    })
})
