import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { CaomeiDescriptions, CaomeiDescriptionsItem } from './index'

function mountDescriptions(props: Record<string, unknown> = {}) {
    return mount(CaomeiDescriptions, {
        props,
        slots: {
            default: () => [
                h(CaomeiDescriptionsItem, { label: '姓名' }, { default: () => '草梅' }),
                h(CaomeiDescriptionsItem, { label: '邮箱' }, { default: () => 'dev@example.com' }),
                h(CaomeiDescriptionsItem, { label: '备注', span: 2 }, { default: () => '跨两列' }),
            ],
        },
    })
}

describe('CaomeiDescriptions', () => {
    it('使用 dl / dt / dd 语义渲染标签与内容', () => {
        const wrapper = mountDescriptions()

        expect((wrapper.element as HTMLElement).tagName).toBe('DL')
        const items = wrapper.findAll('.caomei-descriptions__item')
        expect(items).toHaveLength(3)
        expect(items[0].find('dt').text()).toBe('姓名')
        expect(items[0].find('dd').text()).toBe('草梅')
        expect(items[2].find('dt').text()).toBe('备注')
        expect(items[2].find('dd').text()).toBe('跨两列')
    })

    it('columns 映射到基础列数，span 超过列数时夹取到整行', () => {
        const wrapper = mount(CaomeiDescriptions, {
            props: { columns: 3 },
            slots: {
                default: () => [
                    h(CaomeiDescriptionsItem, { label: 'A', span: 5 }, { default: () => '超宽' }),
                ],
            },
        })

        expect(wrapper.classes()).toContain('caomei-descriptions--cols-3')
        const item = wrapper.get('.caomei-descriptions__item')
        expect(item.attributes('style')).toContain('--caomei-descriptions-item-span: 3')
        expect(item.classes()).toContain('caomei-descriptions__item--wide')
    })

    it('columns 超出 1–6 时夹取到边界', () => {
        const high = mountDescriptions({ columns: 12 })
        expect(high.classes()).toContain('caomei-descriptions--cols-6')

        const low = mountDescriptions({ columns: 0 })
        expect(low.classes()).toContain('caomei-descriptions--cols-1')
    })

    it('bordered / layout / size 映射到类名', () => {
        const wrapper = mountDescriptions({ bordered: true, layout: 'vertical', size: 'lg' })

        expect(wrapper.classes()).toContain('caomei-descriptions--bordered')
        expect(wrapper.classes()).toContain('caomei-descriptions--vertical')
        expect(wrapper.classes()).toContain('caomei-descriptions--lg')
        for (const item of wrapper.findAll('.caomei-descriptions__item')) {
            expect(item.classes()).toContain('caomei-descriptions__item--bordered')
            expect(item.classes()).toContain('caomei-descriptions__item--vertical')
        }
    })

    it('labelWidth 写入根元素变量，标签插槽覆盖文本', () => {
        const wrapper = mount(CaomeiDescriptions, {
            props: { labelWidth: '9rem' },
            slots: {
                default: () => [
                    h(CaomeiDescriptionsItem, { label: '标签' }, {
                        label: () => h('strong', { class: 'demo-label' }, '自定义标签'),
                        default: () => '值',
                    }),
                ],
            },
        })

        expect(wrapper.attributes('style')).toContain('--caomei-descriptions-label-width: 9rem')
        expect(wrapper.find('.demo-label').text()).toBe('自定义标签')
    })

    it('无父级上下文时条目仍按单列渲染', () => {
        const wrapper = mount(CaomeiDescriptionsItem, {
            props: { label: '独立', span: 4 },
            slots: { default: () => '值' },
        })

        expect(wrapper.attributes('style')).toContain('--caomei-descriptions-item-span: 1')
        expect(wrapper.classes()).not.toContain('caomei-descriptions__item--wide')
    })
})
